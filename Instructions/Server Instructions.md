### How to get the server up and running
Our server is built with NodeJS, and we're running it on a rasberry pi.
Here's a great tutorial https://dev.to/bogdaaamn/run-your-nodejs-application-on-a-headless-raspberry-pi-4jnn

### Launching the UI on rasberry pi from ssh
1. First, ssh into the webserver with the -Y / -X option.
2. run `export DISPLAY=:0`
3. run /bin/chromium-browser

