var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var fs = require('fs');
var Web3 = require('web3');

app.use('/css', express.static('css'));
app.use('/img', express.static('img'));
app.use('/lib', express.static('lib'));
app.use(express.static('public'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var port;
var rskNode;
var faucetAddress;
var reCaptchaSecret;
var valueToSend;
var gasPrice;
var gas;
var faucetPrivateKey;

eval(fs.readFileSync('lib/validate-rsk-address.js')+'');

readConfig();

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

extendWeb3();
loadPk();


function executeTransfer(destinationAddress) {
  var result = web3.eth.sendTransaction({from: faucetAddress, to: destinationAddress.toLowerCase(), gasPrice: gasPrice, gas: gas, value: valueToSend});
  console.log('transaction hash', result);
}

function readConfig(){
  obj=JSON.parse(fs.readFileSync('./config.json', 'utf8'));
  port = obj.port;
  rskNode = obj.rskNode;
  faucetAddress = obj.faucetAddress;
  faucetPrivateKey = obj.faucetPrivateKey;
  reCaptchaSecret = obj.reCaptchaSecret;
  valueToSend = obj.valueToSend;
  gasPrice = obj.gasPrice;
  gas = obj.gas;
}

function extendWeb3() {
  web3._extend({
    property: 'personal',
    methods: [new web3._extend.Method({
      name: 'importRawKey',
      call: 'personal_importRawKey',
      params: 2,
      inputFormatter: [function (value) { return value; }, function (value) { return value; }],
      outputFormatter: null
    })]
  });

  web3._extend({
    property: 'personal',
    methods: [new web3._extend.Method({
      name: 'unlockAccount',
      call: 'personal_unlockAccount',
      params: 3,
      inputFormatter: [function (value) { return value; }, function (value) { return value; }, function (value) { return value; }],
      outputFormatter: null
    })]
  });
}

function loadPk() {
  console.log('Loding PK to node');
  var result = web3.personal.importRawKey(faucetPrivateKey, "passPhraseToEncryptPrivKey");
  var result = web3.personal.unlockAccount(faucetAddress, "passPhraseToEncryptPrivKey", "0");
  console.log('PKs loaded to the node');
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
    console.log('Sending RSKs to ' + req.body.rskAddress);
    console.log('Recaptcha ' + req.body.gRecaptchaResponse);
    executeTransfer(req.body.rskAddress)

    res.send('Successfully sent some SBTCs to ' + req.body.rskAddress + '.');
  });
});

app.listen(port, function () {
  console.log('RSK Faucet started on port ' + port);
});