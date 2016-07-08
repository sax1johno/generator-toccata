'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var yaml = require('yamljs'); // For parsing the docker-container.yml file.

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the glorious ' + chalk.red('generator-toccata') + ' model generator!'
    ));

    var prompts = [{
      type    : 'input',
      name    : 'name',
      message : 'What is your model name?',
      default : "User" // Default to current folder name
    }];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.name;
      this.config.set("name", props.name);
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    var schema = {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "type": "object",
      "properties": {
        "title": {
          "type": "string"
        },
        "icon": {
          "type": "string"
        },
        "link": {
          "type": "string"
        },
        "template": {
          "type": "string"
        },
        "content": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "avatar": {
                "type": "string"
              },
              "message": {
                "type": "string"
              },
              "timestamp": {
                "type": "string"
              }
            }
          }
        }
      }
    }    
    this.mkdir(__dirname + "/models");
    this.destinationRoot(__dirname + "/models");
    this.fs.writeJSON(this.props.name, schema);
  },
    
  install: function () {
//    this.installDependencies();
  }
});
