"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/routes/transations.ts
var transations_exports = {};
__export(transations_exports, {
  transactionsRoutes: () => transactionsRoutes
});
module.exports = __toCommonJS(transations_exports);

// src/database.ts
var import_knex = require("knex");

// src/env/index.ts
var import_config = require("dotenv/config");
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: import_zod.z.string(),
  PORT: import_zod.z.number().default(3333)
});
var _env = envSchema.safeParse(process.env);
if (_env.success === false) {
  console.error("Invalid environment variables", _env.error.format());
  throw new Error("Invalid environment variables");
}
var env = _env.data;

// src/database.ts
var config = {
  client: "sqlite",
  connection: {
    filename: env.DATABASE_URL
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./db/migrations"
  }
};
var knex = (0, import_knex.knex)(config);

// src/routes/transations.ts
var import_zod2 = require("zod");
var import_crypto = require("crypto");

// src/middlewares/check-session-id-exists.ts
function checkSessionIdExists(request, reply) {
  return __async(this, null, function* () {
    const sessionId = request.cookies.sessionId;
    if (!sessionId) {
      return reply.status(401).send({
        error: "Unauthorized"
      });
    }
  });
}

// src/routes/transations.ts
function transactionsRoutes(app) {
  return __async(this, null, function* () {
    app.get(
      "/",
      {
        preHandler: [checkSessionIdExists]
      },
      (request, reply) => __async(this, null, function* () {
        const { sessionId } = request.cookies;
        const transactions = yield knex("transactions").where("session_id", sessionId).select();
        return { transactions };
      })
    );
    app.get(
      "/:id",
      {
        preHandler: [checkSessionIdExists]
      },
      (request) => __async(this, null, function* () {
        const getTransactionParamsSchema = import_zod2.z.object({
          id: import_zod2.z.string().uuid()
        });
        const { id } = getTransactionParamsSchema.parse(request.params);
        const { sessionId } = request.cookies;
        const transaction = yield knex("transactions").where({ session_id: sessionId, id }).andWhere("session_id", sessionId).first();
        return { transaction };
      })
    );
    app.get(
      "/summary",
      {
        preHandler: [checkSessionIdExists]
      },
      (request) => __async(this, null, function* () {
        const { sessionId } = request.cookies;
        const summary = yield knex("transactions").where("session_id", sessionId).sum("amount", {
          as: "amount"
        }).first();
        return { summary };
      })
    );
    app.post(
      "/",
      {
        preHandler: [checkSessionIdExists]
      },
      (request, reply) => __async(this, null, function* () {
        const createTrasactionBodySchema = import_zod2.z.object({
          title: import_zod2.z.string(),
          amount: import_zod2.z.number(),
          type: import_zod2.z.enum(["credit", "debit"])
        });
        const { title, amount, type } = createTrasactionBodySchema.parse(
          request.body
        );
        let sessionId = request.cookies.sessionId;
        if (!sessionId) {
          sessionId = (0, import_crypto.randomUUID)();
          reply.cookie("sessionId", sessionId, {
            path: "/",
            maxAge: 1e3 * 60 * 60 * 24 * 7
            // 7 days
          });
        }
        yield knex("transactions").insert({
          id: (0, import_crypto.randomUUID)(),
          title,
          amount: type === "credit" ? amount : amount * -1
        });
        return reply.status(201).send();
      })
    );
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  transactionsRoutes
});
