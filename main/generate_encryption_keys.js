var keypair = require('keypair');//library for generation of keys
var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/logdata.log', category: 'output' }
  ]
});
var logger = log4js.getLogger('output');
var generate_encryption_keys = {
    generate_encryption_keys: function(req, res){
        generateEncryptionKeys(req, res);
    }
};
function generateEncryptionKeys(req, res){
    var pair = keypair();
    res.json({
        status: 200,
        key_pair: pair
    })
}
module.exports = generate_encryption_keys;