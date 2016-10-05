'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the Toccata ' + chalk.red('App Generator') + '!'
    ));

    var prompts = [{
      type    : 'input',
      name    : 'name',
      message : 'App Name',
      default : this.appname // Default to current folder name
    },
    {
      type    : 'input',
      name    : 'description',
      message : 'App Description',
      default : "Server-side template software for building web applications using seneca, node.js, and node-red"
    },
    {
      type    : 'input',
      name    : 'author',
      message : 'Author Name',
      default : "John O'Connor (sax1johno@gmail.com)"
    },
    ];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.config.set("networkName", props.networkName);
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    this.fs.copy(
        this.templatePath('nginx/**/*'),
        this.destinationPath("nginx")
    );
    this.fs.copy(
      this.templatePath('docker-compose.yml'),
      this.destinationPath('docker-compose.yml')
    );
    this.fs.copy(
      this.templatePath('docker-compose.override.yml'),
      this.destinationPath('docker-compose.override.yml')
    );
    this.fs.copy(
      this.templatePath('docker-compose.production.yml'),
      this.destinationPath('docker-compose.production.yml')
    );

    this.fs.copy(
      this.templatePath('service-types.yml'),
      this.destinationPath('service-types.yml')
    );

    this.fs.copyTpl(
      this.templatePath('package.json'),
      this.destinationPath('package.json'),
      {
          name: this.props.name,
          description: this.props.description,
          author: this.props.author
      }
    );
    this.mkdir('sites');
    this.fs.copy(
      this.templatePath('README.md'),
      this.destinationPath('README.md')
    );
  },

  install: function () {
//    this.installDependencies();
  }
});
