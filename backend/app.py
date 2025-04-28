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
    global WEBSITE_USER
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


# Get up to 10 favorite user locations
@app.route('/favorites/user', methods=['GET'])
def favorites():
    global WEBSITE_USER
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    cursor.execute("SELECT userId FROM users WHERE username = %s", (WEBSITE_USER,))
    user = cursor.fetchone()
    
    cursor.execute("""
        SELECT f.location_id, 
               IFNULL(cd.country, sd.subnational1) AS location_name, 
               CASE 
                   WHEN cd.country IS NOT NULL THEN 'country'
                   ELSE 'subnational'
               END AS location_type
        FROM favorites f
        LEFT JOIN country_data cd ON f.location_id = cd.location_id
        LEFT JOIN subnational_data sd ON f.location_id = sd.location_id
        WHERE f.userId = %s
    """, (user['userId'],))
    favorites = cursor.fetchall()

    # print(f"Fetched favorites for user {WEBSITE_USER}: {favorites}") 

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

# Add a location given by the user to favorites
@app.route('/addfavorite', methods=['POST'])
def add_favorite():
    global WEBSITE_USER
    data = request.get_json()
    username = WEBSITE_USER
    location_name = data.get('location_name')

    if not username or not location_name:
        return jsonify({'error': 'Missing username or location_name'}), 400
    
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Get userId from username
        cursor.execute("SELECT userId FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        user_id = user['userId']
        
        # Count how many favorites the user already has
        cursor.execute("SELECT COUNT(*) AS favorite_count FROM favorites WHERE userId = %s", (user_id,))
        count_result = cursor.fetchone()

        if count_result['favorite_count'] == 10:
            return jsonify({'error': 'Maximum number of favorites (10) reached'}), 403

        # Try finding location_id in country_data
        cursor.execute("SELECT location_id FROM country_data WHERE country = %s", (location_name,))
        location = cursor.fetchone()

        # If not found in country_data, check subnational_data
        if not location:
            cursor.execute("SELECT location_id FROM subnational_data WHERE subnational1 = %s", (location_name,))
            location = cursor.fetchone()

        if not location:
            return jsonify({'error': 'Location not found'}), 404

        location_id = location['location_id']

        # Step 4: Insert into favorites
        insert_sql = "INSERT INTO favorites (userId, location_id) VALUES (%s, %s)"
        cursor.execute(insert_sql, (user_id, location_id))
        connection.commit()

        return jsonify({'message': 'Favorite added successfully'}), 201

    except mysql.connector.Error as err:
        if err.errno == 1062:  # Duplicate favorite (primary key conflict)
            # return jsonify({'error': 'Favorite already exists'}), 409
            cursor.execute(
                "DELETE FROM favorites WHERE userId = %s AND location_id = %s",
                (user_id, location_id)
            )
            connection.commit()
            
            return jsonify({'message': 'Favorite removed successfully'}), 200
        print(err)
        return jsonify({'error': 'An error occurred'}), 500

    finally:
        cursor.close()
        connection.close()


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