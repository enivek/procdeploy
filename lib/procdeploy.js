const targz = require("targz");
const childprocess = require("child_process");
const shell = require("shelljs");
const os = require("os");
const kill  = require("tree-kill");
const googlecloud = require("./googlecloud.js");

const homedir = os.homedir() + "/";
const tempdir = os.tmpdir() + "/";
    
var ProcDeploy = function (aProjectName, aEnvName) {

    var mostRecentFileName;
    var mainProcess;
    var projectName;
    var envName;
        
    projectName = aProjectName;
    envname = aEnvname;
        
    /**
     * Get most recent file to download.
     */
    async function _listFilesByPrefix() {
        return await googlecloud.listFilesByPrefix(projectName, envName);
    };

    /**
     * Download it.
     */
    async function _downloadFile(file, fileNameNoExt) {
        return await googlecloud.downloadFile(projectName, file, fileNameNoExt);
    };

    /**
     * Run the application.
     */
    function _runApp( fileName ) {
        var arr = ["-c", "node " + homedir + projectName + "/" + fileName + "/bin/index.js"];
        mainProcess = childprocess.spawn("sh", arr);
        mainProcess.stdout.on("data", function(data) {
            console.log("stdout: " + data);
        });
        mainProcess.stderr.on("data", function(data) {
            console.log("stdout: " + data);
        });
        mainProcess.on("close", function(code) {
            console.log("closing code: " + code);
        });     
    };

    /**
     * Check if there is a new file. If so, download it.
     */
    this.checkAndDownload = async function() {
        
        var file = await _listFilesByPrefix();
        if( file == mostRecentFileName ) {
            console.log("We already have the file. Skip.");
        } else {

            console.log("We dont already have the file.");
            mostRecentFileName = file;
            
            if( mainProcess ) {
                if( mainProcess.pid ) {
                    console.log("There is a main process running. Kill it.");
                    kill(mainProcess.pid);
                }
            }
            
            var fileNameWithExtension = file.replace(envName + "/", "");
            var downloadFileLocation = tempdir + projectName + "/" + fileNameWithExtension;
            var fileName = fileNameWithExtension.replace(".tar.gz", "");
            
            await _downloadFile(file, downloadFileLocation);
            
            targz.decompress({
                src: downloadFileLocation,
                dest: homedir + projectName + "/" + fileName
            }, function(err) {
                   if(err) {
                       console.log(err);
                   } else {
                       console.log("Done!");
                   }
            });
            
            var npmInstall = "npm install --prefix " + homedir + projectName + "/" + fileName;
            var child = shell.exec(npmInstall, {async: true});
            child.stdout.on("data", function(data) {
                if( data ) {
                    if( data.indexOf("up to date") >= 0 || data.indexOf("added") >= 0 ) {
                        _runApp(fileName);
                    }
                }
            });

        }
    };   

};

module.exports.ProcDeploy = ProcDeploy;
