from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_session import Session
import mysql.connector
import secrets

app = Flask(__name__)
CORS(app, supports_credentials=True)

secret_key_hex = secrets.token_hex(16)
app.secret_key = secret_key_hex

app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = True
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
            # Keeps track of all of the current user's data.
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

            connection.close()
            cursor.close()

            session['user'] = user_dict
            session.modified = True
            return jsonify({'message': 'Login successful', 'user': user_dict}), 200
            
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

# Route to create account.
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

        connection.close()
        cursor.close()
        session.modified = True

        return jsonify({'message': 'Account created successfully', 'email': email, 'username': username, 'user_type': user_type}), 200
    except Exception as e:
        return jsonify({'message': f'Error creating account: {str(e)}'}), 500

# Route to logout.
@app.route('/logout', methods=['GET'])
def logout():
    session.clear()
    session.modified = True
    return jsonify({'message': 'Logged out successfully'}), 200

# Routes for the dashboard.
# Route for populating calendar with data from SQL server.
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

# Route to fetch matches.
@app.route('/fetch_matches', methods=['GET'])
def fetch_matches():
    print(session)
    if 'user' in session:
        user_data = session['user']
        user_type = user_data['user_type']
       
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
            
            cursor.execute(sql)
            users = cursor.fetchall()
            print("Session variables in fetch_matches:", session)

            usernames = [user[0] for user in users]

            connection.close()
            cursor.close()

            return jsonify(usernames), 200
        except Exception as e:
            return jsonify({'message': f'Error fetching available matches: {str(e)}'}), 500
    else:
        return jsonify({'message': 'User not logged in'})

# Route
@app.route('/send_tasks', methods=['POST'])
def send_tasks():
    connection = create_db_connection()
    cursor = connection.cursor()

    if 'user' not in session:
        return jsonify({'message': 'User not logged in'}), 401

    user_dict = session['user']
    if user_dict['user_type'] != 'Mentor':
        return jsonify({'message': 'Only Mentors can send tasks'}), 403

    data = request.get_json()
    mentee_id = data['mentee_id']
    task_title = data['task_title']
    task_description = data['task_description']
    due_date = data['due_date']

    try:
        sql = "INSERT INTO tasks (MenteeID, MentorID, TaskTitle, TaskDescription, DueDate) VALUES (%s, %s, %s, %s, %s)"
        values = (mentee_id, user_dict['id'], task_title, task_description, due_date)
        cursor.execute(sql, values)
        connection.commit()

        connection.close()
        cursor.close()

        return jsonify({'message': 'Task sent successfully'}), 200
    except Exception as e:
        return jsonify({'message': f'Error sending task: {str(e)}'}), 500

# Route
@app.route('/fetch_tasks', methods=['GET'])
def fetch_tasks():
    connection = create_db_connection()
    cursor = connection.cursor()

    if 'user' not in session:
        return jsonify({'message': 'User not logged in'}), 401
    user_dict = session['user']
    if user_dict['user_type'] == 'Mentee':
        try:
            sql = "SELECT * FROM tasks WHERE MenteeID = %s AND IsComplete = 0"
            cursor.execute(sql, (user_dict['id'],))
            tasks = cursor.fetchall()

            connection.close()
            cursor.close()

            return jsonify({'tasks': tasks}), 200
        except Exception as e:
            return jsonify({'message': f'Error fetching tasks: {str(e)}'}), 500
    else:
        return jsonify({'message': 'Only Mentees can fetch tasks'}), 403

# Route
@app.route('/complete_task/<int:task_id>', methods=['PUT'])
def complete_task(task_id):
    connection = create_db_connection()
    cursor = connection.cursor()

    if 'user' not in session:
        return jsonify({'message': 'User not logged in'}), 401

    user_dict = session['user']
    if user_dict['user_type'] == 'Mentee':
        try:
            sql = "UPDATE tasks SET IsComplete = 1 WHERE TaskID = %s AND MenteeID = %s"
            cursor.execute(sql, (task_id, user_dict['id']))
            connection.commit()

            connection.close()
            cursor.close()
            
            return jsonify({'message': 'Task completed successfully'}), 200
        except Exception as e:
            return jsonify({'message': f'Error completing task: {str(e)}'}), 500
    else:
        return jsonify({'message': 'Only Mentees can complete tasks'}), 403
    
Session(app)

if __name__ == '__main__':
    app.run()
