const DataWriter = require('./DataWriter.js');
const Client = require('./Client.js');

class DataDevice extends Client {
	constructor(id, name, type, socket, parent) {
		super(id, name, type, socket, parent);
		this.data = {
			temperature: 0,
			pH: 0,
			dissolved_o2: 0
		};
		this.recordingInterval = null;
		this.recordingResolution = 30000; // 30 seconds
	}	

	updateData(temp, pH, dissolved_o2) {
		this.data.temperature = temp || 0;
		this.data.pH = pH || 0;
		this.data.dissolved_o2 = dissolved_o2 || 0;
	}

	startRecording() {
		this.recording = true;
		const filename = this.name + "_" + Date.now() + ".csv";
		var DataWriter_v = new DataWriter(filename);
		console.log("starting recording to " + filename);

		// remove prev device from the list of recording devices
		this.device_manager.removeRecordingDevice(this.name);
		// add this device to the list of recording devices
		this.device_manager.addRecordingDevice(this.name, this);

		this.recordingInterval = setInterval(() => {
		    var data_to_write = {
				time: Date.now(),
				temperature: this.data.temperature,
				pH: this.data.pH,
				dissolved_o2: this.data.dissolved_o2
			};

			DataWriter_v.writeData(data_to_write);
		}, this.recordingResolution);
	}

	stopRecording() {
		if (this.recordingInterval !== null) {
			clearInterval(this.recordingInterval);
			this.recordingInterval = null;
			// remove from the list of recording devices
			this.parent.removeRecordingDevice(this.name);
			console.log("stopped recording");
		} else {
			console.log("no recording to stop");
		}
	}

}

module.exports = DataDevice;