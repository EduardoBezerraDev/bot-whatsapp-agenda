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
import {
  br,
  formatScheduledTask,
  formatConfirmationMessage,
  formatMenuText,
} from "../utils/textFormatter.js";
import { convertToAmericanDate } from "../utils/dateFormatter.js";

const scheduledTasks = {};

const generateNumericID = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const showScheduledTasks = async (sender) => {
  const q = query(collection(db, "tasks"), where("sender", "==", sender));
  const tasksSnapshot = await getDocs(q);
  if (tasksSnapshot.empty) {
    return "📋 Você não tem tarefas agendadas.";
  }

  let response = "*Suas tarefas agendadas:*\n";
  tasksSnapshot.forEach((doc) => {
    const task = doc.data();
    response += formatScheduledTask(task, doc.id);
  });

  return response;
};

const taskExists = async (sender, taskText, taskDate) => {
  const q = query(
    collection(db, "tasks"),
    where("sender", "==", sender),
    where("task", "==", taskText),
    where("scheduledAt", "==", taskDate.toISOString())
  );
  const tasksSnapshot = await getDocs(q);
  return !tasksSnapshot.empty;
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
  const now = new Date();

  if (isNaN(taskDate) || taskDate <= now) {
    sendMessage &&
      (await sendWhatsAppMessage(
        sock,
        sender,
        `⚠️ Data inválida fornecida:${br}${dateStr}${br}${br} *A data e hora devem ser futuras*.`
      ));
    return;
  }

  if (await taskExists(sender, taskText, taskDate)) {
    sendMessage &&
      (await sendWhatsAppMessage(
        sock,
        sender,
        `⚠️ Tarefa já existe para a data e hora fornecidas:${br}${dateStr}${br}${br} *Por favor, forneça uma data e hora diferentes*.`
      ));
    return;
  }

  let job;
  if (repeat === "diario") {
    job = scheduleJob(
      { hour: taskDate.getHours(), minute: taskDate.getMinutes() },
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
        dayOfWeek: taskDate.getDay(),
        hour: taskDate.getHours(),
        minute: taskDate.getMinutes(),
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
        date: taskDate.getDate(),
        hour: taskDate.getHours(),
        minute: taskDate.getMinutes(),
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
      formatConfirmationMessage(taskDate, taskId, repeat)
    );
};

export const handleScheduleTask = async (sock, sender, receivedText) => {
  const parts = receivedText.split(" ");
  if (parts.length < 4) {
    await sendWhatsAppMessage(
      sock,
      sender,
      "Formato inválido. Utilize: !agendar DD/MM/YYYY HH:mm <diario|semanal|mensal|nenhum> Texto da Tarefa."
    );
    return;
  }

  const dateStr = `${convertToAmericanDate(parts[1])} ${parts[2]}`;
  let repeat = "nenhum";
  let taskTextStartIndex = 3;

  if (["diario", "semanal", "mensal"].includes(parts[3])) {
    repeat = parts[3];
    taskTextStartIndex = 4;
  }

  const taskText = parts.slice(taskTextStartIndex).join(" ");
  scheduleTask(sock, dateStr, sender, repeat, taskText);
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
  await deleteDoc(taskRef);
  sendWhatsAppMessage(
    sock,
    sender,
    `✅ Tarefa *${taskId}* cancelada com sucesso.`
  );
};

export const removeTask = (taskId, sock, sender) => {
  if (scheduledTasks[taskId]) {
    scheduledTasks[taskId].taskJob.cancel();
    delete scheduledTasks[taskId];
    sendWhatsAppMessage(
      sock,
      sender,
      `Tarefa com ID:\n\n *${taskId}*\n\n *removida*.`
    );
  } else {
    sendWhatsAppMessage(
      sock,
      sender,
      `Tarefa com ID:\n\n *${taskId}*\n\n não encontrada.`
    );
  }
};

export const showMenu = () => {
  return formatMenuText();
};
