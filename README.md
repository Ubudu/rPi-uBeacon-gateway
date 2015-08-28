# Raspberry Pi uBeacon Gateway

## Introduction

This is the project for the web graphical user interface available on the RaspberryPi to manage local beacons.

## Getting started

### Installation

Run ```npm install``` to install all the dependencies.

### Configuration

Configuration variables, such as the app port, the serial port for UART communication, etc... should be provided to the app via ENV variables.

This is to be compliant with the [http://12factor.net/](Twelve Factor App) principles. This way, we can have:

* Different configuration values for each environment without versioning configuration files,
* Different ways to run the Node.js program depending on the environment ([https://github.com/petruisfan/node-supervisor](supervisor), [https://github.com/foreverjs/forever](forever), [https://github.com/Unitech/pm2](PM2), ...).

### Running in dev mode

In dev mode, I use [https://toolbelt.heroku.com/](Foreman) which is part of the Heroku Toolbelt.
It's a great tool to ensure multiple processes run simultaneously and with the correct environment variables.

A ```Procfile``` file specifies which processes should run and a ```.env``` file specifies the ENV variables.

To get up and running, copy the ```Procfile.dist``` and ```.env.dist``` into a ```Procfile``` and a ```.env``` and update them to suit your needs.

Now run:

    foreman start

[https://github.com/petruisfan/node-supervisor](supervisor) is a great tool in development to ensure the app is restarted whenever there is a JS file change.

With the [http://livereload.com](Chrome LiveReload plugin) installed, in dev mode, whenever a file in /public or a Jade view changes, the web page is reloaded.

### Running in production

There are also multiple options, [https://github.com/Unitech/pm2](PM2) is one of them.

To use PM2, simply copy ```.env.dist``` into ```.env```, update the config to suit your needs and run:

    pm2 start bin/www
