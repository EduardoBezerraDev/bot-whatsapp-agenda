import {
  addLog,
  sendWhatsAppMessage,
} from "../adapters/outbound/WhatsAppService.js";
import {
  handleScheduleTask,
  handleAgenda,
  handleHistory,
  cancelTask,
  removeTask,
  showMenu,
} from "../domain/Task.js";

const commandHandlers = {
  "!menu": async (sock, sender) => {
    const menu = showMenu();
    await sendWhatsAppMessage(sock, sender, menu);
  },
  "!agendar": (sock, sender, receivedText) =>
    handleScheduleTask(sock, sender, receivedText),
  "!remover": (sock, sender, receivedText) => {
    const taskId = receivedText.split(" ")[1];
    removeTask(taskId, sock, sender);
  },
  "!agenda": async (sock, sender) => {
    const scheduledTasksList = handleAgenda(sock, sender);
    await sendWhatsAppMessage(sock, sender, scheduledTasksList);
  },
  "!cancelar": (sock, sender, receivedText) => {
    const taskId = receivedText.split(" ")[1];
    cancelTask(taskId, sock, sender);
  },
  "!historico": (sock, sender) => handleHistory(sock, sender),
};

export const handleIncomingMessages = async (sock, msg) => {
  const message = msg.messages[0];
  const receivedText = message.message?.conversation?.toLowerCase();
  const sender = message.key.remoteJid;
  const isReceivedTextString = typeof receivedText === "string";
  addLog(`Mensagem recebida: ${receivedText || "[sem texto]"}`);

  const command = Object.keys(commandHandlers).find(
    (cmd) => isReceivedTextString && receivedText.startsWith(cmd)
  );
  if (command) {
    await commandHandlers[command](sock, sender, receivedText);
  }
};
