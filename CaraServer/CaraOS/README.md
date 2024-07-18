# flask_test# Flask API

The address of `BASE_URL` :
* In California: [https://cara.zeabur.app](https://cara.zeabur.app)
* In Shanghai: [https://tanninrachel.ren](https://tanninrachel.ren)

## API Usage

### /audio_steam

* function: get the audio_steam data
* method: POST
* data: the data of audio steam

### /api/register

* function: regiseter a user
* method: POST
* data:
	```json
	{
		"email": "your email address",
		"username": "your user name",
		"password": "your password"
	}
	```

### /api/login

* function: user login
* method: POST
* data:
	```json
	{
		"username": "your user name",
		"password": "your password"
	}
	```

### /api/logout

* function: user logout
* method: POST
* data: none

### /api/messages

@login_required
* function: send a message
* method: POST
* data:
	```json
	{
		"content": "the content you want to send"
	}
	```

### /api/messages

@login_required
* function: get all messages
* method: GET
* data: none

### /api/admin/users

@login_required
* function: get all users if you are an admin
* method: GET
* data: none

### /api/upload_image

> Maybe only in China this method is active!

* function: upload an image to TencentCloud COS Bucket
* method: POST
* data: 
  
	`image`: the image you want to upload

### /api/add_knowledge

* function: give Cara an image and then Cara will understand the image and then add to its konwledge base
* method: POST
* data:
  ```json
	{
		"url": "your image url"
	}

### /api/get_knowledge

* function: get the knowledge base
* method: GET
* data: none

### /api/answer_question

* function: answer user's question based on Cara's knowledge base
* method: POST
* data:
  ```json
	{
		"question": "your question"
	}