require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");
const fs = require("fs");
const https = require("https");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const connect = async () =>
  await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION_STRING,
  });

var app = express();

//to get the css file from public folder
app.use(express.static(__dirname + "/public"));

//interact with index.ejs
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

//log the request
function logRequest(req) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  console.log(`Request from ${ip} for ${req.url}`);
}

//routes
app.get("/", async (req, res) => {
  logRequest(req);
  const connection = await connect();
  const { rows: todoList } = await connection.execute("SELECT * FROM todo");
  res.render("index.ejs", { todoList });
  await connection.close();
  return null;
});

//route for adding new task
app.post("/newtodo", async (req, res) => {
  const task = req.body.task || "";
  const connection = await connect();
  // write task to database
  await connection.execute(
    "INSERT INTO todo (task) VALUES (:task)",
    { task },
    { autoCommit: true }
  );
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
  await connection.execute(
    "DELETE FROM todo WHERE id = :taskId",
    { taskId },
    { autoCommit: true }
  );
  res.redirect("/");
  await connection.close();
});

//catch the invalid get requests
app.get("*", (req, res) => {
  res.send("<h1>Invalid Page</h1>");
});

// create https server
const PORT = process.argv[2] || 443;
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
