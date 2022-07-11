
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

            let value1= "TT=23";
            let value2= "TX=24";


            let keys= ["TT=23","TT1=23"];
            doc.services.nodered.environment.push("TX=1")
            
            vars.forEach(v => {
                var line = `- ${v.p} = ${v.to}`;
         
               
                //doc.services.nodered.environment.push(values)

            });

            

            fs.writeFileSync(path,yaml.dump(doc));

           
          } catch (e) {
            console.log(e);
          }
    }
}

module.exports = {
    YAML
};