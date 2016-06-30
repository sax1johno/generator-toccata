'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the glorious ' + chalk.red('generator-toccata') + ' generator!'
    ));

    var prompts = [{
      type    : 'input',
      name    : 'name',
      message : 'Your service name',
      default : this.appname // Default to current folder name
    }];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.name;
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
    this.fs.copy(
      this.templatePath('lib/*'),
      this.destinationPath('lib')
    );
    this.mkdir('tests');
    this.fs.copy(
        this.templatePath("tests/*"),
        this.destinationPath("tests")
    );
    this.fs.copy(
      this.templatePath('package.json'),
      this.destinationPath('package.json')
    );
    this.fs.copy(
      this.templatePath('README.md'),
      this.destinationPath('README.md')
    );
    this.fs.copy(
      this.templatePath('service.js'),
      this.destinationPath('service.js')
    );      
  },
    
  install: function () {
//    this.installDependencies();
  }
});
