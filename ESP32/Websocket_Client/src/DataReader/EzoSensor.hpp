// Class to represent the ezo atlas scientific sensors
// Cannot use the atlas scientific library as it relies on the arduino framework


class EzoSensor {
	public:
	EzoSensor(int address, char * name);
	~EzoSensor();
	int address;
	char * name;
	
};