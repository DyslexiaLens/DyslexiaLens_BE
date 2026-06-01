import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
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

app.get("/api-docs/openapi.json", (_req, res) => {
  res.json(specs);
});

app.get("/api-docs", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>DyslexiaLens API Docs</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui.css" />
    <style>
      html {
        box-sizing: border-box;
        overflow-y: scroll;
      }

      *, *:before, *:after {
        box-sizing: inherit;
      }

      body {
        margin: 0;
        background: #0f172a;
      }

      .swagger-ui .topbar {
        display: none;
      }

      .swagger-ui .information-container {
        margin-bottom: 24px;
      }

      .swagger-ui .scheme-container {
        background: #111827;
        border-radius: 12px;
        padding: 12px 16px;
        margin-bottom: 16px;
      }

      .swagger-ui .info .title,
      .swagger-ui .info p,
      .swagger-ui .opblock-summary-description,
      .swagger-ui .opblock-description-wrapper,
      .swagger-ui .parameter__name,
      .swagger-ui .parameter__type,
      .swagger-ui .response-col_status,
      .swagger-ui .response-col_description,
      .swagger-ui label,
      .swagger-ui .tab li,
      .swagger-ui .renderedMarkdown,
      .swagger-ui .model-title,
      .swagger-ui .prop-type,
      .swagger-ui .parameter__in {
        color: #e5e7eb;
      }

      .swagger-ui .wrapper {
        max-width: 1280px;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: "/api-docs/openapi.json",
          dom_id: "#swagger-ui",
          deepLinking: true,
          persistAuthorization: true,
          displayRequestDuration: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset,
          ],
          layout: "BaseLayout",
        });
      };
    </script>
  </body>
</html>`);
});

app.get("/health", (_req, res) =>
  sendSuccess(res, { status: "healthy" }, "API healthy"),
);

app.use("/api/v1", router);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
