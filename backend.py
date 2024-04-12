from flask import Flask, request, jsonify, session
from flask_session import Session
import mysql.connector
from flask_cors import CORS
import secrets

secret_key = secrets.token_bytes(16)
secret_key_hex = secrets.token_hex(16)

app = Flask(__name__)
CORS(app, origins='*', supports_credentials=True)

app.secret_key = secret_key_hex
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_NAME'] = 'my_session_cookie'
Session(app)

# Function to create a new database connection.
def create_db_connection():
    return mysql.connector.connect(
        host="107.180.1.16",
        port="3306",
        user="spring2024Cteam8",
        password="spring2024Cteam8",
        database="spring2024Cteam8"
    )

# Function to handle OPTIONS requests.
def handle_options():
    return '', 204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    }

# Route to login.
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']

    connection = create_db_connection()
    cursor = connection.cursor()

    try:
        sql = "SELECT * FROM users WHERE email = %s AND password = %s"
        values = (email, password)
        cursor.execute(sql, values)
        user = cursor.fetchone()

        if user:
            user_dict = {
                'id': user[0],
                'email': user[1],
                'username': user[2],
                'industry': user[3],
                'school_year': user[4],
                'user_type': user[5]
            }

            connection.close()
            cursor.close()

            session['user'] = user_dict

            return jsonify({'message': 'Login successful', 'user': user_dict}), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

# Route to fetch matches from the database based on user type and industry.
@app.route('/fetch-matches', methods=['GET'])
def fetch_matches():
    if 'user' not in session:
        return jsonify({'message': 'User not logged in'}), 401

    user_dict = session['user']
    matches = query_matches(user_dict)

    return jsonify({'matches': matches}), 200

def query_matches(user_dict):
    user_type = user_dict['user_type']
    industry = user_dict['industry']

    connection = create_db_connection()
    cursor = connection.cursor()

    try:
        if user_type == 'Mentee':
            sql = "SELECT * FROM users WHERE user_type = 'Mentor' AND industry = %s"
        elif user_type == 'Mentor':
            sql = "SELECT * FROM users WHERE user_type = 'Mentee' AND industry = %s"
        elif user_type == 'Manager':
            sql = "SELECT * FROM users WHERE industry = %s"
        else:
            return []
        
        connection.close()
        cursor.close()

        cursor.execute(sql, (industry,))
        matches = cursor.fetchall()
        return matches
    
    except Exception as e:
        return []
    finally:
        cursor.close()

# Route to create account.
@app.route('/create-account', methods=['POST'])
def create_account():
    data = request.get_json()
    email = data['email']
    username = data['username']
    password = data['password']
    industry = data['industry']
    school_year = data['school_year']
    user_type = data['user_type']

    connection = create_db_connection()
    cursor = connection.cursor()

    try:
        sql = "INSERT INTO users (email, username, password, industry, school_year, user_type) VALUES (%s, %s, %s, %s, %s, %s)"
        values = (email, username, password, industry, school_year, user_type)
        cursor.execute(sql, values)
        connection.commit()

        connection.close()
        cursor.close()

        return jsonify({'message': 'Account created successfully', 'email': email, 'username': username, 'user_type': user_type}), 200
    except Exception as e:
        return jsonify({'message': f'Error creating account: {str(e)}'}), 500

# Route to logout.
@app.route('/logout', methods=['GET'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200

# Route to find available matches.
@app.route('/available-matches', methods=['GET', 'OPTIONS'])
def available_matches():
    connection = create_db_connection()
    cursor = connection.cursor()

    try:
        sql = "SELECT username FROM users WHERE matched = 'no'"
        cursor.execute(sql)
        users = cursor.fetchall()

        usernames = [user[0] for user in users]

        connection.close()
        cursor.close()

        return jsonify(usernames), 200
    except Exception as e:
        return jsonify({'message': f'Error fetching available matches: {str(e)}'}), 500

# Route for populating calendar with data from SQL server.
@app.route('/fetch_data', methods=['GET', 'OPTIONS'])
def fetch_data():
    connection = create_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute('SELECT task_description, due_date FROM mentee_tasks')
        data = cursor.fetchall()

        events = {}
        for row in data:
            event_name = row[0]
            event_date = row[1]
            events[event_name] = event_date

        connection.close()
        cursor.close()

        return jsonify(events)
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
