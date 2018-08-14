const nconf = require("nconf");
const logger = require("./logger.js")
const server = require("./server.js");
const constants = require("./constants.js");

const httpPort = constants.HTTP_PORT;
const configPort = nconf.get(httpPort);
if( !configPort ) {
    logger.error("You must set the " + httpPort + " environment variable");
    process.exit(1);
}

const portNumber = parseInt(nconf.get(httpPort), 10);
server.listen(portNumber, 
    function() {
        logger.info("Listening at port: " + portNumber);
    }
);