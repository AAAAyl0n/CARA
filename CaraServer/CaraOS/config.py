import os
import threading

class Config:
    SERVER_PORT = os.environ.get('PORT') or 9050 # 服务器端口
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'CARA112233' # 用于保护表单免受跨站请求伪造（CSRF）的攻击
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY') # OpenAI API密钥
    # 设置OPENAI_API_KEY为你的OpenAI API密钥    
    os.environ['OPENAI_API_KEY'] = OPENAI_API_KEY # 用于调用OpenAI API
    OPENAI_BASE_URL = os.environ.get('OPENAI_BASE_URL') or 'https://gpt.lucent.blog/v1' # OpenAI API基础URL
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///site.db' # 数据库URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False # 关闭对模型修改的监视
    TEMP_AUDIO_DIR = os.path.join(os.getcwd(), 'TempAudio') # 临时音频文件夹
    SILENCE_THRESHOLD = 1100  # 静音阈值
    SILENCE_DURATION = 2  # 检测到静音后等待的秒数
    WINDOW_SIZE = 10  # 滑动窗口大小
    LAST_SOUND_TIME = 0 # 上一次有声音的时间
    TEMP_PCM_FILE = os.path.join(TEMP_AUDIO_DIR, 'temp_audio.pcm') # 临时PCM文件路径
    LOCK = threading.Lock()  # 锁
    COS_SECRET_ID = os.environ.get('COS_SECRET_ID') # 腾讯云对象存储Secret ID
    COS_SECRET_KEY = os.environ.get('COS_SECRET_KEY') # 腾讯云对象存储Secret Key
    COS_REGION = os.environ.get('COS_REGION') # 腾讯云对象存储地域
    TEMP_IMAGE_DIR = os.path.join(os.getcwd(), 'TempAudio') # 临时音频文件夹
    KNOWLEDGE_BASE = './transcriptions.json' # 知识库文件
    MOONSHOT_API_KEY = os.environ.get('MOONSHOT_API_KEY') # Moonshot API密钥
    MOONSHOT_BASE_URL = os.environ.get('MOONSHOT_BASE_URL') or 'https://api.moonshot.cn/v1' # Moonshot API基础URL
    CACHE_ID = os.environ.get('CACHE_ID')

