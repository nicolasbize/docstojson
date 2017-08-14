#!/usr/bin/env node
/*
 *  Copyright (c) 2016 Nicolas Bize
 *  All rights reserved.
 *
 *  This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 *
 *  Inspired by react-docgen (https://github.com/reactjs/react-docgen)
 */

var program = require('commander');
var os = require('os');
var pathModule = require('path');
var pkg = require('./package.json');
var parser = require('./parser.js');

function list(val) {
  return val.split(',').map(String);
}

program
  .version(pkg.version)
  .usage('[options] <folder ...>')
  .option('-o, --output [value]', 'output file (default to docs.json)')
  .option('-s, --separator [value]', 'output file will be created with given path separator (defaults to system path separator)')
  .option('-p, --pretty', 'pretty print JSON')
  .option('-x, --extensions [extensions]', 'file extensions to consider (default to js,jsx)', list, ['js','jsx'])
  .option('-i, --ignore [folders]', 'folders to ignore (default to test,node_modules)', list, ['test','node_modules'])
  .option('-w, --watch', 'watches for changes and rebuilds the documentation')
  .option('-m, --module', 'renders as an ES6 module')
  .parse(process.argv);

var async = require('async');
var dir = require('node-dir');
var fs = require('fs');
var parser = require('./parser');

var output = program.output || 'docs.json';
var paths = program.args || [];
var extensions = new RegExp('\\.(?:' + program.extensions.join('|') + ')$');
var ignoreDir = program.ignore;
var asModule = program.module;
var watch = program.watch;
var separator = program.separator;

function writeError(msg, path) {
  if (path) {
    process.stderr.write('Error with path "' + path + '": ');
  }
  process.stderr.write(msg + '\n');
  if (msg instanceof Error) {
    process.stderr.write(msg.stack + '\n');
  }
}

function exitWithError(error) {
  writeError(error);
  process.exit(1);
}

function exitWithResult(result, preventExit) {
  result = program.pretty ?
    JSON.stringify(result, null, 2) :
    JSON.stringify(result);
  if (asModule) {
    result = "module.exports = " + result + ";";
  }

  fs.writeFileSync(output, result);
  if (!preventExit) {
    process.exit(0);
  }
}

function traverseDir(path, result, done) {
  dir.readFiles(
    path,
    {
      match: extensions,
      excludeDir: ignoreDir
    },
    function(error, content, filename, next) {
      if (error) {
        exitWithError(error);
      }
      try {
        if (separator) {
          var regex = new RegExp("\\" + pathModule.sep,'g');
          result[filename.replace(regex,separator)] = parser.parse(content, filename);
        } else {
          result[filename] = parser.parse(content, filename);
        }
      } catch(error) {
        writeError(error, filename);
      }
      next();
    },
    function(error) {
      if (error) {
        writeError(error);
      }
      done();
    }
  );
}

function createDocFile(preventExit) {
  var result = Object.create(null);
  async.eachSeries(paths, function(path, done) {
    fs.stat(path, function(error, stats) {
      if (error) {
        writeError(error, path);
        done();
        return;
      }
      if (stats.isDirectory()) {
        traverseDir(path, result, done);
      }
      else {
        try {
          result[path] = parser.parse(fs.readFileSync(path), path);
        } catch(error) {
          writeError(error, path);
        }
        finally {
          done();
        }
      }
    });
  }, function() {
    var resultsPaths = Object.keys(result);
    if (resultsPaths.length === 0) {
      // we must have gotten an error
      if (!preventExit) {
        process.exit(1);
      }
    }
    if (paths.length === 1) { // a single path?
      fs.stat(paths[0], function(error, stats) {
        exitWithResult(stats.isDirectory() ? result : result[resultsPaths[0]], preventExit);
      });
    } else {
      exitWithResult(result, preventExit);
    }
  });
}

if (process.argv.length === 2) {
  program.outputHelp();
  process.exit(0);
} else {
  if (watch) {
    var watch = require("watch");
    watch.watchTree(paths[0], {
      ignoreDotFiles: true,
      filter: function(filename) {
        if (fs.statSync(filename).isDirectory()) {
          return true;
        } else {
          for(var i=0; i<program.extensions.length; i++) {
            if (filename.endsWith("." + program.extensions[i])) {
              return true;
            }
          }
        }
        return false;
      }
    }, function (f, curr, prev) {
      if (typeof f == "object" && prev === null && curr === null) {
        createDocFile(true);
        console.log('Docs compiled. Watching for changes...');
      } else if (prev === null) {
        console.log("A new file was added. Recompiling docs");
        createDocFile(true);
      } else if (curr.nlink === 0) {
        console.log("A file was removed. Recompiling docs");
        createDocFile(true);
      } else {
        console.log("A file was changed. Recompiling docs");
        createDocFile(true);
      }
    });

  } else {
    createDocFile();
  }
}
