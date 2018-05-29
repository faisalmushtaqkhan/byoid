var crypto = require('crypto');

function encrypt(publicKey, info){
    console.log('yahan tk thek tha');
	var encryptedInfo = crypto.publicEncrypt({
    key: publicKey
}, new Buffer(info));
console.log(encryptedInfo);
return encryptedInfo
}
exports.encrypt = encrypt;

function decrypt(privateKey, encryptedInfo){
    console.log('Info from encrypt and decrypt');
    console.log(privateKey);
    console.log(encryptedInfo);
	var decryptedInfo = crypto.privateDecrypt({
	key: privateKey}, new Buffer(encryptedInfo));
	return decryptedInfo;
}
exports.decrypt = decrypt;