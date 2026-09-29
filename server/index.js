import { app } from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Galaxy Transit Companion Server running at http://localhost:${PORT}`);
});
