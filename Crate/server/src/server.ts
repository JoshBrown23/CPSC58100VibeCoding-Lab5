import { createApp } from "./app";
import { config } from "./config/env";

const app = createApp();

app.listen(config.port, () => {
  console.log(`Crate API listening on http://localhost:${config.port}`);
});
