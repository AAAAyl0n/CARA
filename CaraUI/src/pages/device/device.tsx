import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, FlatList, PermissionsAndroid, Platform, TextInput } from 'react-native';
import BleManager, { Peripheral } from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { Device, Characteristic } from '../../types';
import { stringToBytes, bytesToString } from '../../utils'; // 导入转换函数

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

interface DeviceScreenState {
  scanning: boolean;
  devices: Device[];
  connectedDevice: Device | null;
  message: string;
  receivedMessages: string[];
}

class DeviceScreen extends Component<{}, DeviceScreenState> {
  handlerDiscover: any;
  handlerStop: any;
  handlerDisconnect: any;
  handlerUpdate: any;

  constructor(props: {}) {
    super(props);
    this.state = {
      scanning: false,
      devices: [],
      connectedDevice: null,
      message: '',
      receivedMessages: [],
    };
  }

  componentDidMount() {
    BleManager.start({ showAlert: false });

    this.handlerDiscover = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      this.handleDiscoverPeripheral,
    );

    this.handlerStop = bleManagerEmitter.addListener(
      'BleManagerStopScan',
      this.handleStopScan,
    );

    this.handlerDisconnect = bleManagerEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      this.handleDisconnectedPeripheral,
    );

    this.handlerUpdate = bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      this.handleUpdateValueForCharacteristic,
    );

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
        if (result) {
          console.log('Permission is OK');
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
            if (result) {
              console.log('User accepted');
            } else {
              console.log('User refused');
            }
          });
        }
      });
    }
  }

  componentWillUnmount() {
    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
    this.handlerUpdate.remove();
  }

  handleDiscoverPeripheral = (peripheral: Peripheral) => {
    const { devices } = this.state;
    if (peripheral.name && !devices.some((d) => d.id === peripheral.id)) {
      const device: Device = { ...peripheral, characteristics: [] };
      this.setState({ devices: [...devices, device] });
    }
  };

  handleStopScan = () => {
    this.setState({ scanning: false });
  };

  handleDisconnectedPeripheral = (data: any) => {
    this.setState({ connectedDevice: null });
    console.log('Disconnected from ' + data.peripheral);
  };

  handleUpdateValueForCharacteristic = (data: any) => {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
    const receivedString = bytesToString(data.value);
    this.setState((prevState) => ({
      receivedMessages: [...prevState.receivedMessages, receivedString],
    }));
  };

  startScan = () => {
    if (!this.state.scanning) {
      this.setState({ devices: [] });
      BleManager.scan([], 5, true).then(() => {
        console.log('Scanning...');
        this.setState({ scanning: true });
      }).catch((error) => {
        console.error(error);
      });
    }
  };

  connectDevice = (device: Device) => {
    BleManager.connect(device.id).then(() => {
      console.log('Connected to ' + device.id);
      this.setState({ connectedDevice: device });
      this.startNotification(device.id);
    }).catch((error) => {
      console.error('Connection error', error);
    });
  };

  startNotification = (peripheralId: string) => {
    BleManager.retrieveServices(peripheralId).then((peripheralInfo) => {
      if (peripheralInfo.characteristics && peripheralInfo.characteristics.length > 0) {
        const {service, characteristic} = peripheralInfo.characteristics[0];
        BleManager.startNotification(peripheralId, service, characteristic).then(() => {
          console.log('Started notification on ' + peripheralId);
          const { connectedDevice } = this.state;
          if (connectedDevice) {
            connectedDevice.characteristics = [{ service, characteristic }];
            this.setState({ connectedDevice });
          }
        }).catch((error) => {
          console.error('Notification error', error);
        });
      } else {
        console.error('No characteristics found for peripheral ' + peripheralId);
      }
    }).catch((error) => {
      console.error('Retrieve services error', error);
    });
  };

  sendMessage = () => {
    const { connectedDevice, message } = this.state;
    if (connectedDevice && connectedDevice.characteristics && connectedDevice.characteristics.length > 0) {
      const { service, characteristic } = connectedDevice.characteristics[0];
      const messageBytes = stringToBytes(message); // 转换消息为字节数组
      BleManager.write(connectedDevice.id, service, characteristic, messageBytes).then(() => {
        console.log('Sent message: ' + message);
        this.setState({ message: '' });
      }).catch((error) => {
        console.error('Send message error', error);
      });
    } else {
      console.error('No connected device or characteristics found');
    }
  };

  renderItem = ({ item }: { item: Device }) => (
    <View style={styles.device}>
      <Text>Name: {item.name || 'N/A'}</Text>
      <Text>ID: {item.id}</Text>
      <Button title="Connect" onPress={() => this.connectDevice(item)} />
    </View>
  );

  render() {
    const { scanning, devices, connectedDevice, message, receivedMessages } = this.state;

    return (
      <View style={styles.container}>
        <Button 
          title={scanning ? 'Scanning...' : 'Start Scan'} 
          onPress={this.startScan} 
          disabled={scanning}
        />
        <FlatList
          data={devices}
          renderItem={this.renderItem}
          keyExtractor={(item) => item.id}
        />
        {connectedDevice && (
          <View style={styles.connectedDevice}>
            <Text>Connected to {connectedDevice.name || connectedDevice.id}</Text>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={(text) => this.setState({ message: text })}
              placeholder="Enter message"
            />
            <Button title="Send Message" onPress={this.sendMessage} />
            <FlatList
              data={receivedMessages}
              renderItem={({ item }) => <Text>{item}</Text>}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  device: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  connectedDevice: {
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default DeviceScreen;
