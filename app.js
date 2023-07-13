import boardsRoutes from "./routes/boards-routes.js"; // boardsRoutes is a kind of middleware
import usersRoutes from "./routes/users-routes.js";
import HttpError from "./models/http-error.js";

import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5000;
const database = process.env.MONGO_CONNECT_STRING;

app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/boards", boardsRoutes);
app.use("/api/users", usersRoutes);
// app.use(express.static("../client/build"));
app.use((req, res) => {
  res
    .status(404)
    .sendFile(path.join(__dirname, "client", "build", "index.html"));
});
app.use((req, res, next) => {
  throw new HttpError("Could not found this route!", 404);
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

mongoose
  .connect(process.env.MONGO_CONNECT_STRING)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is up on port: ${port}`);
      console.log(`mongo is connect with ${database}`);
      console.log(__dirname);
    });
  })
  .catch((err) => {
    console.log(err);
  });
