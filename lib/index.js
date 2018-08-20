const googlecloud = require('./googlecloud.js');
const targz = require('targz');
const childprocess = require('child_process');
const shell = require('shelljs');

const projectName = 'royaltutor2';
const envName = 'test';

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
        var fileName = fileNameWithExtension.replace('.tar.gz', '');
        
        await downloadFile(file, fileNameWithExtension);
        
        targz.decompress({
            src: fileNameWithExtension,
            dest: '/home/kevin/' + projectName + '/' + fileName
        }, function(err) {
               if(err) {
                   console.log(err);
               } else {
                   console.log("Done!");
               }
        });
        
        shell.exec('npm install --prefix ' + '/home/kevin/' + projectName + '/' + fileName);
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

Promise.run(start);