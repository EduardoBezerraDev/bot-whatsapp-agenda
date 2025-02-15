import fs from "fs";
import path from "path";
//for use with log file, uncomment the lines below
const LOG_FILE_PATH = path.join("./", "log-scheduler.json");
const logArray = [];

export const addLog = (message) => {
  const logEntry = { timestamp: new Date().toISOString(), message };
  logArray.push(logEntry);
  fs.appendFileSync(LOG_FILE_PATH, JSON.stringify(logArray));
};

export const sendWhatsAppMessage = async (sock, recipient, text) => {
  try {
    const recipientJid = recipient.includes("@g.us")
      ? recipient
      : `${recipient}@s.whatsapp.net`;
    await sock.sendMessage(recipientJid, { text });
  } catch (error) {
    addLog(`Erro ao enviar mensagem para ${recipient}: ${error.message}`);
  }
};