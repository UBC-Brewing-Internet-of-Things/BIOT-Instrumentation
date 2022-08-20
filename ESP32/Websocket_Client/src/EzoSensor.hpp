// Class to represent the ezo atlas scientific sensors
// Cannot use the atlas scientific library as it relies on the arduino framework


class EzoSensor {
	public:
	EzoSensor(uint8_t address, char * name);
	~EzoSensor();

	private:
	unit8_t address;
	char * name;
}