const fs = require('fs');

const generateRandomString = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const getFilesAndSizes = (directory) => {
    const fileNames = fs.readdirSync(directory);
    const filesWithSizes = fileNames.map(fileName => {
        const stats = fs.statSync(`${directory}/${fileName}`);
        return {
            name: fileName,
            size: stats.size
        };
    });
    return filesWithSizes;
}



module.exports = {
    generateRandomString,
    getFilesAndSizes
}