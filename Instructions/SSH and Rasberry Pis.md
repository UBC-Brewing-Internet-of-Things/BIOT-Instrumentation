## No Monitors
This tutorial currently only works for linux and mac machines. If you are using a windows machine, you will need to use a program like [Putty](https://www.putty.org/) to connect to the Raspberry Pi.

We don't actually need a monitor to get a pi set up and running. Here's a simple process to get a pi up and running without a monitor.
### SSH
First, we need to know what SSH is. SSH stands for Secure SHell. It's essentially a way to interact with a computer remotely. When we ssh into a pi, we get a command line interface to the pi. We can do anything we would normally do on the pi, but we don't need to be physically connected to it. We can do this from any computer that is connected to the same network as the pi, or from anywhere in the world if we have a port forwarded to the pi. The BIOT router is currently not connected to the internet, it's just a local network for devices to communicate.

### Setting Up the pi
Often, it's easiest to start fresh. Get a microSD card reader, and plug in the pi's microSD card. Grab the Raspberry Pi Imager from https://www.raspberrypi.com/software/. 

Open the imager, and select the OS you want to install. The rest of the pis are using Raspberry Pi OS (64-bit) Lite. This is the barebones version of the OS. It's a little more difficult to set up, but it's a lot faster and more efficient. Since we don't need a GUI, we don't need to install the full version of the OS.

Once you've selected the OS, select the microSD card you want to install it on. 

Before we write, we need to adjust some settings. Click the gear icon in the bottom right corner. Select the following options:
- Set hostname: *pi_name*
- Enable SSH
	- Use password authentication
- Set username and password
    - Username: *pi_name*
	- Password: *password*
- Configure wireless LAN
	- SSID : *network_name*
	- Password: *password*
	- Wireless country: *CA*
- Set locale (optional)
	- Timezone: *America/Vancouver*
	- Keyboard layout: *English (US)*

Then, click "Write". This will take a few minutes. Once it's done, you can eject the microSD card from your computer, and put it in the pi. Connect the pi to power, and give it a few minutes to boot up.


### Connecting to the pi
#### Getting the IP address
Now that the pi is set up, we need to connect to it. We can do this from any computer that is connected to the same network as the pi.

Before we can *ssh* into the pi, we need the *ip* address. There's a bunch of ways to find this, the cleanest is to use *nmap*. You can download nmap from https://nmap.org/. Once you've installed nmap, open a terminal and type the following command:

	nmap -sP 192.168.0.1/24

This will scan through the addresses on our network, and return the devices that are connected. The pi should be listed with the name you set in the imager. The ip address will be listed next to the name.

	Nmap scan report for biotserver.lan (192.168.1.170)

You don't need *nmap* for this. We can do it manually. Open a terminal and type the following command:

	arp -a | grep "b8:27:eb"

All rasberry pis have mac addresses that start with *b8:27:eb*. You can use this to find the ip address of the pi. The ip address will be listed next to the mac address.

We can also find the ip address by logging into the router. The router's ip address is **INSERT IP**. 

Finally, you could always grab a monitor and keyboard and connect it to the pi. Then, you can find the ip address in the terminal. 
	ifconfig -a

Look for the ip address listed next to *inet* under *wlan0*.

#### SSH into the pi
Now, we can ssh into the pi. Open a terminal and type the following command:

	ssh *username*@*ip_address*

You will be prompted for the password, use the one you set in the imager. If you get a message saying that the authenticity of the host can't be established, type yes. You should now be connected to the pi. :D
	

