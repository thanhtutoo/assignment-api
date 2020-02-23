import "reflect-metadata";
import { createConnection, ConnectionOptions } from 'typeorm'
import * as express from "express";
import * as bodyParser from "body-parser";
import routes from "./routes/index";

// create express app
const app = express();
app.use(bodyParser.json());

// register all application routes
app.use("/", routes);
// run app
app.listen(3000);

console.log("OUr application is up and running on port 3000");

// create connection with database
// note that it's not active database connection
// TypeORM creates connection pools and uses them for your requests
createConnection().then(async connection => {
  console.log("DB connected");
}).catch(error => console.log("TypeORM connection error: ", error));

module.exports = app; // for testing