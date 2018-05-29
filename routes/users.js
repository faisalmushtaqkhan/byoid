var dbhelper = require("../common/DatabaseHelper.js");
var users = {
  getAll: function(req, res) {
    var allusers = data; // Spoof a DB call
    res.json(allusers);
  },

  getOne: function(req, res) {
    console.log('yahan aya');
      dbhelper.get(dbhelper.READ, function(err, connection) {
          if (err) return done('Database problem')
          connection.query('SELECT * FROM user_info where username = ?', [req.body.username], function (err, rows) {
              if (err) return done(err)
              if(rows.length > 0) {
                  var allusers = rows[0];
                  res.json(allusers);
              }
              else{
                  res.status(401);
                  res.json({
                      "status": 401,
                      "message": "user does not exist with such username"
                  });
              }
              //done(null, rows);
          });
      });
  },

  create: function(req, res) {
    var newuser = req.body;
    data.push(newuser); // Spoof a DB call
    res.json(newuser);
  },

  update: function(req, res) {
    var updateuser = req.body;
    var id = req.params.id;
    data[id] = updateuser // Spoof a DB call
    res.json(updateuser);
  },

  delete: function(req, res) {
    var id = req.params.id;
    data.splice(id, 1) // Spoof a DB call
    res.json(true);
  }
};
var data = [{
  name: 'user 1',
  id: '1'
}, {
  name: 'user 2',
  id: '2'
}, {
  name: 'user 3',
  id: '3'
}];

module.exports = users;
