'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var yaml = require('js-yaml'); // For parsing the docker-container.yml file.

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the glorious ' + chalk.red('generator-toccata') + ' generator!'
    ));

    var servicePort = (this.config.get('servicePort') + 1) || 1000;
    var prompts = [{
      type    : 'input',
      name    : 'name',
      message : 'What is your service name?',
      default : this.appname // Default to current folder name
    },
    {
      type    : 'input',
      name    : 'port',
      message : 'Which port should this service run on?',
      default : servicePort // Default to current folder name    
    }];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.name;
      this.config.set("servicePort", servicePort);
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    this.mkdir("components/" + this.props.name);
    this.destinationRoot("components/" + this.props.name);
    this.fs.copy(
      this.templatePath('Dockerfile'),
      this.destinationPath('Dockerfile')
    );
    this.mkdir('lib');
    var capName = this.props.name.substr(0, 1).toUpperCase() + this.props.name.substr(1);
    this.fs.copyTpl(
      this.templatePath('lib/index.js'),
      this.destinationPath('lib/index.js'),
        { serviceName: capName}
    );
    this.mkdir('tests');
    this.fs.copyTpl(
        this.templatePath("tests/*"),
        this.destinationPath("tests"),
        { 
            name: capName,
            port: this.props.port
        }
    );
    this.fs.copy(
      this.templatePath('package.json'),
      this.destinationPath('package.json')
    );
    this.fs.copy(
      this.templatePath('README.md'),
      this.destinationPath('README.md')
    );
    this.fs.copyTpl(
      this.templatePath('service.js'),
      this.destinationPath('service.js'),
        { 
            name: capName,
            port: this.props.port
        }        
    );
    this.mkdir('views');
  },
    
  install: function () {
//    this.installDependencies();
  }
});
