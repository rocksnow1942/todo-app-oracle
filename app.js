require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");
const fs = require("fs");
const https = require("https");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const connect = async () =>
  await oracledb.getConnection({
    user: process.env.DB_USER || "system",
    password: process.env.DB_PASSWORD || "password",
    connectString: "localhost/FREEPDB1",
  });

var app = express();

//to get the css file from public folder
app.use(express.static(__dirname + "/public"));

//interact with index.ejs
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

//routes
app.get("/", async (req, res) => {
  const connection = await connect();
  const todoList = await connection.execute("SELECT * FROM todo");
  res.render("index.ejs", { todoList });
  await connection.close();
  return null;
});

//route for adding new task
app.post("/newtodo", async (req, res) => {
  const task = req.body.task;
  const connection = await connect();
  // write task to database
  await connection.execute("INSERT INTO todo VALUES (:task)", { task });
  res.redirect("/");
  await connection.close();
  return null;
});

//route to delete a task by id
app.get("/delete/:id", async (req, res) => {
  const taskId = req.params.id; //get the id from the api
  console.log(req.params.id);
  const connection = await connect();
  //delete the task from database
  await connection.execute("DELETE FROM todo WHERE id = :taskId", { taskId });
  res.redirect("/");
  await connection.close();
});

//catch the invalid get requests
app.get("*", (req, res) => {
  res.send("<h1>Invalid Page</h1>");
});

// create https server
const PORT = 443;
https
  .createServer(
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    },
    app
  )
  .listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
