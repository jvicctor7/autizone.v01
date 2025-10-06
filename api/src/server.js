import { buildApp } from "./app.js";
import { env } from "./lib/env.js";

const app = buildApp();
app.listen(env.PORT, () => {
  console.log(`API rodando em http://localhost:${env.PORT}`);
});
