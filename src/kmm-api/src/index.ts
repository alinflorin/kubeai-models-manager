import "dotenv/config";
import express from "express";
import { version } from "./version";
import errorHandler from "./middleware/error-handler";
import notFoundHandler from "./middleware/not-found-handler";

const app = express();
app.use(express.json());  ///  req.body 

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", version: version });
});







app.use(notFoundHandler);

app.use(errorHandler);

app.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
