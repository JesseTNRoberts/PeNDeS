# PeNDeS
## Prerequisites

- [NodeJS](https://nodejs.org/en/download/package-manager/) (LTS recommended)

Verify dependency satisfaction by issuing `node --version` in the command prompt to see the current available version.

- [NPM](https://www.npmjs.com/get-npm) 

Verify dependency satisfaction with `npm --version`

- [MongoDB](https://docs.mongodb.com/manual/installation/)

After installing, start mongodb locally by running the `mongod` executable in your mongodb installation (you may need to create a `data` directory or set `--dbpath`).

- [python3](https://docs.python-guide.org) 

Verify dependency satisfaction with `python3 --version`

- [.NET](https://dotnet.microsoft.com/download) (Core recommended)

Verify dependency satisfaction with `dotnet --version`

## Installation
with mongodb running locally do the following:
1. clone this repository to the desired project directory `git clone https://github.com/JesseTNRoberts/PeNDeS`
2. open a terminal in the root directory (where the readme.md file is located)
3. `npm install` - to get dependencies
4. `npm install webgme` - to get the peer dependencies
5. `npm start` - to run the server
6. navigate to `http://localhost:8888` to start using PeNDeS!


## Development

### Webgme-cli
If you would like to extend this studio, download and install [webgme-cli](https://github.com/webgme/webgme-cli). This will provide a command line interface with which to manipulate webgme projects like PeNDeS.


