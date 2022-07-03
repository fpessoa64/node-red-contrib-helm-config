
const fs = require('fs');
const path = require('path');

class Util {

    KEY_SCRIPT_NAME = "{{SCRIPT_NAME}}";
    KEY_SCRIPT_LABEL = "{{SCRIPT_LABEL}}";
    KEY_PRD_VARIABLES = "# BEGIN PRD"

    constructor() {
      

    }

    increaseSalary() {
    }

    isFile = fileName => {
        return fs.lstatSync(fileName).isFile();
      };

    isFile(fileName) {
        return fs.lstatSync(fileName).isFile();
    }

    get_folders(folderPath) {
        return fs.readdirSync(folderPath);            
    }

    rename(script) {
        try {

            console.log(script);
            console.log(__dirname);
    
            var path = __dirname + "/helm";
            console.log(path);
    
            if (fs.existsSync(path)) {
                console.log(`Directory exists!: ${path}`);
                var folders = this.get_folders(path);
                console.log(folders);

                if(folders.length > 0) {
                    var folder = path + "/" + folders[0];
                    var new_folder = path + "/" + script;
                    console.log(`rename: ${folder} ${new_folder}`);
                    fs.renameSync(folder, new_folder);
                }
    
                console.log(this.get_folders(path))
            } else {
                console.error(`Directory not found.: ${path}`);
            }
        }catch(e) {
            console.log(e);
        }
       
    }

    prepareVariables(maps) {
        let variables = "\n";
        maps.forEach(element => {
            console.log('element')
            console.log(element);
            let tag = element.p.replace('\"','').replace('\"','');
            let value = `\t${tag}: ${element.to}\n`
            variables += value;
        });
        variables += '\n';
        return variables;
    }

    /** */
    configMap(script,maps,env) {
        console.log(`Script: ${script}`);
        var path = __dirname + "/helm/" + script + "/templates/configmaps.yaml";
        var path_model = __dirname + "/templates/template_configmaps.yaml";
        console.log(path);
        const content = fs.readFileSync(path_model);
        console.log(content.toString("utf-8"));
        console.log(this.KEY_SCRIPT_NAME);
        console.log(this.KEY_SCRIPT_LABEL);
        var text = content.toString("utf-8");
        text = text.replace(this.KEY_SCRIPT_NAME,script + ".name");
        text = text.replace(this.KEY_SCRIPT_LABEL,script + ".labels");
       
        if(env == "PRD") {
            let values = this.KEY_PRD_VARIABLES + "\n" + this.prepareVariables(maps);
            text = text.replace(this.KEY_PRD_VARIABLES,values);
        }
        console.log(text);
        fs.writeFileSync(path,text);
    }
}


// function rename(script){
//     console.log(script);
//     console.log(__dirname);
//     var path = __dirname + "/helm";
//     console.log(path);
//     if (fs.existsSync(path)) {
//         console.log('Directory exists!');
//     } else {
//         console.log('Directory not found.');
//     }


// }   

// function alpha(msj) {
//     console.log('In alpha: ' + msj);
// }

// function beta(msj) {
//     console.log('In beta: ' + msj);
// }

module.exports = {
    Util
};