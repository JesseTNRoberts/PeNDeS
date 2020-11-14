const {spawn} = require('child_process');
const formula = spawn('dotnet', ['CommandLine.dll']);
const fs = require('fs');

let state = 'beforeFirstPrompt';
let result = false;
const FORMULA_PROMPT = '[]>';
const FORMULA_STILL_RUNNING = 'Running';
const FORMULA_QUERY_COMPLETE = 'Done';
const FORMULA_QUERY_TRUE = 'true';
const FORMULA_COMPILATION_FAILED = '(Failed)';
const FORMULA_SELECTION = 'Choose:';
const modelName = process.argv[2];
const domainName = process.argv[3];
const query = process.argv[4];
let collectedPrompt = '';
let commandData = '';
const prompts = [];

function processPrompt(promptData) {
    switch (state) {
        case 'beforeFirstPrompt':
            state = 'firstPrompt';
            break;
        case 'loading':
            if(promptData.indexOf(FORMULA_COMPILATION_FAILED) !== -1) {
                fs.writeFileSync('./error.txt', promptData);
                state = 'fifthPrompt';
            } else {
                state = 'secondPrompt';
            }
            break;
        case 'query':
            state = 'fourthPrompt';
            break;
        case 'result':
            if(promptData.indexOf(FORMULA_STILL_RUNNING) !== -1) {
                state = 'fourthPrompt';
            } else if (promptData.indexOf(FORMULA_QUERY_COMPLETE) !== -1) {
                if(promptData.indexOf(FORMULA_QUERY_TRUE) !== -1) {
                    result = true;
                }
                state = 'fifthPrompt';
            } else {
                state = 'fourthPrompt';
            }
            break;
        default:
            break;
    }
}

function sendData(process, data){
    process.stdin.write(data);
    //console.log(data);
}

formula.stdout.on('data', data => {
    const strData = data.toString('utf8');
    //console.log(strData);
    if(strData.indexOf(FORMULA_PROMPT) !== -1) {
        collectedPrompt += strData;
        prompts.push(collectedPrompt);
        collectedPrompt = '';
    } else {
        collectedPrompt += strData;
    }
});

formula.once('error', error => {
    console.error(error);
    process.exit(1);
});

formula.once('close', code => {
    console.log('formula exited with code: ' + code);
    process.exit(0);
});

const timer = setInterval(() => {
    switch (state) {
        case 'firstPrompt':
            sendData(formula, 'l ./test.4ml\n');
            state = 'loading';
            break;
        case 'secondPrompt':
            sendData(formula, 'qr '+ modelName + ' ' + domainName+'.'+query+ '\n');
            state = 'query';
            break;
        case 'fourthPrompt':
            sendData(formula, 'ls tasks\n');
            state = 'result';
            break;
        case 'fifthPrompt':
            sendData(formula, 'exit\n');
            fs.writeFileSync('./result.txt', result ? 'true' : 'false');
            clearInterval(timer);
            break;
        default:
            if (prompts.length > 0) {
                processPrompt(prompts.shift());
            }
    }
}, 8);