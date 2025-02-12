import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { firebaseConfig } from "../../config/firebaseConfig.js";
import { addLog } from "./WhatsAppService.js";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const restoreScheduledTasks = async (sock) => {
  try {
    const now = new Date();
    const q = query(collection(db, "tasks"));
    const tasksSnapshot = await getDocs(q);

    if (tasksSnapshot.empty) {
      addLog("Nenhuma tarefa para restaurar.");
      return;
    }

    let restoredCount = 0;

    for (const doc of tasksSnapshot.docs) {
      const task = doc.data();
      const taskId = doc.id;
      const taskDate = new Date(task.scheduledAt);

      if (taskDate < now && task.repeat === "nenhum") {
        await deleteDoc(doc.ref);
        addLog(`Tarefa expirada removida: ${taskId}`);
        continue;
      }

      scheduleTask(
        sock,
        task.scheduledAt,
        task.sender,
        task.repeat,
        task.task,
        task.priority,
        false
      );
      restoredCount++;
    }

    addLog(`🔥 ${restoredCount} tarefas restauradas com sucesso!`);
  } catch (error) {
    addLog(`Erro ao restaurar tarefas: ${error.message}`);
  }
};
