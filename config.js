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

        var path = __dirname + "/helm";
        console.log(path);
       

        node.properties = n.properties;
        console.log(node.properties);
        console.log(this.name);
        console.log(this.script);

        const u = new Util();

        // let maps = [
        //     { p: '"TZ"', pt: 'prd', to: '"America/Fortaleza"', tot: 'prd' },
        //     { p: '"NODE_ENV"', pt: 'prd', to: '"production"', tot: 'prd' },
        //     {
        //       p: '"NODE_RED_ENABLE_SAFE_MODE"',
        //       pt: 'prd',
        //       to: '"true"',
        //       tot: 'prd'
        //     },
        //     {
        //       p: 'NODE_RED_ENABLE_PROJECTS',
        //       pt: 'prd',
        //       to: '"true"',
        //       tot: 'prd'
        //     },
        //     {
        //       p: '"EMAIL_HOST"',
        //       pt: 'prd',
        //       to: '"smtp.pmenos.com.br"',
        //       tot: 'prd'
        //     },
        //     { p: '"EMAIL_PORT"', pt: 'prd', to: '587', tot: 'prd' },
        //     {
        //       p: 'EMAIL_USER',
        //       pt: 'prd',
        //       to: '"contadeservico@pmenos.com.br"',
        //       tot: 'prd'
        //     },
        //     { p: '"EMAIL_PASS"', pt: 'prd', to: '"senha"', tot: 'prd' },
        //     { p: '"EMAIL_GROUP"', pt: 'prd', to: 'email1,email2', tot: 'prd' },
        //     { p: '"AMQP_HOST"', pt: 'prd', to: '"ip do host"', tot: 'prd' },
        //     { p: '"AMQP_HOST_PORT"', pt: 'prd', to: '5672', tot: 'prd' },
        //     { p: '"AMQP_USER"', pt: 'prd', to: '"usuario"', tot: 'prd' },
        //     { p: '"AMQP_PASSWORD"', pt: 'prd', to: '"senha"', tot: 'prd' }
        //   ];

        let maps = node.properties;
        console.log(node.properties);

        u.rename("nodered-template-fila-email2");
        u.configMap("nodered-template-fila-email2",maps,"PRD");
        u.deployment("nodered-template-fila-email2");
        u.destinationRule("nodered-template-fila-email2");
        u.hpa("nodered-template-fila-email2");
        u.service("nodered-template-fila-email2"); 
     
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
