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
        choices: ["View All Employees", "View All Departments", "View Employees By Department", "View Employee Roles", "View Employees By Role", "Add New Employee",
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
    
          case "View Employees By Department":
            employeeByDepartment();
            break;
  
          case "View Employee Roles":
            viewRoles();
            break;
    
          case "View Employees By Role":
            employeeByRole();
            break;

          case "Add New Employee":
            addNewEmployee();
            break;
    
          case "Edit Employee Manager":
            console.log("Edit Employee Manager - Function to be written");
            break;
          
          case "Edit Employee Role":
            console.log("Edit Employees Role - Function to be written");
            break;
          
          case "Remove Employee":
            console.log("Remove Employee - Function to be written");
            break;
                      
          default:
            connection.end()
          
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
  connection.query("SELECT name FROM department", function(err, results) {
    if (err) throw err;        
    inquirer
      .prompt({
        name: "name",
        type: "list",
        message: "Select Department",
        choices: function() {
          //start of function
          var departmentList = [];
          for (var i = 0; i < results.length; i++){
            departmentList.push(results[i].name);
          }    
          return departmentList;
        }
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
  }); //end of first connection.query - select name from department
}

//================================View employee by role=============================================

function employeeByRole() {
  connection.query("SELECT title FROM role", function(err, results) {
    if (err) throw err;        
    inquirer
      .prompt({
        name: "title",
        type: "list",
        message: "Select Role",
        choices: function() {
          //start of function
          var employeeTitles = [];
          for (var i = 0; i < results.length; i++){
            employeeTitles.push(results[i].title);
          }    
          return employeeTitles;
        }
      })
      .then(function(answer){
        console.log(answer.title);
        var query = "SELECT e.first_name, e.last_name, r.title FROM employee e, role r WHERE e.role_id = r.id AND ?";
        connection.query(query, { title: answer.title}, function(err, results) {
          if (err) throw err;
          console.table(results);
          connection.end();
          return results;
  
      });
    });  
  });
}

// get Titles - Promisified function
function getTitles(){
  return new Promise((resolve, reject) => {
    connection.query("SELECT title FROM role", function(err, results) {
      if (err) return reject(err);        
      var employeeTitles = [];
      for (var i = 0; i < results.length; i++){
          employeeTitles.push(results[i].title);
      }
      return resolve(employeeTitles);
    })
  });
}

// get Managers - Promisified function
function getManagers(){
  return new Promise((resolve, reject) => {
    connection.query("SELECT first_name, last_name FROM employee e, role r WHERE e.role_id = r.id AND r.title = 'Manager'", function(err, results) {
      if (err) return reject(err);        
      var managerNames = [];
      for (var i = 0; i < results.length; i++){
          managerNames.push(results[i].first_name + " " + results[i].last_name);
      }
      return resolve(managerNames);
    })
  });
}

// =======================================Add Employee==============================================================


  async function addNewEmployee(){
    let empTitles = await getTitles();
    let managerNames = await getManagers();
    
    // end select
    inquirer
        .prompt([{
            name: "firstName",
            type: "input",
            message: "Enter employee's first name: "
        },
        {
            name: "lastName",
            type: "input",
            message: "Enter employees last name: "
        },
        {
            name: "role",
            type: "list",
            message: "Select Employee Role:",
            choices: empTitles
        },
        {
            name: "manager",
            type: "list",
            message: "Select Employee's Manager: ",
            choices: managerNames
        }
    ])
        .then(async function (answer) {
          connection.query("SELECT id FROM role WHERE ?", {title:answer.role}, function(err, roleId){ 
            if (err) throw err;
            //split name into first name and last name
            var managerFirstName = answer.manager.split(' ').slice(0, -1).join(' ');
            var managerLastName = answer.manager.split(' ').slice(-1).join(' ');
            //console.log("First Name: " + managerFirstName + "Last Name: " + managerLastName);

            //get Manager ID

            connection.query("SELECT id FROM employee WHERE ? AND ?", [{first_name:managerFirstName}, {last_name:managerLastName}], function(err, managerId){
            
              if (err) {
                console.log(err);
                throw err;
              }
              // Insert Query
              connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${answer.firstName}","${answer.lastName}",${roleId[0].id},${managerId[0].id})`, function (err, result) {
                if (err) throw err;
                console.log(result.affectedRows + " record(s) updated");
              })
              connection.end();
            });
          });
          //console.log(roleID[0].id);
          // console.log(roleID);
          
        //     // connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${answer.firstName}","${answer.lastName}",${answer.roleID},${answer.managerID})`, function (err, result) {
        //     //     if (err) throw err;
        //     //     console.log(result.affectedRows + " record(s) updated");
        //     // })
            
        //     // connection.end();
         });
}

// ========================================Role Function==================================================
