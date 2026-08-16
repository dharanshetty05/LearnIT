import express from "express";
import healthRouter from "./routes/health.js";
import { errorHandler } from "./middleware/error-handler.js";
import { requestLogger } from "./middleware/request-logger.js";
import cors from "cors";

const app = express();

app.use(express.json());

app.use(cors({
    origin: "http://localhost:3000",
}),
);

app.use(requestLogger);

app.use("/health", healthRouter);

app.use(errorHandler);

export default app;