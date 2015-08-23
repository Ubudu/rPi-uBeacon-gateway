'use strict';

var uBeaconLib = require('node-ubeacon-uart-lib');
var async = require('async');
var debug = require('debug')('uart');

var ubeacon = new uBeaconLib.UBeaconUARTController(process.env.UART_SERIAL_PORT, process.env.UART_BAUD_RATE);

ubeacon.getData = function(callback) {
    var data = {};

    var self = this;

    async.waterfall([
            //Get serial number
            function(finishedCallback){
                self.getSerialNumber(function(serialNumber, error){
                    data.serialNumber = serialNumber;
                    finishedCallback(error);
                });
            },
            //Get UART protocol version
            function(finishedCallback){
                self.getUARTProtocolVersion(function(uartProtocolVersion, error){
                    data.uartProtocolVersion = uartProtocolVersion;
                    finishedCallback(error);
                });
            },
            //Get hw model
            function(finishedCallback){
                self.getHardwareModel(function(hwModel, error){
                    data.hardwareModel = hwModel;
                    finishedCallback(error);
                });
            },
            //Get hw version
            function(finishedCallback){
                self.getHardwareVersion(function(hwVersion, error){
                    data.hardwareVersion = hwVersion;
                    finishedCallback(error);
                });
            },
            //Get BDAddr
            function(finishedCallback){
                self.getMacAddress(function(mac, error){
                    data.macAddress = mac;
                    finishedCallback(error);
                });
            },
            //Get firmware version
            function(finishedCallback){
                self.getFirmwareVersion(function(firmwareVersion, error){
                    data.firmwareVersion = firmwareVersion;
                    finishedCallback(error);
                });
            },
            //Get firmware build
            function(finishedCallback){
                self.getFirmwareBuild(function(firmwareBuild, error){
                    data.firmwareBuild = firmwareBuild;
                    finishedCallback(error);
                });
            },
            //Get advertising state
            function(finishedCallback){
                self.getAdvertisingState(function(advState, error){
                    data.advertisingState = advState;
                    finishedCallback(error);
                });
            },
            //Get advertising interval
            function(finishedCallback){
                self.getAdvertisingInterval(function(advInterval, error){
                    data.advertisingInterval = advInterval;
                    finishedCallback(error);
                });
            },
            //Get proximityUUID
            function(finishedCallback){
                self.getProximityUUID(function(uuid, error){
                    data.uuid = uuid;
                    finishedCallback(error);
                });
            },
            //Get major
            function(finishedCallback){
                self.getMajor(function(major, error){
                    data.major = major;
                    finishedCallback(error);
                });
            },
            //Get major
            function(finishedCallback){
                self.getMinor(function(minor, error){
                    data.minor = minor;
                    finishedCallback(error);
                });
            },
            //Get measured strength
            function(finishedCallback){
                self.getMeasuredStrength(function(measuredStrength, error){
                    data.measuredStrength = parseInt(measuredStrength,16)-255;
                    finishedCallback(error);
                });
            },
            //Get mesh settings
            function(finishedCallback){
                self.getMeshSettingsRegisterObject(function(meshSettings, error){
                    data.meshSettings = JSON.parse(JSON.stringify(meshSettings));     //copy
                    finishedCallback(error);
                });
            },
            //Get mesh network UUID
            function(finishedCallback){
                self.getMeshNetworkUUID(function(uuid, error){
                    data.meshNetworkUUID = uuid;
                    finishedCallback(error);
                });
            },
            //Get mesh deviceId
            function(finishedCallback){
                self.getMeshDeviceId(function(deviceId, error){
                    data.meshDeviceId = deviceId;
                    finishedCallback(error);
                });
            },
            //Get mesh stats
            function(finishedCallback){
                self.getMeshStats(function(stats, error){
                    data.meshStats = stats;
                    finishedCallback(error);
                });
            },
            //Get RTC time
            function(finishedCallback){
                self.getRTCTime(function(rtcTime, error){
                    data.rtcTime = rtcTime;
                    finishedCallback(error);
                });
            }
        ],
        function(error) {
            callback(error, data);
        }
    );
};

ubeacon.updateData = function(beaconData, callback) {
    var data = {};

    var self = this;

    async.waterfall([
            //Set advertising state
            function(finishedCallback){
                if (beaconData.advertisingState != null) {
                    self.setAdvertisingState(beaconData.advertisingState, function(advState, error) {
                        data.advertisingState = advState;
                        return finishedCallback(error);
                    });
                } else {
                    return finishedCallback(null);
                }
            },
            //Set advertising interval
            function(finishedCallback){
                if (beaconData.advertisingInterval != null) {
                    self.setAdvertisingInterval(beaconData.advertisingInterval, function(advInterval, error) {
                        data.advertisingInterval = advInterval;
                        return finishedCallback(error);
                    });
                } else {
                    return finishedCallback(null);
                }
            },
            //Set proximityUUID
            function(finishedCallback){
                if (beaconData.uuid != null) {
                    self.setProximityUUID(beaconData.uuid, function(uuid, error) {
                        data.uuid = uuid;
                        return finishedCallback(error);
                    });
                } else {
                    return finishedCallback(null);
                }
            },
            //Set major
            function(finishedCallback){
                if (beaconData.major != null) {
                    self.setMajor(beaconData.major, function(major, error) {
                        data.major = major;
                        return finishedCallback(error);
                    });
                } else {
                    return finishedCallback(null);
                }
            },
            //Set minor
            function(finishedCallback){
                if (beaconData.minor != null) {
                    self.setMinor(beaconData.minor, function(minor, error) {
                        data.minor = minor;
                        return finishedCallback(error);
                    });
                } else {
                    return finishedCallback(null);
                }
            },
            //Set measured strength
            function(finishedCallback){
                if (beaconData.measuredStrength != null) {
                    var measuredStrength = 255 - Math.abs(beaconData.measuredStrength);
                    self.setMeasuredStrength(measuredStrength, function(ms, error) {
                        data.measuredStrength = parseInt(ms, 16) - 255;
                        return finishedCallback(error);
                    });
                } else {
                    return finishedCallback(null);
                }
            },
            //Set mesh settings
            function(finishedCallback){
                if (beaconData.meshSettings != null) {
                    var meshSettings = new uBeaconLib.UBeaconMeshSettingsRegister();
                    meshSettings.setFrom(beaconData.meshSettings);
                    self.setMeshSettingsRegisterObject(meshSettings , function(settings, error) {
                        data.meshSettings = settings;
                        return finishedCallback(error);
                    });
                } else {
                    return finishedCallback(null);
                }
            },
            //Set mesh network UUID
            function(finishedCallback){
                if (beaconData.meshNetworkUUID != null) {
                    self.setMeshNetworkUUID(beaconData.meshNetworkUUID, function(meshNetworkUUID, error) {
                        data.meshNetworkUUID = meshNetworkUUID;
                        return finishedCallback(error);
                    });
                } else {
                    return finishedCallback(null);
                }
            },
            //Set mesh deviceId
            function(finishedCallback){
                if (beaconData.meshDeviceId != null) {
                    self.setMeshDeviceId(beaconData.meshDeviceId, function(meshDeviceId, error) {
                        data.meshDeviceId = meshDeviceId;
                        return finishedCallback(error);
                    });
                } else {
                    return finishedCallback(null);
                }
            },
            //Get serial number
            function(finishedCallback){
                self.getSerialNumber(function(serialNumber, error){
                    data.serialNumber = serialNumber;
                    finishedCallback(error);
                });
            },
            //Get UART protocol version
            function(finishedCallback){
                self.getUARTProtocolVersion(function(uartProtocolVersion, error){
                    data.uartProtocolVersion = uartProtocolVersion;
                    finishedCallback(error);
                });
            },
            //Get hw model
            function(finishedCallback){
                self.getHardwareModel(function(hwModel, error){
                    data.hardwareModel = hwModel;
                    finishedCallback(error);
                });
            },
            //Get hw version
            function(finishedCallback){
                self.getHardwareVersion(function(hwVersion, error){
                    data.hardwareVersion = hwVersion;
                    finishedCallback(error);
                });
            },
            //Get BDAddr
            function(finishedCallback){
                self.getMacAddress(function(mac, error){
                    data.macAddress = mac;
                    finishedCallback(error);
                });
            },
            //Get firmware version
            function(finishedCallback){
                self.getFirmwareVersion(function(firmwareVersion, error){
                    data.firmwareVersion = firmwareVersion;
                    finishedCallback(error);
                });
            },
            //Get firmware build
            function(finishedCallback){
                self.getFirmwareBuild(function(firmwareBuild, error){
                    data.firmwareBuild = firmwareBuild;
                    finishedCallback(error);
                });
            },
            //Get mesh stats
            function(finishedCallback){
                self.getMeshStats(function(stats, error){
                    data.meshStats = stats;
                    finishedCallback(error);
                });
            },
            //Get RTC time
            function(finishedCallback){
                self.getRTCTime(function(rtcTime, error){
                    data.rtcTime = rtcTime;
                    finishedCallback(error);
                });
            },
            //Reboot and wait until ready again
            function(finishedCallback){
                self.once(self.EVENTS.UBEACON_READY, function() {
                    return finishedCallback();
                });
                self.executeCommand(0x01);
            }
        ],
        function(error) {
            callback(error, data);
        }
    );
};

module.exports = ubeacon;