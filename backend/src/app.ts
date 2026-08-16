import express from "express";
import healthRouter from "./routes/health.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();

app.use(express.json());

app.use("/health", healthRouter);

app.use(errorHandler);

export default app;