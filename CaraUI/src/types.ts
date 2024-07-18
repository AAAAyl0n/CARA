import { Peripheral } from 'react-native-ble-manager';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';


export interface Characteristic {
  service: string;
  characteristic: string;
}

export interface Device extends Peripheral {
  characteristics?: Characteristic[];
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Device: { device: Device };
  Home: undefined;
};

export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;
export type LoginProps = {
  navigation: LoginScreenNavigationProp;
  route: LoginScreenRouteProp;
};

export type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;
export type RegisterScreenRouteProp = RouteProp<RootStackParamList, 'Register'>;
export type RegisterProps = {
  navigation: RegisterScreenNavigationProp;
  route: RegisterScreenRouteProp;
};

export type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;
export type MainScreenRouteProp = RouteProp<RootStackParamList, 'Main'>;
export type MainProps = {
  navigation: MainScreenNavigationProp;
  route: MainScreenRouteProp;
};

export type DeviceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Device'>;
export type DeviceScreenRouteProp = RouteProp<RootStackParamList, 'Device'>;
export type DeviceProps = {
  navigation: DeviceScreenNavigationProp;
  route: DeviceScreenRouteProp;
};

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;
export type HomeProps = {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
};
