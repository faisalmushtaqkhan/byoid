//var dbhelper = require("../common/DatabaseHelper.js");
//var bitcoin = require('bitcoinjs-lib');
var encryptAndDecrypt = require('../common/encrypt_and_decrypt.js');
var api_functions = require('../common/api_functions.js');
var request = require('request');
var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/logdata.log', category: 'output' }
  ]
});
var logger = log4js.getLogger('output');
var encrypt = {
    encrypt: function(req, res){
        encryption(req, res);
    },
    send_info: function(req, res){
        send_information(req, res);
    }
}; //end of var encrypt

function send_information(req, res){
    var bitcoin_address = req.body.bitcoin_address;
    var receiver_bitcoin_address = req.body.receiver_bitcoin_address;
    var asset_meta_id = req.body.asset_meta_id;
    var asset_meta_name = req.body.asset_meta_name;
    var asset_meta_description = req.body.asset_meta_description;
    var asset_user_info = req.body.asset_user_info;
    var public_key = req.body.public_key;
    var private_key = req.body.wif;
    //encrypt the user info
    var encryptedInfo = encryptAndDecrypt.encrypt(public_key, asset_user_info);
    logger.info('This is encrypted info: '+ JSON.stringify(encryptedInfo));
    
    api_functions.issue_assets_units(bitcoin_address, receiver_bitcoin_address, asset_meta_id,
                                    asset_meta_name, asset_meta_description, private_key, JSON.stringify(encryptedInfo), function(err, body, asset){
  if (err) logger.info('error: ',err);
  else {
  logger.info('From here: '+JSON.stringify(body));
  logger.info('From here: '+JSON.stringify(asset));
             res.json({status: 200,
                txid: body.txid,
                assetId: asset.assetId
            });
  }
});
    
}//end of send_information



module.exports = encrypt;
module.send_info;