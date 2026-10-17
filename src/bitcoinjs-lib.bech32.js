// Minimal Bech32 (BIP-0173) implementation for Bitcore BTX native SegWit addresses.
//
// Verified against the official BitCore node source (github.com/LIMXTEC/BitCore, master):
//   src/chainparams.cpp : bech32_hrp = "btx" (mainnet), "testnet1btx" (testnet)
//   src/key_io.cpp      : WitnessV0KeyHash -> ConvertBits<8,5,true>(hash160) with witness
//                         version 0 prefix, then bech32::Encode(hrp, data)
//   src/bech32.cpp      : standard BIP-173 implementation (CHARSET "qpzry9x8gf2tvdw0s3jn54khce6mua7l",
//                         constant 1). This port matches it byte for byte.
// The official BTX wallet site (bitcore.cc/wallets) documents the same mapping: bc1... -> btx1...
//
// This file only ENCODES/DECODES strings. It does not touch key derivation.
var Bitcoin = Bitcoin || {};

Bitcoin.Bech32 = (function () {
	var CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

	// charset reverse lookup; -1 marks characters outside the bech32 alphabet
	var CHARSET_REV = (function () {
		var rev = [], i;
		for (i = 0; i < 128; i++) rev[i] = -1;
		for (i = 0; i < CHARSET.length; i++) rev[CHARSET.charCodeAt(i)] = i;
		return rev;
	})();

	function Polymod(values) {
		var GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
		var chk = 1;
		for (var p = 0; p < values.length; p++) {
			var b = (chk >> 25);
			chk = (chk & 0x1ffffff) << 5 ^ values[p];
			for (var i = 0; i < 5; i++) {
				if (((b >> i) & 1) !== 0) chk ^= GEN[i];
			}
		}
		return chk;
	}

	function HrpExpand(hrp) {
		var ret = [];
		var i;
		for (i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) >> 5);
		ret.push(0);
		for (i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) & 31);
		return ret;
	}

	function CreateChecksum(hrp, data) {
		var values = HrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
		var mod = Polymod(values) ^ 1; // BIP-173 constant 1 (bech32, not bech32m)
		var ret = [];
		for (var p = 0; p < 6; p++) ret.push((mod >> 5 * (5 - p)) & 31);
		return ret;
	}

	function VerifyChecksum(hrp, data) {
		return Polymod(HrpExpand(hrp).concat(data)) === 1;
	}

	// hrp: string (lowercase expected), data: array of 5-bit values
	// Returns the bech32 string, or null on invalid input.
	function encode(hrp, data) {
		if (hrp.length < 1 || hrp.length > 83) return null;
		for (var i = 0; i < data.length; i++) {
			if (data[i] < 0 || data[i] > 31) return null;
		}
		var combined = data.concat(CreateChecksum(hrp, data));
		var ret = hrp + "1";
		for (var j = 0; j < combined.length; j++) ret += CHARSET.charAt(combined[j]);
		return ret;
	}

	// Returns { hrp: string, data: [5-bit values] } or null on any error
	// (bad length, mixed case, invalid char, bad checksum).
	function decode(str) {
		var hasLower = false, hasUpper = false, i;
		for (i = 0; i < str.length; i++) {
			var c = str.charCodeAt(i);
			if (c < 33 || c > 126) return null;
			if (c >= 97 && c <= 122) hasLower = true;
			if (c >= 65 && c <= 90) hasUpper = true;
		}
		if (hasLower && hasUpper) return null;
		str = str.toLowerCase();
		var pos = str.lastIndexOf("1");
		if (pos < 1 || pos + 7 > str.length || str.length > 90) return null;
		var hrp = str.substring(0, pos);
		var data = [];
		for (i = pos + 1; i < str.length; i++) {
			var d = CHARSET_REV[str.charCodeAt(i)];
			if (d === -1) return null;
			data.push(d);
		}
		if (!VerifyChecksum(hrp, data)) return null;
		return { hrp: hrp, data: data.slice(0, data.length - 6) };
	}

	// General 8<->5 bit regrouping per BIP-173 (ConvertBits).
	// encode=true pads the last group with zero bits; encode=false rejects
	// nonzero padding and wrong padding size.
	function convertBits(data, fromBits, toBits, pad) {
		var acc = 0, bits = 0, ret = [];
		var maxv = (1 << toBits) - 1;
		for (var i = 0; i < data.length; i++) {
			var value = data[i];
			if (value < 0 || (value >> fromBits) !== 0) return null;
			acc = (acc << fromBits) | value;
			bits += fromBits;
			while (bits >= toBits) {
				bits -= toBits;
				ret.push((acc >> bits) & maxv);
			}
		}
		if (pad) {
			if (bits > 0) ret.push((acc << (toBits - bits)) & maxv);
		} else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv) !== 0) {
			return null;
		}
		return ret;
	}

	return { encode: encode, decode: decode, convertBits: convertBits };
})();
