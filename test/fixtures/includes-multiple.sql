--# testNameFirstMultiple
SELECT * FROM sometable
WHERE x = 5
GO

--include includes-multiple-2

--# testNameLastMultiple
SELECT * FROM sometable3
WHERE x = 3
GO