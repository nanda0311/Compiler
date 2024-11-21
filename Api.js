const express = require("express");
const bodyParser = require("body-parser");
const compiler = require("compilex");
const cors = require("cors");

const app = express();
const PORT = 8000; // You can change this to a different port if 8000 is occupied

// Initialize compilex with options
const options = { stats: true };
compiler.init(options);

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Allow cross-origin requests

// Serve static CodeMirror files
app.use(
  "/codemirror-5.65.18",
  express.static("C:/Users/nanda/Downloads/Compiler/codemirror-5.65.18")
);

// Serve the frontend (ensure the file path is correct)
app.get("/", (req, res) => {
  res.sendFile("C:/Users/nanda/Downloads/Compiler/index.html");
});

// Compilation route
app.post("/compile", (req, res) => {
  const { code, input, lang } = req.body;

  // Check if code and language are provided
  if (!code || !lang) {
    return res.status(400).send({ error: "Code and language are required." });
  }

  try {
    let envData;

    // Language-specific compilation
    switch (lang.toLowerCase()) {
      case "cpp":
        envData = { OS: "windows", cmd: "g++", options: { timeout: 10000 } };
        if (!input) {
          compiler.compileCPP(envData, code, (data) => res.send(data));
        } else {
          compiler.compileCPPWithInput(envData, code, input, (data) => res.send(data));
        }
        break;

      case "java":
        envData = { OS: "windows", cmd: "javac" };
        if (!input) {
          compiler.compileJava(envData, code, (data) => res.send(data));
        } else {
          compiler.compileJavaWithInput(envData, code, input, (data) => res.send(data));
        }
        break;

      case "python":
        envData = { OS: "windows", cmd: "python" };
        if (!input) {
          compiler.compilePython(envData, code, (data) => res.send(data));
        } else {
          compiler.compilePythonWithInput(envData, code, input, (data) => res.send(data));
        }
        break;

      case "c":
        envData = { OS: "windows", cmd: "gcc", options: { timeout: 10000 } };
        if (!input) {
          compiler.compileC(envData, code, (data) => res.send(data));
        } else {
          compiler.compileCWithInput(envData, code, input, (data) => res.send(data));
        }
        break;

      default:
        res.status(400).send({ error: "Unsupported language." });
    }
  } catch (error) {
    console.error("Error during compilation:", error);
    res.status(500).send({ error: "Internal server error." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
