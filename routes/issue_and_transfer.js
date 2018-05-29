var dbhelper = require("../common/DatabaseHelper.js");
var bitcoin = require('bitcoinjs-lib');
var request = require('request');

var issueAndTransfer = {
    issueAndTransfer: function(req, res){
        issueAssset(req.body.bitcoin_address, req, res);
    },

    getOne: function(req, res) {
    },

    create: function(req, res) {
    },

    update: function(req, res) {
    },

    delete: function(req, res) {
    }
};

function issueAssset(funded_address, req, res){
    function postToApi(api_endpoint, json_data, callback) {
        console.log(api_endpoint+': ', JSON.stringify(json_data));
        request.post({
                url: 'http://testnet.api.coloredcoins.org:80/v3/'+api_endpoint,
                headers: {'Content-Type': 'application/json'},
                form: json_data
            },
            function (error, res, body) {
                if (error) {
                    return callback(error);
                }
                if (typeof body === 'string') {
                    body = JSON.parse(body);
                }

                console.log(body);
                console.log(body.assetId);

                console.log('Status: ', res.statusCode);
                console.log('Asset ID:', body.assetId);
                console.log('Body: ', JSON.stringify(body));
                return callback(null, body);
            });
    };

    var asset = {
        issueAddress: funded_address,
        'amount': 100000,
        'fee': 5000,
        metadata: {
            assetName: "L1",
            issuer: "MWAN",
            description: "Verify you level 1 security",
            userData :{
                meta: [
                    {key: 'bit_coin_address', value: funded_address, type: 'String'}
                ],
                price: 1,
                "Level 1 Security": 'Please verify yourself at level 1'
            }
        }
    };
    postToApi('issue', asset, function(err, body){
        if (err) {
            console.log('error: ', err);
        }
    });
}

module.exports = issueAndTransfer;
