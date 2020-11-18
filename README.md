# PeNDeS

PeNDeS is a domain specific modeling language (dsml) tool used to build petrinets. The modeling environment ensures that any defined petrinet conforms to the domain [rules](https://en.wikipedia.org/wiki/Petri_net) which govern petrinets while providing an easy interface with which to simulate functionality and evaluate characteristics. Specifically, PeNDeS evaluates if a petrinet can be classified as a workflow, marked graph, state machine, or free choice net. PeNDeS and the foundational software (webgme) are open source and readily extendable.

## Petrinets

Petrinets are 

## Dependency Prerequisites  
#### Install these before attempting to clone the repository

- [NodeJS](https://nodejs.org/en/download/package-manager/) (LTS recommended)  
Verify dependency satisfaction by issuing `node --version` in the command prompt to see the current available version.

- [NPM](https://www.npmjs.com/get-npm)  
Verify dependency satisfaction with `npm --version`

- [MongoDB](https://docs.mongodb.com/manual/installation/)  
After installing, start mongodb locally by running the `mongod` executable in your mongodb installation (you may need to create a `data` directory or set `--dbpath`).

- [python3](https://docs.python-guide.org)  
Verify dependency satisfaction with `python3 --version`

  * [webgme-bindings](https://pypi.org/project/webgme-bindings/)  
  Used to call python files

  * [mako](https://pypi.org/project/Mako/)  
  Templating package used to generate formula code

- [.NET](https://dotnet.microsoft.com/download) (Must be Core 3.1)  
Verify dependency satisfaction with `dotnet --version`

## Installation
with mongodb running locally do the following:
1. clone this repository to the desired project directory `git clone https://github.com/JesseTNRoberts/PeNDeS`
2. open a terminal in the root directory (where the readme.md file is located)
3. `npm install` - to get dependencies
4. `npm install webgme` - to get the peer dependencies
5. `npm start` - to run the server
6. navigate to `http://localhost:8888` to start using PeNDeS!

## Get started modeling

Once you have successfully installed PeNDeS and have navigated to `http://localhost:8888` you should see the project creation interface.

<p align="center">
  <img src="/images/project%20creation.png" width="256" height="375">
  <img src="/images/project%20naming.png" width="256" height="375">
  <img src="/images/seed.png" width="256" height="375">
  <img src="/images/landing.png" width="256" height="375">
</p>

## Development

- [Webgme-cli](https://github.com/webgme/webgme-cli
If you would like to extend this studio, download and install webgme-cli. This will provide a command line interface with which to manipulate webgme projects like PeNDeS.


