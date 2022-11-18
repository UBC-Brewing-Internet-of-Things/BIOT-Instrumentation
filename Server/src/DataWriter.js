var fs = require('fs');

class DataWriter {
	
	// Creates a new fs write stream and writes the header to the file
	constructor(filename) {
		this.filename = filename;
		fs.appendFile(filename,"recording_start,time,temperature,pH,dissolved_o2\n,true,0,0,0,0\n", function(err) {
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
		const to_write = "false" + "," + data.time + "," + data.temperature + "," + data.pH + "," + data.dissolved_o2 + "\n";
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