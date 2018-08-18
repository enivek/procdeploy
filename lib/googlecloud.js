/**
 * Returns a list of files in the bucket.
 */
function listFilesByPrefix(bucketName, prefix, delimiter) {

    const result = [];
    const Storage = require('@google-cloud/storage');
    const storage = new Storage();
    const options = {
        prefix: prefix,
    };

    if (delimiter) {
        options.delimiter = delimiter;
    }

    // Lists files in the bucket, filtered by a prefix
    return storage
        .bucket(bucketName)
        .getFiles(options)
        .then(results => {
        
            const files = results[0];
            files.forEach(file => {
                if(file.name.indexOf(".tar.gz") >= 0) {
                    result.push(file.name);
                }
            });   
            
            result.sort();
            if( result.length == 0 ) {
                return null;
            }
            return result.pop();
            
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
        
}

exports.listFilesByPrefix = listFilesByPrefix;

/**
 * Download a file from a bucket.
*/
function downloadFile(bucketName, srcFilename, destFilename) {

    const Storage = require('@google-cloud/storage');
    const storage = new Storage();

    const options = {
        destination: destFilename,
    };

    // Downloads the file
    return storage
        .bucket(bucketName)
        .file(srcFilename)
        .download(options)
        .then(() => {
            console.log("=>" + srcFilename + " downloaded to " + destFilename);
        })
        .catch(err => {
            console.error('ERROR:', err);
        });

}
    
exports.downloadFile = downloadFile;    
    