const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoleTable = require('console.table');

// connect to mysql database
const db = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'BumbleSnake',
	database: 'employees_db',
});
db.connect(function (err) {
	if (err) throw err;
	start();
});

function start() {
	inquirer
		.prompt([
			{
				type: 'list',
				name: 'task',
				message: 'Please choose what you would like to do',
				choices: [
					'View all departments',
					'View all roles',
					'View all employees',
					'Add a department',
					'Add a role',
					'Add an employee',
					'Update an employee role',
					'Exit',
				],
			},
		])
		.then(choice => {
			switch (choice.task) {
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
					break;

				case 'Add an employee':
					addEmployee();
					break;

				case 'Update an employee role':
					updateRole();
					break;
				case 'Exit':
					db.end();
			}
		});
}

// view all departments
function viewDepts() {
	db
		.promise()
		.query(
			`SELECT * FROM departments
        ORDER BY departments.id`
		)
		.then(data => {
			const [rows] = data;
			console.log('\n');
			console.table('Departments', rows);
		});
	start();
}

// view all roles
function viewRoles() {
	db
		.promise()
		.query(
			`SELECT roles.id, roles.title, roles.salary, departments.name AS department FROM roles
        LEFT JOIN departments ON (departments.id = roles.department_id)
        ORDER BY roles.id;`
		)
		.then(data => {
			const [rows] = data;
			console.log('\n');
			console.table('Roles', rows);
		});
	start();
}

// view all employees
function viewEmployees() {
	db
		.promise()
		.query(
			`SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employees
        LEFT JOIN employees manager on manager.id = employees.manager_id
        INNER JOIN roles ON (roles.id = employees.role_id)
        INNER JOIN departments ON (departments.id = roles.department_id)
        ORDER BY employees.id;`
		)
		.then(data => {
			const [rows] = data;
			console.log('\n');
			console.table('Employees', rows);
		});
	start();
}

// add a department
function addDept() {
	inquirer
		.prompt({
			type: 'input',
			message: 'New department name:',
			name: 'new_department',
		})
		.then(function (answer) {
			db.query(
				`INSERT INTO departments SET ?`,
				{
					name: answer.new_department,
				},
				function (err, answer) {
					if (err) {
						throw err;
					}
				}
			),
				console.log('The new department has been added to the database!');
			console.log('\n');
			console.table('New department', answer);
			start();
		});
}

// add a role
addRole = () => {
	inquirer
		.prompt([
			{
				type: 'input',
				message: 'What is the name of the new role?',
				name: 'new_role',
			},
			{
				type: 'number',
				message: 'What is the salary?',
				name: 'new_salary',
			},
		])
		.then(answer => {
			const params = [answer.new_role, answer.new_salary];
			const roleQuery = `SELECT name, id FROM departments`;
			db.query(roleQuery, (err, data) => {
				if (err) throw err;
				const depts = data.map(({ name, id }) => ({ name: name, value: id }));
				inquirer
					.prompt([
						{
							type: 'list',
							name: 'new_dept',
							message: 'Which Departemt?',
							choices: depts,
						},
					])
					.then(deptChoice => {
						const department = deptChoice.new_dept;
						params.push(department);
						console.log(params);
						const sql = `INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)`;
						db.query(sql, params, (err, result) => {
							if (err) throw err;
							console.log('\nThe new role ' + answer.new_role + 'has been added to the database!\n');
							start();
						});
					});
			});
		});
};

// add an employee
function addEmployee() {
	db.query('SELECT * FROM roles', (err, result) => {
		if (err) throw err;
		const roles = result.map(role => ({
			value: role.id,
			name: role.title,
		}));
		db.query('SELECT * FROM employees', (err, result) => {
			if (err) throw err;
			const managers = result.map(employee => ({
				value: employee.id,
				name: employee.first_name + ' ' + employee.last_name,
			}));
			managers.push({ name: 'None', value: null });
			inquirer
				.prompt([
					{
						type: 'input',
						message: 'What is their first name?',
						name: 'first_name',
					},
					{
						type: 'input',
						message: 'What is their last name?',
						name: 'last_name',
					},
					{
						type: 'list',
						message: 'What is their role?',
						name: 'role_id',
						choices: roles,
					},
					{
						type: 'list',
						message: 'Who is their manager?',
						name: 'manager_id',
						choices: managers,
					},
				])
				.then(function (answer) {
					db.query('INSERT INTO employees SET ?', answer, function (err, result) {
						if (err) {
							throw err;
						}
						console.log(
							'\nThe new employee ' +
								answer.first_name +
								' ' +
								answer.last_name +
								'has been added to database!\n'
						);
						start();
					});
				});
		});
	});
}

//update employee role
function updateRole() {
	db.query('SELECT * FROM employees', (err, result) => {
		if (err) throw err;
		const employees = result.map(employee => ({
			value: employee.id,
			name: employee.first_name + ' ' + employee.last_name,
		}));
		db.query('SELECT * FROM roles', (err, result) => {
			if (err) throw err;
			const roles = result.map(role => ({
				value: role.id,
				name: role.title,
			}));
			inquirer
				.prompt([
					{
						type: 'list',
						message: 'Which employee are you updating?',
						name: 'id',
						choices: employees,
					},
					{
						type: 'list',
						message: 'What is their new role?',
						name: 'role_id',
						choices: roles,
					},
				])
				.then(function (answer) {
					db.query(
						'UPDATE employees SET role_id = ? WHERE id = ?',
						[answer.role_id, answer.id],
						function (err, result) {
							if (err) {
								throw err;
							}
							console.log('\nThe employees role has been updated!');
							start();
						}
					);
				});
		});
	});
}
