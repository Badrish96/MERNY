const express = require("express");
const mongoose = require("mongoose");
const serverConfig = require("./configs/serverConfig");
const dbConfig = require("./configs/dbConfig");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(dbConfig.DB_URL);

const db = mongoose.connection;

db.on("error", () => {
  console.log("Error while connecting to Database ");
});

db.once("open", () => {
  console.log("Connected to Database");
});

//Routes
require("./routes/authRoutes.js")(app);
require("./routes/userRoutes.js")(app);
require("./routes/postRoutes")(app);
require("./routes/commentRoutes")(app);
require("./routes/notificationRoutes")(app);

app.listen(serverConfig.PORT, () => {
  console.log(`Server running on ${serverConfig.PORT}`);
});
