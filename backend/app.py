from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Public IP for DB
MYSQL_HOST = "34.60.206.18"
# DB Username ("root" by default) 
MYSQL_USER = "root"          
# DB Name and Password    
MYSQL_PASSWORD = "group109"  
MYSQL_DB = "oncelerwatch"    

def get_db_connection():
    connection = mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB
    )
    return connection

@app.route('/api/users', methods=['GET'])
def index():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Fetch first 15 users and their emails
    cursor.execute("SELECT username, email FROM users LIMIT 15")
    users = cursor.fetchall()

    cursor.close()
    connection.close()
    return jsonify(users)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8080)