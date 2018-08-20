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
        
        if( shell.exec('npm install --prefix ' + '/home/kevin/' + projectName + '/' + fileName).code == 0 ) {
            console.log("npm install complete");
            
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
    }    
}

start();