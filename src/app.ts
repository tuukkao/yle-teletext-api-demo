import express from "express";
import { config } from "./config";
import routes from "./routes";

const app = express();
app.use("/v1", routes);
app.listen(config.PORT, () => {
  console.log(`Listening on port ${config.PORT}`);
});
