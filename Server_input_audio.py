from flask import Flask, request
import wave
import os
import numpy as np
import time
from pydub import AudioSegment
from scipy.io import wavfile
from openai import OpenAI

#此文件用于调试

client = OpenAI()

app = Flask(__name__)

# 临时PCM文件路径
temp_pcm_file = 'temp_audio.pcm'
output_wav_file = 'output.wav'
output_mp3_file = 'output.mp3'

silence_threshold = 900  # 静音阈值，具体值需根据实际情况调整
silence_duration = 5  # 检测到静音后等待的秒数
last_sound_time = time.time()

# 滑动窗口参数
window_size = 5
window = []

def is_silent(data):
    audio_data = np.frombuffer(data, dtype=np.int16)
    rms = np.sqrt(np.mean(audio_data**2))
    return rms < silence_threshold, rms

@app.route('/audio_stream', methods=['POST'])
def audio_stream():
    global last_sound_time, window
    data = request.data
    print(f"Received data of length: {len(data)} bytes")  # 打印接收到的数据长度
    
    silent, rms = is_silent(data)
    window.append(rms)
    if len(window) > window_size:
        window.pop(0)
    
    avg_rms = np.mean(window)
    print(f"Current RMS: {rms}, Average RMS over last {window_size} packets: {avg_rms}")
    
    if avg_rms >= silence_threshold:
        last_sound_time = time.time()
    
    with open(temp_pcm_file, 'ab') as f:
        f.write(data)

    return '', 200

def convert_pcm_to_wav(pcm_file, wav_file, channels=2, rate=44100, sampwidth=2):
    with open(pcm_file, 'rb') as pcmfile:
        pcm_data = pcmfile.read()
    with wave.open(wav_file, 'wb') as wavfile:
        wavfile.setnchannels(channels)
        wavfile.setsampwidth(sampwidth)
        wavfile.setframerate(rate)
        wavfile.writeframes(pcm_data)

def convert_wav_to_mp3(wav_file, mp3_file):
    audio = AudioSegment.from_wav(wav_file)
    audio.export(mp3_file, format="mp3")

def process_audio_files():
    convert_pcm_to_wav(temp_pcm_file, output_wav_file)
    convert_wav_to_mp3(output_wav_file, output_mp3_file)

    audio_file= open("output.wav", "rb")
    print("file opened.")
    transcription = client.audio.transcriptions.create(
        model="whisper-1", 
        file=audio_file
    )
    print(transcription.text)
    print("Processed and converted audio files.")

if __name__ == '__main__':
    # 删除已有的临时文件和输出文件
    if os.path.exists(temp_pcm_file):
        os.remove(temp_pcm_file)
    if os.path.exists(output_wav_file):
        os.remove(output_wav_file)
    if os.path.exists(output_mp3_file):
        os.remove(output_mp3_file)

    # 启动Flask应用
    app.run(host='0.0.0.0', port=5001, threaded=True)

    # 持续检测静音并处理音频文件
    while True:
        time_since_last_sound = time.time() - last_sound_time
        if time_since_last_sound > silence_duration and os.path.exists(temp_pcm_file) and os.path.getsize(temp_pcm_file) > 0:
            process_audio_files()
            os.remove(temp_pcm_file)
            last_sound_time = time.time()  # 重置时间
        time.sleep(1)
