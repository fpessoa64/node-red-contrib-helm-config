
const fs   = require('fs');
const yaml = require('js-yaml');

class YAML {

    vars =[];

    constructor() {
      this.vars = [];

    }

    get_dirname() {
        let path = __dirname;
        let index = path.indexOf("node_modules");
        if(index > 0) {
            return path.substring(0,index);
        }
        return path;
        
    }

    load_vars(env) {
        try {
            var path = this.get_dirname() +  "/docker-compose.yaml";

            const doc = yaml.load(fs.readFileSync(path, 'utf8'));
            console.log(doc);

          } catch (e) {
            console.log(e);
          }
    }
}

module.exports = {
    YAML
};