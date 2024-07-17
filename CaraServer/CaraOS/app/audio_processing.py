import os
import threading
import time
import queue
import logging
from flask import current_app
import numpy as np
import wave
from pydub import AudioSegment
from openai import OpenAI
from scipy.io import wavfile
import json
import logging
from datetime import datetime

client = OpenAI()

audio_queue = queue.Queue()

def convert_pcm_to_wav(app, pcm_file, wav_file, channels=2, rate=44100, sampwidth=2):
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

def process_audio_files(app):
    timestamp = int(time.time())
    output_wav_file = os.path.join(app.config['TEMP_AUDIO_DIR'], f'temp_{timestamp}.wav')
    try:
        with app.config['LOCK']:
            convert_pcm_to_wav(app, app.config['TEMP_PCM_FILE'], output_wav_file)
            os.remove(app.config['TEMP_PCM_FILE'])
    except Exception as e:
        logging.error(f"Error processing audio files: {e}")
    return output_wav_file

def calculate_avg_volume(wav_file):
    try:
        rate, data = wavfile.read(wav_file)
        logging.info(f"Sample rate: {rate}, Data shape: {data.shape}")
        if data.ndim == 2:
            abs_left = np.mean(np.abs(data[:, 0]))
            abs_right = np.mean(np.abs(data[:, 1]))
            avg_abs = (abs_left + abs_right) / 2
        else:
            avg_abs = np.mean(np.abs(data))
        logging.info(f"Average absolute volume: {avg_abs}")
        return avg_abs
    except Exception as e:
        logging.error(f"Error calculating average volume: {e}")
        return 0

def detect_silence(app):
    while True:
        try:
            time_since_last_sound = time.time() - app.config['LAST_SOUND_TIME']
            if time_since_last_sound > app.config['SILENCE_DURATION'] and os.path.exists(app.config['TEMP_PCM_FILE']) and os.path.getsize(app.config['TEMP_PCM_FILE']) > 0:
                wav_file = process_audio_files(app)
                audio_queue.put(wav_file)
                app.config['LAST_SOUND_TIME'] = time.time()
            time.sleep(0.02)
        except Exception as e:
            logging.error(f"Error in silence detection: {e}")

def convert_wav_to_mp3(wav_file, mp3_file):
    try:
        audio = AudioSegment.from_wav(wav_file)
        audio.export(mp3_file, format="mp3")
    except Exception as e:
        logging.error(f"Error converting WAV to MP3: {e}")

def process_audio_queue(app):
    def append_to_json_file(transcription_text, file_type):
        json_file_path = 'transcriptions.json'
        
        new_record = {
            'timestamp': datetime.utcnow().isoformat(),
            'type': file_type,
            'text': transcription_text
        }
        
        if os.path.exists(json_file_path):
            with open(json_file_path, 'r+') as json_file:
                try:
                    data = json.load(json_file)
                    data.append(new_record)
                    json_file.seek(0)
                    json.dump(data, json_file, indent=4)
                except json.JSONDecodeError:
                    json_file.seek(0)
                    json.dump([new_record], json_file, indent=4)
        else:
            with open(json_file_path, 'w') as json_file:
                json.dump([new_record], json_file, indent=4)

    while True:
        try:
            wav_file = audio_queue.get()
            if wav_file is None:
                break
            avg_volume = calculate_avg_volume(wav_file)
            logging.info(f"Average volume of {wav_file}: {avg_volume}")
            if avg_volume < app.config['SILENCE_THRESHOLD']:
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
                #这里写入json文件
                append_to_json_file(transcription.text, "voice")

            os.remove(wav_file)
            os.remove(mp3_file)
        except Exception as e:
            logging.error(f"Error processing audio queue: {e}")

def start_background_tasks(app):
    threading.Thread(target=detect_silence, args=(app,), daemon=True).start()
    threading.Thread(target=process_audio_queue, args=(app,), daemon=True).start()
