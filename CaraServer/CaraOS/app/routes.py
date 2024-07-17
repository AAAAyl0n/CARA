from flask import Blueprint, jsonify, request, current_app
from flask_login import login_user, current_user, logout_user, login_required
from app import db
from app.models import User, Message
import time
import numpy as np
import os
import logging
import threading

bp = Blueprint('main', __name__)

window = []
lock = threading.Lock()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def is_silent(data, silence_threshold):
    try:
        audio_data = np.frombuffer(data, dtype=np.int16)
        if len(audio_data) == 0:
            return True, 0
        audio_data = audio_data.reshape(-1, 2)
        abs_left = np.mean(np.abs(audio_data[:, 0]))
        abs_right = np.mean(np.abs(audio_data[:, 1]))
        avg_abs = (abs_left + abs_right) / 2
        return avg_abs < silence_threshold, avg_abs
    except Exception as e:
        logging.error(f"Error in calculating average absolute value: {e}")
        return True, 0

@bp.route('/audio_stream', methods=['POST'])
def audio_stream():
    global window
    data = request.data
    silence_threshold = current_app.config['SILENCE_THRESHOLD']
    temp_pcm_file = os.path.join(current_app.config['TEMP_AUDIO_DIR'], 'temp_audio.pcm')
    
    logging.info(f"Received data of length: {len(data)} bytes")
    silent, rms = is_silent(data, silence_threshold)
    window.append(rms)
    if len(window) > current_app.config['WINDOW_SIZE']:
        window.pop(0)
    avg_rms = np.mean(window)
    logging.info(f"Current RMS: {rms}, Average RMS over last {current_app.config['WINDOW_SIZE']} packets: {avg_rms}")
    if avg_rms >= silence_threshold:
        current_app.config['LAST_SOUND_TIME'] = time.time()
    with lock:
        with open(temp_pcm_file, 'ab') as f:
            f.write(data)
    return '', 200

@bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first() or User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'User already exists'}), 400
    user = User(username=data['username'], email=data['email'], password=data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and user.password == data['password']:
        login_user(user)
        return jsonify({'message': 'Login successful'}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

@bp.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logout successful'}), 200

@bp.route('/api/messages', methods=['POST'])
@login_required
def send_message():
    data = request.get_json()
    message = Message(content=data['content'], user_id=current_user.id)
    db.session.add(message)
    db.session.commit()
    return jsonify({'message': 'Message sent successfully'}), 201

@bp.route('/api/messages', methods=['GET'])
@login_required
def get_messages():
    messages = Message.query.filter_by(user_id=current_user.id).all()
    return jsonify([{'content': msg.content, 'date_posted': msg.date_posted} for msg in messages]), 200

@bp.route('/api/admin/users', methods=['GET'])
@login_required
def admin_get_users():
    if current_user.username != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    users = User.query.all()
    return jsonify([{'username': user.username, 'email': user.email} for user in users]), 200
