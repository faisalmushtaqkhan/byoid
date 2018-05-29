var jwt = require('jwt-simple');
var validateUser = require('../routes/auth').validateUser;
var dbhelper = require("../common/DatabaseHelper.js");
module.exports = function(req, res, next) {

    // When performing a cross domain request, you will recieve
    // a preflighted request first. This is to check if our the app
    // is safe.

    // We skip the token outh for [OPTIONS] requests.
    //if(req.method == 'OPTIONS') next();
    //var token = req.query.x-access-token;
// var key = req.query.x-key;
    var token = (req.body && req.body.access_token) || (req.query && req.query['x-access-token']) || req.headers['x-access-token'];
    var key = (req.body && req.body.x_key) || (req.query && req.query['x-key']) || req.headers['x-key'];
    console.log(token);
    console.log(key);
    console.log('admin invoked');
    if (token || key) {
        try {
            dbhelper.get(dbhelper.READ, function(err, connection) {
                if (err) return done('Database problem')
                connection.query('SELECT * FROM user where username = ? and login_token = ?', [key, token], function (err, rows) {
                    if (err) return done(err);
                    if(rows.length > 0) {
                            if ((req.url.indexOf('admin') >= 0 && rows[0].account_type == 'admin' && rows[0].pending==0) || ((req.url.indexOf('admin') < 0 && req.url.indexOf('/api/admin/') >= 0 && rows[0].account_type == 'admin') && rows[0].pending==0)) {
                                next(); // To move to next middleware
                            } else {
                                res.status(403);
                                res.json({
                                    "status": 403,
                                    "message": "Not Authorized"
                                });
                                return;
                            }
                        }
                    else{
                        res.status(401);
                        res.json({
                            "status": 401,
                            "message": "Invalid User"
                        });
                        return;
                    }
                    //done(null, rows);
                });
            });
        }
        catch (err) {
            res.status(500);
            res.json({
                "status": 500,
                "message": "Oops something went wrong",
                "error": err
            });
        }
    }
    // Authorize the user to see if s/he can access our resources
    //console.log(dbUser);
    //var dbUser = validateUser(key, token); // The key would be the logged in user's username
    //  console.log(dbUser);


};
