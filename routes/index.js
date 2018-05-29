var express = require('express');
var router = express.Router();
var auth = require('./auth.js');
//var products = require('./products.js');
var users = require('./users.js');
//var issueAndTransfer = require('./issue_and_transfer.js');
var user = require('../main/user.js');
var organisation = require('../main/organisation.js');
//var generate_address = require('../main/generate_address.js');
//var generate_encryption_keys = require('../main/generate_encryption_keys.js');
/*
 * Routes that can be accessed by any one
 */
router.post('/user_signup', auth.user_signup);
router.get('/user_confirm_signup', auth.user_confirm_signup);
router.post('/login', auth.login);
//router.post('/generate_address', generate_address.generate_address);
//router.post('/generate_encryption_keys', generate_encryption_keys.generate_encryption_keys);

/*
 * Routes that can be accessed only by authenticated users
 */
//router.get('/api/v1/products', products.getAll);
//router.get('/api/v1/product/:id', products.getOne);
//router.post('/api/v1/product/', products.create);
//router.put('/api/v1/product/:id', products.update);
//router.delete('/api/v1/product/:id', products.delete);

/*
 * Routes that can be accessed only by authenticated & authorized users
 */
router.get('/api/admin/users', users.getAll);
router.post('/api/admin/users/', users.getOne);

router.get('/api/v1/admin/users', users.getAll);
router.get('/api/   v1/admin/user/:id', users.getOne);
router.post('/api/v1/admin/user/', users.create);
router.put('/api/v1/admin/user/:id', users.update);
router.delete('/api/v1/admin/user/:id', users.delete);
/*
*For organisation
 */
router.post('/api/organisation/get_info', organisation.get_info);
router.post('/api/organisation/decrypt_info/', organisation.decrypt);
router.post('/api/organisation/users/', users.getOne);

/*
 * For users
 */

router.post('/api/user/send_info/', user.send_info);
/*
*
 */



module.exports = router;
