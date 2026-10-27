const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

function readYaml(relativePath) {

    const filePath = path.resolve(__dirname, '..', relativePath);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Test data file not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    return yaml.parse(fileContent);

}
module.exports = {
  readYaml: readYaml
};

