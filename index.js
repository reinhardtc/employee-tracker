const mysql = require('mysql')


//Connect to database
const db = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "BumbleSnake",
        database: "employees_db"
    },
    console.log("Connected to employees database")
)
