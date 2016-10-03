'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var yaml = require('yamljs'); // For parsing the docker-container.yml file.
var nginxConf = require('nginx-conf').NginxConfFile; // for parsing the nginx.conf file.

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the ' + chalk.red('toccata') + ' site generator!'
    ));

    var siteNameSuffix = (this.config.get("siteNumber") + 1) || 1;
    var sites = (this.config.get("sites") || []);

    var prompts = [{
      type    : 'input',
      name    : 'name',
      message : 'Site Name',
      default : "Site" + siteNameSuffix
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
    },
    {
      type    : "input",
      name    : "networkName",
      message : "Internal Network Name",
      default : this.sitename // default to current folder name.
    }
    ];      

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.config.set("siteNumber", siteNameSuffix);
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    // var lowerName = this.props.name.toLowerCase();    

    // Set up the site in the docker-compose file
    var dockerCompose = yaml.load('docker-compose.yml');
    var dockerComposeOverride = yaml.load("docker-compose.override.yml");
    var dockerComposeProduction = yaml.load("docker-compose.production.yml");

    var nodeRedServiceName = this.props.name + "_node-red";
    // Add to the nginx container.
    if (!dockerCompose.services["nginx"].networks) {
      dockerCompose.services["nginx"].networks = []; 
    }
    dockerCompose.services["nginx"].networks.push(this.props.networkName);    
    dockerCompose.services[nodeRedServiceName] = {
      "extends": {
        file: "service-types.yml",
        service: "node-red"
      },
      "build": "sites/" + this.props.name,
      "ports": [
        '80'
      ],
      "restart": "always",
      "depends_on": [
        "nginx"
      ],
      "networks": {
      },
      "links": []
    };

    if (!dockerCompose.networks) {
      dockerCompose.networks = {};
    }
    dockerCompose.networks[this.props.networkName] = {};
    var networks = {
      "networks": dockerCompose.networks
    }

    // delete dockerCompose.networks;
    var lowerName = this.props.name.toLowerCase();
    var capName = this.props.name.toLowerCase().substr(0, 1).toUpperCase() + this.props.name.substr(1);    

    dockerCompose.services[nodeRedServiceName].networks[this.props.networkName] = {
      "aliases": [
        this.props.name + "_node-red"
      ]
    }

    dockerCompose.services[nodeRedServiceName].links = [];
    dockerCompose.services[nodeRedServiceName].links.push(this.props.name + '_views');


    // Add in views.
    dockerCompose.services[this.props.name + "_views"] = {
      "extends": {
        "file": "service-types.yml",
        "service": "microservice"
      },
      "build": "/sites/" + this.props.name + "/components/Views",
      "restart": "always",
      "networks": {
      }.
      "expose": [
        "10201"
      ]
    }

    dockerCompose.services[this.props.name + "_views"].networks[this.props.networkName] = {
      "aliases": [
        this.props.name + '_views'
      ]
    }


    if (!dockerComposeOverride.services) {
      dockerComposeOverride.services = [];
    }
    dockerComposeOverride.services[nodeRedServiceName] = {
      "environment": [
            "NODE_ENV=development",
            "ENV=development"
      ],
        "volumes": [
            - './sites/' + this.props.name + '/flows:/usr/src/flows'
            - './sites/' + this.props.name + '/public:/usr/src/public'
        ]
    }
    if (!dockerComposeProduction.services) {
      dockerComposeProduction.services = [];
    }
    dockerComposeProduction.services[nodeRedServiceName] = {
      "environment": [
            "NODE_ENV=production",
            "ENV=production"
      ],
    }

    var YAMLString = yaml.stringify(dockerCompose, 6);
    var overrideString = yaml.stringify(dockerComposeOverride, 6);
    var productionString = yaml.stringify(dockerComposeProduction, 6);
    var networkString = yaml.stringify(networks, 2);
    YAMLString += networkString;
    this.fs.write("docker-compose.yml", YAMLString);
    this.fs.write("docker-compose.override.yml", overrideString);
    this.fs.write("docker-compose.production.yml", productionString);


    var done = this.async();
    // Add this site to the nginx.conf file as a separate server.
    nginxConf.create("nginx/nginx.conf", function(err, conf) {
      if (err) {
        done(err);
        console.error(err);
      }

      conf.nginx.http._add('server');
      conf.nginx.http.server._add('listen', '80');
      conf.nginx.http.server._add("set", "$alias", nodeRedServiceName);
      conf.nginx.http.server._add('server_name', this.props.name);
      conf.nginx.http.server._add('location', '/');
      conf.nginx.http.server.location._add('proxy_pass', 'http://$alias');
      conf.nginx.http.server.location._add('proxy_http_version', '1.1');
      conf.nginx.http.server.location._add('proxy_set_header', 'Upgrade', '$http_upgrade');
      conf.nginx.http.server.location._add('proxy_set_header', 'Connection', '"upgrade"');
      conf.nginx.http.server.location._add('client_max_body_size', '0');
      conf.flush();
      done();
    });


    /// Create the sites folder and start copying stuff.
    this.mkdir("sites/" + this.props.name);
    this.destinationRoot("sites/" + this.props.name);    
    this.fs.copy(
      this.templatePath('app.js'),
      this.destinationPath('app.js')
    );
    this.mkdir('config');
    this.fs.copyTpl(
        this.templatePath("config/*"),
        this.destinationPath("config"),
        {
            name: this.props.name,
            flowsFile: this.props.flowsFile
        }
    );

    // this.fs.copyTpl(
    //   this.templatePath('docker-compose.yml'),
    //   this.destinationPath('docker-compose.yml'),
    //   {
    //     networkName: this.props.networkName
    //   }
    // );
    // this.fs.copy(
    //   this.templatePath('docker-compose.override.yml'),
    //   this.destinationPath('docker-compose.override.yml')
    // );
    // this.fs.copy(
    //   this.templatePath('docker-compose.production.yml'),
    //   this.destinationPath('docker-compose.production.yml')
    // );
    // TODO: Do a CopyTPL for the main docker-compose files.
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
    this.mkdir('public/components');
    this.mkdir('flows');
    this.fs.copy(
      this.templatePath('README.md'),
      this.destinationPath('README.md')
    );
    this.fs.copy(
      this.templatePath('service-types.yml'),
      this.destinationPath('service-types.yml')
    );
    sites.push({
      "name": this.props.name,
      "networkName": props.networkName
      });
    this.config.set("sites", sites);
  },

  install: function () {
//    this.installDependencies();
  }
});
