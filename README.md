How to build and run locally

- Install NPM
- Run $ npm install
- node rsk-faucet.js
- Open index.html in a browser


Configuration for deployment to prod/testnet
- Copy example-config.json to config.json and configure with your data.- rsk-Faucet.js configuration variables on top of file
- lib/rsk-helper.js configure urlOfFaucetServer
- index.html: Configure recaptcha site key: <div class="g-recaptcha" data-sitekey="reCaptchaSiteKey"></div>
- put some SBTCs on the faucet address


TODO
- Error msg show in red
- Success msg: include amount and address