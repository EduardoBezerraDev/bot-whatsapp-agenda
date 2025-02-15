export const br = "\n";

export const formatScheduledTask = (task, taskId) => {
  const scheduledDate = new Date(task.scheduledAt);
  const date = scheduledDate.toLocaleDateString("pt-BR");
  const time = scheduledDate.toLocaleTimeString("pt-BR");

  return (
    `🆔 ID: ${br}${taskId}${br}${br}` +
    `📝 Tarefa: ${br}*${task.task}*${br}${br}` +
    `📅 Agendada para: ${br}*${date}*${br}${br}` +
    `🕒 Horário: ${br}*${time}*${br}${br}` +
    `🔁 Recorrência: ${br}*${task.repeat}*${br}${br}` +
    `⭐ Prioridade: ${br}*${task.priority}*${br}` +
    `${br}----------------${br}`
  );
};

export const formatConfirmationMessage = (taskDate, taskId, repeat) => {
  const date = taskDate.toLocaleDateString("pt-BR");
  const time = taskDate.toLocaleTimeString("pt-BR");
  return (
    `✅ Tarefa agendada para:${br}${br}` +
    `📅 Data: ${br}*${date}*${br}${br}` +
    `🕒 Horário: ${br}*${time}*${br}${br}` +
    `🆔 ID: ${br}*${taskId}*${br}${br}` +
    `🔁 Recorrência: ${br}*${repeat || "Nenhuma"}*${br}`
  );
};

export const formatMenuText = () => {
  return `
    🌟 *Bem-vindo ao Bot de Agendamentos!* 🤖📅
    
    Aqui você pode criar lembretes, agendar tarefas e até configurar repetições automáticas. Use os comandos abaixo para gerenciar seus compromissos! ⏰✨
    
    📌 *COMANDOS DISPONÍVEIS:*  
    
    🆕 *Agendar uma tarefa:*  
    ✏️ _Cria um lembrete único ou recorrente._  
    ➡️ Digite:  
    *!agendar DD-MM-YYYY HH:mm <diario|semanal|mensal> Descrição da tarefa*  
    📍 Exemplo:  
    *!agendar 05-02-2025 10:00 diario Reunião matinal*  
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
