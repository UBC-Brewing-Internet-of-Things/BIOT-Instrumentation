var fs = require('fs');

class DataWriter {
	
	// Creates a new fs write stream and writes the header to the file
	constructor(filename) {
		this.filename = filename;
		fs.appendFile(filename,"type,time,temperature,pH,dissolved_o2\nSTART,0,0,0,0\n", function(err) {
			if (err) {
				return console.log(err);
			}
		});
	}

	
	/*
		we expect the data in a json object with the following format:
		data = {
			time: <time>,
			temperature: <temperature>,
			pH: <pH>,
			dissolved_o2: <dissolved_o2>
		}
	*/
	writeData(data) {
		// write the data to the file
		const to_write = "READING" + "," + data.time + "," + data.temperature + "," + data.pH + "," + data.dissolved_o2 + "\n";
		fs.appendFile(this.filename, to_write, function(err) {
			if (err) {
				return console.log(err);
			}
		});
	}

	writeRecordingStop() {
		const to_write = "STOP,0,0,0,0\n";
		fs.appendFile(this.filename, to_write, function(err) {
			if (err) {
				return console.log(err);
			}
		});
	}

	close() {
		this.writeStream.close();
	}
}


module.exports = DataWriter;