from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MySQL database connection details
db_connection = mysql.connector.connect(
    host="107.180.1.16",
    port="3306",
    user="spring2024Cteam8",
    password="spring2024Cteam8",
    database="spring2024Cteam8"
)

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']

    cursor = db_connection.cursor()
    sql = "SELECT * FROM users WHERE email = %s AND password = %s"
    values = (email, password)
    cursor.execute(sql, values)
    user = cursor.fetchone()  # Fetch and consume the result

    if user:
        # Since we fetched the result, we don't need to close the cursor here
        return jsonify({'message': 'Login successful', 'user': user}), 200
    else:
        # Similarly, we don't need to close the cursor if there are no results
        return jsonify({'message': 'Invalid credentials'}), 401



@app.route('/create-account', methods=['POST'])
def create_account():
    data = request.get_json()
    email = data['email']
    username = data['username']
    password = data['password']
    industry = data['industry']
    school_year = data['school_year']
    user_type = data['user_type']

    # Perform database operations (e.g., insert user data into the database)
    cursor = db_connection.cursor()
    sql = "INSERT INTO users (email, username, password, industry, school_year, user_type) VALUES (%s, %s, %s, %s, %s, %s)"
    values = (email, username, password, industry, school_year, user_type)

    try:
        cursor.execute(sql, values)
        db_connection.commit()
        cursor.close()
        return jsonify({'message': 'Account created successfully', 'email': email, 'username': username, 'user_type': user_type}), 200
    except Exception as e:
        return jsonify({'message': f'Error creating account: {str(e)}'}), 500
    
@app.route('/logout', methods=['GET'])
def logout():
    # Clear any session data or cookies if needed
    return jsonify({'message': 'Logged out successfully'}), 200


if __name__ == '__main__':
    app.run(debug=True)
