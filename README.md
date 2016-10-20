How to build and run locally

- Install NPM
- Run $ npm install
- node rsk-faucet.js
- Open index.html in a browser


Configuration for deployment to prod/testnet
- There is a reCaptcha site created for monitoring@rsk.co / domain rsk.co
- rskFaucet.js configuration variables on top of file
- rsk-helper.js: configure urlOfFaucetServer
- index.html: Configure recaptcha site key: <div class="g-recaptcha" data-sitekey="reCaptchaSiteKey"></div>
- put some SBTCs on the faucet address


TODO
- Error msg show in red
- Success msg: include amount and address
- Make configuration more elegant (ie configuration file, env variables, etc)