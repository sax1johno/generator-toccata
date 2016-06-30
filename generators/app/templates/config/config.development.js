/**
 * Configuration for all plugins goes in this file.  The name of this file
 * represents the environment for which this configuration belongs, with
 * the following file naming convention:
 *  config.<environment>.js
 *
 * The config object itself is just a set of key/value pairs, with the key representing
 * the name of the plugin and the value representing configuration options.
 * 
 * See the documentation for each individual plugin for more information on what
 * options can be included here.
 **/

var path = require('path'),
    fs = require('fs'),
    jade = require('jade'),
    expressSession = require('express-session');
    
module.exports = {
  appName: "DLI Encyclopedia of Dry Cleaning",
  main: {
    port:process.env.PORT
  },
  auth: {
    // change to true if you want to send emails
    sendemail:false
  },
  services:  // A list of pm2-compatible JSON objects containing the microservice servers you want to spawn.
    [
        {
            "name"          : "RedServer",
            "script"        : "app.js",
            "watch"         : false,
            "merge_logs"    : true,
            "instance"      : 1,
            "exec_mode"     : "cluster_mode"
        },
        {
            "name"        : "Users",
            "script"      : "components/users/service.js",
            "watch"       : true,
            "merge_logs"  : true,
            "instances"   : 1,
            "exec_mode"   : "cluster_mode"
        },
        {
            "name"        : "Articles",
            "script"      : "components/articles/service.js",
            "watch"       : true,
            "merge_logs"  : true,
            "instances"   : 1,
            "exec_mode"   : "cluster_mode"
        },
        {
            "name"        : "Categories",
            "script"      : "components/categories/service.js",
            "watch"       : true,
            "merge_logs"  : true,
            "instances"   : 1,
            "exec_mode"   : "cluster_mode"
        },
        {
            "name"        : "Public",
            "script"      : "components/public/service.js",
            "watch"       : false,
            "merge_logs"  : true,
            "instances"   : 1,
            "exec_mode"   : "cluster_mode"
        }
  ],
  nodered: {
          
    // the tcp port that the Node-RED web server is listening on
    uiPort: 1880,
    // Retry time in milliseconds for MQTT connections
    mqttReconnectTime: 15000,
    // Retry time in milliseconds for Serial port connections
    serialReconnectTime: 15000,
    // The maximum length, in characters, of any message sent to the debug sidebar tab
    debugMaxLength: 1000,

    // The file containing the flows. If not set, it defaults to flows_<hostname>.json
    flowFile: 'dli_encyclopedia_flows.json',
    flowFilePretty: true,

    // By default, all user data is stored in the Node-RED install directory. To
    // use a different location, the following property can be used
    userDir: path.join(__dirname, "flows"),

    // Node-RED scans the `nodes` directory in the install directory to find nodes.
    // The following property can be used to specify an additional directory to scan.
    // nodesDir: __dirname,

    // By default, the Node-RED UI is available at http://localhost:1880/
    // The following property can be used to specifiy a different root path.
    // If set to false, this is disabled.
    httpAdminRoot: '/system/admin',

    // Some nodes, such as HTTP In, can be used to listen for incoming http requests.
    // By default, these are served relative to '/'. The following property
    // can be used to specifiy a different root path. If set to false, this is
    // disabled.
    httpNodeRoot: '/',

    // The following property can be used in place of 'httpAdminRoot' and 'httpNodeRoot',
    // to apply the same root to both parts.
    //httpRoot: '/red',

    // When httpAdminRoot is used to move the UI to a different root path, the
    // following property can be used to identify a directory of static content
    // that should be served at http://localhost:1880/.
    httpStatic: path.join(__dirname, "../public"),

    // Securing Node-RED
    // -----------------
    // To password protect the Node-RED editor and admin API, the following
    // property can be used. See http://nodered.org/docs/security.html for details.
    //adminAuth: {
    //    type: "credentials",
    //    users: [{
    //        username: "admin",
    //        password: "$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN.",
    //        permissions: "*"
    //    }]
    //},

    // To password protect the node-defined HTTP endpoints (httpNodeRoot), or
    // the static content (httpStatic), the following properties can be used.
    // The pass field is a bcrypt hash of the password.
    // See http://nodered.org/docs/security.html#generating-the-password-hash
    //httpNodeAuth: {user:"user",pass:"$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN."},
    //httpStaticAuth: {user:"user",pass:"$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN."},

    // The following property can be used to enable HTTPS
    // See http://nodejs.org/api/https.html#https_https_createserver_options_requestlistener
    // for details on its contents.
    // See the comment at the top of this file on how to load the `fs` module used by
    // this setting.
    //
    //https: {
    //    key: fs.readFileSync('privatekey.pem'),
    //    cert: fs.readFileSync('certificate.pem')
    //},

    // The following property can be used to disable the editor. The admin API
    // is not affected by this option. To disable both the editor and the admin
    // API, use either the httpRoot or httpAdminRoot properties
    //disableEditor: false,

    // The following property can be used to configure cross-origin resource sharing
    // in the HTTP nodes.
    // See https://github.com/troygoode/node-cors#configuration-options for
    // details on its contents. The following is a basic permissive set of options:
    //httpNodeCors: {
    //    origin: "*",
    //    methods: "GET,PUT,POST,DELETE"
    //},

    // If you need to set an http proxy please set an environment variable
    // called http_proxy (or HTTP_PROXY) outside of Node-RED in the operating system.
    // For example - http_proxy=http://myproxy.com:8080
    // (Setting it here will have no effect)
    // You may also specify no_proxy (or NO_PROXY) to supply a comma separated
    // list of domains to not proxy, eg - no_proxy=.acme.co,.acme.co.uk

    // The following property can be used to add a custom middleware function
    // in front of all http in nodes. This allows custom authentication to be
    // applied to all http in nodes, or any other sort of common request processing.
    // httpNodeMiddleware: function(req,res,next) {
    //  next();
    // },

    // Anything in this hash is globally available to all functions.
    // It is accessed as context.global.
    // eg:
    functionGlobalContext: { 
        os:require('os'),
        seneca: require('seneca'),
        _: require('underscore'),
        jade: require('jade')
    },
    // can be accessed in a function block as:
    //    context.global.os

    // functionGlobalContext: {
        // os:require('os'),
        // octalbonescript:require('octalbonescript'),
        // jfive:require("johnny-five"),
        // j5board:require("johnny-five").Board({repl:false})
    // },

    // The following property can be used to order the categories in the editor
    // palette. If a node's category is not in the list, the category will get
    // added to the end of the palette.
    // If not set, the following default order is used:
    //paletteCategories: ['subflows', 'input', 'output', 'function', 'social', 'mobile', 'storage', 'analysis', 'advanced'],

    // Configure the logging output
    logging: {
        // Only console logging is currently supported
        console: {
            // Level of logging to be recorded. Options are:
            // fatal - only those errors which make the application unusable should be recorded
            // error - record errors which are deemed fatal for a particular request + fatal errors
            // warn - record problems which are non fatal + errors + fatal errors
            // info - record information about the general running of the application + warn + error + fatal errors
            // debug - record information which is more verbose than info + info + warn + error + fatal errors
            // trace - record very detailed logging + debug + info + warn + error + fatal errors
            level: "debug",

            // Whether or not to include metric events in the log output
            metrics: false,
            // Whether or not to include audit events in the log output
            audit: false
        }
    },
    swagger: {
      "template": {
        "swagger": "2.0",
        "info": {
          "title": "DLI Encyclopedia of Dry Cleaning",
          "version": "0.1.0"
        }
      }
    }
  }
};
