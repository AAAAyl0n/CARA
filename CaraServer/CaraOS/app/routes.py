from flask import Blueprint, jsonify, request, current_app
from flask_login import login_user, current_user, logout_user, login_required
from app import db
from app.models import User, Message
import time
import numpy as np
import os
import logging
import threading
from app.cos import CosBucket
from app.gpt import GPT_Model
import json
from datetime import datetime, timezone
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
    
@bp.route('/')
def index():
    return 'Hello, Cara!'

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
    user = User(username=data['username'], email=data['email'], password=data['password'], avatar_url=data['avatar_url'])
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
    # 获取数据库中的所有用户的所有message
    messages = Message.query.all()
    results = []
    for msg in messages:
        sender = User.query.get(msg.user_id)
        results.append({'content': msg.content, 'date_posted': msg.date_posted, 'sender': sender.username, 'avatar_url': sender.avatar_url})
    
    return jsonify(results), 200

@bp.route('/api/get_info', methods=['GET'])
@login_required
def get_info():
    return jsonify({'username': current_user.username, 'email': current_user.email, 'avatar_url': current_user.avatar_url}), 200

@bp.route('/api/get_cara_info', methods=['GET'])
def get_cara_info():
    cara = User.query.filter_by(username='Cara').first()
    return jsonify({'username': cara.username, 'email': cara.email, 'avatar_url': cara.avatar_url}), 200

@bp.route('/api/admin/users', methods=['GET'])
@login_required
def admin_get_users():
    if current_user.username != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    users = User.query.all()
    return jsonify([{'username': user.username, 'email': user.email, 'avatar_url': user.avatar_url} for user in users]), 200

@bp.route('/api/upload_image', methods=['POST'])
def upload_image():
    print(current_app.config['TEMP_IMAGE_DIR'])
    image_file = request.files['image']
    image_name = image_file.filename
    image_path = f"{current_app.config['TEMP_IMAGE_DIR']}/{image_name}"
    image_file.save(image_path)
    bucket = CosBucket(secret_id=current_app.config['COS_SECRET_ID'], secret_key=current_app.config['COS_SECRET_KEY'], region=current_app.config['COS_REGION'])
    image_url = bucket.upload_file(image_path)
    return jsonify({'image_url': image_url}), 200

@bp.route('/api/add_knowledge', methods=['POST'])
def add_knowledge():
    data = request.get_json()
    knowledge_base = json.loads(open(current_app.config['KNOWLEDGE_BASE'], 'r').read())
    gm = GPT_Model(current_app)
    # 筛选出近五分钟内的数据
    latest_knowledge_base = [
        item for item in knowledge_base if (datetime.utcnow() - datetime.fromisoformat(item['timestamp'])).total_seconds() < 300
    ]
    data_text = gm.ask_image(data['url'], latest_knowledge_base)
    knowledge_item = {
        'timestamp': datetime.utcnow().isoformat(),
        'type': 'image',
        'url': data['url'],
        'text': data_text,
    }
    knowledge_base.append(knowledge_item)
    with open(current_app.config['KNOWLEDGE_BASE'], 'w') as f:
        json.dump(knowledge_base, f, indent=4)
    # 更新cache
    gm.update_cache(knowledge_base, current_app.config['CACHE_ID'])
    return jsonify({'message': 'Knowledge added successfully'}), 200

@bp.route('/api/get_knowledge', methods=['GET'])
def get_knowledge():
    knowledge_base = json.loads(open(current_app.config['KNOWLEDGE_BASE'], 'r').read())
    return jsonify(knowledge_base), 200

@bp.route('/api/answer_question', methods=['POST'])
def answer_question():
    data = request.get_json()
    gm = GPT_Model(current_app)
    messages = Message.query.all()
    answer = gm.answer_by_knowledge(messages, data['question'], current_app.config['CACHE_ID'])
    # 以Cara的身份发送消息
    message = Message(content=answer, user_id=User.query.filter_by(username='Cara').first().id)
    db.session.add(message)
    db.session.commit()
    return jsonify({'answer': answer}), 200

@bp.route('/api/delete_all_message', methods=['GET'])
def delete_message():
    messages = Message.query.all()
    for msg in messages:
        db.session.delete(msg)
    db.session.commit()
    return jsonify({'message': 'All messages deleted'}), 200
    
