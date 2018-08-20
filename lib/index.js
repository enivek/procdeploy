const targz = require('targz');
const childprocess = require('child_process');
const shell = require('shelljs');
const os = require('os');
const kill  = require('tree-kill');
const googlecloud = require('./googlecloud.js');

const projectName = 'royaltutor2';
var envName = "";
var mostRecentFileName;
var mainProcess;

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
    
    setInterval(checkAndDownload, 10000);    
}

/**
 * Get most recent file to download.
*/
async function listFilesByPrefix() {
    return await googlecloud.listFilesByPrefix(projectName, envName);
}

/**
 * Download it.
 */
async function downloadFile(file, fileNameNoExt) {
    return await googlecloud.downloadFile(projectName, file, fileNameNoExt);
}

/**
 * Run the application.
 */
function runApp( fileName ) {
    var arr = ['-c', 'node ' + os.homedir() + '/' + projectName + '/' + fileName + '/bin/index.js'];
    mainProcess = childprocess.spawn('sh', arr);
    mainProcess.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
    });
    mainProcess.stderr.on('data', function(data) {
        console.log('stdout: ' + data);
    });
    mainProcess.on('close', function(code) {
        console.log('closing code: ' + code);
    });     
}

/**
 * Check if there is a new file. If so, download it.
 */
async function checkAndDownload() {
    var file = await listFilesByPrefix();
    if( file == mostRecentFileName ) {
        console.log("We already have the file. Skip.");
    }
    else {

        console.log("We dont already have the file.");
        
        if( mainProcess ) {
            console.log("There is a main process running. Kill it.");
            kill(mainProcess.pid);
        }
        
        var fileNameWithExtension = file.replace(envName + '/', '');
        var downloadFileLocation = "/tmp/" + projectName + "/" + fileNameWithExtension;
        var fileName = fileNameWithExtension.replace('.tar.gz', '');
        
        await downloadFile(file, downloadFileLocation);
        
        targz.decompress({
            src: downloadFileLocation,
            dest: os.homedir() + '/' + projectName + '/' + fileName
        }, function(err) {
               if(err) {
                   console.log(err);
               } else {
                   console.log("Done!");
               }
        });
        
        var npmInstall = 'npm install --prefix ' + os.homedir() + '/' + projectName + '/' + fileName;
        var child = shell.exec(npmInstall, {async: true});
        child.stdout.on('data', function(data) {
            if( data ) {
                if( data.indexOf('up to date') >= 0 || data.indexOf('added') >= 0 ) {
                    runApp(fileName);
                }
            }
        });

    }    
}

startUp();