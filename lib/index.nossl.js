const nconf = require("nconf");
const logger = require("./logger.js")
const server = require("./server.js");

nconf.argv().env().file({ file: "./config/nossl.json" });
const options = nconf.get("config");

server.listen(options.httpPort, 
    function() {
        logger.info("Listening at port: " + options.httpPort);
    }
);