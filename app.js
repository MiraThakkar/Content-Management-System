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
        choices: ["View All Employees", "View Employees By Department", "View Employees By Role", "Add Employee",
         "Edit Employee Manager", "Edit Employee Role", "Remove Employee"]
      })
      .then(function(answer) {
        // based on their answer, either call the bid or the post functions
        if (answer.action === "View All Employees") {
          viewEmployees();
        }
        else if(answer.action === "Remove Employee") {
            removeEmployee();
        }  else if(answer.action === "View Employees By Department") {
          employeeByDepartment();
        }else
        {
          connection.end();
        }
      });
  }

function viewEmployees() {

    connection.query("SELECT * FROM employee", function(err, results) {
        if (err) throw err;
        console.table(results);
        connection.end();
        return results;

    });

}
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

  
// employeeByDepartment();


