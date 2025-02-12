import { addLog, sendWhatsAppMessage } from '../adapters/outbound/WhatsAppService.js';
import { handleScheduleTask, handleAgenda, handleHistorico, cancelTask, removeTask, showMenu } from '../domain/Task.js';

export const handleIncomingMessages = async (sock, msg) => {
  const message = msg.messages[0];
  const receivedText = message.message?.conversation?.toLowerCase();
  const sender = message.key.remoteJid;

  addLog(`Mensagem recebida: ${receivedText || "[sem texto]"}`);

  if (receivedText === "!menu") {
    const menu = showMenu();
    await sendWhatsAppMessage(sock, sender, menu);
  }

  if (receivedText.startsWith("!agendar")) {
    handleScheduleTask(sock, sender, receivedText);
  }

  if (receivedText.startsWith("!remover")) {
    const taskId = receivedText.split(" ")[1];
    removeTask(taskId, sock, sender);
  }

  if (receivedText === "!agenda") {
    const scheduledTasksList = handleAgenda(sock, sender);
    await sendWhatsAppMessage(sock, sender, scheduledTasksList);
  }

  if (receivedText.startsWith("!cancelar")) {
    const taskId = receivedText.split(" ")[1];
    cancelTask(taskId, sock, sender);
  }

  if (receivedText.startsWith("!historico")) {
    handleHistorico(sock, sender);
  }
};