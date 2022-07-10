/**
 * Copyright 2018 Dean Cording <dean@cording.id.au>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 **/

const { config } = require("process");


module.exports = function (RED) {
    "use strict";
    var fs = require("fs");
    const {Util} = require('./util');


    function ConfigNode(n) {
        RED.nodes.createNode(this, n);

        var node = this;
        this.name = n.name;
        this.script = n.script;
        this.enabled = n.enabled;
        this.url_api = n.url;
        this.url_swagger = n.swagger;

        var path = __dirname + "/helm";
        console.log(path);
       

        node.properties = n.properties;
        console.log(node.properties);
        console.log(this.name);
        console.log(this.script);
        console.log(this.enabled);
        console.log(this.url_api);
        console.log(this.url_swagger);

        const u = new Util();

        let maps = node.properties;
        console.log(node.properties);

        console.log("script: " + this.script);
        console.log("name: " + this.name);

        if(this.name == "PRD" ||  this.name == "STG"  &&   this.script  && this.script.length > 0) {
            console.log("atualiza");

            u.rename(this.script);
            // u.set_config_map(this.script,maps,this.name);
            // u.set_deployment(this.script);
            // u.set_destination_rule(this.script);
            // u.set_hpa(this.script);
            // u.set_service(this.script);  
            // u.set_virtualService(this.script); 
            // u.set_chart(this.script);
            // u.set_values(this.script,this.enabled,this.url_api,this.url_swagger);
            u.loadVariables(this.script,this.name);
        }
     
        console.log("configNode  executado")

        node.configure = function (node) {

            var d = new Date();
            console.log(d.toString());
            console.log(`name: ${this.name} script: ${this.script}`);
          
            console.log(node.context());
            node.properties.forEach(function (property) {

                console.log(property);
                var value = RED.util.evaluateNodeProperty(property.to, property.tot, node, null)
                
                // if (property.pt === 'flow') {
                //     node.context().flow.set(property.p,value);
                // } else if (property.pt === 'global') {
                //     node.context().global.set(property.p,value);
                // }else  if(property.pt === 'str'){

                // }
            });
        };
        console.log(node);
        if (n.active) node.configure(node);

        node.on("input", function (msg) {
            console.log(node);
            node.configure(node);
            console.log("input");
        });
    }

    RED.nodes.registerType("config", ConfigNode);
    RED.events.on("nodes:add", function(node) {
        console.log("A node has been added to the workspace!")
    })


    RED.events.once('flows:stopped', () => {
        console.log("flows timeout");
    })

    

    RED.events.once('nodes:change', () => {
        console.log("flows timeout change");

    })
   
    RED.httpAdmin.post("/config/:id", RED.auth.needsPermission("config.write"), function (req, res) {
        var node = RED.nodes.getNode(req.params.id);
        if (node != null) {
            try {
                console.log("post");
                console.log(node);
                node.configure(node);
                res.sendStatus(200);
            } catch (err) {
                res.sendStatus(500);
                node.error("Config failed: " + err.toString());
            }
        } else {
            res.sendStatus(404);
        }
    });

};
