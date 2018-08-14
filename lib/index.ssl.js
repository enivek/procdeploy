
const greenlock = require("greenlock-express");
const nconf = require("nconf");
const logger = require("./logger.js")
const server = require("./server.js");
const constants = require("./constants.js");

const httpPort = constants.HTTP_PORT;
const configHttpPort = nconf.get(httpPort);
if( !configPort ) {
    logger.error("You must set the " + httpPort + " environment variable");
    process.exit(1);
}

const httpsPort = constants.HTTPS_PORT;
const configHttpsPort = nconf.get(httpsPort);
if( !configHttpsPort ) {
    logger.error("You must set the " + httpsPort + " environment variable");
    process.exit(1);
}

const options = {
    server: "https://acme-v01.api.letsencrypt.org/directory", 
    email: "kevin@example.org", 
    agreeTos: true, 
    debug: true,   
    approveDomains: [ "example.org" ], 
    app: server
};

greenlock.create(options).listen(httpPort, httpsPort);
