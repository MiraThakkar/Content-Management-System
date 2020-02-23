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
        choices: ["View All Employees", 
                  "View All Departments", 
                  "View Employee Roles", 
                  "View Employees By Department",
                  "View Employees By Manager", 
                  "View Employees By Role", 
                  "Add New Employee", 
                  "Add New Department",
                  "Add New Role",
                  "Edit Employee Manager", 
                  "Edit Employee Role", 
                  "Remove Employee"
                ]
      })
      .then(function(answer) {
        switch (answer.action) {
          case "View All Employees":
            viewEmployees();
            break;
    
          case "View All Departments":
            viewDepartments();
            break;

          case "View Employee Roles":
          viewRoles();
          break;
    
          case "View Employees By Department":
            employeeByDepartment();
            break;

          case "View Employees By Manager":
            employeeByManager();
            break;
  
          case "View Employees By Role":
            employeeByRole();
            break;

          case "Add New Employee":
            addNewEmployee();
            break;

          case "Add New Department":
            addDepartment();
            break;
          case "Add New Role":
            addNewRole();
            break;
    
          case "Edit Employee Manager":
            editEmployeeManager();
            break;
          
          case "Edit Employee Role":
            editEmployeeRole();
            break;
          
          case "Remove Employee":
            removeEmployee();
            break;
                      
          default:
            connection.end()
          
        }
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

// get Employees - Promisified function
function getEmployees(){
  return new Promise((resolve, reject) => {
    connection.query("SELECT first_name, last_name FROM employee", function(err, results) {
      if (err) return reject(err);        
      var employeeNames = [];
      for (var i = 0; i < results.length; i++){
          employeeNames.push(results[i].first_name + " " + results[i].last_name);
      }
      return resolve(employeeNames);
    })
  });
}

// get Departments - Promisified function
function getDepartments(){
  return new Promise((resolve, reject) => {
    connection.query("SELECT name FROM department", function(err, results) {
      if (err) return reject(err);        
      var departmentNames = [];
      for (var i = 0; i < results.length; i++){
          departmentNames.push(results[i].name);
      }
      return resolve(departmentNames);
    });
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
    });
  });
}


// ===============================View employee by manager===============================
async function employeeByManager() {
  let managers = await getManagers();
  inquirer
    .prompt({
      name: "managerName",
      type: "list",
      message: "Select Manager",
      choices: managers
    })
    .then(function(answer){
      var managerFirstName = answer.managerName.split(' ').slice(0, -1).join(' ');
      var managerLastName = answer.managerName.split(' ').slice(-1).join(' ');

      connection.query("SELECT id FROM employee WHERE ? AND ?", [{first_name:managerFirstName}, {last_name:managerLastName}], function(err, managerId){
        
        if (err) {
          console.log(err);
          throw err;
        }
        var query = "SELECT e1.id, e1.first_name, e1.last_name, CONCAT(e2.first_name, ' ',  e2.last_name) as Manager FROM employee e1, employee e2 WHERE e2.id = e1.manager_id AND e2.id = ?";
        connection.query(query, managerId[0].id, function(err, results) {
          if (err) throw err;
          console.table(results);
          connection.end();
          return results;
        });
      });
    });
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
      
      });
}

//===========================Add Department=================================

function addDepartment (){
  inquirer
      .prompt([{
          name: "name",
          type: "input",
          message: "Enter Department you would like to add: "
      }
    ])
    .then(function (answer){
      connection.query(`INSERT INTO department (name) VALUES ("${answer.name}")`, function(err, result){
        if (err) throw err;
        console.log(result.affectedRows + " record(s) updated");
      })
      connection.end();
    });
}


//===========================Add new role=================================

async function addNewRole() {
  var departmentNames = await getDepartments();
  inquirer
      .prompt([{
          name: "title",
          type: "input",
          message: "Enter role title: "
      },
      {
        name: "salary",
        type: "input",
        message: "Enter role salary: "
      },
      {
        name: "department",
        type: "list",
        message: "Select a department",
        choices: departmentNames
      }

    ])
    .then(function (answer){
      connection.query("SELECT id FROM department WHERE ?", {name:answer.department}, function(err, department){ 
        if (err) throw err;
        connection.query(`INSERT INTO role (title, salary, department_id) VALUES ("${answer.title}", "${answer.salary}", "${department[0].id}")`, function(err, result){
          if (err) throw err;
          console.log(result.affectedRows + " record(s) updated");
          connection.end();
        })
      });
      
    });
}

//=============================update employeee role=======================

async function editEmployeeRole(){
  let empNames = await getEmployees();
  let empTitles = await getTitles();
  // let managerNames = await getManagers();
  
  
  inquirer
      .prompt([{

          name: "name",
          type: "list",
          message: "Select employee: ",
          choices: empNames
      },
      {
          name: "title",
          type: "list",
          message: "Select employee's new role: ",
          choices: empTitles
      }
  ])
  .then(function (answer){
    var firstName = answer.name.split(' ').slice(0, -1).join(' ');
    var lastName = answer.name.split(' ').slice(-1).join(' ');
    connection.query("SELECT id FROM role WHERE ?", {title:answer.title}, function(err, result){ 
      if (err) throw err;
      connection.query("UPDATE employee SET ? WHERE ? AND ?", [{role_id: result[0].id}, {first_name:firstName}, {last_name:lastName}], function(err, result){
        if (err) throw err;
        console.log(result.affectedRows + " record(s) updated");
        connection.end();
      })
    });
  
  });
}


//=============================update employeee manager=======================

async function editEmployeeManager(){
  let empNames = await getEmployees();
  let managers = await getManagers();
    
  inquirer
      .prompt([{

          name: "name",
          type: "list",
          message: "Select employee: ",
          choices: empNames
      },
      {
          name: "manager",
          type: "list",
          message: "Select employee's new manager: ",
          choices: managers
      }
  ])
  .then(function (answer){
    var managerFirstName = answer.manager.split(' ').slice(0, -1).join(' ');
    var managerLastName = answer.manager.split(' ').slice(-1).join(' ');
    
    var empFirstName = answer.name.split(' ').slice(0, -1).join(' ');
    var empLastName = answer.name.split(' ').slice(-1).join(' ');

    connection.query("SELECT id FROM employee WHERE ? AND ?", [{first_name:managerFirstName}, {last_name:managerLastName}], function(err, result){ 
      if (err) throw err;
      connection.query("UPDATE employee SET ? WHERE ? AND ?", [{manager_id: result[0].id}, {first_name:empFirstName}, {last_name:empLastName}], function(err, result){
        if (err) throw err;
        console.log(result.affectedRows + " record(s) updated");
        connection.end();
      })
    });
  
  });
}




//==========================Remove Employee================================
async function removeEmployee() {
  let employeeNames = await getEmployees();
  inquirer
  .prompt({
    name: "empName",
    type: "list",
    message: "Which employee would you like to remove?",
    choices: employeeNames
  })
  .then(function(answer) {
    
    var employeeFirstName = answer.empName.split(' ').slice(0, -1).join(' ');
    var employeeLastName = answer.empName.split(' ').slice(-1).join(' ');

    connection.query("DELETE FROM employee WHERE ? AND ?", [{first_name:employeeFirstName}, {last_name:employeeLastName}], function(err, result){
            
      if (err) throw err;
      console.log(result.affectedRows + " record(s) deleted");
      connection.end();
    });
    
  });
}