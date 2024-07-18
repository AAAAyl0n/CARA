from datetime import datetime
from openai import OpenAI
import json
from app.models import User, Message
import requests
import os


class GPT_Model:
    def __init__(self, app) -> None:
        self.api_key = app.config['OPENAI_API_KEY']
        self.base_url = app.config['OPENAI_BASE_URL']
        self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)
        self.moonshot_api_key = app.config['MOONSHOT_API_KEY']
        self.moonshot_base_url = app.config['MOONSHOT_BASE_URL']
        self.app = app
        self.moonshot_client = OpenAI(api_key=self.moonshot_api_key, base_url=self.moonshot_base_url)
        
    def ask_image(self, image_url: str, knowledge_base: dict) -> str:
        """
        根据图片描述内容
        :param image_url: 图片地址
        :param knowledge_base: 知识库
        :return: 描述内容
        """
        print(image_url)
        completion = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "你是一个私人定制化的AI助手Cara，接下来你将收到一个知识库，这个知识库中包含了我近五分钟内所说的话和对所拍摄照片的理解。请根据这个知识库用词条化的语言不超过十个词语解释我接下来拍到的照片。",
                        }
                    ],
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "这是一个JSON形式的知识库，你可以根据这个知识库来回答我接下来拍到的照片是什么：\n" + json.dumps(knowledge_base, indent=4, ensure_ascii=False)
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": image_url}
                        }
                    ]
                }
            ]
        )
        response = completion.choices[0].message.content
        return response
    
    def create_cache(self, knowledge_base: dict):
        """
        创建缓存
        :param knowledge_base: 知识库
        """
        messages = [
            {
                "role": "system",
                "content": "你是一个私人定制化的AI助手Cara，接下来你将收到一个知识库，这个知识库中包含了我所说的话和对所拍摄照片的理解。接下来的问题请根据我提供的知识库回答"
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "这是一个JSON形式的知识库，包含了每条听到的话语或者拍到的图片的时间以及相关信息:\n" + json.dumps(knowledge_base, indent=4, ensure_ascii=False)
                    }
                ]
            }
        ]
        response = requests.post(f"{self.moonshot_base_url}/caching",
                        headers = {
                            "Authorization": f"Bearer {self.moonshot_api_key}"
                        },
                        json = {
                            "model": "moonshot-v1",
                            "messages": messages,
                            "ttl": 3600,
                            "tags": ["knowledge_base"]
                        })
        return response.json()
    
    def update_cache(self, knowledge_base: dict, cache_id: str):
        """
        更新缓存
        :param knowledge_base: 知识库
        :param cache_id: 缓存ID
        """
        messages = [
            {
                "role": "system",
                "content": "你是一个私人定制化的AI助手Cara，接下来你将收到一个知识库，这个知识库中包含了我所说的话和对所拍摄照片的理解。接下来的问题请根据我提供的知识库回答"
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "这是一个JSON形式的知识库，包含了每条听到的话语或者拍到的图片的时间以及相关信息:\n" + json.dumps(knowledge_base, indent=4)
                    }
                ]
            }
        ]
        # 删除原来的缓存
        requests.delete(f"{self.moonshot_base_url}/caching/{cache_id}",
                        headers = {
                            "Authorization": f"Bearer {self.moonshot_api_key}"
                        })
        # 创建新的缓存
        response = requests.post(f"{self.moonshot_base_url}/caching",
                        headers = {
                            "Authorization": f"Bearer {self.moonshot_api_key}"
                        },
                        json = {
                            "model": "moonshot-v1",
                            "messages": messages,
                            "ttl": 3600,
                            "tags": ["knowledge_base"]
                        }).json()
        os.environ['CACHE_ID'] = response['id']
        self.app.config['CACHE_ID'] = response['id']
        return response
        
    
    def answer_by_knowledge(self, messages, question, cache_id):
        # 获取数据库中的所有用户的所有message
        messages = Message.query.all()
        db_results = []
        for msg in messages:
            sender = User.query.get(msg.user_id)
            db_results.append({'content': msg.content, 'date_posted': msg.date_posted, 'sender': sender.username})
        cara_message = []
        # 存储到Cara的对话历史消息中
        for item in db_results:
            cara_item = {
                'role': 'system' if item['sender'] == 'Cara' else 'user',
                'content': item['content'],
            }
            cara_message.append(cara_item)
        print(cara_message)
        system_propmt = """
        你是一个私人定制化的AI助手Cara，你之前收到了一个知识库，这个知识库中包含了我所说的话和对所拍摄照片的理解。请根据这个知识库用如下JSON格式输出你的回复：
        
        {
            "type": "如果你回答的内容中包含知识库中的图片，请在这里填入image，否则填入text",
            "url": "如果你回答的内容中包含知识库中的图片，请在这里填入图片地址，否则填入null",
            "text": "你回答的内容"
        }
        
        注意，由于我的知识库中是包含timestamp的，所以时间也是一个重要的信息，你可以根据这个信息来回答我的问题。
        """
        # completion = self.moonshot_client.chat.completions.create(
        #     model="moonshot-v1-128k",
        #     messages = [
        #         {
        #             "role": "cache",
        #             "content": f"cache_id={cache_id};reset_ttl=3600"
        #         }] + cara_message + [
        #         {
        #             "role": "system",
        #             "content": system_propmt
        #         },
        #         {
        #             "role": "user",
        #             "content": question
        #         }
        #     ],
        #     response_format={
        #         "type": "json_object"
        #     }
        # )
        # response = completion.choices[0].message.content
        response = requests.post(f"{self.moonshot_base_url}/chat/completions",
                        headers = {
                            "Authorization": f"Bearer {self.moonshot_api_key}"
                        },
                        json = {
                            "model": "moonshot-v1-128k",
                            "messages": [
                                {
                                    "role": "cache",
                                    "content": f"cache_id={cache_id};reset_ttl=3600"
                                }] + cara_message + [
                                {
                                    "role": "system",
                                    "content": system_propmt
                                },
                                {
                                    "role": "user",
                                    "content": question
                                }
                            ],
                            "response_format": {
                                "type": "json_object"
                            }
                        })
        print(response.json())
        print(response.headers)
        return response.json()