--# testNameFirst
SELECT * FROM sometable
WHERE x = 5
GO


--include file/that/doesnt/exist.sql


--# testNameLast
SELECT * FROM sometable3
WHERE x = 3
GO