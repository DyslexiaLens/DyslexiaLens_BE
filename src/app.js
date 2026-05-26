import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger.js";
import { router } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { sendSuccess } from "./utils/response.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

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
