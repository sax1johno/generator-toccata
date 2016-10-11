var sutil = require('util');

var seneca = require('seneca')();

// The only thing this does is serve up all of the views in this application and expose
// them as a service in a separate container.
seneca
  .use('seneca-entity')
  .use('views')
  .use('mem-store',{ map:{
  '-/-/views':'*'
  }})
  .listen({type: 'tcp'});