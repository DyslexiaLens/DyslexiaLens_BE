import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { specs } from "./config/swagger.js";
import { router } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { sendSuccess } from "./utils/response.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.get("/", (_req, res) =>
  sendSuccess(
    res,
    {
      name: "DyslexiaLens Backend API",
      status: "healthy",
      docs: "/api-docs",
      health: "/health",
      apiHealth: "/api/v1/health",
      basePath: "/api/v1",
    },
    "DyslexiaLens Backend API is running",
  ),
);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { swaggerOptions: { persistAuthorization: true } }),
);

app.get("/health", (_req, res) =>
  sendSuccess(res, { status: "healthy" }, "API healthy"),
);

app.use("/api/v1", router);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
