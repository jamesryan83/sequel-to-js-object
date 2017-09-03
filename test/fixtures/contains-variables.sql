-- The best use case for <<variables>> is probably as column lengths,
-- then you can reuse the same json data for the front-end. For
-- instance, have username and password lengths in a json file like this,
-- { "username": 45, "password": 255 }, then
-- pass them in here as <<variables>> and also use them for server
-- and client side validation, meaning you only have to update the
-- data in one place.  But you can use <<variables>> to replace any part
-- of a statement if you want


--# test table
CREATE TABLE test
(
    id_test NVARCHAR(<<variable1>>) NOT NULL,
    <<variable2>> NVARCHAR(<<variable1>>) <<variable3>>
)

GO

--# test table 2
CREATE TABLE test2
(
    id_test2 NVARCHAR(<<variable1>>) <<variable3>>,
    <<variable4>>,
    column3 NVARCHAR(<<variableThatDoesntExist>>) NOT NULL
)

GO
