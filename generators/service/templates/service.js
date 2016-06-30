var sutil = require('util');

var seneca = require('seneca')();

seneca
  .use('views')
  .use('seneca-entity')
  .use('./lib/index')
  .listen({type: 'tcp', port: <%= port %>});