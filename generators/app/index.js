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
    {
      type    : 'input',
      name    : 'flowsFile',
      message : 'Flow File Name',
      default : "myapp"
    }
    ];      

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    this.mkdir('components');
    this.fs.copy(
      this.templatePath('app.js'),
      this.destinationPath('app.js')
    );
    this.mkdir('config');
    this.fs.copyTpl(
        this.templatePath("config/*"),
        this.destinationPath("config"),
        {
            name: name,
            flowsFile: this.props.flowsFile
        }
    );
    this.fs.copy(
      this.templatePath('docker-compose.yml'),
      this.destinationPath('docker-compose.yml')
    );
    this.fs.copy(
      this.templatePath('Dockerfile'),
      this.destinationPath('Dockerfile')
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
    this.mkdir('public');
    this.mkdir('public/css');
    this.mkdir('public/js');
    this.mkdir('public/img');
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
