# PeNDeS

PeNDeS (<ins>Pe</ins>tri<ins>N</ins>et <ins>De</ins>sign <ins>S</ins>tudio) is a domain specific modeling language (dsml) tool used to build petrinets. The modeling environment ensures that any defined petrinet conforms to the domain [rules](https://en.wikipedia.org/wiki/Petri_net) which govern petrinets while providing an easy interface with which to simulate functionality and evaluate characteristics. Specifically, PeNDeS evaluates if a petrinet can be classified as a workflow, marked graph, state machine, or free choice net. PeNDeS and the foundational software (webgme) are open source and readily extendable.

## Petrinets

A petrinet is a type of directed bipartite graph. The two types of elements are places and transitions. Each place has a positive finite number of markings. Transitions with all their connected in-places (places that have outgoing connections to this transition) possessing one or more markings are said to be enabled, which means they may be fired. When a transition is fired, all the connected in-places have their markings reduced by one and all connected out-places have their markings incremented by one.

Petrinets are used as a graphical modeling language used to describe process operation, similar to state machines. However, petrinets are far more expressive than state machines ie. any state machine may be encoded as a petrinet while not all petrinets can be represented as state machines. Petrinets are most often utilized to encode and study the formal characteristics of processes.

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

## Getting started 

Once you have successfully installed PeNDeS and have navigated to `http://localhost:8888` you should see the project creation interface (image 1). Here you are to enter the name you would like to be assigned to your project (image 2). Next, you can select how you want to create the project. A dropdown menu allows you to choose multiple ways to initialize a project. PeNDeS has a preconfigure project seed, called PetrinetSeed, which should be chosen (image 3). After completing these steps you will see the landing page that shows a model view of 4 example petrinets (image 4).  

<p align="center">
  1. <img src="/images/project%20creation.png" width="45%">
  2. <img src="/images/project%20naming.png" width="45%">
</p>

<p align="center">
  3. <img src="/images/seed.png" width="45%">
  4. <img src="/images/landing.png" width="45%">
</p>

### Creating, Simulating, and Interpreting models

To create a model, either edit one of the existing petrinet models (image 5) or drag a petrinet object into the composition landing view and edit the new petrinet. Once the model has been edited to your satisfaction, you can simulate the model by choosing the simulator visualizer in the left hand panel. In the simulator the model is shown in a similar format to the model editor. However, here you can click enabled transitions and test the overall functionality. Enabled transitions are highlighted in green (image 5). 

If you would like to evaluate if the created petrinet falls into one of the well studied categories (workflow, marked graph, state machine, or free choice net) click the glasses icon in the toolbar. The results are displayed directly in the simulator environment. If your model reaches a locked condition, then a message will be displayed requesting you to reload the model. This can be done by clicking the circular arrow icon in the toolbar. Finally, if you would like to be able to scroll the model, use the check box to enable scrolling.

<p align="center">
  5. <img src="/images/model.png" width="45%">
  6. <img src="/images/simulator.png" width="45%">
</p>

<p align="center">
  7. <img src="/images/interpreter.png" width="60%">
</p>

## Development

- [Webgme-cli](https://github.com/webgme/webgme-cli)
If you would like to extend this studio, download and install webgme-cli. This will provide a command line interface with which to manipulate webgme projects like PeNDeS.


