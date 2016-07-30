var sutil = require('util');

var seneca = require('seneca')();

var pluginName = "<%= name %>";

seneca
  .use('seneca-entity')
  .use('./lib/index', {"pluginName": pluginName})
  .listen({type: 'tcp'})
  .ready(function(err) {
    // Initialize views after the service has been made ready.
    if (err) process.exit(1);
        var viewPath = path.resolve(__dirname, "views");
         fs.readdir(viewPath, function(err, files) {
             if (err) {
                 seneca.log.error(err);
             } else {
                 async.each(files, function(file, cb) {
                     if (err) {
                         cb(err);
                     } else {
                         var view = {};
                         view.plugin = pluginName;
                         view.ext = require('path').extname(file);
                         view.name = require('path').basename(file, view.ext);
                         view.path = path.resolve(viewPath, file);
                         view.template = fs.readFileSync(view.path).toString();
                         seneca.act({
                             role: "views",
                             cmd: "add", 
                             name: view.name,
                             plugin: view.plugin,
                             ext: view.ext,
                             template: view.template
                         }, function(err, result) {
                              console.log("view result for ", view.name, " is ", result);
                             if (err) {
                                 cb(err);
                             } else {
                                 cb();
                             }
                         });
                     }
                 }, function(err) {
                     if (err) {
                         seneca.log.error(err);
                     }
                 });
             }
         });
  });    