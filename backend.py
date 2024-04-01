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
            user_dict = {
                'id': user[0],
                'email': user[1],
                'username': user[2],
                'industry': user[3],
                'school_year': user[4],
                'user_type': user[5]
            }
            # Manually commit the changes and close the connection after consuming the result
            db_connection.commit()
            db_connection.close()
            return jsonify({'message': 'Login successful', 'user': user_dict}), 200
        else:
            # Close the connection if no user is found
            db_connection.close()
            return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        # Close the connection in case of an exception
        db_connection.close()
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
@app.route('/matches', methods=['GET'])
def get_matches():
    # Get the user's industry from the request
    industry = request.args.get('industry')
    cursor = db_connection.cursor()
    try:
        # Fetch mentees available to mentors in the same industry
        sql_mentees = "SELECT * FROM users WHERE user_type = 'Mentee' AND industry = %s"
        cursor.execute(sql_mentees, (industry,))
        mentees = cursor.fetchall()
        # Fetch mentors available to mentees in the same industry
        sql_mentors = "SELECT * FROM users WHERE user_type = 'Mentor' AND industry = %s"
        cursor.execute(sql_mentors, (industry,))
        mentors = cursor.fetchall()
        cursor.close()
        # Return available matches
        return jsonify({'mentees': mentees, 'mentors': mentors}), 200
    except Exception as e:
        cursor.close()
        return jsonify({'message': f'Error fetching matches: {str(e)}'}), 500
if __name__ == '__main__':
    app.run(debug=True)








