
const greenlock = require("greenlock-express");
const nconf = require("nconf");
const logger = require("./logger.js")
const server = require("./server.js");

const argument = process.argv[3];
const configEnvironment = argument.split("=")[1];
const fileName = "./config/" + configEnvironment + ".json";
nconf.argv().env().file({ file: fileName });
const options = nconf.get("config");

const httpPort = options.httpPort;
const httpsPort = options.httpsPort;

options.app = server;

greenlock.create(options).listen(httpPort, httpsPort);
