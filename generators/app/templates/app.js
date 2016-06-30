/**
 * This is an express-powered node-red application bootstrap.  This spins
 * up the node-red server and allows us to use more precise settings control.
 **/
var http = require('http');
var express = require("express");
var seneca = require('seneca')();
var RED = require("node-red"),
    app = express(),
    environment = app.get("ENV") || "development";
var formidable = require('formidable');
var expressSession = require('express-session');
var passport = require('passport');

var configFile = "./config/config." + environment + ".js";
seneca.use('options', configFile);

console.log(configFile);
app.use("/",express.static("public"));

// Create a server
var server = http.createServer(app);

seneca.ready(function(err){
    if (!err) {
        var config = seneca.export('options');
        
        console.log("userDir = ", config.nodered.userDir);
        
        // Initialise the runtime with a server and settings
        console.log("Node red config = ", config.nodered);
        RED.init(server,config.nodered);
        
        // Serve the editor UI from /red
        app.use(config.nodered.httpAdminRoot,RED.httpAdmin);
        
        // Serve the http nodes UI from /api
        app.use(config.nodered.httpNodeRoot,RED.httpNode);

        server.listen(config.main.port);
        console.log("Listening on port ", config.main.port);
        // Start the runtime
        RED.start();
    } else {
        console.error(err);
    }
});