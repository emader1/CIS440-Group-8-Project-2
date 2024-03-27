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

# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']
    cursor = db_connection.cursor()
    try:
        sql = "SELECT * FROM users WHERE email = %s AND password = %s"
        values = (email, password)
        cursor.execute(sql, values)
        user = cursor.fetchone()  # Fetch the user data
        cursor.close()  # Close the cursor after consuming the result

        if user:
            return jsonify({'message': 'Login successful', 'user': user}), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        cursor.close()  # Close the cursor in case of an exception
        return jsonify({'message': f'Error: {str(e)}'}), 500

# Create account endpoint
@app.route('/create-account', methods=['POST'])
def create_account():
    data = request.get_json()
    email = data['email']
    username = data['username']
    password = data['password']
    industry = data['industry']
    school_year = data['school_year']
    user_type = data['user_type']

    cursor = db_connection.cursor()
    try:
        sql = "INSERT INTO users (email, username, password, industry, school_year, user_type) VALUES (%s, %s, %s, %s, %s, %s)"
        values = (email, username, password, industry, school_year, user_type)
        cursor.execute(sql, values)
        db_connection.commit()  # Commit the changes to the database
        cursor.close()
        return jsonify({'message': 'Account created successfully', 'email': email, 'username': username, 'user_type': user_type}), 200
    except Exception as e:
        cursor.close()
        return jsonify({'message': f'Error creating account: {str(e)}'}), 500
    
# Logout endpoint
@app.route('/logout', methods=['GET'])
def logout():
    # Clear any session data or cookies if needed
    return jsonify({'message': 'Logged out successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True)
