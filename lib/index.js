const googlecloud = require('./googlecloud.js');
const targz = require('targz');

googlecloud.
    listFilesByPrefix('royaltutor2', 'test').
    then( file => {
        if( file ) {
            console.log("Download " + file);
            var fileName = file.replace('test/', '');
            googlecloud.
            downloadFile('royaltutor2', file, fileName).
            then( () => {
                                
                targz.decompress({
                    src: fileName,
                    dest: '/home/kevin/' + fileName
                }, function(err) {
                       if(err) {
                           console.log(err);
                       } else {
                           console.log("Done!");
                       }
                });
                                
            } );
        }
    });