const targz = require("targz");
const childprocess = require("child_process");
const shell = require("shelljs");
const os = require("os");
const kill  = require("tree-kill");
const googlecloud = require("./googlecloud.js");
const fs = require("fs");

const homedir = os.homedir() + "/";
const tempdir = os.tmpdir() + "/";
    
var ProcDeploy = function (aProjectName, aEnvName) {

    var mostRecentFileName;
    var mainProcess;
    var projectName = aProjectName;
    var envName = aEnvName;
    var ready = true;
                
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
        var rootdir = homedir + projectName + "/" + fileName;
        var arr = ["-c", "node " + homedir + projectName + "/" + fileName + "/bin/index.js " + " --rootdir " + rootdir ];
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
     * Prepare download directory.
    */
    function _prepareDownloadDirectory() {
        if (!fs.existsSync(tempdir + projectName + "/")){
            fs.mkdirSync(tempdir + projectName + "/");
        }
    }
    
    /**
     * Check if this process is ready.
     */
    this.isReady = function() {
        return ready;
    }

    /**
     * Check if there is a new file. If so, download it.
     */
    this.checkAndDownload = async function() {
    
        ready = false;
        
        var file = await _listFilesByPrefix();
        var fileNameWithExtension = file.replace(envName + "/", "");
        var downloadFileLocation = tempdir + projectName + "/" + fileNameWithExtension;
        var fileName = fileNameWithExtension.replace(".tar.gz", "");
        
        // Create download directory if it does not exist.
        _prepareDownloadDirectory(tempdir + projectName + "/");
        
        if( file == mostRecentFileName && mostRecentFileName != undefined ) {

            // If the process is not started then start it.
            if( !mainProcess ) {
                _runApp(fileName);
            }
        
        } else {

            mostRecentFileName = file;
            
            if( mainProcess ) {
                if( mainProcess.pid ) {
                    console.log("Killing process " + mainProcess.pid);
                    kill(mainProcess.pid);
                }
                mainProcess = null;
            }           
                        
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
            
            // Run npm install 
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
        
        ready = true;
            
    };   

};

module.exports.ProcDeploy = ProcDeploy;
