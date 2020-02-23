DROP DATABASE IF EXISTS employeeTracker_DB;
CREATE DATABASE employeeTracker_DB;

USE employeeTracker_DB;

CREATE TABLE employee(
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT NOT NULL,
  manager_id INT,
  
  PRIMARY KEY (id)
  
);


CREATE TABLE role(
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INT,

  PRIMARY KEY (id)

);

CREATE TABLE department(
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL,

  PRIMARY KEY (id)

);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Paul","Flowers", "1", "1"), 
("John","Dorian", "5", "3"), ("Christopher","Turk", "3", "1"),("Molly","Clock", "3", "2"), ("Bob","Kelso", "2", "2");



INSERT INTO department (name) VALUES ("Finance"),("Information Technology"),("Accounting"),("Marketing"),("Production");

SELECT * FROM department;

INSERT INTO role (title, salary, department_id) VALUES ("Engineer", 5000, 2),("Accountant", 3000, 3), ("Manager", 6500, 4), ("Analyst", 4500, 2);

SELECT * FROM role;


SELECT  d.name
FROM employee e, role r, department d
WHERE e.role_id = r.id AND
r.department_id =d.id;

SELECT  e.first_name, e.last_name, r.title
FROM employee e, role r
WHERE e.role_id = r.id;
select first_name, last_name from employee e, role r where e.role_id = r.id and r.title="Manager";
SELECT first_name, last_name FROM employee e, role r WHERE e.role_id = r.id AND r.title = 'Manager';

SELECT e1.id, e1.first_name, e1.last_name, CONCAT(e2.first_name, ' ',  e2.last_name) as Manager FROM employee e1, employee e2 WHERE e2.first_name = "Molly" AND e2.last_name = "Clock" AND e2.id = e1.manager_id;
SELECT e.first_name, e.last_name, r.title FROM employee e, role r WHERE e.role_id = r.id AND r.title = "Manager";

select * from employee;

SELECT d.name as 'Department Name', SUM(salary) as 'Utilized Budget' FROM employee e, role r, department d WHERE e.role_id = r.id and r.department_id = d.id and d.name = "Marketing";
