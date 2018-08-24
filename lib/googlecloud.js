/**
 * Returns a list of files in the bucket.
 */
async function listFilesByPrefix(bucketName, prefix, delimiter) {

    const result = [];
    const Storage = require('@google-cloud/storage');
    const storage = new Storage();
    const options = {
        prefix: prefix,
    };

    if (delimiter) {
        options.delimiter = delimiter;
    }

    var filesResults = await storage.bucket(bucketName).getFiles(options);
    const files = filesResults[0];
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
        
}

module.exports.listFilesByPrefix = listFilesByPrefix;

/**
 * Download a file from a bucket.
 */
async function downloadFile(bucketName, srcFilename, destFilename) {

    const Storage = require('@google-cloud/storage');
    const storage = new Storage();
    const options = {
        destination: destFilename,
    };

    await storage.bucket(bucketName).file(srcFilename).download(options);
    console.log("Downloading " + srcFilename);

}
    
module.exports.downloadFile = downloadFile;    
    