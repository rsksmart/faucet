**How to build and run locally**

- Install NPM
- Run: $ npm install 
    If you get an error installing canvas package, refer to the section bellow 'Installing dependencies'.
- node rsk-faucet.js
- Open index.html in a browser


**Configuration for deployment to prod/testnet**
- Copy example-config.json to config.json and configure with your data.
- rsk-Faucet.js configuration variables on top of file
- lib/rsk-helper.js configure urlOfFaucetServer
- put some SBTCs on the faucet address


**TODO**
- Error msg show in red
- Success msg: include amount and address



**INSTALLING DEPENDENCIES**

If 'npm install canvas' fails on your system then you need to install these system-libraries and trying again.


**On ubuntu**

    At your shell execute these commands:
        > sudo apt-get install libgif-dev
 
    if that isn't enough for you then:
        > sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++


**On MAC OSX**

    At your shell execute these commands:
        > npm install node-gyp -g
        > brew install giflib cairo libjpeg giflib pixman
        > npm install canvas

    if that isn't enough for you then:
        > xcode-select --install      # I thought this was dumb, but was key to one of my issues 
        > npm install node-gyp -g
        > brew install giflib cairo libjpeg giflib pixman
        > export PKG_CONFIG_PATH=/opt/X11/lib/pkgconfig
        > OTHER_CFLAGS=-I/usr/local/include npm install canvas


**On RedHat**

    At your shell execute these commands:
        > sudo yum install cairo cairo-devel cairomm-devel libjpeg-turbo-devel pango pango-devel pangomm pangomm-devel giflib-devel -y

