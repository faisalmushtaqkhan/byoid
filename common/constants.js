var define = require("node-constants")(exports);
// define is a function that binds "constants" to an object (commonly exports)

// a single constant
//define("PI", 3.14);

// or multiple
define({
    TEST_NET_API_URL: 'http://testnet.api.coloredcoins.org:80/v3/',
    SALT: 'iuyeDjlk8973'
});