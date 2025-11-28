USE DB_PMS;
GO

SET QUOTED_IDENTIFIER ON;
GO

UPDATE Users
SET PasswordHash = '$2a$11$fJe3FtG5zdoyTMnCY/EfBO37LutCcQZgV6rjnuyrf5.41QQIxX73a'
WHERE Email = 'john@acme.com';

SELECT @@ROWCOUNT as Updated;
GO
