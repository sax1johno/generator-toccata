'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var yaml = require('yamljs'); // For parsing the docker-container.yml file.

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the glorious ' + chalk.red('generator-toccata') + ' generator!'
    ));

    var servicePort = (this.config.get('servicePort') + 1) || 1000;
    var serviceNumber = (this.config.get("serviceNumber") + 1) || 1;
    var prompts = [{
      type    : 'input',
      name    : 'name',
      message : 'What is your service name?',
      default : "Service" + serviceNumber // Default to current folder name
    },
    {
        type: 'input',
        name: 'description',
        message: "Description of the service:",
        default: "A seneca.js based microservice"
    },
    {
        type: 'input',
        name: 'author',
        message: "Service author:",
        default: "Joe Sample (sample@example.com)"
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
      this.config.set("serviceNumber", serviceNumber);
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    var dockerCompose = yaml.load('docker-compose.yml');
    var dockerComposeOverride = yaml.load("docker-compose.override.yml");
    var lowerName = this.props.name.toLowerCase();
    var capName = this.props.name.toLowerCase().substr(0, 1).toUpperCase() + this.props.name.substr(1);    
    dockerCompose.services[lowerName] = {
        "extends": {
            file: "service-types.yml",
            service: "microservice"
        },
        "build": "./components/" + capName,
        "ports": [
            '10201'
        ],
        "networks": {
          "app": {
            "aliases": [
              "" + lowerName
            ]
          }
        },
        "restart": "always"
    };

    dockerComposeOverride.services[lowerName] = {
        "volumes": [
            './components/' + capName + '/views:/usr/src/views',
            './components/' + capName + '/models:/usr/src/models'            
        ]
    }

    if (dockerCompose.services["node-red"].links) {
        dockerCompose.services["node-red"].links.push(lowerName)
    } else {
        dockerCompose.services["node-red"].links = [];
        dockerCompose.services["node-red"].links.push(lowerName)        
    }
    var YAMLString = yaml.stringify(dockerCompose, 5);
    var overrideString = yaml.stringify(dockerComposeOverride, 5);
    console.log("Yaml string = ", YAMLString);
    this.fs.write("docker-compose.yml", YAMLString);
    this.fs.write("docker-compose.override.yml", overrideString);
    this.mkdir("components/" + capName);
    this.mkdir("public/components/" + capName);
    this.destinationRoot("components/" + capName);
    this.fs.copyTpl(
      this.templatePath('Dockerfile'),
      this.destinationPath('Dockerfile'),
      {
          port: this.props.port
      }
    );
    this.mkdir('lib');
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
    this.mkdir('models');
    this.fs.copyTpl(
      this.templatePath('package.json'),
      this.destinationPath('package.json'),
      {
          name: capName,
          description: this.props.description,
          author: this.props.author
      }
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
