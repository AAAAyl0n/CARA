import os
import threading

class Config:
    SERVER_PORT = 5004
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'CARA112233'
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    # 设置OPENAI_API_KEY为你的OpenAI API密钥    
    os.environ['OPENAI_API_KEY'] = OPENAI_API_KEY
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///site.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    TEMP_AUDIO_DIR = 'TempAudio'
    SILENCE_THRESHOLD = 1100  # 静音阈值
    SILENCE_DURATION = 2  # 检测到静音后等待的秒数
    WINDOW_SIZE = 10  # 滑动窗口大小
    LAST_SOUND_TIME = 0
    TEMP_PCM_FILE = os.path.join(TEMP_AUDIO_DIR, 'temp_audio.pcm')
    LOCK = threading.Lock()  # 定义一个锁对象

