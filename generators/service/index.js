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
    var mySites = this.config.get("sites").map(function(site) {
      return site.name;
    });
    var servicePort = (this.config.get('servicePort') + 1) || 1000;
    var serviceNumber = (this.config.get("serviceNumber") + 1) || 1;
    var prompts = [
    {
      type: 'list',
      name: 'site',
      message: 'Choose a site for this service: ',
      choices: mySites
    },
    {
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
    }
    ];

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
    var dockerComposeProduction = yaml.load("docker-compose.production.yml");    
    var networks = {
      "networks": dockerCompose.networks
    }
    delete dockerCompose.networks;
    var lowerName = this.props.name.toLowerCase();
    var capName = this.props.name.toLowerCase().substr(0, 1).toUpperCase() + this.props.name.substr(1);
    var nodeRedServiceName = lowerName + "_node-red"; 
    var lowerSiteName = this.props.site.toLowerCase();
    var generator = this;

    var chosenSite = this.config.get("sites").filter(function(site) {
      console.log("Site name = ", site.name);
      console.log("Generator site = ", generator.props.site);
      if (site.name == generator.props.site) {
        return true;
      }
    })[0];

    dockerCompose.services[lowerSiteName + "_" + lowerName] = {
        "extends": {
            file: "service-types.yml",
            service: "microservice"
        },
        "build": "sites/" + chosenSite.name + "/components/" + capName,
        "networks": {
        },
        "restart": "unless-stopped",
        "expose": [
            '10201'
        ],
        "links": [
          lowerSiteName + "_views"
        ]
    };

    var networkName = chosenSite.networkName.toLowerCase();
    console.log(JSON.stringify(networkName));

    dockerCompose.services[lowerSiteName + "_" + lowerName].networks[networkName] = {
      "aliases": [
        lowerName
      ]
    }

    dockerComposeOverride.services[lowerSiteName + "_" + lowerName] = {
      "environment": [
            "NODE_ENV=development",
            "ENV=development"
      ],
        "volumes": [
            './sites/' + this.props.site + '/flows:/usr/src/flows',
            './sites/' + this.props.site + '/public:/usr/src/public'
        ]
    }

    dockerComposeProduction.services[lowerSiteName + "_" + lowerName] = {
      "environment": [
            "NODE_ENV=production",
            "ENV=production"
      ],
    }


    if (!dockerCompose.services[lowerSiteName + "_node-red"].links) {
        dockerCompose.services[lowerSiteName + "_node-red"].links = [];
    }
    dockerCompose.services[lowerSiteName + "_node-red"].links.push(lowerSiteName + "_" + lowerName);
    var YAMLString = yaml.stringify(dockerCompose, 6);
    var overrideString = yaml.stringify(dockerComposeOverride, 6);
    var productionString = yaml.stringify(dockerComposeProduction, 6);
    var networkString = yaml.stringify(networks, 2);
    YAMLString += networkString;
    this.fs.write("docker-compose.yml", YAMLString);
    this.fs.write("docker-compose.override.yml", overrideString);
    this.fs.write("docker-compose.production.yml", productionString);
    this.destinationRoot("sites/" + this.props.site);
    this.mkdir("components/" + capName);
    this.mkdir("public/components/" + capName);
    this.destinationRoot("components/" + capName);
    this.fs.copyTpl(
      this.templatePath('Dockerfile'),
      this.destinationPath('Dockerfile'),
      {
          port: 10201
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
            port: 10201
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
            port: 10201
        }
    );
    this.mkdir('views');
  },
    
  install: function () {
//    this.installDependencies();
  }
});
