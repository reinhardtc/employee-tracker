INSERT INTO departments (name)
VALUES('Sales'), ('Finanace'), ('Legal'), ('Engineering');

INSERT INTO roles (title, salary, department_id)
VALUES
    ('Account Manager', 80000, 1),
    ('Accountant', 70000, 2),
    ('Lawyer', 100000, 3),
    ('Senior Software Engineer', 100000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
    ('Clark', 'Kent', 1, 1),
    ('Bruce', 'Wayne', 2, 1),
    ('Diana', 'Prince', 3, 1),
    ('Carol', 'Danvers', 4, 1);
    