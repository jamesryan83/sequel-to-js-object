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