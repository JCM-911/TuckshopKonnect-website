import os
from flask import Flask, request, jsonify, send_from_directory
from pymongo import MongoClient
from bson.objectid import ObjectId
import bcrypt
import jwt
from dotenv import load_dotenv

load_dotenv()

# Serve static files from the root directory
app = Flask(__name__, static_folder='.', static_url_path='')

# --- Database Setup ---
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/tuckshop")
client = MongoClient(MONGO_URI)
db = client.get_database()

# --- User Model (simplified for now) ---
users = db.users

# --- Default Admin User Creation ---
def create_default_admin():
    if not users.find_one({"username": "admin"}):
        hashed_password = bcrypt.hashpw(b'admin', bcrypt.gensalt())
        users.insert_one({
            "username": "admin",
            "password": hashed_password,
            "role": "admin"
        })
        print("Default admin user created.")

# --- API Routes ---
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    user = users.find_one({"username": username})

    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        # Generate JWT token
        token = jwt.encode(
            {'user_id': str(user['_id']), 'role': user.get('role', 'user')},
            os.environ.get("JWT_SECRET", "secret"),
            algorithm="HS256"
        )
        return jsonify({"token": token})
    else:
        return jsonify({"message": "Invalid credentials"}), 401

# --- Frontend Serving Routes ---
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)


if __name__ == '__main__':
    create_default_admin()
    app.run(debug=True, port=os.environ.get("PORT", 5000))