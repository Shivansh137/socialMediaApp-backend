const DataUriParser = require('datauri/parser');

const getDataUri = (file) => {
    const parser = new DataUriParser();
    return parser.format(file?.originalname, file?.buffer).content;
}

module.exports = getDataUri;