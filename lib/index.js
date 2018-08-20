const googlecloud = require('./googlecloud.js');
const targz = require('targz');
const childprocess = require('child_process');
const shell = require('shelljs');
const os = require('os');

const projectName = 'royaltutor2';

var environment = process.env.ENVIRONMENT;
if ( environment === undefined ) { environment = "local"; }
const envName = 'test';

console.log("Home directory: " + os.homedir());
console.log("Temp directory: " + os.tmpdir());

async function listFilesByPrefix() {
    return await googlecloud.listFilesByPrefix(projectName, envName);
}

async function downloadFile(file, fileNameNoExt) {
    return await googlecloud.downloadFile(projectName, file, fileNameNoExt);
}

function runApp() {
    var arr = ['-c', 'node /home/kevin/' + projectName + "/" + fileName + '/bin/index.js'];
    var child = childprocess.spawn('sh', arr);
    child.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
    });
    child.stderr.on('data', function(data) {
        console.log('stdout: ' + data);
    });
    child.on('close', function(code) {
        console.log('closing code: ' + code);
    });     
}

async function start() {
    var file = await listFilesByPrefix();
    if( file ) {

        var fileNameWithExtension = file.replace(envName + '/', '');
        var downloadFileLocation = "/tmp/" + projectName + "/" + fileNameWithExtension;
        var fileName = fileNameWithExtension.replace('.tar.gz', '');
        
        await downloadFile(file, downloadFileLocation);
        
        targz.decompress({
            src: downloadFileLocation,
            dest: '/home/kevin/' + projectName + '/' + fileName
        }, function(err) {
               if(err) {
                   console.log(err);
               } else {
                   console.log("Done!");
               }
        });
        
        var npmInstall = 'npm install --prefix ' + '/home/kevin/' + projectName + '/' + fileName;
        var child = shell.exec(npmInstall, {async: true});
        child.stdout.on('data', function(data) {
            if( data ) {
                if( data.indexOf('up to date') >= 0 ) {
                    runApp();
                }
            }
        });

    }    
}

start();