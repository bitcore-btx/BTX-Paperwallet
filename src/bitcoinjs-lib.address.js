//https://raw.github.com/bitcoinjs/bitcoinjs-lib/09e8c6e184d6501a0c2c59d73ca64db5c0d3eb95/src/address.js
Bitcoin.Address = function (bytes) {
	if ("string" == typeof bytes) {
		bytes = Bitcoin.Address.decodeString(bytes);
	}
	this.hash = bytes;
	this.version = Bitcoin.Address.networkVersion;
};

// Bitcore BTX mainnet pubkey address version byte = 0x03 (base58 addresses start with '2').
// Confirmed against the official BitCore node (LIMXTEC/BitCore src/chainparams.cpp):
//   base58Prefixes[PUBKEY_ADDRESS] = 3, base58Prefixes[SECRET_KEY] = 128 (0x80), bech32_hrp = "btx".
Bitcoin.Address.networkVersion = 0x03; // mainnet

// P2SH script address version byte = 0x7D (125) -> base58 addresses start with 's'.
// Confirmed against the official BitCore node (LIMXTEC/BitCore src/chainparams.cpp):
//   base58Prefixes[SCRIPT_ADDRESS] = std::vector<unsigned char>(1,125); // BTX prefix 's'
// Used for P2SH-P2WPKH "compatibility" addresses (BIP-49 style nested SegWit).
Bitcoin.Address.scriptHashVersion = 0x7D; // mainnet

// Human-readable part for native SegWit (bech32) addresses, addresses look like btx1...
// Same source: LIMXTEC/BitCore src/chainparams.cpp (bech32_hrp = "btx") and src/key_io.cpp
// (standard BIP-173 bech32, witness v0). Documented at https://bitcore.cc/wallets (bc1... -> btx1...).
Bitcoin.Address.bech32Hrp = "btx"; // mainnet

/**
* Serialize this object as a standard Bitcoin address.
*
* Returns the address as a base58-encoded string in the standardized format.
*/
Bitcoin.Address.prototype.toString = function () {
	// Get a copy of the hash
	var hash = this.hash.slice(0);

	// Version
	hash.unshift(this.version);
	var checksum = Crypto.SHA256(Crypto.SHA256(hash, { asBytes: true }), { asBytes: true });
	var bytes = hash.concat(checksum.slice(0, 4));
	return Bitcoin.Base58.encode(bytes);
};

Bitcoin.Address.prototype.getHashBase64 = function () {
	return Crypto.util.bytesToBase64(this.hash);
};

/**
* Parse a Bitcoin address contained in a string.
*/
Bitcoin.Address.decodeString = function (string) {
	var bytes = Bitcoin.Base58.decode(string);
	var hash = bytes.slice(0, 21);
	var checksum = Crypto.SHA256(Crypto.SHA256(hash, { asBytes: true }), { asBytes: true });

	if (checksum[0] != bytes[21] ||
			checksum[1] != bytes[22] ||
			checksum[2] != bytes[23] ||
			checksum[3] != bytes[24]) {
		throw "Checksum validation failed!";
	}

	var version = hash.shift();

	if (version != Bitcoin.Address.networkVersion) {
		throw "Version " + version + " not supported!";
	}

	return hash;
};
