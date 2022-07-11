
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

    remove_item(key,vars) {
        doc.services.nodered.environment
        var index = 0;
        var found = -1;
        vars.forEach(element => {
            if(element.indexOf(key) >= 0) {
                found = index;
            }
            index++;
        });

        if(found >=0 ) {
            vars.splice(found,1);
        }
    }
    /**
     * 
     * @param {*} env 
     * @param {*} vars 
     */
    set_vars(env,vars) {
        try {

            if(vars.length > 0) {
                if(env == "PRD" || env == "STG") {
                    
                    var path = this.get_dirname() +  "/docker-compose.yaml";
                    if(env == "STG") {
                        path = this.get_dirname() +  "/docker-compose-stg.yaml";
                    }

                    const doc = yaml.load(fs.readFileSync(path, 'utf8'));
                    console.log(doc);
                    // var keys = [];
                    // doc.services.nodered.environment.forEach(e => {
                    //     console.log(e)
                    //     keys.push(e.split("=")[0].replace("-","").trim());
                    //     console.log(keys);

                    // });
        
                    //doc.services.nodered.environment = [];
                    vars.forEach(v => {
                        var line = `${v.p} = ${v.to}`;
                        this.remove_item(v.p,doc.services.nodered.environment);

                        // var data = doc.services.nodered.environment.filter(item => item.indexOf(v.p) >= 0);
                        // if(data) {
                        //     console.log(`found: ${data}`)
                        //     const index =doc.services.nodered.environment.indexOf(data);
                        //     console.log(`found: ${index}`)
                        //     if(index >=0 )
                        //         doc.services.nodered.environment.splice(index,1);
                        // }
                        // const index = keys.indexOf(v.p);
                        // if(index >= 0) {
                        //     doc.services.nodered.environment.splice(index,1);
                        // }
                        doc.services.nodered.environment.push(line)
                        console.log("push: " + line);
        
                    });
                    fs.writeFileSync(path,yaml.dump(doc));
                }
               
            }
           
          } catch (e) {
            console.log(e);
          }
    }
}

module.exports = {
    YAML
};