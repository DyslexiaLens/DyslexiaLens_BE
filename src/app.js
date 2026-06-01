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

const swaggerDocsCsp = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
    },
  },
});

app.get("/api-docs", swaggerDocsCsp, (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>DyslexiaLens API Docs</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui.css" />
    <style>
      :root {
        color-scheme: light;
      }

      html {
        box-sizing: border-box;
        overflow-y: scroll;
        background: #e2e8f0;
      }

      *, *:before, *:after {
        box-sizing: inherit;
      }

      body {
        margin: 0;
        background:
          radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 32%),
          linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
        color: #0f172a;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
          "Segoe UI", sans-serif;
      }

      #swagger-ui {
        background: transparent;
        min-height: 100vh;
        padding: 24px 0 40px;
      }

      .swagger-ui .topbar {
        display: none;
      }

      .swagger-ui .wrapper {
        max-width: 1240px;
      }

      .swagger-ui .information-container,
      .swagger-ui .scheme-container,
      .swagger-ui .opblock,
      .swagger-ui section.models,
      .swagger-ui .responses-wrapper,
      .swagger-ui .tab-wrap {
        border-radius: 16px;
        box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
      }

      .swagger-ui .information-container,
      .swagger-ui .scheme-container,
      .swagger-ui section.models,
      .swagger-ui .tab-wrap {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(148, 163, 184, 0.25);
        padding: 16px 18px;
      }

      .swagger-ui .information-container {
        margin-bottom: 24px;
      }

      .swagger-ui .scheme-container {
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
        color: #0f172a;
      }

      .swagger-ui .info .title {
        font-size: 3rem;
        line-height: 1.05;
        letter-spacing: -0.04em;
        margin-bottom: 0.25rem;
      }

      .swagger-ui .info .description,
      .swagger-ui .info .title small {
        color: #475569;
      }

      .swagger-ui .opblock {
        border: 1px solid rgba(148, 163, 184, 0.24);
        background: rgba(255, 255, 255, 0.92);
        margin-bottom: 12px;
      }

      .swagger-ui .opblock .opblock-summary {
        padding: 14px 16px;
      }

      .swagger-ui .opblock-summary-path,
      .swagger-ui .opblock-summary-description,
      .swagger-ui .opblock-title_normal,
      .swagger-ui .opblock-summary-operation-id,
      .swagger-ui .opblock-summary-method {
        color: #0f172a;
      }

      .swagger-ui .opblock-tag {
        border-bottom: 1px solid rgba(148, 163, 184, 0.28);
      }

      .swagger-ui .btn.authorize,
      .swagger-ui .btn.try-out__btn,
      .swagger-ui .btn.execute,
      .swagger-ui .btn.cancel,
      .swagger-ui select,
      .swagger-ui input,
      .swagger-ui textarea {
        border-radius: 10px;
      }

      .swagger-ui .btn.authorize {
        background: #0f766e;
        border-color: #0f766e;
        color: #fff;
      }

      .swagger-ui .btn.authorize svg {
        fill: #fff;
      }

      .swagger-ui .btn.authorize:hover {
        background: #115e59;
        border-color: #115e59;
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
