var seneca = require('seneca')(),
    assert = require('assert'),
    _ = require('underscore'),
    client;
    
describe('<%= name %>', function() {
     before(function(done) {
         // load up the microservice client.
         this.timeout(5000);
         client = seneca.client({type: 'tcp', port: <%= port %>});
         client.act({ "role": "<%= name %>", "cmd": "ping"}, function(err, result) {
             console.log("ping result was ", result);
             done(err);
         });
     });

});
