var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

var rskNode = "localhost:4444";
var faucetAddress = "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826";
var reCaptchaSecret = "reCaptchaSecretKey";
var valueToSend = 10000000000000000;
var gasPrice = 1;
var gas = 21000;

app.use('/css', express.static('css'));
app.use('/img', express.static('img'));
app.use('/lib', express.static('lib'));
app.use(express.static('public'));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));



var fs = require('fs');
eval(fs.readFileSync('lib/validate-rsk-address.js')+'');

var Web3 = require('web3');
function getWeb3() {
    if (web3)
        return web3;

    console.log('using web3', rskNode);
    web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider('http://' + rskNode));

    return web3;
}
var web3;
getWeb3();


function executeTransfer(destinationAddress) {
    var result = web3.eth.sendTransaction({from: faucetAddress, to: destinationAddress, gasPrice: gasPrice, gas: gas, value: valueToSend});
    console.log('transaction hash', result);
}

app.get('/balance', function (req, res) {
  var balance = web3.eth.getBalance(faucetAddress);
  return res.status(200).send(balance);  
});


app.post('/', function (req, res) {
  if (!validateRskAddress(req.body.rskAddress)) {
      console.log('Invalid RSK address format ', req.body.rskAddress);
      return res.status(400).send('Invalid RSK address format.');
  }
  // gRecaptchaResponse is the key that browser will generate upon form submit.
  // if its blank or null means user has not selected the captcha, so return the error.
  if(req.body.gRecaptchaResponse === undefined || req.body.gRecaptchaResponse === '' || req.body.gRecaptchaResponse === null) {
    console.log('No req.body.gRecaptchaResponse');
    return res.status(400).send("Please complete captcha.");
  }
  // req.connection.remoteAddress will provide IP address of connected user.
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + reCaptchaSecret + "&response=" + req.body.gRecaptchaResponse + "&remoteip=" + req.connection.remoteAddress;
  // Hitting GET request to the URL, Google will respond with success or error scenario.
  request(verificationUrl,function(error,response,body) {
    body = JSON.parse(body);
    // Success will be true or false depending upon captcha validation.
    if(body.success !== undefined && !body.success) {
      console.log('Invalid captcha ', req.body.gRecaptchaResponse);
      return res.status(400).send("Failed captcha verification.");
    }
  });

  console.log('Sending RSKs to ' + req.body.rskAddress);
  console.log('Recaptcha ' + req.body.gRecaptchaResponse);
  executeTransfer(req.body.rskAddress)

  res.send('Successfully sent some SBTCs to ' + req.body.rskAddress + '.');
});

app.listen(3000, function () {
  console.log('RSK Faucet started on port 3000');
});