import React from "react";
import { StyleSheet } from "react-native";
import DeviceScreen from "./src/pages/device/device";
import HomeScreen from "./src/pages/home/home";
import RegisterScreen from "./src/pages/auth/register";
import LoginScreen from "./src/pages/auth/login";
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from "react-native/Libraries/NewAppScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { enableScreens } from 'react-native-screens';

enableScreens();

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen 
      name="首页" 
      component={HomeScreen} 
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="home-outline" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen 
      name="设备" 
      component={DeviceScreen} 
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="hardware-chip-outline" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

class App extends React.Component {
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
});

export default App;
