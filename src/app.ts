import express from "express";
import { config } from "./config";

const app = express();
app.listen(config.PORT, () => {
  console.log(`Listening on port ${config.PORT}`);
});