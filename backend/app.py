from flask import Flask, jsonify, request
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

WEBSITE_USER = None

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


# Verify user exists
@app.route('/login/user', methods=['POST'])
def check_login():
    data = request.get_json()
    username = data.get('username')
    WEBSITE_USER = data.get('username')
    password = data.get('password')

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT DISTINCT userId FROM users WHERE password = %s AND username = %s", (password, username))
    user = cursor.fetchone()

    cursor.close()
    connection.close()

    if user:
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401


# Shows users' favorites
@app.route('/favorites/user', methods=['GET'])
def favorites():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT DISTINCT location_id FROM favorites WHERE userId = %s" (WEBSITE_USER))
    favorites = cursor.fetchall()

    cursor.close()
    connection.close()
    return jsonify(favorites)


# Lists most viewed countries and subnations
@app.route('/popular', methods=['GET'])
def popular():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute('SELECT DISTINCT country FROM countries ORDER BY views DESC LIMIT 10')
    favorites = cursor.fetchall()

    cursor.close()
    connection.close()
    return jsonify(favorites)


# Lists all the information about a country
@app.route('/country/country_name', methods=['POST'])
def country_detail(country_name):
    data = request.get_json()
    country_name = data.get('username')
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM countries WHERE country_name = %s" (country_name))
    country = cursor.fetchone()

    cursor.close()
    connection.close()

    if country:
        return jsonify(country)
    else:
        return jsonify({"error": "Country not found"}), 404


# Lists all the information about a subnation
@app.route('/subnation/subnation_name', methods=['POST'])
def subnation_detail():
    data = request.get_json()
    subnation_name = data.get('username')
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM subnations WHERE subnation_name = %s" (subnation_name))
    subnation = cursor.fetchone()

    cursor.close()
    connection.close()

    if subnation:
        return jsonify(subnation)
    else:
        return jsonify({"error": "Subnation not found"}), 404

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8080)