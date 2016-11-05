

function validateRskAddress(rskAddress) {
	if (rskAddress.length != 42) {
		return false;
	}
	if (rskAddress.substring(0,2) != "0x") {
		return false;
	}
	var actualAddress = rskAddress.substring(2,42);
	if (! /^([a-zA-Z0-9]{40,40})$/.test(actualAddress)) {
		return false;
	}
	return true;
}