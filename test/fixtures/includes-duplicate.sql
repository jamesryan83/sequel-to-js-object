--# testNameFirst
SELECT * FROM sometable
WHERE x = 5
GO

--include single-statement

--# testNameLast
SELECT * FROM sometable3
WHERE x = 3
GO

--include single-statement