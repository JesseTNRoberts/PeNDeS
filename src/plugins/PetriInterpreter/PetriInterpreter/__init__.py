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
import subprocess
from mako.template import Template

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

        name_prefix = "_"
        #Build data for petrinet
        for node in nodes:
            name = name_prefix + core.get_path(node).replace("/","")
            path2node[core.get_path(node)] = node
            if core.is_type_of(node, META['Place']):
                places.append({'name': name})

            elif core.is_type_of(node, META['Transition']):
                transitions.append({'name': name})

        for node in nodes:
            if core.is_type_of(node, META['InputArc']):
                src = name_prefix + core.get_pointer_path(node, 'src').replace("/","")
                dst = name_prefix + core.get_pointer_path(node, 'dst').replace("/","")
                inputArcs.append({'src': src, 'dst': dst})

            elif core.is_type_of(node, META['OutputArc']):
                src = name_prefix + core.get_pointer_path(node, 'src').replace("/","")
                dst = name_prefix + core.get_pointer_path(node, 'dst').replace("/","")
                outputArcs.append({'src': src, 'dst': dst})

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

        # go to formula directory to analyze petrinet
        # don't change the names here without changing the formulaCaller.js file that is
        # part of the petriNet Meta Object in the meta-model
        formula_files = {'results': 'result.txt',
                         'errors': 'error.txt',
                         'caller': 'formulaCaller.js',
                         'model': 'test.4ml',
                         'directory': 'formula'}
        os.chdir(formula_files['directory'])
        formula_file = open(formula_files['caller'], 'w+')
        formula_file.write(formula_caller)
        formula_file.close()

        formula_file = open(formula_files['model'], 'w+')
        formula_file.write(formula_code)
        formula_file.close()

        #remove the error file if it exists to use presence as error detection
        if os.path.isfile(formula_files['errors']):
            os.remove(formula_files['errors'])

        check_result = {}
        checks = ['workflow', 'markedGraph', 'freeChoice', 'stateMachine']
        for check in checks:
            subprocess.run(['node', 'formulaCaller.js', 'M1992', 'PetriNetDomain', check],
                              stdout=subprocess.PIPE)

            if os.path.isfile('result.txt'):
                # check the result
                result_file = open('result.txt', 'r')
                result = result_file.read()
                result_file.close()
                check_result[check] = result.find('true') != -1

        #Deliver the results to the user
        if os.path.isfile('error.txt'):
            self.create_message(active_node,
                                'There was an error with the formula model...  '+
                                open('error.txt', 'r').read())
        else:
            self.create_message(active_node, str(check_result))

        #cleanup
        for filename in [formula_files['results'],
                         formula_files['errors'],
                         formula_files['caller'],
                         formula_files['model']]:
            if os.path.isfile(filename):
                os.remove(filename)


