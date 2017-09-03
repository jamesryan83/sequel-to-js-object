"use strict";

// NOTE: some regexes might not be cross platform, not sure

var fs = require("fs");
var path = require("path");
var sinon = require("sinon");
var assert = require("assert");
var sql2obj = require("../index");

var folderPath = "./test/fixtures";

var variables = {
    "variable1": 123,
    "variable2": "fullname",
    "variable3": "NOT NULL",
    "variable4": "fullname NVARCHAR(255) NOT NULL"
};

var multipleStatementsResult = { 
    testName: "SELECT * FROM sometable WHERE x = 5",
    testName2: "SELECT * FROM sometable2 WHERE x = 4",
    testName3: "SELECT * FROM sometable3 WHERE x = 3"
};

console.log("NOTE: warnings are expected.");

describe("sql-file-to-object", function () {
        
    
    it("throws error on incorrect filename", function () {
        assert.throws(() => sql2obj.parseSync(path.join(folderPath, "fileThatDoesntExist.sql")),
                      /file not found: test\\fixtures\\fileThatDoesntExist.sql/);        
    });
    
    
    it("throws error on duplicate statement name", function () {
        assert.throws(() => sql2obj.parseSync(path.join(folderPath, "duplicate-name.sql")),
                      /Only 1 name per statement allowed \(at testName\)/);
        
        assert.throws(() => sql2obj.parseSync(path.join(folderPath, "duplicate-name-2.sql")),
                      /Only 1 name per statement allowed \(at testName2\)/);
    });    
      
    
    it("returns empty array on empty input file", function () {
        var spy = sinon.spy(console, "log");
        
        var result = sql2obj.parseSync(path.join(folderPath, "empty-file.sql"));
        assert.deepStrictEqual(result, {});
        assert(spy.calledWith("Warning: result is empty"));
        
        spy.restore();
    });
    
    
    it("ignores comments", function () {
        var result = sql2obj.parseSync(path.join(folderPath, "ignore-comments.sql"));
        assert.equal(result.testName, "SELECT * FROM sometable WHERE x = 5");
    });
    
    
    it("throws error on missing GO", function () {
        assert.throws(() => sql2obj.parseSync(path.join(folderPath, "missing-go.sql")),
                      /Statement found but GO was missing/);
        
        assert.throws(() => sql2obj.parseSync(path.join(folderPath, "missing-go-2.sql")),
                      /Statement found but GO was missing/);
    });
    
    
    it("throws error on missing statement name", function () {
        assert.throws(() => sql2obj.parseSync(path.join(folderPath, "missing-name.sql")),
                      /name missing for: SELECT \* FROM sometable WHERE x = 5/);
        
        assert.throws(() => sql2obj.parseSync(path.join(folderPath, "missing-name-2.sql")),
                      /name missing for: SELECT \* FROM sometable2 WHERE x = 4/);
    });
    
    
    it("warning on missing statement", function () {
        var spy = sinon.spy(console, "log");
        
        var result = sql2obj.parseSync(path.join(folderPath, "missing-statement.sql"));
        assert.equal(result.testName, "");
        assert(spy.calledWith("Warning: statement missing for: testName"));
        
        var result = sql2obj.parseSync(path.join(folderPath, "missing-statement-2.sql"));
        assert.equal(result.testName2, "");
        assert(spy.calledWith("Warning: statement missing for: testName2"))
        
        spy.restore();        
    });
    
    
    it("handles single statement", function () {
        var result = sql2obj.parseSync(path.join(folderPath, "single-statement.sql"));
        assert.deepStrictEqual(result, { testName: "SELECT * FROM sometable WHERE x = 5" });
    });
    
    
    it("handles multiple statements", function () {
        var result = sql2obj.parseSync(path.join(folderPath, "multiple-statements.sql"));
        assert.deepStrictEqual(result, multipleStatementsResult);
    });
   
    
    it("works with no empty lines", function () {
        var result = sql2obj.parseSync(path.join(folderPath, "no-empty-lines.sql"));
        assert.deepStrictEqual(result, multipleStatementsResult);
    });
    
    
    it("normalizes names", function () {
        var result = sql2obj.parseSync(path.join(folderPath, "normalizes-names.sql"));
        
        // spaces to hyphens
        assert.deepStrictEqual(result, {
            "firstName": "SELECT * FROM sometable",
            "second-Name": "SELECT * FROM sometable2",
            "third-Name-Test": "SELECT * FROM sometable3",
        });
    });
    

    it("inserts variables and warns when missing", function () {
        var spy = sinon.spy(console, "log");
        
        var result = sql2obj.parseSync(path.join(folderPath, "contains-variables.sql"), variables);
        
        assert.deepStrictEqual(result, {
            "test-table": "CREATE TABLE test ( id_test NVARCHAR(123) NOT NULL, fullname NVARCHAR(123) NOT NULL )",
            "test-table-2": "CREATE TABLE test2 ( id_test2 NVARCHAR(123) NOT NULL, fullname NVARCHAR(255) NOT NULL, column3 NVARCHAR(<<variableThatDoesntExist>>) NOT NULL )"
        });
        assert(spy.calledWith("Warning: unmatched variable in sql statement: test-table-2"));
        
        spy.restore();
    });
    
    
    it("throws error on missing or invalid include path", function () {
        assert.throws(() => sql2obj.parseSync(path.join(folderPath, "includes-missing.sql")),
                      /file not found: test\\fixtures\\file\\that\\doesnt\\exist.sql/);
    });
    
    
    it("throws error on circular include references", function () {
        // This throws duplicate due to the cached list of includes preventing circular references
        assert.throws(() => sql2obj.parseSync(path.join(folderPath, "includes-circular.sql")),
                      /Duplicate include found: includes-circular-2/);     
    });
    
    
    it("throws error on duplicate include filepaths", function () {
        assert.throws(() => sql2obj.parseSync(path.join(folderPath, "includes-duplicate.sql")),
                      /Duplicate include found: single-statement/);     
    });
    
    
    it("includes a single file", function () {
        var result = sql2obj.parseSync(path.join(folderPath, "includes-single.sql"));
        
        assert.deepStrictEqual(result, { 
            "testNameFirst": "SELECT * FROM sometable WHERE x = 5",
            "testName": "SELECT * FROM sometable WHERE x = 5",
            "testNameLast": "SELECT * FROM sometable3 WHERE x = 3"
        });
    });
    
    
    it("includes file in deep folder", function () {
        var result = sql2obj.parseSync(path.join(folderPath, "includes-deep-folder.sql"));
        
        assert.deepStrictEqual(result, { 
            "testNameFirst": "SELECT * FROM sometable WHERE x = 5",
            "some-kinda-statement": "SELECT * FROM sometable123 WHERE x = 5",
            "testNameLast": "SELECT * FROM sometable3 WHERE x = 3"
        });
    });
    
    
    it("includes file from deep folder", function () {
        var result = sql2obj.parseSync(path.join(folderPath, "includes1", "includes2", "includes-from-folder.sql"));
        
        assert.deepStrictEqual(result, { 
            "testNameOtherMultiple": "SELECT * FROM sometable WHERE x = 5",
            "testName": "SELECT * FROM sometable WHERE x = 5"
        });
    });
    
    
    it("includes multiple files", function () {
        var result = sql2obj.parseSync(path.join(folderPath, "includes-multiple.sql"));                
        
        assert.deepStrictEqual(result, { 
             "testNameFirstMultiple": "SELECT * FROM sometable WHERE x = 5",
             "testNameFirst": "SELECT * FROM sometable WHERE x = 5",
             "testName": "SELECT * FROM sometable WHERE x = 5",
             "testNameLast": "SELECT * FROM sometable3 WHERE x = 3",
             "testNameOtherMultiple": "SELECT * FROM sometable WHERE x = 5",
             "some-kinda-statement": "SELECT * FROM sometable123 WHERE x = 5",
             "testNameLastMultiple": "SELECT * FROM sometable3 WHERE x = 3"
        });
    });
    
    
    it("test readme demo", function () {
        var result = sql2obj.parseSync(path.join("examples", "mysqlfile.sql"), { my_variable: 7 });
        assert.deepStrictEqual(result, {
            "statement1": "SELECT * FROM sometable WHERE x = 3",
            "statement2": "SELECT * FROM sometable2 WHERE x = 5",
            "statement3": "SELECT * FROM sometable3 WHERE x = 7"
        });
    });
    
});

