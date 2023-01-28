## Working with EZO Sensors in i2c mode
### Ensuring the board is in i2c mode
- When the Atlas Scientific EZO circuit boards are in i2c mode, the light will be BLUE in standby mode (and green when reading). 
	- This is the dark blue, the UART blue is more of a teal.
- When the chip is in UART mode, the light will be GREEN in standby mode (and blue when reading).
- To switch the chip between i2c mode and UART mode, you can short TX to PGND
	- Leave the chip connected to power (VCC) and ground (GND)
	- Make sure to disconnect the RX line, and anything else connected to the board.
- Relevant Documentation:
	- https://files.atlas-scientific.com/pH_EZO_Datasheet.pdf
		- Page 41 - Switching to i2c
		- Page 47 - i2c LED colour definition


