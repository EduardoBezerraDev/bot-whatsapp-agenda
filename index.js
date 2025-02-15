import express from "express";
import { startBot } from "./src/adapters/inbound/WhatsAppBot.js";
import { addLog } from "./src/adapters/outbound/WhatsAppService.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot WhatsApp Agenda está rodando!");
});

app.listen(PORT, async () => {
  try {
    await startBot();
  } catch (error) {
    addLog(`Erro ao iniciar o bot: ${error.message}`);
  }
});
