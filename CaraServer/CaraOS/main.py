from app import create_app
from app.audio_processing import start_background_tasks

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        # 初始化背景任务
        start_background_tasks(app)
    
    # 启动Flask应用
    app.run(host='0.0.0.0', port=app.config["SERVER_PORT"], threaded=True)
