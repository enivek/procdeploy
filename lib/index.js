const googlecloud = require("./googlecloud.js");
const ProcDeploy = require("./procdeploy.js").ProcDeploy;

var pd = new ProcDeploy("royaltutor", "test");

function checkAndDownload(name) {
    pd.checkAndDownload();
}
    
/**
 * Begin startup sequence.
 */
function startUp() {
    var environment = process.env.ENVIRONMENT;
    if ( environment === undefined ) { environment = "local"; }
    envName = environment;

    console.log("Home directory: " + os.homedir());
    console.log("Temp directory: " + os.tmpdir());
    console.log("Environment: " + envName);
    
    setInterval(checkAndDownload, 60000);    
}