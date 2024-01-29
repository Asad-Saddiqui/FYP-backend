const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const connectdb = () => {
  // mongoose.connect('mongodb+srv://FYP:asad2723101@cluster0.hyldwcr.mongodb.net/project',
  mongoose.connect("mongodb://localhost:27017/myproject", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4
  });
  // ...
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error: "));
  db.once("open", function () {
    console.log("Connected successfully");
  });
};
connectdb();




app.use(express.json());
app.use(cors());
app.use("/api", require("./Routes/patientsRoutes"));
//  /api/add/prescription
app.use("/api", require("./Routes/prescriptionRoutes"));
app.use("/api", require("./Routes/tamplateRoutes"));
app.use("/api", require("./Routes/Medcines"));


app.listen(4000, () => {
  console.log("app runing on  4000 port");
});

