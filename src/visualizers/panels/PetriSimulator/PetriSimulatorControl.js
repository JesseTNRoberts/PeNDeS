/*globals define, WebGMEGlobal*/
/**
 * Generated by VisualizerGenerator 1.7.0 from webgme on Wed Nov 11 2020 19:19:31 GMT+0100 (Central European Standard Time).
 */

define([
    'js/Constants',
    'js/Utils/GMEConcepts',
    'js/NodePropertyNames'

], function (
    CONSTANTS,
    GMEConcepts,
    nodePropertyNames
) {

    'use strict';

    function PetriSimulatorControl(options) {

        this._logger = options.logger.fork('Control');

        this._client = options.client;

        // Initialize core collections and variables
        this._widget = options.widget;

        this._currentNodeId = null;
        this._currentNodeParentId = undefined;

        this._petriData = null;

        this._initWidgetEventHandlers();

        this._logger.debug('ctor finished');
        
        this._initialLoaded = false;

    }

    PetriSimulatorControl.prototype._initWidgetEventHandlers = function () {
        this._widget.onNodeClick = function (id) {
            // Change the current active object
            WebGMEGlobal.State.registerActiveObject(id);
        };
    };

    /* * * * * * * * Visualizer content update callbacks * * * * * * * */
    // One major concept here is with managing the territory. The territory
    // defines the parts of the project that the visualizer is interested in
    // (this allows the browser to then only load those relevant parts).
    PetriSimulatorControl.prototype.selectedObjectChanged = function (nodeId) {
        var desc = this._getObjectDescriptor(nodeId),
            self = this;

        self._logger.debug('activeObject nodeId \'' + nodeId + '\'');
        self._initialLoaded = false;

        // Remove current territory patterns
        if (self._currentNodeId) {
            self._client.removeUI(self._territoryId);
        }

        self._currentNodeId = nodeId;
        self._currentNodeParentId = undefined;

        if (typeof self._currentNodeId === 'string') {
            // Put new node's info into territory rules
            self._selfPatterns = {};
            self._selfPatterns[nodeId] = {children: 1};  // Territory "rule"

            self._widget.setTitle(desc.name.toUpperCase());

            self._currentNodeParentId = desc.parentId;

            self._territoryId = self._client.addUI(self, function (events) {
                self._eventCallback(events);
            });

            // Update the territory
            self._client.updateTerritory(self._territoryId, self._selfPatterns);

            //self._selfPatterns[nodeId] = {children: 1};
            //self._client.updateTerritory(self._territoryId, self._selfPatterns);
        }
    };

    // This next function retrieves the relevant node information for the widget
    PetriSimulatorControl.prototype._getObjectDescriptor = function (nodeId) {
        var nodeObj = this._client.getNode(nodeId),
            metaNode,
            objDescriptor = {
                name: 'N/A'
            };

        if (nodeObj) {
            objDescriptor = {
                id: undefined,
                name: undefined,
                childrenIds: undefined,
                parentId: undefined,
                isConnection: false,
                position: {
                    x: 0,
                    y: 0
                },
                connects: {
                    srcId: null,
                    dstId: null
                },
                metaType: null,
                tokens: null
            };

            objDescriptor.id = nodeObj.getId();
            objDescriptor.name = nodeObj.getAttribute(nodePropertyNames.Attributes.name);
            objDescriptor.childrenIds = nodeObj.getChildrenIds();
            objDescriptor.childrenNum = objDescriptor.childrenIds.length;
            objDescriptor.parentId = nodeObj.getParentId();
            objDescriptor.isConnection = GMEConcepts.isConnection(nodeId);  // GMEConcepts can be helpful
            if (objDescriptor.isConnection) {
                objDescriptor.connects.srcId = nodeObj.getPointer('src').to;
                objDescriptor.connects.dstId = nodeObj.getPointer('dst').to;
            }

            objDescriptor.position = nodeObj.getRegistry('position');

            // No need to register territory since the meta-nodes are always loaded and available.
            metaNode = this._client.getNode(nodeObj.getMetaTypeId());
            if (metaNode) {
                objDescriptor.metaType = metaNode.getAttribute('name');
            }

            if (objDescriptor.metaType === 'Place'){
                objDescriptor.tokens = nodeObj.getAttribute('Tokens');
            }

        }



        return objDescriptor;
    };

    /* * * * * * * * Node Event Handling * * * * * * * */
    PetriSimulatorControl.prototype._eventCallback = function (events) {
        var i = events ? events.length : 0,
            petriData = {
                simulatorHtmlTemplate : null,
                descriptors : {}
            },
            nodeObj,
            event;

        this._logger.debug('_eventCallback \'' + i + '\' items');

	    if (this._initialLoaded === false){
	        this._initialLoaded = true;

            for (i = 0; i < events.length; i += 1) {
                event = events[i];
                if (event.etype === 'load') {
                    if (event.eid === this._currentNodeId) {
                        nodeObj = this._client.getNode(event.eid);

                        petriData.simulatorHtmlTemplate = nodeObj.getAttribute('simulatorTemplate');

                    } else {
                        petriData.descriptors[event.eid] = this._getObjectDescriptor(event.eid);
                    }
                } else {
                    this._logger.debug('Skipping event of type', event.etype);
                }
            }
	        this._logger.info('initial load event, petriData',petriData);
            this._petriData = petriData;
            this._widget._embedSimulator(this._petriData);

	    } else {
            while (i--) {
                event = events[i];
                switch (event.etype) {

                case CONSTANTS.TERRITORY_EVENT_LOAD:
                    this._onLoad(event.eid);
                    break;
                case CONSTANTS.TERRITORY_EVENT_UPDATE:
                    this._onUpdate(event.eid);
                    break;
                case CONSTANTS.TERRITORY_EVENT_UNLOAD:
                    this._onUnload(event.eid);
                    break;
                default:
                    break;
                }
            }
        }

        this._logger.debug('_eventCallback \'' + events.length + '\' items - DONE');
    };

    PetriSimulatorControl.prototype._onLoad = function (gmeId) {
        var description = this._getObjectDescriptor(gmeId);
        this._widget.addNode(description);
    };

    PetriSimulatorControl.prototype._onUpdate = function (gmeId) {
        var description = this._getObjectDescriptor(gmeId);
        this._widget.updateNode(description);
    };

    PetriSimulatorControl.prototype._onUnload = function (gmeId) {
        this._widget.removeNode(gmeId);
    };

    PetriSimulatorControl.prototype._stateActiveObjectChanged = function (model, activeObjectId) {
        if (this._currentNodeId === activeObjectId) {
            // The same node selected as before - do not trigger
        } else {
            this.selectedObjectChanged(activeObjectId);
        }
    };

    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    PetriSimulatorControl.prototype.destroy = function () {
        this._detachClientEventListeners();
        this._removeToolbarItems();
    };

    PetriSimulatorControl.prototype._attachClientEventListeners = function () {
        this._detachClientEventListeners();
        WebGMEGlobal.State.on('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged, this);
    };

    PetriSimulatorControl.prototype._detachClientEventListeners = function () {
        WebGMEGlobal.State.off('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged);
    };

    PetriSimulatorControl.prototype.onActivate = function () {
        this._attachClientEventListeners();
        this._displayToolbarItems();

        if (typeof this._currentNodeId === 'string') {
            WebGMEGlobal.State.registerActiveObject(this._currentNodeId, {suppressVisualizerFromNode: true});
        }
    };

    PetriSimulatorControl.prototype.onDeactivate = function () {
        this._detachClientEventListeners();
        this._hideToolbarItems();
    };

    /* * * * * * * * * * Updating the toolbar * * * * * * * * * */
    PetriSimulatorControl.prototype._displayToolbarItems = function () {

        if (this._toolbarInitialized === true) {
            for (var i = this._toolbarItems.length; i--;) {
                this._toolbarItems[i].show();
            }
        } else {
            this._initializeToolbar();
        }
    };

    PetriSimulatorControl.prototype._hideToolbarItems = function () {

        if (this._toolbarInitialized === true) {
            for (var i = this._toolbarItems.length; i--;) {
                this._toolbarItems[i].hide();
            }
        }
    };

    PetriSimulatorControl.prototype._removeToolbarItems = function () {

        if (this._toolbarInitialized === true) {
            for (var i = this._toolbarItems.length; i--;) {
                this._toolbarItems[i].destroy();
            }
        }
    };

    PetriSimulatorControl.prototype._initializeToolbar = function () {
        var self = this,
            toolBar = WebGMEGlobal.Toolbar;

        this._toolbarItems = [];

        this._toolbarItems.push(toolBar.addSeparator());

        /************** Petrinet Interpreter Button ****************/

        this.$btnPetrinetInterpreter = toolBar.addButton({
            title: 'Call Interpreter',
            icon: 'glyphicon glyphicon-sunglasses',
            clickFn: function (/*data*/) {
                let pluginContext = self._client.getCurrentPluginContext('PetriInterpreter',
                                                                            self._currentNodeId);
                //seems there's an error that requires a non-empty pluginConfig array
                pluginContext.pluginConfig = {a : 'test'};

                self._widget._interpreterDisplay('This will take a moment.');

                self._client.runServerPlugin('PetriInterpreter', pluginContext,
                    function (err, result){
                        if(err){
                            self._logger.error(err);
                            self._widget._interpreterDisplay('Something went wrong!');
                        } else {
                            self._widget._interpreterDisplay('Classifications: --> ' +
                                result.messages[0].message);
                            self._logger.info('Plugin Done', result);
                        }
                    });
            }
        });
        this._toolbarItems.push(this.$btnPetrinetInterpreter);

        /************** Petrinet Simulator Reset Button ****************/

        this.$btnSimulatorReset = toolBar.addButton({
            title: 'Reset Simulator',
            icon: 'glyphicon glyphicon-refresh',
            clickFn: function (/*data*/) {
                self._widget._simulatorUnload();
                self._widget._embedSimulator(self._petriData);
            }
        });
        this._toolbarItems.push(this.$btnSimulatorReset);

        this._toolbarInitialized = true;
    };

    return PetriSimulatorControl;
});
