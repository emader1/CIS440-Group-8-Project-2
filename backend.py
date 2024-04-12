from flask import Flask, request, jsonify, session
from flask_session import Session
import mysql.connector
from flask_cors import CORS
import secrets
import logging
app = Flask(__name__)
# Setup CORS and Session
secret_key_hex = secrets.token_hex(16)
app.secret_key = secret_key_hex
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_NAME'] = 'my_session_cookie'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
# Example CORS configuration
CORS(app, supports_credentials=True, origins=["http://127.0.0.1:5500"], methods=['OPTIONS', 'POST', 'GET', 'PUT', 'DELETE'], allow_headers=["Content-Type", "Authorization", "X-Requested-With"])

Session(app)
logging.basicConfig(level=logging.INFO)
def create_db_connection():
    return mysql.connector.connect(
        host="107.180.1.16",
        port="3306",
        user="spring2024Cteam8",
        password="spring2024Cteam8",
        database="spring2024Cteam8"
    )

db_connection = None

# Function to initialize db_connection if not already initialized.
def initialize_db_connection():
    global db_connection
    if db_connection is None:
        db_connection = create_db_connection()

@app.route('/', methods=['OPTIONS', 'POST', 'GET', 'FETCH'])
def handle_options():
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': 'http://127.0.0.1:5500',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true',
        }
        return '', 204, headers
    else:
        # Handle other methods as usual
        pass

from flask import session

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']
    initialize_db_connection()
    cursor = db_connection.cursor()
    try:
        sql = "SELECT * FROM users WHERE email = %s AND password = %s"
        cursor.execute(sql, (email, password))
        user = cursor.fetchone()
        if user:
            user_dict = {'id': user[0], 'email': user[1], 'username': user[2], 'industry': user[3], 'school_year': user[4], 'user_type': user[5]}
            session['user'] = user_dict
            session.modified = True  # Force session to be saved
            return jsonify({'message': 'Login successful', 'user': user_dict}), 200
            
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500
    finally:
        cursor.close()


# Function to fetch matches from the database based on user type and industry.
@app.route('/fetch-matches', methods=['GET'])
def fetch_matches():
    print("Session:", session)  # Log the session information
    if 'user' not in session:
        return jsonify({'message': 'User not logged in'}), 401

    user_dict = session['user']
    matches = query_matches(user_dict)

    return jsonify({'matches': matches}), 200

def query_matches(user_dict):
    user_type = user_dict['user_type']
    industry = user_dict['industry']

    cursor = db_connection.cursor()

    try:
        if user_type == 'Mentee':
            sql = "SELECT * FROM users WHERE user_type = 'Mentor' AND industry = %s"
        elif user_type == 'Mentor':
            sql = "SELECT * FROM users WHERE user_type = 'Mentee' AND industry = %s"
        elif user_type == 'Manager':
            sql = "SELECT * FROM users WHERE industry = %s"
        else:
            return []

        cursor.execute(sql, (industry,))
        matches = cursor.fetchall()
        return matches
    except Exception as e:
        return []
    finally:
        cursor.close()

@app.route('/create-account', methods=['POST'])
def create_account():
    data = request.get_json()
    email = data['email']
    username = data['username']
    password = data['password']
    industry = data['industry']
    school_year = data['school_year']
    user_type = data['user_type']

    initialize_db_connection()
    cursor = db_connection.cursor()

    try:
        sql = "INSERT INTO users (email, username, password, industry, school_year, user_type) VALUES (%s, %s, %s, %s, %s, %s)"
        values = (email, username, password, industry, school_year, user_type)
        cursor.execute(sql, values)
        db_connection.commit()
        return jsonify({'message': 'Account created successfully', 'email': email, 'username': username, 'user_type': user_type}), 200
    except Exception as e:
        return jsonify({'message': f'Error creating account: {str(e)}'}), 500
    finally:
        cursor.close()

# Logout endpoint.
@app.route('/logout', methods=['GET'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/available-matches', methods=['GET'])
def available_matches():
    initialize_db_connection()
    cursor = db_connection.cursor()

    try:
        sql = "SELECT username FROM users WHERE matched = 'no'"
        cursor.execute(sql)
        users = cursor.fetchall()

        usernames = [user[0] for user in users]
        return jsonify(usernames), 200
    except Exception as e:
        return jsonify({'message': f'Error fetching available matches: {str(e)}'}), 500
    finally:
        cursor.close()

if __name__ == '__main__':
    app.run(debug=True, threaded=True)
