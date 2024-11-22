const express = require('express');
const bodyParser = require('body-parser');
const compiler = require('compilex');
const cors = require('cors');
const path = require('path');

const app = express();

// Initialize compilex with options
const options = { stats: true };
compiler.init(options);

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Allow cross-origin requests

// Serve static files from the current directory (where the index.html is)
app.use(express.static(path.join(__dirname)));

// Serve the frontend (index.html) from the correct path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Default code snippets for each language
const defaultCode = {
  cpp: '#include <iostream>\nusing namespace std;\nint main() {\n\tcout << "Hello, World!" << endl;\n\treturn 0;\n}',
  java: 'public class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello, World!");\n\t}\n}',
  python: 'print("Hello, World!")',
  c: '#include <stdio.h>\nint main() {\n\tprintf("Hello, World!\\n");\n\treturn 0;\n}',
};

// Compilation route
app.post('/compile', (req, res) => {
  const { code, input, lang } = req.body;

  const codeToCompile = code || defaultCode[lang.toLowerCase()];

  if (!lang || !defaultCode[lang.toLowerCase()]) {
    return res.status(400).send({ error: 'Language not supported.' });
  }

  try {
    let envData;
    switch (lang.toLowerCase()) {
      case 'c++':
        envData = { OS: 'windows', cmd: 'g++', options: { timeout: 10000 } };
        if (!input) {
          compiler.compileCPP(envData, code, (data) => {
            res.send(data);
          });
        } else {
          compiler.compileCPPWithInput(envData, code, input, (data) => {
            res.send(data);
          });
        }
        break;

      case 'java':
        envData = { OS: 'windows', cmd: 'javac' };
        const javaCodeWithClassName = codeToCompile.replace('public class Main', 'public class Main');
        if (!input) {
          compiler.compileJava(envData, javaCodeWithClassName, (data) => res.send(data));
        } else {
          compiler.compileJavaWithInput(envData, javaCodeWithClassName, input, (data) => res.send(data));
        }
        break;

      case 'python':
        envData = { OS: 'windows', cmd: 'python' };
        if (!input) {
          compiler.compilePython(envData, codeToCompile, (data) => res.send(data));
        } else {
          compiler.compilePythonWithInput(envData, codeToCompile, input, (data) => res.send(data));
        }
        break;

      case 'c':
        envData = { OS: 'windows', cmd: 'gcc', options: { timeout: 10000 } };
        if (!input) {
          compiler.compileC(envData, codeToCompile, (data) => res.send(data));
        } else {
          compiler.compileCWithInput(envData, codeToCompile, input, (data) => res.send(data));
        }
        break;

      default:
        res.status(400).send({ error: 'Unsupported language.' });
    }
  } catch (error) {
    res.status(500).send({ error: 'Internal server error.' });
  }
});

// Export the app for Vercel
module.exports = app;
