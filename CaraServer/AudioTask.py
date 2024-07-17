from flask import Flask, request
import os
import threading
import time
import numpy as np
import wave
from pydub import AudioSegment
from openai import OpenAI
import queue
import logging
from scipy.io import wavfile  # 确保导入scipy.io.wavfile

client = OpenAI()

app = Flask(__name__)

# 临时PCM文件路径
temp_audio_dir = 'TempAudio'
if not os.path.exists(temp_audio_dir):
    os.makedirs(temp_audio_dir)

temp_pcm_file = os.path.join(temp_audio_dir, 'temp_audio.pcm')
silence_threshold = 1100  # 静音阈值，具体值需根据实际情况调整
silence_duration = 2  # 检测到静音后等待的秒数
last_sound_time = time.time()

# 滑动窗口参数
window_size = 10
window = []

# 锁对象，用于线程同步
lock = threading.Lock()

# 音频队列，用于线程间通信
audio_queue = queue.Queue()

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def is_silent(data):
    try:
        # 读取数据为np.int16
        audio_data = np.frombuffer(data, dtype=np.int16)
        
        if len(audio_data) == 0:
            return True, 0
        
        # 因为是双声道音频，需要将数据reshape
        audio_data = audio_data.reshape(-1, 2)
        
        # 计算左声道和右声道的平均绝对值
        abs_left = np.mean(np.abs(audio_data[:, 0]))
        abs_right = np.mean(np.abs(audio_data[:, 1]))
        
        # 计算总体平均绝对值
        avg_abs = (abs_left + abs_right) / 2
        
        return avg_abs < silence_threshold, avg_abs
    except Exception as e:
        logging.error(f"Error in calculating average absolute value: {e}")
        return True, 0

@app.route('/audio_stream', methods=['POST'])
def audio_stream():
    global last_sound_time, window
    data = request.data
    logging.info(f"Received data of length: {len(data)} bytes")
    
    silent, rms = is_silent(data)
    window.append(rms)
    if len(window) > window_size:
        window.pop(0)
    
    avg_rms = np.mean(window)
    logging.info(f"Current RMS: {rms}, Average RMS over last {window_size} packets: {avg_rms}")
    
    if avg_rms >= silence_threshold:
        last_sound_time = time.time()
    
    with lock:
        with open(temp_pcm_file, 'ab') as f:
            f.write(data)

    return '', 200

def run_flask_app():
    app.run(host='0.0.0.0', port=5001, threaded=True)

def convert_pcm_to_wav(pcm_file, wav_file, channels=2, rate=44100, sampwidth=2):
    try:
        with open(pcm_file, 'rb') as pcmfile:
            pcm_data = pcmfile.read()
        with wave.open(wav_file, 'wb') as wavfile:
            wavfile.setnchannels(channels)
            wavfile.setsampwidth(sampwidth)
            wavfile.setframerate(rate)
            wavfile.writeframes(pcm_data)
    except Exception as e:
        logging.error(f"Error converting PCM to WAV: {e}")

def process_audio_files():
    timestamp = int(time.time())
    output_wav_file = os.path.join(temp_audio_dir, f'temp_{timestamp}.wav')
    try:
        with lock:
            convert_pcm_to_wav(temp_pcm_file, output_wav_file)
            os.remove(temp_pcm_file)
    except Exception as e:
        logging.error(f"Error processing audio files: {e}")
    return output_wav_file

def calculate_avg_volume(wav_file):
    try:
        rate, data = wavfile.read(wav_file)
        logging.info(f"Sample rate: {rate}, Data shape: {data.shape}")

        # 如果是双声道音频，分别计算两个声道的平均绝对值
        if data.ndim == 2:
            abs_left = np.mean(np.abs(data[:, 0]))
            abs_right = np.mean(np.abs(data[:, 1]))
            avg_abs = (abs_left + abs_right) / 2
        else:
            # 单声道
            avg_abs = np.mean(np.abs(data))

        logging.info(f"Average absolute volume: {avg_abs}")
        return avg_abs
    except Exception as e:
        logging.error(f"Error calculating average volume: {e}")
        return 0

def detect_silence():
    global last_sound_time
    while True:
        try:
            time_since_last_sound = time.time() - last_sound_time
            if time_since_last_sound > silence_duration and os.path.exists(temp_pcm_file) and os.path.getsize(temp_pcm_file) > 0:
                wav_file = process_audio_files()
                audio_queue.put(wav_file)
                last_sound_time = time.time()  # 重置时间
            time.sleep(0.02)
        except Exception as e:
            logging.error(f"Error in silence detection: {e}")

def convert_wav_to_mp3(wav_file, mp3_file):
    try:
        audio = AudioSegment.from_wav(wav_file)
        audio.export(mp3_file, format="mp3")
    except Exception as e:
        logging.error(f"Error converting WAV to MP3: {e}")

def process_audio_queue(): #音频处理线程
    while True:
        try:
            wav_file = audio_queue.get()
            if wav_file is None:
                break
            
            avg_volume = calculate_avg_volume(wav_file)
            logging.info(f"Average volume of {wav_file}: {avg_volume}")
            
            if avg_volume < silence_threshold:
                logging.info(f"Discarding {wav_file} due to low volume")
                os.remove(wav_file)
                continue
            
            mp3_file = wav_file.replace('.wav', '.mp3')
            convert_wav_to_mp3(wav_file, mp3_file)
            with open(mp3_file, "rb") as audio_file:
                logging.info("File opened.")
                transcription = client.audio.transcriptions.create(
                    model="whisper-1", 
                    file=audio_file
                )
                logging.info(transcription.text)
            os.remove(wav_file)
            os.remove(mp3_file)
        except Exception as e:
            logging.error(f"Error processing audio queue: {e}")

if __name__ == '__main__':
    # 删除已有的临时文件和输出文件
    if os.path.exists(temp_pcm_file):
        os.remove(temp_pcm_file)

    # 启动Flask应用线程
    flask_thread = threading.Thread(target=run_flask_app)
    flask_thread.start()

    # 启动静音检测线程
    silence_detection_thread = threading.Thread(target=detect_silence)
    silence_detection_thread.start()

    # 启动音频处理线程
    audio_processing_thread = threading.Thread(target=process_audio_queue)
    audio_processing_thread.start()
