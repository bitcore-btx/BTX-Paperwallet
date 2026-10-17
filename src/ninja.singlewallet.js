(function (wallets, qrCode) {
	var single = wallets.singlewallet = {
		isOpen: function () {
			return (document.getElementById("singlewallet").className.indexOf("selected") != -1);
		},

		open: function () {
			if (document.getElementById("btcaddress").innerHTML == "") {
				single.generateNewAddressAndKey();
			}
			document.getElementById("singlearea").style.display = "block";
		},

		close: function () {
			document.getElementById("singlearea").style.display = "none";
		},

		// generate bitcoin address and private key and update information in the HTML
		generateNewAddressAndKey: function () {
			try {
				var key = new Bitcoin.ECKey(false);
				key.setCompressed(true);
				single.lastKey = key;
				var bitcoinAddress = single.getAddressForCurrentFormat();
				var privateKeyWif = key.getBitcoinWalletImportFormat();
				document.getElementById("btcaddress").innerHTML = bitcoinAddress;
				document.getElementById("btcprivwif").innerHTML = privateKeyWif;
				var keyValuePair = {
					"qrcode_public": bitcoinAddress,
					"qrcode_private": privateKeyWif
				};
				qrCode.showQrCode(keyValuePair, 4);
			}
			catch (e) {
				// browser does not have sufficient JavaScript support to generate a bitcoin address
				alert(e);
				document.getElementById("btcaddress").innerHTML = "error";
				document.getElementById("btcprivwif").innerHTML = "error";
				document.getElementById("qrcode_public").innerHTML = "";
				document.getElementById("qrcode_private").innerHTML = "";
			}
		},

		// the key currently displayed (kept so toggling the address format does NOT
		// generate a new key - the same key funds both the legacy and the segwit address)
		lastKey: null,

		segwitSelected: function () {
			var el = document.getElementById("singlesegwit");
			return el != null && el.checked;
		},

		getAddressForCurrentFormat: function () {
			if (single.segwitSelected()) {
				return single.lastKey.getBech32Address();
			}
			return single.lastKey.getBitcoinAddress();
		},

		// checkbox handler: re-render the address + public QR for the SAME key
		toggleSegwit: function () {
			if (single.lastKey == null) return;
			var bitcoinAddress = single.getAddressForCurrentFormat();
			document.getElementById("btcaddress").innerHTML = bitcoinAddress;
			qrCode.showQrCode({
				"qrcode_public": bitcoinAddress,
				"qrcode_private": document.getElementById("btcprivwif").innerHTML
			}, 4);
		}
	};
})(ninja.wallets, ninja.qrCode);