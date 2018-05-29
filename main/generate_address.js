var api_functions = require('../common/api_functions.js');
var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/logdata.log', category: 'output' }
  ]
});
var logger = log4js.getLogger('output');

var generate_address = {
    generate_address: function(req, res){
        generateAddress(req, res);
    }
};


function generateAddress(req, res){
    api_functions.generate_address(function(address, wif){
        res.json({status: 200,
                address: address,
                wif: wif
            });
    });
}

module.exports = generate_address;