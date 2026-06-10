import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Schemas used across the API
const createGoalSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().min(1),
  deadline: z.string().datetime().optional(),
});

const updateGoalSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  deadline: z.string().datetime().optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
});

const createReviewSchema = z.object({
  weekStart: z.string().datetime(),
  weekEnd: z.string().datetime(),
  wins: z.string().optional(),
  challenges: z.string().optional(),
  nextWeekPlan: z.string().optional(),
  rating: z.number().int().min(1).max(10).optional(),
});

const registerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
});

const errorSchema = z.object({
  error: z.string(),
});

const goalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  deadline: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const reviewSchema = z.object({
  id: z.string(),
  userId: z.string(),
  weekStart: z.string().datetime(),
  weekEnd: z.string().datetime(),
  wins: z.string().nullable(),
  challenges: z.string().nullable(),
  nextWeekPlan: z.string().nullable(),
  rating: z.number().int().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const userSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string(),
  createdAt: z.string().datetime(),
});

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Talkvex API",
    version: "1.0.0",
    description: "API REST para gerenciamento de metas, hábitos diários e revisões semanais.",
  },
  servers: [
    {
      url: process.env.NEXTAUTH_URL || "http://localhost:3000",
      description: "API Server",
    },
  ],
  components: {
    schemas: {
      Goal: zodToJsonSchema(goalSchema as any, "Goal"),
      CreateGoal: zodToJsonSchema(createGoalSchema as any, "CreateGoal"),
      UpdateGoal: zodToJsonSchema(updateGoalSchema as any, "UpdateGoal"),
      Review: zodToJsonSchema(reviewSchema as any, "Review"),
      CreateReview: zodToJsonSchema(createReviewSchema as any, "CreateReview"),
      User: zodToJsonSchema(userSchema as any, "User"),
      Register: zodToJsonSchema(registerSchema as any, "Register"),
      Error: zodToJsonSchema(errorSchema as any, "Error"),
    },
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "next-auth.session-token",
        description: "Autenticação via cookie de sessão do NextAuth",
      },
    },
    responses: {
      Unauthorized: {
        description: "Não autenticado",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { error: "Não autenticado" },
          },
        },
      },
      NotFound: {
        description: "Recurso não encontrado",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { error: "Recurso não encontrado" },
          },
        },
      },
      ValidationError: {
        description: "Erro de validação",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { error: "Required; String must contain at least 1 character(s)" },
          },
        },
      },
      ServerError: {
        description: "Erro interno do servidor",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { error: "Erro interno do servidor" },
          },
        },
      },
    },
  },
  paths: {
    "/api/register": {
      post: {
        summary: "Registrar novo usuário",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Register" },
            },
          },
        },
        responses: {
          "201": {
            description: "Usuário criado com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          "400": {
            description: "Dados inválidos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                examples: {
                  missingFields: {
                    value: { error: "Email e senha são obrigatórios" },
                  },
                  shortPassword: {
                    value: { error: "A senha deve ter pelo menos 8 caracteres" },
                  },
                },
              },
            },
          },
          "409": {
            description: "Email já cadastrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { error: "Usuário já cadastrado com esse email" },
              },
            },
          },
          "500": { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/me": {
      get: {
        summary: "Obter dados do usuário autenticado",
        tags: ["Authentication"],
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Dados do usuário",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/goals": {
      get: {
        summary: "Listar todas as metas do usuário",
        tags: ["Goals"],
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Lista de metas",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Goal" },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        summary: "Criar nova meta",
        tags: ["Goals"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateGoal" },
            },
          },
        },
        responses: {
          "201": {
            description: "Meta criada com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Goal" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "422": { $ref: "#/components/responses/ValidationError" },
        },
      },
    },
    "/api/goals/{id}": {
      get: {
        summary: "Obter meta específica",
        tags: ["Goals"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID da meta",
          },
        ],
        responses: {
          "200": {
            description: "Dados da meta",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Goal" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: {
        summary: "Atualizar meta",
        tags: ["Goals"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID da meta",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateGoal" },
            },
          },
        },
        responses: {
          "200": {
            description: "Meta atualizada com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Goal" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "422": { $ref: "#/components/responses/ValidationError" },
        },
      },
      delete: {
        summary: "Excluir meta",
        tags: ["Goals"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID da meta",
          },
        ],
        responses: {
          "200": {
            description: "Meta excluída com sucesso",
            content: {
              "application/json": {
                schema: { type: "object", properties: { message: { type: "string" } } },
                example: { message: "Meta excluída com sucesso" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/goals/{id}/generate": {
      post: {
        summary: "Gerar plano de ação para meta",
        description: "Usa IA para gerar plano anual, trimestral e semanal",
        tags: ["Goals"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID da meta",
          },
        ],
        responses: {
          "200": {
            description: "Planos gerados com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    annualPlan: { type: "string" },
                    quarterlyPlan: { type: "string" },
                    weeklyPlan: { type: "string" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/reviews": {
      get: {
        summary: "Listar revisões semanais",
        tags: ["Reviews"],
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Lista de revisões",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Review" },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        summary: "Criar nova revisão semanal",
        tags: ["Reviews"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateReview" },
            },
          },
        },
        responses: {
          "201": {
            description: "Revisão criada com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Review" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "422": { $ref: "#/components/responses/ValidationError" },
        },
      },
    },
    "/api/reviews/generate-questions": {
      post: {
        summary: "Gerar perguntas guiadas para revisão",
        description: "Usa IA para gerar perguntas personalizadas baseadas nas metas e histórico",
        tags: ["Reviews"],
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Perguntas geradas com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    questions: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/reviews/{id}/adjust": {
      post: {
        summary: "Ajustar planos com base na revisão",
        description: "Usa IA para sugerir ajustes nos planos",
        tags: ["Reviews"],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID da revisão",
          },
        ],
        responses: {
          "200": {
            description: "Sugestões geradas com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    suggestions: { type: "string" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/daily/today": {
      get: {
        summary: "Obter hábitos e tarefas do dia",
        tags: ["Daily"],
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Dados do dia",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    habits: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          completed: { type: "boolean" },
                        },
                      },
                    },
                    tasks: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          description: { type: "string" },
                          completed: { type: "boolean" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/metrics/weekly": {
      get: {
        summary: "Obter métricas semanais",
        description: "Estatísticas de progresso e consistência",
        tags: ["Metrics"],
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Métricas semanais",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    completionRate: { type: "number" },
                    streak: { type: "number" },
                    totalHabits: { type: "number" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
  },
  tags: [
    { name: "Authentication", description: "Autenticação e gerenciamento de usuários" },
    { name: "Goals", description: "Gerenciamento de metas" },
    { name: "Reviews", description: "Revisões semanais" },
    { name: "Daily", description: "Hábitos e tarefas diárias" },
    { name: "Metrics", description: "Métricas e estatísticas" },
  ],
};
