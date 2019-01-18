var faucetUrl = 'https://faucet.testnet.rsk.co'

document.addEventListener('DOMContentLoaded', () => {
	let handleError = (error) => $('#result').html('<b class="has-error">' + error + '</b>')

	$.ajax({
    type: 'GET',
    url: faucetUrl + '/balance',
    async: true,
    cache: false,
		success: (result) => $('#balance').html(result),
		error: (xhr, status, error) => handleError('Error loading faucet balance.')
	})

	let refreshCaptcha = () => $('#captcha-image').attr('src', faucetUrl + '/captcha.jpg#' + new Date().getTime())
	refreshCaptcha()
	$('#btnRefresh').click(refreshCaptcha)

	$('#toRskBtn').click(() => {
		let addr = $('#address').val()
		let captcha = $('#captcha').val()

		$.ajax({
			type: 'POST',
			url: faucetUrl,
			cache: false,
			data: { 'rskAddress': addr, 'captcha': captcha },
			success: (result) => $('#result').html('<b>Successfully sent some SBTCs to that address<b>'),
			error: (xhr, status, error) => {
				let message = xhr.responseText === undefined || xhr.responseText === '' || xhr.responseText === null ?
					error.toString() :
					errorMsg = xhr.responseText
				handleError(message)
			}
		})
	})
})
