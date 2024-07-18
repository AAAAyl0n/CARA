import React, { Component } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { login } from '../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginProps } from '../../types';


interface State {
  email: string;
  password: string;
  message: string;
}

class LoginScreen extends Component<{}, State> {
  state: State = {
    email: '',
    password: '',
    message: ''
  };

  handleLogin = async () => {
    const { email, password } = this.state;
		console.log('email:', email);
		console.log('password:', password);
    try {
      const response = await login(email, password);
      this.setState({ message: 'Login successful' });
      const { navigation } = this.props as LoginProps;
			navigation.navigate('Main');
    } catch (error) {
      console.error('Error during login:', error);
      this.setState({ message: 'Login failed' });
    }
  };

  render() {
    const { email, password, message } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={(text) => this.setState({ email: text })}
          placeholder="Email"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={(text) => this.setState({ password: text })}
          placeholder="Password"
          secureTextEntry
        />
        <Button title="Login" onPress={this.handleLogin} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Button
          title="Go to Register"
          onPress={() => {
							const { navigation } = this.props as LoginProps;
							navigation.navigate('Register');
						}
					}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  message: {
    marginTop: 20,
    textAlign: 'center',
    color: 'red',
  },
});

export default LoginScreen;
