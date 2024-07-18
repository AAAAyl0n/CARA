from app import create_app
from app.audio_processing import start_background_tasks
from app.gpt import GPT_Model
import json

app = create_app()

if __name__ == '__main__':
    # 更新缓存
    gm = GPT_Model(app)
    gm.update_cache(json.loads(open(app.config['KNOWLEDGE_BASE'], 'r').read()), app.config['CACHE_ID'])
    with app.app_context():
        # 初始化背景任务
        start_background_tasks(app)

    # 启动Flask应用
    app.run(host='0.0.0.0', port=app.config["SERVER_PORT"], threaded=True)
