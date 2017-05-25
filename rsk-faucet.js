var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var fs = require('fs');
var Web3 = require('web3');
var CronJob = require('cron').CronJob;
const cookieParser = require('cookie-parser')

app.use('/css', express.static('css'));
app.use('/img', express.static('img'));
app.use('/lib', express.static('lib'));
app.use(express.static('public'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use( bodyParser.json() );                           // to support JSON-encoded bodies
app.use( bodyParser.urlencoded({ extended: true }) );   // to support URL-encoded bodies

const captchaUrl = '/captcha.jpg'
const captchaId = 'captcha'
const captchaFieldName = 'captcha' 

app.use(cookieParser())
const captcha = require('captcha').create({ cookie: captchaId })
app.get(captchaUrl, captcha.image())

var port;
var rskNode;
var faucetAddress;
var reCaptchaSecret;
var valueToSend;
var gasPrice;
var gas;
var faucetPrivateKey;
var faucetHistory = {};

eval(fs.readFileSync('lib/validate-rsk-address.js')+'');

readConfig();

var job = new CronJob({
  cronTime: '* */59 * * * *',
  onTick: function() {
    for (var storeAddress in faucetHistory) {
      if ( faucetHistory.hasOwnProperty(storeAddress) ) {
        var now = new Date().getTime();
        //86400000 = 1 day
        if(now - faucetHistory[storeAddress].timestamp >= 86400000) {
          delete faucetHistory[storeAddress];
        }
      }
    }
  }, start: false, timeZone: 'America/Los_Angeles'});
job.start();


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

function executeTransfer(destinationAddress) {

  loadPk();
  var result = web3.eth.sendTransaction({from: faucetAddress, to: destinationAddress.toLowerCase(), gasPrice: gasPrice, gas: gas, value: valueToSend});
  console.log('transaction hash', result);
}

function readConfig(){
  const obj=JSON.parse(fs.readFileSync('./config.json', 'utf8'));
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
  var result = web3.personal.unlockAccount(faucetAddress, "passPhraseToEncryptPrivKey", "0xE10");
  console.log('PKs loaded to the node');
}

function accountAlreadyUsed(account) {
    var acc = account.toLowerCase(); 
    return acc in faucetHistory;
}

app.get('/balance', function (req, res) {
  var balance = web3.eth.getBalance(faucetAddress);

  balance = web3.fromWei(balance, "ether");
  
  return res.status(200).send(balance);  
});

app.post('/', function (req, res) {
  if (!validateRskAddress(req.body.rskAddress)) {
    console.log('Invalid RSK address format ', req.body.rskAddress);
    return res.status(400).send('Invalid RSK address format.');
  }

  if (accountAlreadyUsed(req.body.rskAddress)) {
    console.log('Address already used today:', req.body.rskAddress);
    return res.status(400).send('Address already used today.');
  }


  //
  //
  if(req.body[captchaFieldName] === undefined || req.body[captchaFieldName] === '' || req.body[captchaFieldName] === null) {
    console.log('No req.body.' + captchaFieldName);
    return res.status(400).send("Please complete captcha.");
  }

  var isSyncing = web3.eth.syncing;
  if(!isSyncing) {
    // Success will be true or false depending upon captcha validation.
    var valid = captcha.check(req.body[captchaFieldName], req.cookies[captchaId])
    if(valid !== undefined && !valid) {
      console.log('Invalid captcha ', req.body[captchaFieldName]);
      return res.status(400).send("Failed captcha verification.");
    }
    console.log('Sending RSKs to ' + req.body.rskAddress);
    console.log('Captcha ' + req.body[captchaFieldName]);
    executeTransfer(req.body.rskAddress)

    faucetHistory[req.body.rskAddress.toLowerCase()] = {timestamp: new Date().getTime()};
    res.send('Successfully sent some SBTCs to ' + req.body.rskAddress + '.');
  } else {
    res.send('We can not tranfer any amount right now. Try again later.' + req.body.rskAddress + '.');
  }
});

app.listen(port, function () {
  console.log('RSK Faucet started on port ' + port);
});