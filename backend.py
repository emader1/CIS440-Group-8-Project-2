from flask import Flask, request, jsonify, session
from flask_session import Session
import mysql.connector
from flask_cors import CORS
import secrets

secret_key = secrets.token_bytes(16)
secret_key_hex = secrets.token_hex(16)

print(secret_key_hex)

app = Flask(__name__)
CORS(app)
app.secret_key = secret_key_hex  # Set a secret key for session management
app.config['SESSION_TYPE'] = 'filesystem'  # Configure session type (can be 'filesystem', 'redis', etc.)
app.config['SESSION_COOKIE_NAME'] = 'my_session_cookie'  # Set a session cookie name
Session(app)

# Function to create a new database connection
def create_db_connection():
    return mysql.connector.connect(
        host="107.180.1.16",
        port="3306",
        user="spring2024Cteam8",
        password="spring2024Cteam8",
        database="spring2024Cteam8"
    )

# Initialize db_connection globally
db_connection = None

# Function to initialize db_connection if not already initialized
def initialize_db_connection():
    global db_connection
    if db_connection is None:
        db_connection = create_db_connection()

# Login endpoint
# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']

    initialize_db_connection()  # Ensure db_connection is initialized
    cursor = db_connection.cursor()

    try:
        sql = "SELECT * FROM users WHERE email = %s AND password = %s"
        values = (email, password)
        cursor.execute(sql, values)
        user = cursor.fetchone()  # Fetch the user data

        if user:
            user_dict = {
                'id': user[0],
                'email': user[1],
                'username': user[2],
                'industry': user[3],
                'school_year': user[4],
                'user_type': user[5]
            }

            # Store user data in the session
            session['user'] = user_dict

            return jsonify({'message': 'Login successful', 'user': user_dict}), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500
    finally:
        cursor.close()


# Function to fetch matches from the database based on user type and industry

# Function to fetch matches from the database based on user type and industry
@app.route('/fetch-matches', methods=['GET'])
def fetch_matches():
    if 'user' not in session:
        return jsonify({'message': 'User not logged in'}), 401

    user_dict = session['user']
    matches = query_matches(user_dict)

    print('Matches found:', matches)  # Print matches to console for verification

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
            return []  # Return an empty list for invalid user types

        cursor.execute(sql, (industry,))
        matches = cursor.fetchall()
        return matches
    except Exception as e:
        return []  # Return an empty list if there's an error fetching matches
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

    initialize_db_connection()  # Ensure db_connection is initialized
    cursor = db_connection.cursor()

    try:
        sql = "INSERT INTO users (email, username, password, industry, school_year, user_type) VALUES (%s, %s, %s, %s, %s, %s)"
        values = (email, username, password, industry, school_year, user_type)
        cursor.execute(sql, values)
        db_connection.commit()  # Commit the changes to the database
        return jsonify({'message': 'Account created successfully', 'email': email, 'username': username, 'user_type': user_type}), 200
    except Exception as e:
        return jsonify({'message': f'Error creating account: {str(e)}'}), 500
    finally:
        cursor.close()

# Logout endpoint
@app.route('/logout', methods=['GET'])
def logout():
    # Clear session data
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200


if __name__ == '__main__':
    app.run(debug=True)
