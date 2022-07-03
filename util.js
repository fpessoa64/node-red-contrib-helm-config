
const fs = require('fs');
const path = require('path');

class Util {
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