
const fs = require('fs');
const path = require('path');

class Util {

    KEY_SCRIPT_NAME = "{{SCRIPT_NAME}}";
    KEY_SCRIPT_LABEL = "{{SCRIPT_LABEL}}";
    KEY_SELECTOR_LABELS = "{{SELECTOR_LABELS}}";
    KEY_BEGIN_PRD = "# BEGIN PRD";
    KEY_END_PRD = "# END PRD";
    KEY_BEGIN_STG = "# BEGIN STG";
    KEY_END_STG = "# END STG";
    KEY_ENABLED_SERVICE = "{{ENABLED_SERVICE}}";
    KEY_URL_API = "{{URL_API}}";
    KEY_URL_SWAGGER = "{{URL_SWAGGER}}";
    vars = [];

    constructor() {
        this.vars = [];

    }
    /**
     * retorno o diretorio base
     * @returns 
     */
    get_dirname() {
        //let path = __dirname;
        let path = "/data";
        let index = path.indexOf("node_modules");
        if (index > 0) {
            return path.substring(0, index);
        }
        return path;

    }
    /**
     * Testa se  arquivo
     * @param {*} fileName 
     * @returns 
     */
    isFile = fileName => {
        return fs.lstatSync(fileName).isFile();
    };
    /**
     * Testa se arquivo
     * @param {*} fileName 
     * @returns 
     */
    isFile(fileName) {
        return fs.lstatSync(fileName).isFile();
    }
    /**
     * Listas pastas
     * @param {*} folderPath 
     * @returns 
     */
    get_folders(folderPath) {
        return fs.readdirSync(folderPath);
    }
    /**
     * renomei anome do script
     * @param {*} script 
     */
    rename(script) {
        try {

            console.log(script);
            console.log(this.get_dirname());

            var path = this.get_dirname() + "/helm";
            console.log(path);

            if (fs.existsSync(path)) {
                console.log(`Directory exists!: ${path}`);
                var folders = this.get_folders(path);
                console.log(folders);

                if (folders.length > 0) {
                    var folder = path + "/" + folders[0];
                    var new_folder = path + "/" + script;
                    console.log(`rename: ${folder} ${new_folder}`);
                    fs.renameSync(folder, new_folder);
                }

                console.log(this.get_folders(path))
            } else {
                console.error(`Directory not found.: ${path}`);
            }
        } catch (e) {
            console.log(e);
        }

    }

    /**
     * Prepara variaveis de ambiente para tela do helm
     * @param {*} maps 
     * @returns 
     */
    prepareVariables(maps) {
        //let variables = "\n";
        maps.forEach(element => {
            let tag = element.p.replace('\"', '').replace('\"', '');
            let value = `\t${tag}: ${element.to}\n`
            variables += value;
        });
        //variables += '\n';
        return variables;
    }

    /**
     * Atualiza variaveis no configmap
     * @param {*} text 
     * @param {*} script 
     * @returns 
     */
    setConfigMapName(text, script) {
        let index = text.indexOf("name: {{ include ", 0);
        if (index > 0) {
            let end = text.indexOf(". }}", index);
            if (end > 0) {
                console.log(text.substring(index, end));
                let found = text.substring(index, end);
                let replace = "name: {{ include " + "\"" + script.trim() + ".name" + "\" ";
                text = text.replace(new RegExp(found, "g"), replace);
                console.log(text);
                //fs.writeFileSync(path,text);
            }
        }
        return text;
    }
    /**
     * Ajusta configmap labels
     * @param {*} text 
     * @param {*} script 
     * @returns 
     */
    setConfigMapLabel(text, script) {
        let index = text.indexOf("{{- include ", 0);
        if (index > 0) {
            let end = text.indexOf(" . | nindent", index);
            if (end > 0) {
                console.log(text.substring(index, end));
                let found = text.substring(index, end);
                let replace = "{{- include " + "\"" + script.trim() + ".labels" + "\"";
                text = text.replace(new RegExp(found, "g"), replace);
                console.log(text);
            }
        }
        return text;
    }
    /**
     * Configura variaveis configmap PRD
     * @param {*} text 
     * @param {*} maps 
     * @returns 
     */
    setConfigMapVarPRD(text, maps) {

        let index = text.indexOf(this.KEY_BEGIN_PRD, 0);
        if (index > 0) {
            let end = text.indexOf(this.KEY_END_PRD, index);
            if (end > 0) {
                console.log(text.substring(index, end));
                let found = text.substring(index, end);
                let replace = this.KEY_BEGIN_PRD + "\n" + this.prepareVariables(maps) + "\n" + " ";
                text = text.replace(new RegExp(found, "g"), replace);
            }
        }
        return text;
    }
    /**
     * Configura vraiveis configmap
     * @param {*} text 
     * @param {*} maps 
     * @returns 
     */
    setConfigMapVarSTG(text, maps) {
        console.log("config stg");
        let index = text.indexOf("{{- else if eq .Values.configmap.env \"stg\" }}");
        if(index >= 0) {
            let end = text.indexOf("{{- else if eq .Values.configmap.env \"hml\" }}", index);
            if(end > 0) {
                console.log("substring: " + text.substring(index, end));
                let found = text.substring(index, end);
                console.log("found: " + found)
                let replace = "{{- else if eq .Values.configmap.env \"stg\" }}\n";
                replace += this.prepareVariables(maps);
                replace += "\n";
                console.log("replace: " + replace)
                text = text.replace(new RegExp(found, "g"), replace);
            }else {
                console.log(" nao encontrei index ");
            }
        }else {
            console.log(" nao encontrei index ");
        }
        return text;

        // let index = text.indexOf(this.KEY_BEGIN_STG, 0);
        // if (index > 0) {
        //     let end = text.indexOf(this.KEY_END_STG, index);
        //     if (end > 0) {
        //         console.log(text.substring(index, end));
        //         let found = text.substring(index, end);
        //         let replace = this.KEY_BEGIN_STG + "\n" + this.prepareVariables(maps) + "\n" + " ";

        //         text = text.replace(new RegExp(found, "g"), replace);
        //         console.log(text);
        //     }
        // }
        return text;
    }

    set_config_map(script, maps, env) {
        console.log(`Script: ${script}`);

        var path = this.get_dirname() + "/helm/" + script + "/templates/configmaps.yaml";
        //var path_model = this.get_dirname() + "/templates/template_configmaps.yaml";

        const content = fs.readFileSync(path);
        console.log(content.toString("utf-8"));
        var text = content.toString("utf-8");
        text = this.setConfigMapName(text, script);
        text = this.setConfigMapLabel(text, script);

        if (env == "PRD") {
            //text = this.setConfigMapVarPRD(text, maps);
        } else if (env == "STG") {
            text = this.setConfigMapVarSTG(text, maps);
        }

        fs.writeFileSync(path, text);

    }

    /**
     * Seta configuracoe deployment
     * @param {*} script 
     * @param {*} maps 
     * @param {*} env 
     */
    set_deployment(script) {
        console.log(`Script: ${script}`);
        var path = this.get_dirname() + "/helm/" + script + "/templates/deployment.yaml";
        var path_model = this.get_dirname() + "/templates/template_deployment.yaml";
        console.log(path);
        const content = fs.readFileSync(path_model);
        console.log(content.toString("utf-8"));
        console.log(this.KEY_SCRIPT_NAME);
        console.log(this.KEY_SCRIPT_LABEL);
        var text = content.toString("utf-8");

        text = text.replace(new RegExp(this.KEY_SCRIPT_NAME, "g"), script + ".name");
        text = text.replace(new RegExp(this.KEY_SCRIPT_LABEL, "g"), script + ".labels");

        console.log(text);
        fs.writeFileSync(path, text);
    }
    /**
     * Set destination rule
     * @param {*} script 
     */
    set_destination_rule(script) {
        console.log(`Script: ${script}`);
        var path = this.get_dirname() + "/helm/" + script + "/templates/destinationRule.yaml";
        var path_model = this.get_dirname() + "/templates/template_destinationRule.yaml";
        console.log(path);
        const content = fs.readFileSync(path_model);
        console.log(content.toString("utf-8"));
        console.log(this.KEY_SCRIPT_NAME);
        console.log(this.KEY_SCRIPT_LABEL);
        var text = content.toString("utf-8");

        text = text.replace(new RegExp(this.KEY_SCRIPT_NAME, "g"), script + ".name");
        text = text.replace(new RegExp(this.KEY_SCRIPT_LABEL, "g"), script + ".labels");


        console.log(text);
        fs.writeFileSync(path, text);
    }
    /**
     * Set HPA
     * @param {*} script 
     */
    set_hpa(script) {
        console.log(`Script: ${script}`);
        var path = this.get_dirname() + "/helm/" + script + "/templates/hpa.yaml";
        var path_model = this.get_dirname() + "/templates/template_hpa.yaml";
        console.log(path);
        const content = fs.readFileSync(path_model);
        var text = content.toString("utf-8");

        text = text.replace(new RegExp(this.KEY_SCRIPT_NAME, "g"), script + ".name");
        text = text.replace(new RegExp(this.KEY_SCRIPT_LABEL, "g"), script + ".labels");

        //console.log(text);
        fs.writeFileSync(path, text);
    }

    /**
     * Configura Servico
     * @param {*} script 
     */
    set_service(script) {
        console.log(`Script: ${script}`);
        var path = this.get_dirname() + "/helm/" + script + "/templates/service.yaml";
        var path_model = this.get_dirname() + "/templates/template_service.yaml";
        console.log(path);
        const content = fs.readFileSync(path_model);
        // console.log(content.toString("utf-8"));
        // console.log(this.KEY_SCRIPT_NAME);
        // console.log(this.KEY_SCRIPT_LABEL);
        var text = content.toString("utf-8");
        text = text.replace(new RegExp(this.KEY_SCRIPT_NAME, "g"), script + ".name");
        text = text.replace(new RegExp(this.KEY_SCRIPT_LABEL, "g"), script + ".labels");
        text = text.replace(new RegExp(this.KEY_SELECTOR_LABELS, "g"), script + ".selectorLabels");


        //console.log(text);
        fs.writeFileSync(path, text);
    }
    /**
     * COnfigura Virtual Service
     * @param {*} script 
     */
    set_virtualService(script) {__dirname
        console.log(`Script: ${script}`);
        var path = this.get_dirname() + "/helm/" + script + "/templates/virtualservice.yaml";
        var path_model = this.get_dirname() + "/templates/template_virtualservice.yaml";
        console.log(path);
        const content = fs.readFileSync(path_model);
        // console.log(content.toString("utf-8"));
        // console.log(this.KEY_SCRIPT_NAME);
        // console.log(this.KEY_SCRIPT_LABEL);
        var text = content.toString("utf-8");
        text = text.replace(new RegExp(this.KEY_SCRIPT_NAME, "g"), script + ".name");
        text = text.replace(new RegExp(this.KEY_SCRIPT_LABEL, "g"), script + ".labels");

        //console.log(text);
        fs.writeFileSync(path, text);
    }
    /**
     * Configura chats valores
     * @param {*} script 
     */
    set_chart(script) {
        console.log(`Script: ${script}`);
        var path = this.get_dirname() + "/helm/" + script + "/Chart.yaml";
        var path_model = this.get_dirname() + "/templates/template_chart.yaml";
        console.log(path);
        const content = fs.readFileSync(path_model);
        console.log(content.toString("utf-8"));
        console.log(this.KEY_SCRIPT_NAME);

        var text = content.toString("utf-8");

        text = text.replace(new RegExp(this.KEY_SCRIPT_NAME, "g"), script + "");

        console.log(text);
        fs.writeFileSync(path, text);
    }

    /**
     * Configura valores
     * @param {*} script 
     * @param {*} service_enabled 
     * @param {*} service_url 
     * @param {*} service_url_swagger 
     */
    set_values(script, service_enabled, service_url, service_url_swagger) {
        console.log(`Script: ${script}`);
        var path = this.get_dirname() + "/helm/" + script + "/values.yaml";
        var path_model = this.get_dirname() + "/templates/template_values.yaml";
        console.log(path);
        const content = fs.readFileSync(path_model);
        // console.log(content.toString("utf-8"));
        // console.log(this.KEY_SCRIPT_NAME);

        var text = content.toString("utf-8");
        text = text.replace(new RegExp(this.KEY_SCRIPT_NAME, "g"), script + "");
        if (service_url && service_url.length > 0) {
            let replace = service_enabled ? "true" : "false";
            text = text.replace(new RegExp(this.KEY_ENABLED_SERVICE, "g"), replace);
            text = text.replace(new RegExp(this.KEY_URL_API, "g"), service_url);
            text = text.replace(new RegExp(this.KEY_URL_SWAGGER, "g"), service_url_swagger);

        } else {
            text = text.replace(new RegExp(this.KEY_ENABLED_SERVICE, "g"), "false");
            text = text.replace(new RegExp(this.KEY_URL_API, "g"), "");
            text = text.replace(new RegExp(this.KEY_URL_SWAGGER, "g"), "");
        }
        //console.log(text);
        fs.writeFileSync(path, text);

    }

    /**
     * Carrega Variaveis
     * @param {*} script 
     * @param {*} env 
     */
    loadVariables(script, env) {
        var path = this.get_dirname() + "/helm/" + script + "/templates/configmaps.yaml";
        const content = fs.readFileSync(path);
        var text = content.toString("utf-8");
        var begin_mark = this.KEY_BEGIN_PRD
        var end_mark = this.KEY_END_PRD;
        if (env == "PRD") {
            begin_mark = this.KEY_BEGIN_PRD
            end_mark = this.KEY_END_PRD;
        } else if (env == "STG") {
            begin_mark = this.KEY_BEGIN_STG
            end_mark = this.KEY_END_STG;
        }

        this.load_vars(begin_mark, end_mark, text);
    }
    /**
     * Carrega variaveis 
     * @param {*} begin_mark 
     * @param {*} end_mark 
     * @param {*} text 
     */
    load_vars(begin_mark, end_mark, text) {
        this.vars = [];
        let index = text.indexOf(begin_mark, 0);
        if (index > 0) {
            let end = text.indexOf(end_mark, index);
            if (end > 0) {
                let str = text.substring(index, end);
                console.log(str);
                let lines = str.split('\n');
                lines.forEach(line => {

                    if (!(line.indexOf(begin_mark) >= 0 || line.indexOf(end_mark) >= 0 || line.length < 2)) {
                        console.log('line:' + line);
                        var item = this.prepare_var(line);
                        if (item) {
                            this.vars.push(item);
                        }

                    }

                });
            }
        }
        console.log(this.vars);
    }
    /**
     * Monta variaveis
     * @param {*} line 
     * @returns 
     */
    prepare_var(line) {
        let values = line.split(":");
        if (values.length == 2) {
            var item = { p: values[0].trim(), pt: 'prd', to: values[1].trim(), tot: 'prd' };
            return item;
        }
        return null;
    }

    remove_var(var_name) {
        var i = 0;
        while (i < this.vars.length) {
            if (this.vars[i].p === var_name) {
                this.vars.splice(i, 1);
            } else {
                ++i;
            }
        }
    }
    /**
     * Print variables
     */
    print_vars() {
        console.log("Print vars");
        this.vars.forEach(element => {
            console.log(element);
        });
    }
    /**
     * 
     * @returns Get variables
     */
    get_vars() {
        return this.vars;
    }
}


module.exports = {
    Util
};