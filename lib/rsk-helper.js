

var urlOfFaucetServer = "https://faucet.rsk.co";
$(document).ready(function(){
	$.ajax({
    type: "GET",
    url: urlOfFaucetServer + "/balance",
    async: true,
    cache: false,
		success: function callFunction(result) {
			$("#faucetBalance").html('<h3>Faucet balance is ' + result + ' SBTC</h3>');
		},
		error: function (xhr, status, error) {
			console.log("Faucet balance retrieval error.")
		}
  });

	$( "#toRskBtn" ).click(function() {
		try {
			var rskAddress = $( "#rskAddress" ).val();
			if (!validateRskAddress(rskAddress)) {
				$("#toRskResult").html('<h3 class="has-error">Invalid RSK address format.</h3>');
				return;
			}
            var captchaText = $( "#captchaInputText" ).val();
			$.ajax({
            	type: "POST",
            	url: urlOfFaucetServer,
            	cache: false,
            	data: {"rskAddress" : rskAddress, "captcha": captchaText},
				success: function callFunction(result) {
					$("#toRskResult").html('<h3>Successfully sent some SBTCs to that address</h3>');
					$("#toRskForm").hide();
				},
				error: function (xhr, status, error) {
					var errorMsg;
  					if(xhr.responseText === undefined || xhr.responseText === '' || xhr.responseText === null) {
  						errorMsg = error.toString();
  					} else {
  						errorMsg = xhr.responseText;
  					}
					$("#toRskResult").html('<h3 class="has-error">' + errorMsg + '</h3>');
				}
      });
		} catch(err) {
			$("#toRskResult").html('<h3 class="has-error">' + err.message + '</h3>');
		}
	});
});


