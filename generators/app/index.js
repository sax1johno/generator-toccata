'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the bee\'s knees ' + chalk.red('generator-toccata') + ' generator!'
    ));

    var prompts = [{
      type: 'confirm',
      name: 'someAnswer',
      message: 'Would you like to enable this option?',
      default: true
    }];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    this.fs.copy(
      this.templatePath('components'),
      this.destinationPath('components')
    );
    this.fs.copy(
      this.templatePath('app.js'),
      this.destinationPath('app.js')
    );
    this.fs.copy(
      this.templatePath('config'),
      this.destinationPath('config')
    );
    this.fs.copy(
      this.templatePath('docker-compose.yml'),
      this.destinationPath('docker-compose.yml')
    );
    this.fs.copy(
      this.templatePath('Dockerfile'),
      this.destinationPath('Dockerfile')
    );
    this.fs.copy(
      this.templatePath('package.json'),
      this.destinationPath('package.json')
    );
    this.fs.copy(
      this.templatePath('public'),
      this.destinationPath('public')
    );
    this.fs.copy(
      this.templatePath('README.md'),
      this.destinationPath('README.md')
    );
    this.fs.copy(
      this.templatePath('service-types.yml'),
      this.destinationPath('service-types.yml')
    );

  },

  install: function () {
    this.installDependencies();
  }
});
