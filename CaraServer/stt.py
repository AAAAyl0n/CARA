from openai import OpenAI
client = OpenAI()

audio_file= open("output.wav", "rb")
print("file opened.")
transcription = client.audio.transcriptions.create(
  model="whisper-1", 
  file=audio_file
)
print(transcription.text)

#此文件用于调试
