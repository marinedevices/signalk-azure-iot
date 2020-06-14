# signalk-azure-iot
This nodejs plugin logs data produced by SignalK Server to <a href="https://azure.microsoft.com/en-gb/services/iot-hub/">Azure Iot Hub</a>.  It provides a bridge for the metrics to be stored 
in a cloud based database and/or displayed via a web application. It is inspired by a similar <a href="https://github.com/meri-imperiumi/signalk-aws-iot">AWS plugin</a>
<h2>Setting up</h2>
Have your <a href="http://signalk.org/installation.html">SignalK Server</a> up and running and install this plugin via the SignalK Appstore. 
Follow the steps to create your <a href="https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-create-through-portal">Azure Iot Hub</a> using a free Azure account.
Once your Device is registered fill in and activate the plugin's configuration page. The Primary Connection String is found in Azure Iot Hub/Iot Devices/[your device name].
<img src="https://github.com/marinedevices/signalk-azure-iot/blob/master/signalkazureiothub.jpg?raw=true"></img>
And that's it.
