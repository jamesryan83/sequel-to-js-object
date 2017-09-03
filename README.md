
##SQL file to object

Parses an *.sql file synchronously and returns the statements as a json object

Include SQL files into other SQL files and replace parts of them with json data

### Why

Simple organization of raw SQL files.  Has some similarities to Sass, the css preprocesser (i.e. includes and variables)

Allows easy separation of any variables, such as column lengths, into a json file which
can then be used elsewhere in the application (like for client-side input validation)

### Installation

    npm install sql-file-to-object --save-dev


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

    var sql2obj = require("../index");
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

For &lt;json property name&gt;, spaces are replaced with "-"

&lt;&lt;variables&gt;&gt; are replaced by data passed to the parseSync function.  The property name in the data
must match the variable name in the SQL (i.e. { "test": value } maps to &lt;&lt;test&gt;&gt; which will be replaced by value)

This library only copies your SQL into a json object and inserts variables, it doesn't check your statements for errors or anything like that

Includes are relative to the file passed into parseSync

Physical files must end in *.sql, but it's optional everywhere else (e.g "--include my-file" is parsed as my-file.sql)

### Tests

Dependencies: Mocha, Sinon

    npm test
    
