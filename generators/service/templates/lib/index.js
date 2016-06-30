var _ = require('underscore'),
    path = require('path'),
    fs = require('fs'),
    async = require('async');

module.exports = function(options) {
    var pluginName = "<plugin_name>";
    
    var seneca = this;

    // Specify other service dependencies here.
    // Views is used by default. 
    seneca.depends(pluginName,[
        'views'
    ]);
    
    options = seneca.util.deepextend({
    },options);
    
    /**
     * Initialize the ServiceHub
     **/
    seneca.add({init:pluginName}, function(args, done) {
    	// By default, we'll add views when the plugin is initialized.
//         var viewPath = path.resolve(__dirname, "../views");
//         fs.readdir(viewPath, function(err, files) {
//             if (err) {
//                 done(err);
//             } else {
//                 async.each(files, function(file, cb) {
//                     if (err) {
//                         cb(err);
//                     } else {
//                         var view = {};
//                         view.plugin = pluginName;
//                         view.ext = require('path').extname(file);
//                         view.name = require('path').basename(file, view.ext);
//                         view.path = path.resolve(viewPath, file);
//                         view.template = fs.readFileSync(view.path);
//                         seneca.act({
//                             role: "views",
//                             cmd: "add", 
//                             name: view.name,
//                             plugin: view.plugin,
//                             ext: view.ext,
//                             template: view.template
//                         }, function(err, result) {
//                             // console.log("view result for ", view.name, " is ", result);
//                             if (err) {
//                                 cb(err);
//                             } else {
//                                 cb();
//                             }
//                         });
//                     }
//                 }, function(err) {
//                     if (err) {
//                         done(err);
//                     } else {
//                         done();
//                     }
//                 });
//             }
//         }); 
    });
    
    /**
     * Ping service allows other programs to determine whether or not a
     * service is avaialble and responding to command patterns.
     **/
    seneca.add({
        "role": pluginName,
        "cmd": "ping"
    }, function(args, done) {
        done(null, {name:  pluginName});
    });
    
    return {
        "name": pluginName
    };
};