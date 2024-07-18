import React, { Component } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { register } from '../../utils';
import { NavigationProp } from '@react-navigation/native';

interface State {
  username: string;
  email: string;
  password: string;
  message: string;
}

class RegisterScreen extends Component<{}, State> {
  state: State = {
    username: '',
    email: '',
    password: '',
    message: ''
  };

  handleRegister = async () => {
    const { username, email, password } = this.state;
    try {
      const response = await register(username, email, password);
      this.setState({ message: response.message });
      if (response.message === 'User registered successfully') {
				const { navigation } = this.props as unknown as { navigation: NavigationProp<any> };
				navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      this.setState({ message: 'Registration failed' });
    }
  };

  render() {
    const { username, email, password, message } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={(text) => this.setState({ username: text })}
          placeholder="Username"
        />
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
        <Button title="Register" onPress={this.handleRegister} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Button
          title="Go to Login"
          onPress={() => {
							const { navigation } = this.props as unknown as { navigation: NavigationProp<any> };
							navigation.navigate('Login');
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

export default RegisterScreen;
