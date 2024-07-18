import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { sendMessages, getMessages, getUserInfo, getCaraInfo, convertUTCToBeijingTime } from '../../utils'; // 更新为你的utils.ts的实际路径

interface User {
  username: string;
  email: string;
  avatar_url : string;
}

interface Message {
  content: string;
  date_posted: string;
	sender: string;
}

interface State {
  messages: Message[];
  messageText: string;
  currentUser: User | null;
  Cara: User | null;
}

interface CaraContent {
  type: string;
  url: string;
  text: string;
}

class HomeScreen extends Component<{}, State> {
  state: State = {
    messages: [],
    messageText: '',
    currentUser: null,
    Cara: null,
  };       

  flastListRef: React.RefObject<FlatList> = React.createRef();

	interval: any;

  componentDidMount() {
    const currentUserInfo = getUserInfo();
    const CaraInfo = getCaraInfo();
    let currentUser: User = { username: '', email: '', avatar_url: '' };
    let Cara: User  = { username: '', email: '', avatar_url: '' };
    currentUserInfo.then((data) => {
      currentUser.username = data.username;
      currentUser.email = data.email;
      currentUser.avatar_url = data.avatar_url;
      this.setState({ currentUser: currentUser });
    });
    CaraInfo.then((data) => {
      Cara.username = data.username;
      Cara.email = data.email;
      Cara.avatar_url = data.avatar_url;
      this.setState({ Cara: Cara });
    });
    this.fetchMessages(); // 组件挂载后调用fetchMessages方法，获取消息
		this.interval = setInterval(this.fetchMessages, 1000); // 每隔1秒调用fetchMessages方法，获取消息
  }

	componentWillUnmount() {
		clearInterval(this.interval);
	}

  // 滚动到底部
  scrollToEnd = () => {
    this.flastListRef.current?.scrollToEnd({ animated: true });
  };

	// 抓取消息
  fetchMessages = async () => {
    try {
      const data = await getMessages();
      if (this.state.messages.length !== data.length) {
        this.setState({ messages: data });
        this.scrollToEnd();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

	// 发送消息
  handleSendMessage = async () => {
    const { messageText } = this.state;
    if (messageText.trim() === '') return;

    try {
      this.setState({ messageText: '' }, () => {
        Keyboard.dismiss();
        this.scrollToEnd();
      });
      await sendMessages(messageText);
      this.fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  renderContentItem = (item: CaraContent) => {
    if (item.type === 'image') {
      return (
        <View>
          <Text style={styles.messageContent}>{item.text}</Text>
          <Image source={{ uri: item.url }} style={styles.messageImage} resizeMode='cover' />
        </View>
      );
    } else {
      return (
        <View>
          <Text style={styles.messageContent}>{item.text}</Text>
        </View>
      );
    }
  };

	// 渲染单个消息
  renderItem = ({ item }: { item: Message }) => {
    if (item.sender === 'Cara') {
      let content: CaraContent;
      content = JSON.parse(item.content);
      return (
        <View style={[styles.messageWrapper, styles.messageWrapperLeft]}>
          <Image source={{ uri: this.state.Cara?.avatar_url }} style={styles.avatar} />
          <View style={{flexDirection: 'column'}}>
            <Text style={[styles.senderName, styles.senderNameLeft]}>{item.sender}</Text>
            <View style={[styles.messageContainer, styles.messageContainerLeft]}>
              {Array.isArray(content) ? (
                content.map((contentItem, index) => (
                  <View key={index}>{this.renderContentItem(contentItem)}</View>
                ))
              ) : (
                this.renderContentItem(content)
              )}
            </View>
            <Text style={styles.messageDate}>{convertUTCToBeijingTime(item.date_posted)}</Text>
          </View>
        </View>
      );
  } else {
    return (
      <View style={[styles.messageWrapper, styles.messageWrapperRight]}>
        <View style={{flexDirection: 'column', alignItems: 'flex-end'}}>
          <Text style={[styles.senderName, styles.senderNameRight]}>{item.sender}</Text>
          <View style={[styles.messageContainer, styles.messageContainerRight]}>
            <Text style={styles.messageContent}>{item.content}</Text>
          </View>
          <Text style={styles.messageDate}>{convertUTCToBeijingTime(item.date_posted)}</Text>
        </View>
        <Image source={{ uri: this.state.currentUser?.avatar_url }} style={styles.avatar} />
      </View>
    );
  }
}

  componentDidUpdate(prevProps: {}, prevState: State) {
    // 对比当前消息长度和实际消息长度
    if (prevState.messages.length !== this.state.messages.length) {
      console.log('Messages updated');
      this.scrollToEnd();
    }
  }

	// 渲染
  render() {
    const { messages, messageText } = this.state;
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <FlatList
          ref={this.flastListRef}
          data={messages}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.messageList}
          onContentSizeChange={() => this.scrollToEnd()}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={(text) => this.setState({ messageText: text })}
            placeholder="在此处输入消息"
          />
          <TouchableOpacity style={styles.button} onPress={this.handleSendMessage}>
            <Text style={styles.buttonText}>发送</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  messageList: {
    flex: 1,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  messageWrapperRight: {
    justifyContent: 'flex-end',
  },
  messageWrapperLeft: {
    justifyContent: 'flex-start',
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginRight: 5,
  },
  messageContainerRight: {
    maxWidth: '100%',
    backgroundColor: '#99ccff',
    alignItems: 'flex-end',  // Align content to the end
  },
  messageContainerLeft: {
    maxWidth: '80%',
    backgroundColor: '#f1f1f1',
  },
  messageContent: {
    fontSize: 16,
  },
  messageDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  messageImage: {
    width: 200,
    height: undefined,
    aspectRatio: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
  },
  senderName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  senderNameRight: {
    textAlign: 'right',
    marginRight: 5,
  },
  senderNameLeft: {
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#007bff', // Blue background
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});


export default HomeScreen;
