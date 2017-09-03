"use strict";

var fs = require("fs");
var os = require("os");
var path = require("path");

var currentFolderpath = undefined;
var includedFiles = undefined;


// Returns an array of sql statements from an sql file
function parseSync(filepath, variables) {
    includedFiles = [];
    var returnStatements = {};
        
    // cache folderpath
    currentFolderpath = path.dirname(filepath);
    
    // parse sql file and includes
    _parseRecursiveSync(filepath, returnStatements);
    
    // Nothing found
    if (!Object.keys(returnStatements).length) {
        console.log("Warning: result is empty");
        return returnStatements;
    }
    
    // if variables were passed in
    if (variables) {
        var rgx = undefined;
        
        // for each sql result
        for (var statementName of Object.keys(returnStatements)) {            
                                    
            // for each json variable
            for (var variableName of Object.keys(variables)) {
                
                // match variable name and replace with variable value
                rgx = new RegExp("<<(\s*)" + variableName + "(\s*)>>", "gmi")                
                returnStatements[statementName] = returnStatements[statementName]
                    .replace(rgx, variables[variableName]);
            }
            
            // warn on unmatched <<variable>>
            if (returnStatements[statementName].match(/<<(\s*)(.*)(\s*)>>/gmi)) {
                console.log("Warning: unmatched variable in sql statement: " + statementName);
            }                
        }
    }
    
    return returnStatements;    
}


// Recuresively parse an sql file into a json object
function _parseRecursiveSync(filepath, returnStatements) {
    var currentStatement = "";
    var currentStatementName = "";
    
    if (!filepath) throw new Error("filepath missing");
    
    
    // load sql into an array of lines
    var sql = "";
    try {
        if (filepath.indexOf(".sql") === -1) filepath += ".sql";
        
        sql = fs.readFileSync(filepath, "utf8");
    } catch (ex) {
        throw new Error("file not found: " + filepath);        
    }
    sql = sql.split(os.EOL); // end-of-line

    
    // for each line
    for (var i = 0; i < sql.length; i++) {
        sql[i] = sql[i].trim();
        
        
        // ignore empty lines
        if (!sql[i]) continue;
        
        
        // line starts with --
        if (sql[i].indexOf("--") === 0) {
            
            // statement name
            if (sql[i].indexOf("--#") === 0) {
                if (currentStatementName) {
                    throw new Error("Only 1 name per statement allowed (at " + currentStatementName + ")");
                }
                
                // remove the --# from the start
                currentStatementName = sql[i].substr(4, sql[i].length).trim();
                
                // replace multiple spaces with single hyphen
                currentStatementName = currentStatementName.replace(/\s+/gmi, "-");
                continue;
                
                
            // include
            } else if (sql[i].indexOf("--include") === 0) {
                var includePath = sql[i].replace("--include", "").trim();                                
                
                if (includedFiles.indexOf(includePath) !== -1) {
                    // Duplicate inlcudes aren't allowed because each statement
                    // must have a unique name.  Including a file more than
                    // once would duplicate the names
                    // This also prevents circular include references
                    throw new Error("Duplicate include found: " + includePath);
                }
                
                includedFiles.push(includePath);
                includePath = path.join(currentFolderpath, includePath);
                
                // include sql at current line
                _parseRecursiveSync(includePath, returnStatements);
                
                continue;
                
            // comment
            } else {
                continue;
            }
        }
        
                
        // end of statement
        if (sql[i] === "GO") {
            if (!currentStatementName) throw new Error("name missing for: " + currentStatement);
            
            currentStatement = currentStatement.trim();
            if (!currentStatement) console.log("Warning: statement missing for: " + currentStatementName);
            
            returnStatements[currentStatementName] = currentStatement;
            
            currentStatement = "";
            currentStatementName = "";
            
                
        // part of current statement
        } else {
            currentStatement += sql[i] + " ";
        }
    }        
        
    if (currentStatement) {
        throw new Error("Statement found but GO was missing")
    }
}



exports = module.exports = {
    parseSync: parseSync
}