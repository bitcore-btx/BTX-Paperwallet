# bitcore.cc - Bitcore BTX Paper Wallet
JavaScript Client-Side Bitcore BTX Wallet Generator (fork of bitaddress.org v3.3.0)

This is the bitcore.cc Bitcore BTX edition of the bitaddress.org paper
wallet. Now Bitcore BTX addresses and their corresponding private key can be
conveniently generated in a web browser.

The bitcore.cc project provides an all-in-one HTML document with embedded
JavaScript/Css/Images. The JavaScript is readable not minified and contains no
XMLHttpRequest's (no AJAX). The benefit of this technique is you can load the 
JavaScript locally and trust that the JavaScript did not change after being 
loaded. 

All crypto source files are byte-identical to bitaddress.org v3.3.0; visible
text/strings were rebranded (Bitcoin -> Bitcore BTX), the paper-wallet artwork
(logos, wordmark, microprint strip, watermark) was redesigned with Bitcore
branding, and the dead Bitcoin explorers were replaced with
chainz.cryptoid.info/btx.


CHANGES vs. bitaddress.org v3.3.0:

 1) SegWit (P2WPKH, btx1...) addresses in Single Wallet, Bulk Wallet, Paper
    Wallet and Brain Wallet (checkbox "SegWit address (btx1...)?").

 2) Skip randomness: a "Skip randomness" button lets the user finish the
    mouse-movement seeding step immediately. It still draws 64 bytes from the
    browser's built-in CSPRNG (window.crypto.getRandomValues), so no entropy
    source is removed - mouse movement only adds extra entropy.

 3) Default language is English; the browser language is auto-detected and
    overrides it when supported. Switch via the language dropdown or the URL
    parameter ?culture=de (etc.).

 4) The bitcore.cc logo in the header links to https://bitcore.cc and opens
    it in a new tab.

 5) Bulk Wallet command panel laid out as an invisible table; buttons are
    numbered "1. Generate" / "2. Print".


BUILDING:

    node combine_build.js

This merges src/ (HTML, CSS, JS, culture files) into the single-file bundle
bitaddress.org.html. Grunt is not required.

Here is a link to the BitcoinTalk.org forum topic discussing the original
project:
https://bitcointalk.org/index.php?topic=43496.0

Fork repository: https://github.com/bitcore-btx/BTX-Paperwallet


END USER NOTES:

 1) For Bulk Wallet I recommended using Google Chrome, it's the fastest.

 2) Requires IE9+, Firefox, Chrome or sufficient JavaScript support.

 3) Mobile Safari only works with iPhone4 or newer devices.
    Older devices timeout while executing JavaScript.

 4) DO NOT use Opera Mini it renders JavaScript output server side, therefore
    they might record the private key you generated.

 5) BIP38 most likely will not work on mobile devices due to hardware limitations.


Notice of Copyrights and Licenses:
---------------------------------------
The bitaddress.org project, software and embedded resources are
copyright bitaddress.org.

The bitaddress.org name and logo are not part of the open source
license.

Portions of the all-in-one HTML document contain JavaScript codes that
are the copyrights of others. The individual copyrights are included
throughout the document along with their licenses. Included JavaScript
libraries are separated with HTML script tags.

Summary of JavaScript functions with a redistributable license:

JavaScript function	|	License
-------------------	|	--------------
Array.prototype.map	|	Public Domain
window.Crypto | BSD License
window.SecureRandom	| BSD License
window.EllipticCurve	|	BSD License
window.BigInteger |	BSD License
window.QRCode | MIT License
window.Bitcoin | MIT License

The bitaddress.org software is available under The MIT License (MIT)
Copyright (c) 2011-2013 bitaddress.org

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
