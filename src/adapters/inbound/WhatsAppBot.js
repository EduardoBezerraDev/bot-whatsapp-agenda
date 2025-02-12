import { makeWASocket } from "@whiskeysockets/baileys";
import { useMultiFileAuthState } from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import { handleIncomingMessages } from '../../application/BotService.js';
import { addLog, sendWhatsAppMessage } from '../outbound/WhatsAppService.js';
import { restoreScheduledTasks } from '../outbound/FirebaseService.js';

export const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");

  const sock = makeWASocket({
    auth: state,
    syncFullHistory: true,
  });

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", async ({ connection, qr }) => {
    if (connection === "close") {
      console.log("Reconectando...");
      await startBot();
    }
    if (qr) {
      addLog("Escaneie o QR Code para conectar ao WhatsApp.");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "open") {
      await restoreScheduledTasks(sock);
      addLog("Conexão estabelecida com sucesso!");
    } else if (connection === "close") {
      addLog("Conexão encerrada.");
    } else {
      addLog(`Status da conexão: ${connection}`);
    }
  });

  sock.ev.on("messages.upsert", async (msg) =>
    handleIncomingMessages(sock, msg)
  );
};