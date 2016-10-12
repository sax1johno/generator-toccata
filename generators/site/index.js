'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var yaml = require('yamljs'); // For parsing the docker-container.yml file.
var nginxConf = require('nginx-conf').NginxConfFile; // for parsing the nginx.conf file.
var q = require('q');


module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the ' + chalk.red('toccata') + ' site generator!'
    ));

    console.log("Site number is " + this.config.get("siteNumber"));
    var siteNameSuffix = (this.config.get("siteNumber") + 1) || 1;
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
      default : "Site" + siteNameSuffix // default to current folder name.
    }
    ];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      // console.log("in prompt promise", siteNameSuffix);
      this.config.set("siteNumber", siteNameSuffix);
      // console.log("afterward, siteNumber = ", this.config.get("siteNumber"));
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    var writingDefer = q.defer();
    var lowerName = this.props.name.toLowerCase();
    var networkName = this.props.networkName.toLowerCase();
    // Set up the site in the docker-compose file
    var dockerCompose = yaml.load('docker-compose.yml');
    var dockerComposeOverride = yaml.load("docker-compose.override.yml");
    var dockerComposeProduction = yaml.load("docker-compose.production.yml");

    var nodeRedServiceName = lowerName + "_node-red";
    // Add to the nginx container.
    if (!dockerCompose.services["nginx"].networks) {
      dockerCompose.services["nginx"].networks = []; 
    }
    dockerCompose.services["nginx"].networks.push(networkName);
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
    dockerCompose.networks[networkName] = {};
    var networks = {
      "networks": dockerCompose.networks
    }

    delete dockerCompose.networks;
    // var lowerName = this.props.name.toLowerCase();
    var capName = this.props.name.toLowerCase().substr(0, 1).toUpperCase() + this.props.name.substr(1);    

    dockerCompose.services[nodeRedServiceName].networks[networkName] = {
      "aliases": [
        lowerName + "_node-red"
      ]
    }

    dockerCompose.services[nodeRedServiceName].links = [];
    dockerCompose.services[nodeRedServiceName].links.push(lowerName + '_views');


    // Add in views.
    dockerCompose.services[lowerName + "_views"] = {
      "extends": {
        "file": "service-types.yml",
        "service": "microservice"
      },
      "build": "sites/" + this.props.name + "/components/Views",
      "restart": "always",
      "networks": {
      },
      "expose": [
        "10201"
      ]
    }

    dockerCompose.services[lowerName + "_views"].networks[networkName] = {
      "aliases": [
        lowerName + '_views'
      ]
    }


    if (!dockerComposeOverride.services) {
      dockerComposeOverride.services = {};
    }
    dockerComposeOverride.services[nodeRedServiceName] = {
      "environment": [
            "NODE_ENV=development",
            "ENV=development"
      ],
        "volumes": [
            './sites/' + this.props.name + '/flows:/usr/src/flows',
            './sites/' + this.props.name + '/public:/usr/src/public'
        ]
    }
    dockerComposeOverride.services[lowerName + "_views"] = {
      "environment": [
            "NODE_ENV=development",
            "ENV=development"
      ],
        "volumes": [
            './sites/' + this.props.name + '/components/Views/views:/usr/src/views',
            './sites/' + this.props.name + '/components/Views/models:/usr/src/models'
        ]
    }    
    if (!dockerComposeProduction.services) {
      dockerComposeProduction.services = {};
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

    var generator = this;
    // Add this site to the nginx.conf file as a separate server.
    nginxConf.create(process.env.PWD + "/nginx/nginx.conf", function(err, conf) {
      if (err) {
        writingDefer.reject(err);
      }
      // console.log(conf.nginx);      

      conf.nginx.http._add('server');
      if (!Array.isArray(conf.nginx.http.server)) {
        conf.nginx.http.server._add('listen', '80');
        conf.nginx.http.server._add("set $alias", '"' + nodeRedServiceName + '"');
        conf.nginx.http.server._add('location', '/');
        conf.nginx.http.server.location._add('proxy_pass', 'http://$alias');
        conf.nginx.http.server.location._add('proxy_http_version', '1.1');
        conf.nginx.http.server.location._add('proxy_set_header Upgrade', '$http_upgrade');
        conf.nginx.http.server.location._add('proxy_set_header Connection', '"upgrade"');
        conf.nginx.http.server.location._add('client_max_body_size', '0');        
      } else {
        var i = conf.nginx.http.server.length - 1;
        conf.nginx.http.server[i]._add('listen', '80');
        conf.nginx.http.server[i]._add("set $alias", nodeRedServiceName);
        conf.nginx.http.server[i]._add('server_name', generator.props.name);
        conf.nginx.http.server[i]._add('location', '/');
        conf.nginx.http.server[i].location._add('proxy_pass', 'http://$alias');
        conf.nginx.http.server[i].location._add('proxy_http_version', '1.1');
        conf.nginx.http.server[i].location._add('proxy_set_header Upgrade', '$http_upgrade');
        conf.nginx.http.server[i].location._add('proxy_set_header Connection', '"upgrade"');
        conf.nginx.http.server[i].location._add('client_max_body_size', '0');
      }
      // conf.on('flushed', function() {
      //   console.log('finished writing to disk');
      //   done();        
      // });
      // Add to the sites array BEFORE changing the destination root. Otherwise it'll write
      // to the wrong spot.
        var sites = (generator.config.get("sites") || []);      
        sites.push({
          "name": generator.props.name,
          "networkName": generator.props.networkName
          });
        generator.config.set("sites", sites);

       /// Create the sites folder and start copying stuff.                
        generator.mkdir("sites/" + generator.props.name);
        generator.destinationRoot("sites/" + generator.props.name);    
        generator.fs.copy(
          generator.templatePath('app.js'),
          generator.destinationPath('app.js')
        );
        generator.mkdir('config');
        generator.fs.copyTpl(
            generator.templatePath("config/*"),
            generator.destinationPath("config"),
            {
                name: generator.props.name,
                flowsFile: generator.props.flowsFile
            }
        );

        generator.mkdir("components");
        generator.fs.copy(
          generator.templatePath("components/**/*"),
          generator.destinationPath("components")
        );
        // generator.fs.copyTpl(
        //   generator.templatePath('docker-compose.yml'),
        //   generator.destinationPath('docker-compose.yml'),
        //   {
        //     networkName: generator.props.networkName
        //   }
        // );
        // generator.fs.copy(
        //   generator.templatePath('docker-compose.override.yml'),
        //   generator.destinationPath('docker-compose.override.yml')
        // );
        // generator.fs.copy(
        //   generator.templatePath('docker-compose.production.yml'),
        //   generator.destinationPath('docker-compose.production.yml')
        // );
        // TODO: Do a CopyTPL for the main docker-compose files.
        generator.fs.copy(
          generator.templatePath('Dockerfile'),
          generator.destinationPath('Dockerfile')
        );
        generator.fs.copyTpl(
          generator.templatePath('package.json'),
          generator.destinationPath('package.json'),
          {
              name: generator.props.name,
              description: generator.props.description,
              author: generator.props.author
          }
        );
        generator.mkdir('public');
        generator.mkdir('public/css');
        generator.mkdir('public/js');
        generator.mkdir('public/img');
        generator.mkdir('public/components');
        generator.mkdir('flows');
        generator.fs.copy(
          generator.templatePath('README.md'),
          generator.destinationPath('README.md')
        );
        generator.fs.copy(
          generator.templatePath('service-types.yml'),
          generator.destinationPath('service-types.yml')
        );
        writingDefer.resolve();
    });
    return writingDefer.promise;
  },

  install: function () {
//    this.installDependencies();
  }
});
