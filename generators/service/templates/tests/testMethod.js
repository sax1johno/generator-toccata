var seneca = require('seneca')(),
    assert = require('assert'),
    _ = require('underscore'),
    client;
    
describe('Users', function() {
//     before(function(done) {
//         // load up the microservice client.
//         this.timeout(5000);
//         client = seneca.client({type: 'tcp', port: 1112});
//         console.log("Client should be spun up");
//         client.act({ "role": "Admin", "cmd": "ping"}, function(err, result) {
//             console.log("ping result was ", result);
//             done(err);
//         });
//     });
//     
//     describe('#render', function(done) {
//         it('should render the service hub', function(done) {
//             this.timeout(5000);
//             client = seneca.client({type: 'tcp', port: 1112});
//             seneca.act({
//                 "plugin": "Admin",
//                 "role": "views",
//                 "cmd": "render",
//                 "name": "dashboard",
//                 "locals": {
//                 }
//             }, function(err, rend) {
//                 console.log(rend);
//                 if (!rend) {
//                     done("View not found");
//                 } else {
//                     done(err, rend);
//                 }
//             });
//         });
//     });
});
