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

const server = app.listen(PORT, HOST, () => {
    logger.debug(`Running on http://${HOST}:${PORT}`);
});

// Call server.close on SIGTERM
process.on('SIGTERM', () => {
    logger.debug('SIGTERM signal received: closing HTTP server')
    server.close(() => {
        logger.debug('HTTP server closed')
    })
})
