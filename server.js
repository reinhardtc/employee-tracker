const inquirer = require('inquirer')
const mysql = require('mysql2')
const cTable = require('console.table')

const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'BumbleSnake',
    database: 'employees_db',
});

// start server after db to database
db.connect(err => {
    if(err) throw err;
    start()
});


function start (){
    inquirer.prompt([{
        name: 'task',
        type: 'list',
        message: 'Please choose what you would like to do',
        choices: [
            'View all departments', 
            'View all roles', 
            'View all employees', 
            'Add a department', 
            'Add a role', 
            'Add an employee', 
            'Update an employees roles',
            'Exit',
        ]
    }
    ]).then((answer) => {
        switch(answer.task){
            case 'View all departments':
                viewDepts();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all employees':
                viewEmployees();
                break;
            case 'Add a department':
                addDept();
                break;
            case 'Add a role':
                addRole();
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employees roles':
                updateRole();
                break;
            case 'Exit':
                db.end();
        }
    });
};

// show all departments
function viewDepts(){
    db.promise()
    .query(`SELECT * FROM departments`)
    .then((data) => {
        const [rows] = data;
        console.table('Departments', rows);
    });
    start();
}


// show all roles
function viewRoles(){
    db.promise()
    .query(`SELECT * FROM roles`)
    .then((data) => {
        const [rows] = data;
        console.table("Roles", rows);
    });
    start();
}

// show all employees
function viewEmployees(){
    db.promise()
    .query(`SELECT * FROM employees`)
    .then((data) => {
        const [rows] = data;
        console.table("Employees", rows);
    });
    start();
}

// add a department
function addDept(){
    inquirer.prompt({
        type: "input",
        name: "newDept",
        message: "what is the name of the new department?"
    }).then(function (answer){
        db.query(`INSERT INTO departments SET ?`, {
            name: answer.newDept,
        }), console.log("New Department Added");
        console.table("New Department", answer)
        start()
    });
}

// add a role
function addRole(){
    inquirer.prompt([
        {
            type: "input",
            name: "newRoleName",
            message: "What is the new role?"
        },
        {
            type: "number",
            name: "What is the salary?",
            name: "newRoleSalary"
        },
        {
            type: "list",
            name: "newRoleDept",
            message: "Which department?",
            choices: departments
        }
    ])
    .then(function(answer){
        db.query(`INSERT INTO roles SET ?`,{
            name: answer.newRoleName,
            salary: answer.newRoleSalary,
            department: answer.newRoleDept
        }), console.log("New Role Added");
        console.table("New Role", answer)
        start()
    })
}



// add an employee
function addEmployee(){
    inquirer.prompt([{
        type: "input",
        name: "firstName",
        message: "What is their first name?"
    },
    {
        type: "input",
        name: "lastName",
        message: "What is their last name?"
    },
    {
        type: "list",
        name: "newEmpRole",
        message: "What is their role?",
        choices: roles
    },
    {
        type: "list",
        name: "newEmpManager",
        message: "Who is their manager?",
        choices: managers
    }
]).then(function(answer){
    db.query(`INSERT INTO employees SET ?`,{
        firstName: answer.firstName,
        lastName: answer.lastName,
        role: answer.newEmpRole,
        manager: answer.newEmpmanager
    }), console.log("New Employee added");
    console.table("New Employee", answer)
})
}

// Update an employee's roles

function updateRole(){
    db.query(`SELECT * FROM employees`, (err, results) => {
        if (err) throw err;
        const employees = results.map((employee) => ({
            value: employees.id,
            name: employees.firstName + " " + employees.last_name,
        }));
        db.query(`SELECT * FROM roles`, (err, results) => {
            if (err) throw err;
            const role = results.map((roles)=> ({
                value: role.id,
                name: role.title
            }));
            inquirer.prompt([{
                type: "list",
                message: "Who's role would you like to update?",
                name: "employeeName",
                choices: employees
            },{
                type: "list",
                message: "What is their new role?",
                name: "EmployeeNewRole",
                choices: roles
            }]).then(function(answer){
                db.query(`UPDATE employee SET role_id = ? WHERE id = ?`, [answer.role_id, answer.id],
                function(err, results){
                    if (err) throw err;
                    console.log("Employee's role updated");
                    start()
                })
            })
        })
    })
}
