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

    cursor.execute("SELECT DISTINCT location_id,country FROM favorites WHERE userId = %s", (WEBSITE_USER,))
    favorites = cursor.fetchall()

    cursor.close()
    connection.close()
    return jsonify(favorites)

# Lists most viewed countries and subnations
@app.route('/popular', methods=['GET'])
def popular():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute('SELECT DISTINCT country,views FROM country_data ORDER BY views DESC LIMIT 10')
    favorites = cursor.fetchall()

    cursor.close()
    connection.close()
    return jsonify(favorites)


# Lists all the information about a country
@app.route('/country/country_name', methods=['POST'])
def country_detail():
    data = request.get_json()
    country_name = data.get('username')
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM country_data WHERE country = %s", (country_name,))
    country = cursor.fetchone()

    if country:
        cursor.execute("UPDATE country_data SET views = views + 1 WHERE country = %s", (country_name,))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify(country)
    else:
        cursor.close()
        connection.close()
        return jsonify({"error": "Country not found"}), 404


# Lists all the information about a subnation
@app.route('/subnation', methods=['POST'])
def subnation_detail():
    data = request.get_json()
    subnation_name = data.get('username')
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM subnational_data WHERE subnational1 = %s", (subnation_name,))
    subnation = cursor.fetchone()

    if subnation:
        cursor.execute("UPDATE subnational_data SET views = views + 1 WHERE subnational1 = %s", (subnation_name,))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify(subnation)
    else:
        cursor.close()
        connection.close()
        return jsonify({"error": "Subnation not found"}), 404


# Grabs all the statistics we made advanced queries for
@app.route('/statistics', methods=['GET'])
def statsitics() :
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute('SELECT * FROM country_carbon_status')
    carbon_status = cursor.fetchall()

    cursor.execute('SELECT * FROM loss_ratio')
    loss_ratio = cursor.fetchall()

    cursor.execute('SELECT * FROM below_average')
    below_average = cursor.fetchall()

    cursor.execute('SELECT * FROM above_average')
    above_average = cursor.fetchall()

    cursor.close()
    connection.close()
    l = [carbon_status, loss_ratio, below_average, above_average]
    return jsonify(l)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8080)