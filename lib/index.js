const googlecloud = require('./googlecloud.js');

googlecloud.
    listFilesByPrefix('royaltutor2', 'test', '/').
    then( file => {
        if( file ) {
            console.log("Download " + file);
        }
    });