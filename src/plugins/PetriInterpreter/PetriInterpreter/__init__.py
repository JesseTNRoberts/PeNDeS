"""
This is where the implementation of the plugin code goes.
The PetriInterpreter-class is imported from both run_plugin.py and run_debug.py
"""
import sys
import logging
from webgme_bindings import PluginBase
import os
import json
import shutil
from mako.template import Template
import subprocess

# Setup a logger
logger = logging.getLogger('PetriInterpreter')
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(sys.stdout)  # By default it logs to stderr..
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)


class PetriInterpreter(PluginBase):
    def main(self):
        core = self.core
        root_node = self.root_node
        active_node = self.active_node
        META = self.META

        # building structured data from model
        nodes = core.load_sub_tree(active_node)
        path2node = {}
        places = []
        transitions = []
        inputArcs = []
        outputArcs = []

        #verify that the caller is a petrinet
        if not core.is_type_of(active_node, META['PetriNet']):
            logger.warning("The active node is not a PetriNet... Attempting to find net")
            for node in nodes:
                if core.is_type_of(node, META['PetriNet']) and \
                        not core.get_path(node) == '/y/D': #Necessary to prevent grabbing the metanode
                    active_node = node
                    nodes = core.load_sub_tree(active_node)
                    logger.warning("The active node is changed to " + core.get_attribute(node, 'name'))
                    break

        if not core.is_type_of(active_node, META['PetriNet']):
            logger.error("Failed to find a PetriNet")

        #Build data for petrinet
        for node in nodes:
            path2node[core.get_path(node)] = node
            if core.is_type_of(node, META['Place']):
                places.append({'name': core.get_path(node).replace("/","")})

            elif core.is_type_of(node, META['Transition']):
                transitions.append({'name': core.get_path(node).replace("/","")})

        for node in nodes:
            if core.is_type_of(node, META['InputArc']):
                inputArcs.append({'src': core.get_pointer_path(node, 'src').replace("/",""),
                                  'dst': core.get_pointer_path(node, 'dst').replace("/","")})

            elif core.is_type_of(node, META['OutputArc']):
                outputArcs.append({'src': core.get_pointer_path(node, 'src').replace("/",""),
                                   'dst': core.get_pointer_path(node, 'dst').replace("/","")})


        #Get template information
        formula_domain = core.get_attribute(active_node, 'formulaDomain')
        formula_caller = core.get_attribute(active_node, 'formulaCaller')
        formula_template = Template(core.get_attribute(active_node, 'formulaTemplate'))
        model_name = core.get_attribute(active_node, 'name')

        #render the template
        formula_code = formula_template.render(name=model_name,
                                               domain=formula_domain,
                                               places=places,
                                               transitions=transitions,
                                               inputArcs=inputArcs,
                                               outputArcs=outputArcs)
        logger.info('\n' + formula_code)

        # go into our formula sub-directory and create a temporary folder
        os.chdir('formula')
        formula_file = open('formulaCaller.js', 'w+')
        formula_file.write(formula_caller)
        formula_file.close()

        formula_file = open('test.4ml', 'w+')
        formula_file.write(formula_code)
        formula_file.close()

        check_result = {}
        checks = ['workflow', 'markedGraph', 'freeChoice', 'stateMachine']
        for check in checks:
            subprocess.run(['node', 'formulaCaller.js', 'M1992', 'PetriNetDomain', check],
                              stdout=subprocess.PIPE)

            # check the result
            result_file = open('result.txt', 'r')
            result = result_file.read()
            result_file.close()
            check_result[check] = result.find('true') != -1

        self.create_message(active_node, str(check_result))


