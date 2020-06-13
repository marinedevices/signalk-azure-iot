const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;
const Protocol = require('azure-iot-device-mqtt').Mqtt;

module.exports = function (app) {
  var plugin = {};
  var deviceId;
  var messageId = 0;
  var client;
  var unsubscribes = [];

  plugin.id = 'signalk-azure-iot';
  plugin.name = 'SignalK to Azure IoT Hub';
  plugin.description = 'Plugin to log SignalK data to Azure IoT Hub';

  function sendMessage(m) {
    messageId++;
    let path = m.path;
    let mValue = JSON.stringify(m.value);
    let payload = JSON.stringify({
      messageId: messageId,
      deviceId: deviceId,
      path: path,
      measurement: mValue
    });
    let message = new Message(payload);
    client.sendEvent(message);
  }

  plugin.start = function (options) {
    // Here we put our plugin logic
    app.debug('Plugin started');
    app.setProviderStatus('Plugin has started');

    client = Client.fromConnectionString(options.azureiot_connectionString, Protocol);
    deviceId = options.azureiot_deviceId;
    client.deviceId = deviceId;
    client.open(function (err) {
      if (err) {
        app.setProviderStatus('Could not connect to Azure Iot Hub');
        app.setProviderError(err.message);
        plugin.stop();
      } else {
        app.debug('SignalK Azure client connected');
        app.setProviderStatus('Connected to Azure IoT Hub');
      }
      client.close(function () {
      });
    });

    const localSubscription = {
      context: 'vessels.self',
      subscribe: [{
        path: '*',
        period: (options.send_interval || 15) * 1000,
      }],
    };

    app.subscriptionmanager.subscribe(
      localSubscription,
      unsubscribes,
      (subscriptionError) => {
        app.error(subscriptionError);
      },
      (delta) => {
        delta.updates.forEach((u) => {
          u.values.forEach(sendMessage);
        });
      },
    );

    client.on('message', function (msg) {
      //      these just change status info of the plugin without affecting its function;
      //      append the logic as per specific requirements;
      //      message is sent from Azure Iot Hub C2D;
      let c2d = msg.data.toString('ascii');
      switch (c2d) {
        case 'connect':
          app.debug('message from c2d = ' + 'connected');
          app.setProviderStatus('Connected to Azure IoT Hub by c2d');
          break;
        case 'disconnect':
          app.debug('message from c2d = ' + 'disconnected');
          app.setProviderStatus('Disconnected from Azure IoT Hub by c2d');
          break;
        case 'stop':
          app.debug('message from c2d = ' + 'stopped');
          app.setProviderStatus('SignalK Azure IoT Hub plugin is stopped by c2d');
        default:
          app.debug('default Hello from Azure Iot Hub Server by c2d');
      }
    });
  };

  plugin.stop = function () {
    // Here we put logic we need when the plugin stops
    unsubscribes.forEach((f) => f());
    unsubscribes = [];
    if (client) {
      client.close();
    }
    app.debug('Plugin stopped');
  };

  plugin.schema = {
    type: 'object',
    required: [
      'azureiot_deviceId',
      'azureiot_connectionString',
    ],
    properties: {
      azureiot_deviceId: {
        type: 'string',
        title: 'Your device name as registered with Azure Iot Hub',
      },
      azureiot_connectionString: {
        type: 'string',
        title: 'Azure IoT Device Primary Connection String (From Azure Home/IoT Hub/IoT Devices)',
      },
      send_interval: {
        type: 'number',
        title: 'How often to send data, in seconds',
        default: 15,
      },
    },
  };

  plugin.uiSchema = {
    azureiot_deviceId: {
      'ui:widget': 'textarea'
    },
    azureiot_connectionString: {
      'ui:widget': 'textarea',
    },
  };
  return plugin;
};