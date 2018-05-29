var crypto = require('crypto');
var constants = require('../common/constants.js');
var sql = require('mysql');
var jwt = require('jwt-simple');
var dbhelper = require("../common/DatabaseHelper.js");
var api_functions = require('../common/api_functions.js');
var keypair = require('keypair');//library for generation of keys
var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/logdata.log', category: 'output' }
  ]
});
var logger = log4js.getLogger('output');

var auth = {
  login: function(req, res) {
    var email = req.body.email || '';
    var password = req.body.password || '';
    if (email == '' || password == '') {
      res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid credentials"
      });
      return;
    }
    // Fire a query to your DB and check if the credentials are valid
    var dbUserObj = auth.validate(email, password, res);
  },
  
  user_confirm_signup: function(req, res){
            var email = req.query.email;
            var key = req.query.key;
            dbhelper.get(dbhelper.READ, function(err, connection) {
                if(err) done(err)
            connection.query('SELECT * FROM verification_secret where email = ? && is_verified=0', [email], function (err, row) {
                if(err) done(err);
                if(row.length > 0){
                    var hash = crypto.createHash('sha256');
              hash.update(key+constants.SALT);
              var hex = hash.digest('hex');
              if(hex == row[0].verification_secret){
                  var secret_record = {is_verified: 1};
                  connection.query('UPDATE verification_secret SET ? where email = ?', [secret_record, email], function(err, row){
                      if(err) done(err)
                      else{
                          var record = {pending: 0, is_active: 1};
                          connection.query('UPDATE user SET ? where email = ?', [record, email], function(err, row){
                              if(err) done(err)
                              else{
                              res.json({
                                    "status": 200,
                                    "info": "successfully verified"
                                });
                            }
                            });
              }
                   });
               
              }
              else{
                  res.json({
                      "status": 401,
                      "message": "unvalid request"
                  });
              }
                }
                else{
                    res.json({
                      "status": 401,
                      "message": "Not valid for this user"
                  });
                }
                
            });
        });
  },
  
  user_signup: function(req, res){
      var email = req.body.email;
      var password = req.body.password;
      var first_name = req.body.first_name;
      var last_name = req.body.last_name;
      var login_token = genToken();
      var created_date = new Date();
      var account_type = 'user';
//      if(account_type == 'user' || account_type == 'organisation'){
          var hash = crypto.createHash('sha256');
              hash.update(password+constants.SALT);
              var hex = hash.digest('hex');
              var is_active = 0;
              var pending = 1;
              api_functions.generate_address(function(bitcoin_address, wif){
                  var pair = keypair();
                  var private_key = pair['private'];
                  var public_key = pair['public'];
              dbhelper.get(dbhelper.READ, function(err, connection) {
          if (err) return done('Database problem')
          connection.query('SELECT * FROM user where email = ?', [email], function (err, rows) {
              if (err) return done(err)
              if(rows.length > 0) {
                  res.status(401);
                  res.json({
                      "status": 401,
                      "message": "User already exits"
                  });
              }
              else{                  
                     dbhelper.get(dbhelper.WRITE, function(err, connection) {
                            if (err) return done('Database problem');
                            var record = {email: email, first_name: first_name, last_name: last_name, password: hex, account_type: account_type, is_active: is_active, created_date: created_date, pending: pending, login_token: login_token};
                            connection.query('INSERT INTO user SET ?', record, function (err, row) {
                               if (err){ 
                                   return done(err);
                               }
                                else{
                                    crypto.randomBytes(48, function(err, buffer) {
                                    var verification_secret = buffer.toString('hex');
                                    var hash = crypto.createHash('sha256');
                                    hash.update(verification_secret+constants.SALT);
                                    var hex = hash.digest('hex');
                                    connection.query('SELECT * FROM verification_secret where email = ?', [email], function(err, row){
                                    if(err) return done(err);
                                    if(row.length > 0){
                                        var secret_record = {verification_secret: hex, created_date: created_date, is_verified: 0};
                                    connection.query('UPDATE verification_secret SET ? where email = ?', [secret_record, email], function(err, row){
                                        if(err){ 
                                            done(err) 
                                        }
                                        else{
                                       res.json({
                                     "status": 200,
                                     "public_key": public_key,
                                     "private_key": private_key,
                                     "bitcoin_address": bitcoin_address,
                                     "wif": wif,
                                     "login_token": login_token,
                                     "verification_secret": verification_secret
                                    }); 
                                        }
                                    });
                                    }
                                    else{
                                    var secret_record = {email: email, verification_secret: hex, created_date: created_date, is_verified: 0};
                                    connection.query('INSERT INTO verification_secret SET ?', secret_record, function(err, row){
                                        res.json({
                                     "status": 200,
                                     "public_key": public_key,
                                     "private_key": private_key,
                                     "bitcoin_address": bitcoin_address,
                                     "wif": wif,
                                     "login_token": login_token,
                                     "verification_secret": verification_secret
                                        });
                                    });
                                       }
                                });
                            });//end of else
                        }
                        });
                    });
                  
//                  res.status(200);
//            res.json({
//              "status": 200,
//              "message": "Successfull",
//              "password": hex
//            });
              }
          });//end of db writes
      }); //end of db read
      });//end of generate address
//      }
//      else{
//            res.status(401);
//            res.json({
//              "status": 401,
//              "message": "Invalid Account type"
//            }); 
//      }
  },

  validate: function(email, password, res) {
      var hash = crypto.createHash('sha256');
              hash.update(password+constants.SALT);
              var hex = hash.digest('hex');
      dbhelper.get(dbhelper.READ, function(err, connection) {
          if (err) return done('Database problem')
          connection.query('SELECT * FROM user where email = ? and password = ?', [email, hex], function (err, rows) {
              if (err) return done(err)
              if(rows.length > 0 && rows[0].is_pending == 1) {
                  res.json({
                      info: "account confirmation is pending"
                  });
              }
              if(rows.length > 0 && rows[0].is_active == 1) {
                  res.json({
                      login_token: rows[0].login_token
                  });
              }
              else{
                  res.status(401);
                  res.json({
                      "status": 401,
                      "message": "Invalid credentials"
                  });
              }
              //done(null, rows);
          });
      });
  },

  validateUser: function(email, token) {
    console.log('validate user');
      dbhelper.get(dbhelper.READ, function(err, connection) {
          if (err) return done('Database problem')
          connection.query('SELECT * FROM user where email = ? and login_token = ?', [email, token], function (err, rows) {
              if (err) return done(err)
              if(rows.length > 0) {
                return rows[0];
              }
              else{
                  return;
              }
              //done(null, rows);
          });
      });
  },
}

// private method
function genToken() {
  var expires = expiresIn(1); // 1 days
  var token = jwt.encode({
    exp: expires
  }, require('../config/secret')());
  return token;
}

function expiresIn(numDays) {
  var dateObj = new Date();
  dateObj.setDate(dateObj.getDate() + numDays);
    dateObj = dateObj.getFullYear()+ '-' + (parseInt(dateObj.getMonth())+1) + '-'+dateObj.getDate();
  return dateObj;
}
function done(rows){
  console.log('inside of done function');
  console.log(rows);
}
module.exports = auth;