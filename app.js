require('dotenv').config();
var mysql = require("mysql");
var inquirer = require("inquirer");

const cTable = require('console.table');





var connection = mysql.createConnection({
        host: process.env.host,
        user: "root",
        password: process.env.password,
        database: process.env.database
});




// connect to the mysql server and sql database
connection.connect(function(err) {
    if (err) throw err;

    console.log(process.env.username);
    console.log(process.env.host);
    console.log(process.env.password);
    console.log(process.env.database);


    // run the start function after the connection is made to prompt the user
    startApp();
});


// function which prompts the user for what action they should take

function startApp() {
    inquirer
      .prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: ["View All Employees", "View Employees By Department", "View Employees By Role", "Add New Employee",
         "Edit Employee Manager", "Edit Employee Role", "Remove Employee"]
      })
      .then(function(answer) {
        switch (answer.action) {
          case "View All Employees":
            viewEmployees();
            break;
    
          case "View All Departments":
            viewDepartments();
            break;
    
          case "view Employee Roles":
            viewRoles();
            break;
    
          case "View Employees by Role":
            songSearch();
            break;

          case "Add New Employee":
            addNewEmployee();
            break;
    
          case "View Employees by Department":
            connection.end();
            break;
        }
      });
  }
        



// ========================View all employees===================================

function viewEmployees() {

    connection.query("SELECT * FROM employee", function(err, results) {
        if (err) throw err;
        console.table(results);
        connection.end();
        return results;

    });

}

// ========================View all departments===================================

function viewDepartments() {

  connection.query("SELECT * FROM department", function(err, results) {
      if (err) throw err;
      console.table(results);
      connection.end();
      return results;

  });

}

// ========================View all Roles===================================

function viewRoles() {

  connection.query("SELECT * FROM role", function(err, results) {
      if (err) throw err;
      console.table(results);
      connection.end();
      return results;

  });

}

//==========================Remove Employee========================================

function removeEmployee() {
    console.log("Inside remove employee function");
    inquirer
    .prompt({
      name: "deleteemployee",
      type: "list",
      message: "?",
      choices: ["View All Employees", "View Employees By Department", "View Employees By Role", "Add Employee",
       "Edit Employee Manager", "Edit Employee Role", "Remove Employee"]
    })
    .then(function(answer) {

      console.log(answer);

    });

}


// ===============================View employee by department===============================
function employeeByDepartment() {

  console.log("Inside  employeeByDept function");

  return inquirer
  .prompt({
    name: "name",
    type: "list",
    message: "Select Department",
    choices: ["Finance", "Information Technology", "Accounting", "Marketing", "Production"]
  })
    .then(function(answer){
      var query = "SELECT e.first_name, e.last_name, d.name FROM employee e, role r, department d WHERE e.role_id = r.id AND r.department_id = d.id AND  ?";
      connection.query(query, { name: answer.name}, function(err, results) {
        if (err) throw err;
        console.table(results);
        connection.end();
        return results;

      });
      // console.log(name);
    });

}

//================================View employee by role=============================================

function employeeByRole() {

  console.log("Inside  employeeByRole function");

  return inquirer
  .prompt({
    name: "empName",
    type: "list",
    message: "Which employee do you want to remove?",
    choices: ["Engineer", "Accountant", "Manager", "Analyst"]
  })
    .then(function(answer){
      var query = "SELECT e.first_name, e.last_name, r.title FROM employee e, role r WHERE e.role_id = r.id AND ?";
      connection.query(query, { title: answer.role}, function(err, results) {
        if (err) throw err;
        console.table(results);
        connection.end();
        return results;

      });
     
    });

}

// =======================================Add Employee==============================================================


  function addNewEmployee(){
    inquirer
        .prompt([{
            name: "Name",
            type: "input",
            message: "Enter employee's first name: "
        },
        {
            name: "lastName",
            type: "input",
            message: "Enter employees last name: "
        },
        {
            name: "roleID",
            type: "input",
            message: "Enter role ID: "
        },
        {
            name: "managerID",
            type: "input",
            message: "Enter mananger ID: "
        }
    ])
        .then(function (answer) {
            connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${answer.firstName}","${answer.lastName}",${answer.roleID},${answer.managerID})`, function (err, result) {
                if (err) throw err;
                console.log(result.affectedRows + " record(s) updated");
            })
            
            connection.end();
        });
}

