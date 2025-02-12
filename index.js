import { startBot } from "./src/adapters/inbound/WhatsAppBot.js";
import { addLog } from "./src/adapters/outbound/WhatsAppService.js";

(async () => {
  try {
    await startBot();
    addLog("Bot iniciado com sucesso!");
  } catch (error) {
    addLog(`Erro ao iniciar o bot: ${error.message}`);
  }
})();
