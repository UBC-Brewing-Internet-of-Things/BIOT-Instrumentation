var fs = require('fs');

class DataWriter {
	
	// Creates a new fs write stream and writes the header to the file
	constructor(filename) {
		this.filename = filename;
		this.writeStream = fs.createWriteStream(filename);
		this.writeStream.write("time,temperature,pH,dissolved_o2\n");
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
		this.writeStream.write(data.time + "," + data.temperature + "," + data.pH + "," + data.dissolved_o2 + "\n");
	}

	close() {
		this.writeStream.close();
	}
}


module.exports = DataWriter;