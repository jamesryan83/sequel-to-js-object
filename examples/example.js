"use strict";

var sql2obj = require("../index");

var result = sql2obj.parseSync("examples/mysqlfile", { my_variable: 7 });

console.log(result);

// Result:
// {
//     "statement1": "SELECT * FROM sometable WHERE x = 3",
//     "statement2": "SELECT * FROM sometable2 WHERE x = 5",
//     "statement3": "SELECT * FROM sometable3 WHERE x = 7"
// }
