# Bot WhatsApp Agenda

Este projeto é um bot de agendamento para WhatsApp que permite aos usuários criar lembretes, agendar tarefas e configurar repetições automáticas. O bot é construído usando a biblioteca Baileys para interagir com o WhatsApp e Firebase para armazenamento de dados.

## Instalação

Siga os passos abaixo para configurar e executar o bot:

1. Clone o repositório:
    ```sh
    git clone https://github.com/EduardoBezerraDev/bot-whatsapp-agenda.git
    cd bot-whatsapp-agenda
    ```

2. Instale as dependências:
    ```sh
    npm install
    ```

3. Configure as variáveis de ambiente:
    Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis:
    ```env
    FIREBASE_API_KEY=your_firebase_api_key
    FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    FIREBASE_PROJECT_ID=your_firebase_project_id
    FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    FIREBASE_APP_ID=your_firebase_app_id
    FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
    ```

4. Inicie o bot:
    ```sh
    npm start
    ```

## Arquitetura

A arquitetura do projeto é dividida em várias camadas para melhor organização e manutenção do código:

- **Adapters**: Contém os adaptadores de entrada e saída para comunicação com serviços externos.
  - `inbound`: Responsável por receber mensagens do WhatsApp.
  - `outbound`: Responsável por enviar mensagens para o WhatsApp e interagir com o Firebase.
- **Application**: Contém a lógica de negócios principal do bot.
- **Domain**: Contém a lógica de domínio, como agendamento de tarefas e manipulação de dados.
- **Config**: Contém as configurações do Firebase.

### Estrutura de Pastas

```
/src
  /adapters
    /inbound
      WhatsAppBot.js
    /outbound
      FirebaseService.js
      WhatsAppService.js
  /application
    BotService.js
  /domain
    Task.js
  /config
    firebaseConfig.js
index.js
```

## Comandos Disponíveis

- `!menu`: Mostra o menu de comandos disponíveis.
- `!agendar YYYY-MM-DD HH:mm <diario|semanal|mensal> Descrição da tarefa`: Agenda uma nova tarefa.
- `!agenda`: Mostra todas as tarefas agendadas.
- `!cancelar <ID da tarefa>`: Cancela uma tarefa agendada.
- `!historico`: Mostra o histórico de tarefas concluídas.

## Contribuição

Sinta-se à vontade para contribuir com o projeto abrindo issues e pull requests no GitHub.

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
