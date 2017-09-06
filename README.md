
## SQL file to JavaScript object literal

Synchronously parses an *.sql file containing statements seperated by `GO` keywords and returns the statements as a JavaScript object literal

Include SQL files into other SQL files and replace parts of them with JSON data

### Why

Simple organization of raw SQL files.  Has some similarities to Sass, the css preprocesser (i.e. includes and variables)

Allows easy separation of any variables, such as column lengths, into a JSON file which
can then be used elsewhere in the application (like for client-side input validation)

### Installation

not on npm yet


### Usage

In mysqlfile.sql:

    --# statement1
    SELECT * FROM sometable
    WHERE x = 3
    GO

    -- a comment
    --include mysqlfile2

    --# statement3
    SELECT * FROM sometable3
    -- another comment
    WHERE x = <<my_variable>>
    GO
    
In mysqlfile2.sql in same directory as mysqlfile.sql:

    --# statement2
    SELECT * FROM sometable2
    WHERE x = 5
    GO

In node:

    (not on npm yet)
    var sql2obj = require("index.js");
    var result = sql2obj.parseSync("examples/mysqlfile", { my_variable: 7 });    
    console.log(result):

Result: 

    { statement1: "SELECT * FROM sometable WHERE x = 3",
      statement2: "SELECT * FROM sometable2 WHERE x = 5",
      statement3: "SELECT * FROM sometable3 WHERE x = 7" }

Run this to see the example

    npm run-script example

### Notes

Dependencies: None

The format of each statement in the SQL file must be like this:

    --# <json property name>
        SQL STATEMENT GOES HERE
        MULTIPLE LINES ARE FINE
        COMMENTS AND EMPTY LINES ARE IGNORED
        VARIABLES LOOK LIKE <<this>> AND CAN GO ANYWHERE
            AND CAN BE USED MULTIPLE TIMES IN THE SAME STATEMENT
        EVERY STATEMENT HAS TO END WITH GO
    GO

For `<json property name>`, spaces are replaced with `-`

`<<variables>>` are replaced by data passed to the `parseSync` function.  The property name in the data
must match the variable name in the SQL (i.e. `{ "test": value }` maps to `<<test>>` which will be replaced by `value`)

This library doesn't check your statements for errors or anything like that

`--include`'s are relative to the directory of the file passed into `parseSync`

Physical files you pass in and include must have the extension *.sql

### Tests

Dependencies: Mocha, Sinon

    npm test
    
