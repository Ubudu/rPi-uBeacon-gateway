'use strict';

var express = require('express');
var fs = require('fs');
var router = new express.Router();
var debug = require('debug')('web');
var db = require('../db');
var async = require('async');

var credentialsPath = __dirname + '/../credentials.json';
var idPath = __dirname + '/../id.json';

var gatewayIdentifier = require(idPath).gatewayId;

var ubeacon = require('../ubeacon');

/* Set the correct header section */
router.use(function(req, res, next) {
  res.locals.headerSection = 'tasks';
  next();
});

/* Checks if the user is authenticated */
router.use(function(req, res, next) {
  fs.exists(credentialsPath, function(exists) {
    if (exists) {
      var credentials = require(credentialsPath);
      if (credentials.token !== null) {
        return next();
      } else {
        return res.redirect('/login');
      }
    } else {
      return res.redirect('/login');
    }
  });
});

// Dummy list of tasks
var fakeTasks = require(__dirname + '/../data/test/fake_tasks.json');

// Load them to db
fakeTasks.forEach(function(fakeTask) {
  db.tasks.findOne({ id: fakeTask.id }, function(err, task) {
    if (err) {
      return console.log(err);
    }
    if (!task) {
      debug('Inserting fake task with ID ' + fakeTask.id);
      db.tasks.insert(fakeTask, function(err, newTask) {
        if (err) {
          return console.log(err);
        }
      });
    } else {
      debug('Fake task with Id ' + fakeTask.id + ' already inserted');
    }
  });
});

/* GET list of tasks */
router.get('/', function(req, res, next) {
  db.tasks.find({}).sort({ created_at: 1 }).exec(function(err, tasks) {
    if (err) {
      return next(err);
    }

    // DEBUG
    tasks = fakeTasks;

    // Need to split tasks depending on their status
    var assignedToMeTasks = [];
    var upcomingTasks = [];
    var assignedToAnotherGatewayTasks = [];
    var progressTasks = [];
    var completedTasks = [];
    var erroredTasks = [];

    tasks.forEach(function(task) {
      if (task.assigned_to == gatewayIdentifier) {
        assignedToMeTasks.push(task);
        switch (task.status) {
          case "CREATED":
          case "ASSIGNED":
            upcomingTasks.push(task);
            break;
          case "PROGRESS":
            progressTasks.push(task);
            break;
          case "COMPLETED":
            completedTasks.push(task);
            break;
          case "ERROR":
            erroredTasks.push(task);
            break;
        }
      } else {
        assignedToAnotherGatewayTasks.push(task);
      }
    });

    res.render('tasks/index', {
      assignedToMeTasks: assignedToMeTasks,
      assignedToAnotherGatewayTasks: assignedToAnotherGatewayTasks,
      upcomingTasks: upcomingTasks,
      progressTasks: progressTasks,
      completedTasks: completedTasks,
      erroredTasks: erroredTasks,
      cmdNames: cmdNames
    });
  });
});

/* Execute a task */
router.post('/:id/execute', function(req, res, next) {
  db.tasks.findOne({ id: parseInt(req.params.id) }).exec(function(err, task) {
    if (err) {
      return next(err);
    }
    if (!task) {
      return next(new Error('Not found'));
    }
    if (task.status != "ASSIGNED" || task.assigned_to != gatewayIdentifier) {
      return next(new Error('Task is not assigned to this gateway'));
    }

    async.eachSeries(task.commands, function(command, callback) {
      var dataBytes = hexStringToString(command.value ? command.value : '');
      var cmdByte = command.command_id;
      var isGet = command.type === 'GET';
      var cmdBuffer = ubeacon.getCommandString(isGet, cmdByte, new Buffer(dataBytes), false);
      ubeacon.sendMeshRemoteManagementMessage(command.target, cmdBuffer.toString());
      setTimeout(callback, 5000);
    }, function(err) {
      return res.redirect('/tasks');
    });
  });
});

var uartHumanReadableCmd = {
  none:                   'None',   //
  protocolVersion:        'Protocol version',
  firmwareVersion:        'Firmware version',
  hardwareModel:          'Hardware model',
  hardwareVersion:        'Hardware version',
  bdaddr:                 'MAC address',
  firmwareBuild:          'Firmware build',
  serialNumber:           'Serial number',
  connectable:            'Connectable status',
  connectionInfo:         'Connection infos',
  ledSettingsRegister:    'LED settings register',
  uartSettingsRegister:   'UART settings register',
  txPower:                'TX power',
  batteryLevel:           'Battery level',
  temperature:            'Temperature',
  RTCAlarmEnabled:        'RTC alarm status',
  RTCSettingsRegister:    'RTC settings register',
  RTCTime:                'RTC time',
  RTCSchedule:            'RTC schedule',
  advertising:            'Advertising',
  advertisingInterval:    'Advertising interval',
  uuid:                   'Proximity UUID',
  major:                  'Major',
  minor:                  'Minor',
  measuredStrength:       'Measured strength',
  serviceId:              'Service ID',
  led:                    'LED status',
  command:                'Command',
  meshSettingsRegister:   'Mesh settings register',
  meshNetworkUUID:        'Mesh network UUID',
  meshDeviceId:           'Mesh device ID',
  meshStats:              'Mesh stats'
};

var cmdNames = {};
for (var key in ubeacon.uartCmd) {
  var cmd = ubeacon.uartCmd[key];
  var name = uartHumanReadableCmd[key];
  cmdNames[cmd] = name;
}

var hexStringToString = function(hexStr)  {
  var str = '';
  for (var i = 0 ; i < hexStr.length ; i += 2) {
    var c = String.fromCharCode(parseInt(hexStr.substr(i, 2), 16));
    str += c;
  }
  return str;
};

module.exports = { path: '/tasks', router: router };