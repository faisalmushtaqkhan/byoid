var constants = require('./constants.js');
var bitcoin = require('bitcoinjs-lib');
var request = require('request');
var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/logdata.log', category: 'output' }
  ]
});
var logger = log4js.getLogger('output');
var broadcast;
var asset;
var api_functions = {
    issue_assets_units: function(bitcoin_address, receiver_bitcoin_address, asset_meta_id,
                                    asset_meta_name, asset_meta_description, private_key, asset_user_info, callback){
                                    issue_assets(bitcoin_address, receiver_bitcoin_address,
                                    asset_meta_id, asset_meta_name, asset_meta_description, asset_user_info, function(err, body){
                                        if(err){
                                            logger.error('Error caught at main: '+err);
                                        }
                                        else{
                                            logger.info('The body of asset is: '+JSON.stringify(body));
                                            asset = body;
                                            var sign = signTx(body.txHex, private_key);
                                            logger.info('Signed TX: '+ sign);
                                            var data_params = {
                                                'txHex': sign
                                            }
                                            postToApi('broadcast',data_params,function(err, body){
                                                if (err) logger.error('error: '+err);
                                                else{
                                                    broadcast = body;
                                                    logger.info('broadcasted transaction: '+ JSON.stringify(body));
                                                    callback(null, broadcast, asset);
                                                }
                                            });
                                        }
                                    });                    
    },
    
    get_asset_units: function(assetid, txid, index, callback){
                var info = getFromApi('assetmetadata',assetid+'/'+txid+':'+index, function(err, body){
                    if (err) logger.error('error: '+err);
                    else{
                        logger.info('From get assets: '+JSON.stringify(body));
                        return callback(null, body);
                    }
                  });
                  return info;
    },//end of get_asset_units
    
    generate_address: function(callback){
        var key = bitcoin.ECKey.makeRandom();
        var address = key.pub.getAddress(bitcoin.networks.testnet).toString();
        var wif = key.toWIF();
        return callback(address, wif);
        
    }
};
module.exports = api_functions;

function issue_assets(bitcoin_address, receiver_bitcoin_address, asset_meta_id, asset_meta_name, asset_meta_description, asset_user_info, callback){
    var asset = {
    'issueAddress':bitcoin_address,
    'amount': 1,
    'divisibility': 0,
    'fee': 5000,
    'reissueable': false,
    'transfer': [{
    	'address': receiver_bitcoin_address,
    	'amount': 1
    }],
    'metadata': {
        'assetId': asset_meta_id,
        'assetName': asset_meta_name,
        'description': asset_meta_description,
	'info': asset_user_info
    }
};
return postToApi('issue', asset, function(err, body){
  if (err){
      callback(error);
      logger.info('error: ',err);
  }
  else{ 
      callback(null, body);
  }
});
}//issue_assets

function postToApi(api_endpoint, json_data, callback) {
    logger.log(api_endpoint+': ', JSON.stringify(json_data));
    request.post({
        url: constants.TEST_NET_API_URL+api_endpoint,
        headers: {'Content-Type': 'application/json'},
        form: json_data
    }, 
    function (error, response, body) {
        if (error) return callback(error);
        if (typeof body === 'string') {
            body = JSON.parse(body)
        }
        logger.info('Status: ', response.statusCode)
        logger.info('Body is it?: ', JSON.stringify(body));
        return callback(null, body);
    });
}; //end of postToApi

function getFromApi(api_endpoint, param, callback) {
    logger.info('Get from:'+api_endpoint+'/'+param);
    request.get(constants.TEST_NET_API_URL+api_endpoint+'/'+param, function (error, response, body) {
        if (error) {
            return callback(error);
        }
        if (typeof body === 'string') {
            body = JSON.parse(body)
        }
        logger.info('Status:', response.statusCode);
        logger.info('Body info this I want to get:', body);
        return callback(null, body);
    });
};//end of getFromApi

function signTx (unsignedTx, WIF) {
    var privateKey = bitcoin.ECKey.fromWIF(WIF)
    var tx = bitcoin.Transaction.fromHex(unsignedTx)
    var insLength = tx.ins.length
    for (var i = 0; i < insLength; i++) {
        tx.sign(i, privateKey)
    }
    return tx.toHex();
}