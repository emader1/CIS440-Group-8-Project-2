from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# MySQL database connection details.
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
    try:
        sql = "SELECT * FROM users WHERE email = %s AND password = %s"
        values = (email, password)
        cursor.execute(sql, values)
        user = cursor.fetchone()
        cursor.close()

        if user:
            user_dict = {
                'id': user[0],
                'email': user[1],
                'username': user[2],
                'industry': user[3],
                'school_year': user[4],
                'user_type': user[5]
            }
            db_connection.commit()
            db_connection.close()
            return "<p>Login Successful!</p>"
        else:
            db_connection.close()
            return "<p>Error</p>"
    except Exception as e:
        db_connection.close()
        return "<p>Error</p>"

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
        db_connection.commit()
        cursor.close()
        return "<p>Account Created Successfully.</p>"
    except Exception as e:
        cursor.close()
        return "<p>Error Creating Account.</p>"

@app.route('/logout', methods=['GET'])
def logout():
    return "<p>Logged Out Successfully.</p>"
        
if __name__ == '__main__':
    app.run(debug=True)
