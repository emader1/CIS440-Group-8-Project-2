from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_session import Session
import mysql.connector
import secrets

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config['SESSION_TYPE'] = 'filesystem'

def create_db_connection():
    return mysql.connector.connect(
        host="107.180.1.16",
        port="3306",
        user="spring2024Cteam8",
        password="spring2024Cteam8",
        database="spring2024Cteam8"
    )

@app.route('/', methods=['OPTIONS'])
def handle_options():
    return '', 204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    }

# Routes for the login page.
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
        cursor.execute(sql, (email, password))
        user = cursor.fetchone()
        if user:
            user_dict = {
                'id': user[0],
                'email': user[1],
                'username': user[2],
                'industry': user[4],
                'school_year': user[5],
                'user_type': user[6],
                'matched': user[8],
                'match_username': user[9]
            }

            session['user'] = user_dict
            session.modified = True
            return jsonify({'message': 'Login successful', 'user': user_dict}), 200
        else:
            return jsonify({'message': 'Invalid credentials.'}), 401
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500
    finally:
        cursor.close()
        connection.close()

# Route to create an account.
@app.route('/create_account', methods=['POST'])
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
        return jsonify({'message': 'Account created successfully', 'email': email, 'username': username, 'user_type': user_type}), 200
    except Exception as e:
        return jsonify({'message': f'Error creating account: {str(e)}'}), 500
    finally:
        cursor.close()
        connection.close()

# Route to logout.
@app.route('/logout', methods=['GET'])
def logout():
    session.clear()
    session.modified = True
    return jsonify({'message': 'Logged out successfully.'}), 200

# Routes for dashboard.
# Route for updating calendar.
@app.route('/fetch_data', methods=['GET'])
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

# Route to show available matches.
@app.route('/available_matches', methods=['GET'])
def available_matches():
    connection = create_db_connection()
    cursor = connection.cursor()

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
        connection.close()

# Route to update matches.
@app.route('/update_match', methods=['POST'])
def update_match():
    if 'user' not in session:
        return jsonify({'message': 'User not logged in.'}), 401

    data = request.get_json()
    user_id = session['user']['id']
    match_username = data['match_username']

    connection = create_db_connection()
    cursor = connection.cursor()

    try:
        update_sql = "UPDATE users SET matched = 'yes', match_username = %s WHERE id = %s"
        cursor.execute(update_sql, (match_username, user_id))

        cursor.execute("SELECT id FROM users WHERE username = %s", (match_username,))
        match_user_id = cursor.fetchone()[0]
        cursor.execute(update_sql, (session['user']['username'], match_user_id))

        connection.commit()
        return jsonify({'message': 'Match updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': f'Error updating match: {str(e)}'}), 500
    finally:
        cursor.close()
        connection.close()

# Route to fetch matches.
@app.route('/fetch_matches', methods=['GET'])
def fetch_matches():
    if 'user' not in session:
        return jsonify({'message': 'User not logged in.'}), 401

    connection = create_db_connection()
    cursor = connection.cursor()

    try:
        user_id = session['user']['id']
        sql = "SELECT match_username FROM users WHERE id = %s AND matched = 'yes'"
        cursor.execute(sql, (user_id,))
        matches = cursor.fetchall()

        matched_usernames = [match[0] for match in matches if match[0]]
        return jsonify(matched_usernames), 200
    except Exception as e:
        return jsonify({'message': f'Error fetching matches: {str(e)}'}), 500
    finally:
        cursor.close()
        connection.close()

Session(app)

if __name__ == '__main__':
    app.run()
