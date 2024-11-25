const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT, PATCH,DELETE",
    allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept",
  })
);

const generalRoutes = require("./api/routes/generalRoutes");
app.use("/", generalRoutes);

app.listen(port, () => {
  try {
    console.log(`App listening on port ${port}!`);
  } catch (error) {
    console.log(error);
  }
});
