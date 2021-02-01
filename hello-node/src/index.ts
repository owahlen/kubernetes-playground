import express from "express";
import logger from "./logger";

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, HOST, () => {
  logger.debug(`Running on http://${HOST}:${PORT}`);
});
