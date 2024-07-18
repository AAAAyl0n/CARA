"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BleEventType = exports.ConnectionPriority = exports.BleScanPhyMode = exports.BleScanMatchCount = exports.BleScanCallbackType = exports.BleScanMatchMode = exports.BleScanMode = exports.BleState = void 0;
/**
 * android states: https://developer.android.com/reference/android/bluetooth/BluetoothAdapter#EXTRA_STATE
 * ios states: https://developer.apple.com/documentation/corebluetooth/cbcentralmanagerstate
 * */
var BleState;
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
})(BleState = exports.BleState || (exports.BleState = {}));
/**
 * [android only]
 */
var BleScanMode;
(function (BleScanMode) {
    BleScanMode[BleScanMode["Opportunistic"] = -1] = "Opportunistic";
    BleScanMode[BleScanMode["LowPower"] = 0] = "LowPower";
    BleScanMode[BleScanMode["Balanced"] = 1] = "Balanced";
    BleScanMode[BleScanMode["LowLatency"] = 2] = "LowLatency";
})(BleScanMode = exports.BleScanMode || (exports.BleScanMode = {}));
/**
 * [android only]
 */
var BleScanMatchMode;
(function (BleScanMatchMode) {
    BleScanMatchMode[BleScanMatchMode["Aggressive"] = 1] = "Aggressive";
    BleScanMatchMode[BleScanMatchMode["Sticky"] = 2] = "Sticky";
})(BleScanMatchMode = exports.BleScanMatchMode || (exports.BleScanMatchMode = {}));
/**
 * [android only]
 */
var BleScanCallbackType;
(function (BleScanCallbackType) {
    BleScanCallbackType[BleScanCallbackType["AllMatches"] = 1] = "AllMatches";
    BleScanCallbackType[BleScanCallbackType["FirstMatch"] = 2] = "FirstMatch";
    BleScanCallbackType[BleScanCallbackType["MatchLost"] = 4] = "MatchLost";
})(BleScanCallbackType = exports.BleScanCallbackType || (exports.BleScanCallbackType = {}));
/**
 * [android only]
 */
var BleScanMatchCount;
(function (BleScanMatchCount) {
    BleScanMatchCount[BleScanMatchCount["OneAdvertisement"] = 1] = "OneAdvertisement";
    BleScanMatchCount[BleScanMatchCount["FewAdvertisements"] = 2] = "FewAdvertisements";
    BleScanMatchCount[BleScanMatchCount["MaxAdvertisements"] = 3] = "MaxAdvertisements";
})(BleScanMatchCount = exports.BleScanMatchCount || (exports.BleScanMatchCount = {}));
/**
 * [android only]
 */
var BleScanPhyMode;
(function (BleScanPhyMode) {
    BleScanPhyMode[BleScanPhyMode["LE_1M"] = 1] = "LE_1M";
    BleScanPhyMode[BleScanPhyMode["LE_2M"] = 2] = "LE_2M";
    BleScanPhyMode[BleScanPhyMode["LE_CODED"] = 3] = "LE_CODED";
    BleScanPhyMode[BleScanPhyMode["ALL_SUPPORTED"] = 255] = "ALL_SUPPORTED";
})(BleScanPhyMode = exports.BleScanPhyMode || (exports.BleScanPhyMode = {}));
/**
 * [android only API 21+]
 */
var ConnectionPriority;
(function (ConnectionPriority) {
    ConnectionPriority[ConnectionPriority["balanced"] = 0] = "balanced";
    ConnectionPriority[ConnectionPriority["high"] = 1] = "high";
    ConnectionPriority[ConnectionPriority["low"] = 2] = "low";
})(ConnectionPriority = exports.ConnectionPriority || (exports.ConnectionPriority = {}));
var BleEventType;
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
})(BleEventType = exports.BleEventType || (exports.BleEventType = {}));
//# sourceMappingURL=types.js.map