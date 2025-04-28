# AutoPy - Automação de Posts no Facebook

## Visão Geral

AutoPy é uma ferramenta para automatizar postagens em grupos do Facebook de forma inteligente, simulando comportamento humano para evitar bloqueios e detecção de automação. O sistema permite agendar postagens, gerenciar múltiplos grupos e usa técnicas de simulação de comportamento humano para tornar as interações mais naturais.

## Funcionalidades

- 🤖 **Simulação de Comportamento Humano**: Movimentos de mouse naturais, digitação com velocidade variável, pausas aleatórias
- 📅 **Agendamento de Publicações**: Programe postagens para datas e horários específicos
- 📊 **Dashboard de Monitoramento**: Visualize o status das tarefas e atividades recentes
- 📝 **Geração de Conteúdo**: Crie postagens variadas com um gerador de conteúdo inteligente
- 👥 **Gerenciamento de Grupos**: Organize e categorize os grupos alvo para suas postagens
- 🔄 **Postagens Variadas**: Alternância de formatos com emojis, hashtags e pequenos "erros" para parecer humano

## Requisitos

- Python 3.8+
- Node.js 14+
- Navegador Chrome ou Firefox

## Estrutura do Projeto

```
D:\AutoPy\
│
├── backend/                  # Servidor Python
│   ├── app.py                # API Flask para comunicação com o frontend
│   ├── config.py             # Configurações do sistema
│   ├── automation/           # Módulos de automação
│   │   ├── facebook_bot.py   # Automatização das ações no Facebook
│   │   ├── behavior.py       # Simulação de comportamento humano
│   │   └── post_generator.py # Gerador de conteúdo para posts
│   │
│   └── utils/                # Utilitários do backend
│
├── frontend/                 # Interface React
│   ├── src/
│   │   ├── components/       # Componentes da interface
│   │   ├── services/         # Serviços de API
│   │   └── styles/           # Estilos CSS
│   │
│   └── public/
│
└── data/                     # Dados do aplicativo
    ├── accounts.json         # Configurações de contas
    ├── groups.json           # Dados dos grupos alvo
    ├── schedule.json         # Agendamento de tarefas
    ├── logs/                 # Registros de atividade
    └── content/              # Conteúdo para posts
```

## Instalação

### Método Rápido (Script)

1. Execute o script `start_project.bat` (Windows) ou `start_project.sh` (Linux/Mac)
2. O script criará todos os diretórios, instalará as dependências e iniciará o projeto

### Instalação Manual

#### Backend (Python)

1. Navegue até a pasta `backend`:
   ```
   cd D:\AutoPy\backend
   ```

2. Crie e ative um ambiente virtual:
   ```
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

3. Instale as dependências:
   ```
   pip install -r requirements.txt
   ```

4. Instale o Playwright:
   ```
   playwright install
   ```

#### Frontend (React)

1. Navegue até a pasta `frontend`:
   ```
   cd D:\AutoPy\frontend
   ```

2. Instale as dependências:
   ```
   npm install
   ```

## Execução

### Método Rápido (Script)

Execute o script `start_project.bat` (Windows) ou `start_project.sh` (Linux/Mac).

### Execução Manual

1. Inicie o backend:
   ```
   cd D:\AutoPy\backend
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   python app.py
   ```

2. Inicie o frontend (em um novo terminal):
   ```
   cd D:\AutoPy\frontend
   npm start
   ```

3. Acesse o aplicativo em seu navegador:
   ```
   http://localhost:3000
   ```

## Como Usar

1. **Configurar Conta**: Configure sua conta do Facebook em "Conta"
2. **Adicionar Grupos**: Adicione os grupos alvo em "Grupos"
3. **Criar Agendamentos**: Crie tarefas agendadas em "Agendamentos"
4. **Iniciar Sistema**: Inicie o agendador no Dashboard
5. **Monitorar Atividade**: Acompanhe as atividades e logs no Dashboard

## Tecnologias Utilizadas

- **Backend**: Python, Flask, Playwright
- **Frontend**: React, Material-UI
- **Automação**: Playwright
- **Banco de Dados**: JSON (armazenamento local)

## Observações Importantes

- Este projeto foi desenvolvido apenas para fins educativos e pessoais
- O uso desta ferramenta para spam ou violação dos Termos de Serviço do Facebook é de total responsabilidade do usuário
- A automação de contas do Facebook pode resultar em bloqueio ou banimento da sua conta se detectada
- É recomendado o uso moderado da ferramenta, com intervalos razoáveis entre postagens

## Segurança

- As senhas são armazenadas apenas localmente e são utilizadas somente para autenticação no Facebook
- Recomenda-se utilizar uma conta secundária para testes iniciais
- Os cookies de sessão são armazenados localmente para reduzir a necessidade de logins frequentes

## Contribuições

Contribuições são bem-vindas! Se você encontrar problemas ou tiver sugestões para melhorias, sinta-se à vontade para abrir uma issue ou enviar um pull request.

## Licença

Este projeto é licenciado sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.