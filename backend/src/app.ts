import express from "express";
import healthRouter from "./routes/health.js";
import { errorHandler } from "./middleware/error-handler.js";
import { requestLogger } from "./middleware/request-logger.js";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import authRouter from "./routes/auth.js";
import testRouter from "./routes/test.js";
import courseRouter from "./routes/courses.js";

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}),
);

app.use(requestLogger);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/health", healthRouter);
app.use("/api", authRouter);
app.use("/api/test", testRouter);
app.use("/api/courses", courseRouter);

app.use(errorHandler);

export default app;