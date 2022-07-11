
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

    set_vars(env,vars) {
        try {
            var path = this.get_dirname() +  "/docker-compose.yaml";

            const doc = yaml.load(fs.readFileSync(path, 'utf8'));
            console.log(doc);
          
            doc.services.nodered.environment.forEach(e => {
                console.log(e)
            });

            vars.forEach(v => {
                var line = `- ${v.p} = ${v.to}`;
                doc.services.nodered.environment.push(line)

            });

            

            fs.writeFileSync(path,yaml.safeDump(doc));

           
          } catch (e) {
            console.log(e);
          }
    }
}

module.exports = {
    YAML
};