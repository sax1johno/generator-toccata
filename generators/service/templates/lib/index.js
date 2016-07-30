var _ = require('underscore'),
    path = require('path'),
    fs = require('fs'),
    async = require('async');

module.exports = function(options) {    
    var seneca = this;

    // Specify other service dependencies here.
    
    options = seneca.util.deepextend({
    },options);
    
    var pluginName = options.pluginName;
    
    /**
     * Initialize the ServiceHub
     **/
    seneca.add({init:pluginName}, function(args, done) {
        done();
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