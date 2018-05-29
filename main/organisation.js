//var dbhelper = require("../common/DatabaseHelper.js");
var encryptAndDecrypt = require('../common/encrypt_and_decrypt.js');
var api_functions = require('../common/api_functions.js');
var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/logdata.log', category: 'output' }
  ]
});
var logger = log4js.getLogger('output');
var decrypt = {
    decrypt: function(req, res){
        decryption(req, res);
    }, //end of decrypt
    get_info: function(req, res){
        get_information(req, res);
    }//end of get_info
};

function decryption(private_key, encrypted_info){
    var decryptedInfo = encryptAndDecrypt.decrypt(private_key, encrypted_info);
    logger.info('Decrypted Info is: '+decryptedInfo);
    return decryptedInfo.toString();
}
module.exports = decrypt;

function get_information(req, res){
        var asset_id = req.body.asset_id;
        var tx_id = req.body.tx_id;
        var private_key = req.body.private_key;
        
        api_functions.get_asset_units(asset_id, tx_id, 0, function(err, body){
             logger.info('from organisation: '+JSON.stringify(body));
             var assetId = body.metadataOfIssuence.data.assetId;
             var assetName = body.metadataOfIssuence.data.assetName;
             var description = body.metadataOfIssuence.data.description;
             var encrypted_info = body.metadataOfIssuence.data.info;
             //converting string into json object
             encrypted_info = JSON.parse(encrypted_info); 
            var decrypted_info = decryption(private_key, encrypted_info);
            console.log(decrypted_info)
             res.json({status: 200,
                info: decrypted_info,
                asset_id: assetId,
                asset_name: assetName,
                description: description
            });
                 
        });
}//end of get_information