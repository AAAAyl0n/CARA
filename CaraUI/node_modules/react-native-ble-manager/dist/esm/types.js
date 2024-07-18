/**
 * android states: https://developer.android.com/reference/android/bluetooth/BluetoothAdapter#EXTRA_STATE
 * ios states: https://developer.apple.com/documentation/corebluetooth/cbcentralmanagerstate
 * */
export var BleState;
(function (BleState) {
    /**
     * [iOS only]
     */
    BleState["Unknown"] = "unknown";
    /**
     * [iOS only]
     */
    BleState["Resetting"] = "resetting";
    BleState["Unsupported"] = "unsupported";
    /**
     * [iOS only]
     */
    BleState["Unauthorized"] = "unauthorized";
    BleState["On"] = "on";
    BleState["Off"] = "off";
    /**
     * [android only]
     */
    BleState["TurningOn"] = "turning_on";
    /**
     * [android only]
     */
    BleState["TurningOff"] = "turning_off";
})(BleState || (BleState = {}));
/**
 * [android only]
 */
export var BleScanMode;
(function (BleScanMode) {
    BleScanMode[BleScanMode["Opportunistic"] = -1] = "Opportunistic";
    BleScanMode[BleScanMode["LowPower"] = 0] = "LowPower";
    BleScanMode[BleScanMode["Balanced"] = 1] = "Balanced";
    BleScanMode[BleScanMode["LowLatency"] = 2] = "LowLatency";
})(BleScanMode || (BleScanMode = {}));
/**
 * [android only]
 */
export var BleScanMatchMode;
(function (BleScanMatchMode) {
    BleScanMatchMode[BleScanMatchMode["Aggressive"] = 1] = "Aggressive";
    BleScanMatchMode[BleScanMatchMode["Sticky"] = 2] = "Sticky";
})(BleScanMatchMode || (BleScanMatchMode = {}));
/**
 * [android only]
 */
export var BleScanCallbackType;
(function (BleScanCallbackType) {
    BleScanCallbackType[BleScanCallbackType["AllMatches"] = 1] = "AllMatches";
    BleScanCallbackType[BleScanCallbackType["FirstMatch"] = 2] = "FirstMatch";
    BleScanCallbackType[BleScanCallbackType["MatchLost"] = 4] = "MatchLost";
})(BleScanCallbackType || (BleScanCallbackType = {}));
/**
 * [android only]
 */
export var BleScanMatchCount;
(function (BleScanMatchCount) {
    BleScanMatchCount[BleScanMatchCount["OneAdvertisement"] = 1] = "OneAdvertisement";
    BleScanMatchCount[BleScanMatchCount["FewAdvertisements"] = 2] = "FewAdvertisements";
    BleScanMatchCount[BleScanMatchCount["MaxAdvertisements"] = 3] = "MaxAdvertisements";
})(BleScanMatchCount || (BleScanMatchCount = {}));
/**
 * [android only]
 */
export var BleScanPhyMode;
(function (BleScanPhyMode) {
    BleScanPhyMode[BleScanPhyMode["LE_1M"] = 1] = "LE_1M";
    BleScanPhyMode[BleScanPhyMode["LE_2M"] = 2] = "LE_2M";
    BleScanPhyMode[BleScanPhyMode["LE_CODED"] = 3] = "LE_CODED";
    BleScanPhyMode[BleScanPhyMode["ALL_SUPPORTED"] = 255] = "ALL_SUPPORTED";
})(BleScanPhyMode || (BleScanPhyMode = {}));
/**
 * [android only API 21+]
 */
export var ConnectionPriority;
(function (ConnectionPriority) {
    ConnectionPriority[ConnectionPriority["balanced"] = 0] = "balanced";
    ConnectionPriority[ConnectionPriority["high"] = 1] = "high";
    ConnectionPriority[ConnectionPriority["low"] = 2] = "low";
})(ConnectionPriority || (ConnectionPriority = {}));
export var BleEventType;
(function (BleEventType) {
    BleEventType["BleManagerDidUpdateState"] = "BleManagerDidUpdateState";
    BleEventType["BleManagerStopScan"] = "BleManagerStopScan";
    BleEventType["BleManagerDiscoverPeripheral"] = "BleManagerDiscoverPeripheral";
    BleEventType["BleManagerDidUpdateValueForCharacteristic"] = "BleManagerDidUpdateValueForCharacteristic";
    BleEventType["BleManagerConnectPeripheral"] = "BleManagerConnectPeripheral";
    BleEventType["BleManagerDisconnectPeripheral"] = "BleManagerDisconnectPeripheral";
    /**
     * [Android only]
     */
    BleEventType["BleManagerPeripheralDidBond"] = "BleManagerPeripheralDidBond";
    /**
     * [iOS only]
     */
    BleEventType["BleManagerCentralManagerWillRestoreState"] = "BleManagerCentralManagerWillRestoreState";
    /**
     * [iOS only]
     */
    BleEventType["BleManagerDidUpdateNotificationStateFor"] = "BleManagerDidUpdateNotificationStateFor";
})(BleEventType || (BleEventType = {}));
//# sourceMappingURL=types.js.map