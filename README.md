# docstojson
Generate code docs as a reusable json object

Installation
------------
npm install docstojson

Usage
-----
docstojson [options] <folder ...>

Options
-------
-h, --help                     output usage information
-V, --version                  output the version number
-o, --output [value]           output file (default to docs.json)
-s, --separator [value]        output file will be created with given path separator (defaults to system path separator)
-p, --pretty                   pretty print JSON
-x, --extensions [extensions]  file extensions to consider (default to js,jsx)
-i, --ignore [folders]         folders to ignore (default to test,node_modules)
-w, --watch                    watches for changes and rebuilds the documentation
-m, --module                   renders as an ES6 module
