import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DyslexiaLens Backend API",
      version: "1.0.0",
      description:
        "RESTful API for DyslexiaLens application with authentication, profile, AI upload, and history features",
      contact: {
        name: "DyslexiaLens Team",
        email: "support@dyslexialens.app",
      },
      license: {
        name: "MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Local Development Server",
      },
      {
        url: "https://dyslexia-lens-be.vercel.app/api/v1",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Authorization header using the Bearer scheme",
        },
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operation successful",
            },
            data: {
              type: "object",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
              },
              nullable: true,
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            fullName: {
              type: "string",
              example: "John Doe",
            },
            email: {
              type: "string",
              example: "john@example.com",
            },
            phone: {
              type: "string",
              example: "08123456789",
              nullable: true,
            },
            birth_date: {
              type: "string",
              format: "date",
              example: "1990-01-01",
              nullable: true,
            },
            avatar_url: {
              type: "string",
              example: "uploads/avatar.jpg",
              nullable: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        DetectionHistory: {
          type: "object",
          properties: {
            id: {
              type: "integer",
            },
            user_id: {
              type: "integer",
            },
            image_url: {
              type: "string",
            },
            predicted_text: {
              type: "string",
            },
            confidence: {
              type: "number",
              format: "float",
            },
            result_label: {
              type: "string",
              enum: ["LIKELY_DYSLEXIA_PATTERN", "NORMAL_PATTERN"],
            },
            raw_response: {
              type: "object",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Auth",
        description: "Authentication endpoints",
      },
      {
        name: "Profile",
        description: "User profile management",
      },
      {
        name: "AI",
        description: "AI upload and detection",
      },
      {
        name: "History",
        description: "Detection and translation history",
      },
      {
        name: "System",
        description: "System endpoints",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

export const specs = swaggerJsdoc(options);
