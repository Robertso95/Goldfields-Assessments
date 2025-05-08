require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const storyRoutes = require("./routes/stories");
const classRoutes = require("./routes/classRoutes");
const userRoutes = require("./routes/userRoutes");
const homeRoutes = require("./routes/homeRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  if (req.method === 'PUT' || req.method === 'DELETE' || req.method === 'POST') {
    console.log('Request params:', req.params);
    if (Object.keys(req.body).length > 0) {
      console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
  }
  next();
});

app.use("/api/stories", storyRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/images", homeRoutes);
app.use("/api", assignmentRoutes); //Sprint 1

/**
 * New Route added for user routes
 */
app.use("/api/users", userRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("connected to db & listening on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});
