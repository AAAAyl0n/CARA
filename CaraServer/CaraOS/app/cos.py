from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client
from qcloud_cos import CosServiceError
from qcloud_cos import CosClientError

class CosBucket:
    def __init__(self, secret_id: str, secret_key: str, region: str):
        self.secret_id: str = secret_id
        self.secret_key: str = secret_key
        self.region: str = region
        self.config: CosConfig = CosConfig(Region=region, SecretId=secret_id, SecretKey=secret_key)
        self.client: CosS3Client = CosS3Client(self.config)
        self.bucket_name: str = self.get_bucket(0)
        
    def get_bucket(self, index: int) -> str:
        """
        获取桶名称
        :param index: 桶索引
        :return: 桶名称 
        """
        response: dict = self.client.list_buckets()
        return response["Buckets"]["Bucket"][index]["Name"]
    
    def upload_file(self, file_path: str) -> str:
        """
        上传文件
        :param file_path: 文件路径
        :return: 文件地址
        """
        self.client.upload_file(
            Bucket=self.bucket_name,
            LocalFilePath=file_path,
            Key=file_path.split('/')[-1]
        )
        url: str = f"https://{self.bucket_name}.cos.{self.region}.myqcloud.com/{file_path.split('/')[-1]}"
        return url
    
    def upload_image(self, image_data: bytes, image_name: str) -> str:
        """
        上传图片
        :param image_data: 图片数据
        :param image_name: 图片名称
        :return: 图片地址
        """
        self.client.upload_file(
            Bucket=self.bucket_name,
            Body=image_data,
            Key=image_name
        )
        url: str = f"https://{self.bucket_name}.cos.{self.region}.myqcloud.com/{image_name}"
        return url