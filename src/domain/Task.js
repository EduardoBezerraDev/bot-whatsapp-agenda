import { scheduleJob } from "node-schedule";
import {
  addLog,
  sendWhatsAppMessage,
} from "../adapters/outbound/WhatsAppService.js";
import {
  setDoc,
  doc,
  deleteDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../adapters/outbound/FirebaseService.js";
import { v4 as uuidv4 } from "uuid";

const scheduledTasks = {};

const generateNumericID = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const scheduleTask = async (
  sock,
  dateStr,
  sender,
  repeat,
  taskText,
  priority = "normal",
  sendMessage = true
) => {
  const taskId = String(generateNumericID());
  const taskDate = new Date(dateStr);

  if (isNaN(taskDate)) {
    addLog(`Data inválida fornecida: ${dateStr}`);
    return;
  }

  let job;
  if (repeat === "diario") {
    job = scheduleJob(
      { hour: taskDate.getUTCHours(), minute: taskDate.getUTCMinutes() },
      async () => {
        sendMessage &&
          (await sendWhatsAppMessage(
            sock,
            sender,
            `🔔 *Lembrete Diário:* ${taskText}`
          ));
      }
    );
  } else if (repeat === "semanal") {
    job = scheduleJob(
      {
        dayOfWeek: taskDate.getUTCDay(),
        hour: taskDate.getUTCHours(),
        minute: taskDate.getUTCMinutes(),
      },
      async () => {
        sendMessage &&
          (await sendWhatsAppMessage(
            sock,
            sender,
            `🔔 *Lembrete Semanal:* ${taskText}`
          ));
      }
    );
  } else if (repeat === "mensal") {
    job = scheduleJob(
      {
        date: taskDate.getUTCDate(),
        hour: taskDate.getUTCHours(),
        minute: taskDate.getUTCMinutes(),
      },
      async () => {
        sendMessage &&
          (await sendWhatsAppMessage(
            sock,
            sender,
            `🔔 *Lembrete Mensal:* ${taskText}`
          ));
      }
    );
  } else {
    job = scheduleJob(taskDate, async () => {
      sendMessage &&
        sendWhatsAppMessage(sock, sender, `🔔 *Lembrete:* ${taskText}`);
    });
  }

  await setDoc(doc(collection(db, "tasks"), taskId), {
    sender,
    task: taskText,
    repeat,
    priority,
    scheduledAt: taskDate.toISOString(),
  });

  sendMessage &&
    sendWhatsAppMessage(
      sock,
      sender,
      `✅ Tarefa agendada para:\n\n *${taskDate.toLocaleString()}*\n\n com ID:\n\n *${taskId}*\n\n Recorrência:\n *${
        repeat || "Nenhuma"
      }*`
    );
  addLog(
    `Tarefa agendada para ${taskDate.toLocaleString()} com ID: ${taskId}, recorrência: ${
      repeat || "Nenhuma"
    }`
  );
};

export const handleScheduleTask = async (sock, sender, receivedText) => {
  const [command, date, time, ...taskArray] = receivedText.split(" ");
  const task = taskArray.join(" ");
  const scheduledAt = new Date(`${date}T${time}:00Z`);
  const taskId = uuidv4();
  const repeat = "nenhum";

  await setDoc(doc(db, "tasks", taskId), {
    scheduledAt: scheduledAt.toISOString(),
    sender,
    task,
    repeat,
    priority: "normal", // Ajuste conforme necessário
  });

  scheduleJob(taskId, scheduledAt, async () => {
    await sendWhatsAppMessage(sock, sender, `🔔 Lembrete: ${task}`);
    if (repeat === "nenhum") {
      await deleteDoc(doc(db, "tasks", taskId));
    }
  });

  const confirmationMessage = `✅ Tarefa agendada para:\n\n📅 Data: ${scheduledAt.toLocaleDateString(
    "pt-BR",
    { timeZone: "UTC" }
  )}\n🕒 Hora: ${scheduledAt.toLocaleTimeString("pt-BR", {
    timeZone: "UTC",
  })}\n\n🆔 ID: ${taskId}\n🔁 Recorrência: ${repeat}`;
  await sendWhatsAppMessage(sock, sender, confirmationMessage);
  addLog(`Tarefa agendada: ${taskId} para ${sender}`);
};

export const handleAgenda = async (sock, sender) => {
  await sendWhatsAppMessage(sock, sender, await showScheduledTasks(sender));
};

export const handleHistory = async (sock, sender) => {
  const userTasks = completedTasks.filter((task) => task.sender === sender);
  if (userTasks.length === 0) {
    await sendWhatsAppMessage(
      sock,
      sender,
      "📂 *Nenhuma tarefa concluída até o momento*."
    );
  } else {
    let historyMessage = "📜 *Histórico de Tarefas Concluídas:*\n";
    userTasks.forEach((task, index) => {
      historyMessage += `\n${index + 1}. *${task.taskText}* - Finalizada em: ${
        task.completedAt
      }`;
    });
    await sendWhatsAppMessage(sock, sender, historyMessage);
  }
};

export const cancelTask = async (taskId, sock, sender) => {
  const taskRef = doc(collection(db, "tasks"), taskId);
  const taskDoc = await getDoc(taskRef);

  if (!taskDoc.exists() || taskDoc.data().sender !== sender) {
    sendWhatsAppMessage(
      sock,
      sender,
      `🚫 Tarefa com ID\n\n *${taskId}*\n\n *não encontrada ou já foi removida*.`
    );
    return;
  }

  console.log(taskDoc.data());

  await deleteDoc(taskRef);
  sendWhatsAppMessage(
    sock,
    sender,
    `✅ Tarefa *${taskId}* cancelada com sucesso.`
  );
  addLog(`Tarefa ${taskId} cancelada pelo usuário ${sender}.`);
};

export const removeTask = (taskId, sock, sender) => {
  if (scheduledTasks[taskId]) {
    scheduledTasks[taskId].taskJob.cancel();
    delete scheduledTasks[taskId];
    addLog(`Tarefa com ID:\n\n ${taskId}:\n\n removida.`);
    sendWhatsAppMessage(
      sock,
      sender,
      `Tarefa com ID:\n\n *${taskId}*\n\n *removida*.`
    );
  } else {
    addLog(`Tarefa com ID:\n\n *${taskId}*\n\n não encontrada.`);
  }
};

export const showMenu = () => {
  return `
  🌟 *Bem-vindo ao Bot de Agendamentos!* 🤖📅
  
  Aqui você pode criar lembretes, agendar tarefas e até configurar repetições automáticas. Use os comandos abaixo para gerenciar seus compromissos! ⏰✨
  
  📌 *COMANDOS DISPONÍVEIS:*  
  
  🆕 *Agendar uma tarefa:*  
  ✏️ _Cria um lembrete único ou recorrente._  
  ➡️ Digite:  
  *!agendar YYYY-MM-DD HH:mm <diario|semanal|mensal> Descrição da tarefa*  
  📍 Exemplo:  
  *!agendar 2025-02-05 10:00 diario Reunião matinal*  
  👉 Se não quiser repetição, basta omitir essa parte.  
  
  📋 *Ver todas as tarefas agendadas:*  
  📝 _Mostra a lista de todas as tarefas pendentes._  
  ➡️ Digite:  
  *!agenda*  
  
  ❌ *Cancelar uma tarefa:*  
  🛑 _Remove um lembrete já agendado._  
  ➡️ Digite:  
  *!cancelar <ID da tarefa>*  
  📍 Exemplo:  
  *!cancelar 123e4567-e89b-12d3-a456-426614174000*  
  
  🚀 *Tornar uma tarefa recorrente:*  
  🔄 _Transforma um lembrete existente em uma repetição diária, semanal ou mensal._  
  ➡️ Digite:  
  *!repetir <diario|semanal|mensal> <ID da tarefa>*  
  📍 Exemplo:  
  *!repetir semanal 123e4567-e89b-12d3-a456-426614174000*  
  
  🔍 *Ver detalhes de uma tarefa:*  
  🔎 _Exibe informações completas sobre um lembrete específico._  
  ➡️ Digite:  
  *!detalhes <ID da tarefa>*  
  📍 Exemplo:  
  *!detalhes 123e4567-e89b-12d3-a456-426614174000*  
  
  ⚡ *Definir prioridade da tarefa:*  
  ⚠️ _Marque uma tarefa como Alta, Média ou Baixa prioridade._  
  ➡️ Digite:  
  *!prioridade <alta|media|baixa> <ID da tarefa>*  
  📍 Exemplo:  
  *!prioridade alta 123e4567-e89b-12d3-a456-426614174000*  
  
  🕒 *Receber lembretes antes da tarefa:*  
  ⏳ _Receba avisos automáticos 1 dia e 1 hora antes do evento._ (Ativado por padrão!)  
  
  📜 *Histórico de tarefas concluídas:*  
  📂 _Veja todas as tarefas que já foram finalizadas._  
  ➡️ Digite:  
  *!historico*  
  
  📢 *Mostrar este menu novamente:*  
  📖 _Exibe os comandos disponíveis a qualquer momento._  
  ➡️ Digite:  
  *!menu*  
  
  ---
  
  ✨ *Dica:* Sempre que criar uma tarefa, guarde o ID dela para gerenciar depois!  
  📲 *Dúvidas? Basta me chamar!* 🚀
    `;
};
