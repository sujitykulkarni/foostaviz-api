require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const elementsRouter = require("./routes/elements");
const teamsRouter = require("./routes/teams");
const fixturesRouter = require("./routes/fixtures");

// defining the Express app
const app = express();

// Establishing the port
const PORT = process.env.PORT || 5000;

// adding Helmet to enhance your Rest API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan("combined"));

app.use(express.static("public"));
// routes
app.use("/docs", express.static("public"));
app.use("/elements", elementsRouter);
app.use("/teams", teamsRouter);
app.use("/fixtures", fixturesRouter);
// starting the server
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
