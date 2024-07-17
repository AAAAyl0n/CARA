import os
import threading

class Config:
    SERVER_PORT = 5004
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'CARA112233' # 用于保护表单免受跨站请求伪造（CSRF）的攻击
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY') # OpenAI API密钥
    # 设置OPENAI_API_KEY为你的OpenAI API密钥    
    os.environ['OPENAI_API_KEY'] = OPENAI_API_KEY # 用于调用OpenAI API
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///site.db' # 数据库URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False # 关闭对模型修改的监视
    TEMP_AUDIO_DIR = 'TempAudio' # 临时音频文件夹
    SILENCE_THRESHOLD = 1100  # 静音阈值
    SILENCE_DURATION = 2  # 检测到静音后等待的秒数
    WINDOW_SIZE = 10  # 滑动窗口大小
    LAST_SOUND_TIME = 0 # 上一次有声音的时间
    TEMP_PCM_FILE = os.path.join(TEMP_AUDIO_DIR, 'temp_audio.pcm') # 临时PCM文件路径
    LOCK = threading.Lock()  # 锁

