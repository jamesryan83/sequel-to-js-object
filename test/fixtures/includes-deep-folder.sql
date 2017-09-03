--# testNameFirst
SELECT * FROM sometable
WHERE x = 5
GO


--include includes1/includes2/an-sql-file


--# testNameLast
SELECT * FROM sometable3
WHERE x = 3
GO