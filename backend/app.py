#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
API Flask para o projeto de automação do Facebook
"""

import os
import json
import asyncio
import threading
import time
import sys
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from automation.facebook_bot import FacebookBot
from automation.post_generator import PostGenerator
from utils.logger import setup_logger

# Inicializa logger
logger = setup_logger("flask_app")

# Configurações
DATA_DIR = "D:/AutoPy/data"
ACCOUNTS_FILE = os.path.join(DATA_DIR, "accounts.json")
GROUPS_FILE = os.path.join(DATA_DIR, "groups.json")
SCHEDULE_FILE = os.path.join(DATA_DIR, "schedule.json")

# Cria diretórios se não existirem
os.makedirs(DATA_DIR, exist_ok=True)

# Inicializa a aplicação Flask
app = Flask(__name__)
CORS(app)  # Permite requisições de outros domínios (para o frontend React)

# Estado global da aplicação
app_state = {
    "running": False,
    "last_error": None,
    "last_activity": None,
    "scheduled_tasks": [],
    "bot_instance": None,
    "scheduler_thread": None
}

# Inicializa o gerador de posts
post_generator = PostGenerator()

# Carrega ou cria a lista de grupos
def load_groups():
    """Carrega a lista de grupos do arquivo JSON"""
    if os.path.exists(GROUPS_FILE):
        try:
            with open(GROUPS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Erro ao carregar grupos: {e}")
            return []
    else:
        # Cria arquivo com exemplo
        default_groups = [
            {
                "id": "123456789",
                "name": "Grupo de Exemplo",
                "url": "https://www.facebook.com/groups/123456789",
                "category": "tech",
                "active": True
            }
        ]
        
        with open(GROUPS_FILE, 'w', encoding='utf-8') as f:
            json.dump(default_groups, f, indent=2)
            
        return default_groups

# Carrega ou cria a lista de contas
def load_accounts():
    """Carrega a lista de contas do arquivo JSON"""
    if os.path.exists(ACCOUNTS_FILE):
        try:
            with open(ACCOUNTS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Erro ao carregar contas: {e}")
            return {}
    else:
        # Cria arquivo com exemplo
        default_account = {
            "email": "exemplo@email.com",
            "password": "senha_aqui",
            "name": "Usuário de Exemplo",
            "cookies": []
        }
        
        with open(ACCOUNTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(default_account, f, indent=2)
            
        return default_account

# Carrega ou cria a agenda de tarefas
def load_schedule():
    """Carrega a agenda de tarefas do arquivo JSON"""
    if os.path.exists(SCHEDULE_FILE):
        try:
            with open(SCHEDULE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Erro ao carregar agenda: {e}")
            return []
    else:
        # Cria arquivo com exemplo
        tomorrow = datetime.now() + timedelta(days=1)
        tomorrow_str = tomorrow.strftime("%Y-%m-%d %H:%M")
        
        default_schedule = [
            {
                "id": "task_1",
                "type": "post",
                "target_id": "123456789",
                "target_name": "Grupo de Exemplo",
                "content": "Este é um post de exemplo agendado para amanhã.",
                "scheduled_time": tomorrow_str,
                "completed": False,
                "media_path": "",
                "category": "tech"
            }
        ]
        
        with open(SCHEDULE_FILE, 'w', encoding='utf-8') as f:
            json.dump(default_schedule, f, indent=2)
            
        return default_schedule

# Salva a agenda de tarefas
def save_schedule(schedule):
    """Salva a agenda de tarefas no arquivo JSON"""
    try:
        with open(SCHEDULE_FILE, 'w', encoding='utf-8') as f:
            json.dump(schedule, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Erro ao salvar agenda: {e}")
        return False

# Salva a lista de grupos
def save_groups(groups):
    """Salva a lista de grupos no arquivo JSON"""
    try:
        with open(GROUPS_FILE, 'w', encoding='utf-8') as f:
            json.dump(groups, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Erro ao salvar grupos: {e}")
        return False

# Salva a conta
def save_account(account):
    """Salva a conta no arquivo JSON"""
    try:
        with open(ACCOUNTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(account, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Erro ao salvar conta: {e}")
        return False

# Função para o thread do agendador
def scheduler_thread():
    """Thread para processar tarefas agendadas"""
    logger.info("Iniciando thread do agendador")
    
    while app_state["running"]:
        try:
            # Carrega a agenda atual
            tasks = load_schedule()
            now = datetime.now()
            
            # Verifica tarefas para executar
            for task in tasks:
                if task.get("completed", False):
                    continue
                    
                scheduled_time = datetime.strptime(task["scheduled_time"], "%Y-%m-%d %H:%M")
                
                # Se chegou a hora da tarefa e o bot não está ocupado
                if scheduled_time <= now and not app_state.get("bot_busy", False):
                    logger.info(f"Executando tarefa agendada: {task['id']}")
                    
                    # Marca que o bot está ocupado
                    app_state["bot_busy"] = True
                    
                    # Executa a tarefa em uma thread separada
                    threading.Thread(
                        target=execute_scheduled_task,
                        args=(task,),
                        daemon=True
                    ).start()
            
            # Aguarda 30 segundos antes da próxima verificação
            time.sleep(30)
            
        except Exception as e:
            logger.error(f"Erro no agendador: {e}")
            time.sleep(60)  # Espera um pouco mais em caso de erro
            
    logger.info("Thread do agendador finalizada")

# Executa uma tarefa agendada
def execute_scheduled_task(task):
    """Executa uma tarefa agendada"""
    try:
        # Cria uma instância do bot se não existir
        if app_state["bot_instance"] is None:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            app_state["bot_instance"] = loop.run_until_complete(
                FacebookBot().start()
            )
            
            # Faz login
            account = load_accounts()
            loop.run_until_complete(
                app_state["bot_instance"].login(
                    account.get("email"), 
                    account.get("password")
                )
            )
        
        # Executa a tarefa
        bot = app_state["bot_instance"]
        loop = asyncio.get_event_loop()
        
        # Converte para async/await
        success = loop.run_until_complete(bot.run_scheduled_task(task))
        
        if success:
            logger.info(f"Tarefa {task['id']} executada com sucesso")
            
            # Atualiza o status da tarefa na agenda
            schedule = load_schedule()
            for i, t in enumerate(schedule):
                if t["id"] == task["id"]:
                    schedule[i]["completed"] = True
                    schedule[i]["execution_time"] = datetime.now().strftime("%Y-%m-%d %H:%M")
                    break
                    
            save_schedule(schedule)
            
            # Registra a atividade
            app_state["last_activity"] = {
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "task_type": task["type"],
                "target": task.get("target_name", "Desconhecido"),
                "status": "success"
            }
        else:
            logger.error(f"Falha ao executar tarefa {task['id']}")
            app_state["last_error"] = {
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "task_id": task["id"],
                "message": "Falha ao executar tarefa agendada"
            }
    except Exception as e:
        logger.error(f"Erro ao executar tarefa: {e}")
        app_state["last_error"] = {
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "task_id": task.get("id", "unknown"),
            "message": str(e)
        }
    finally:
        # Marca que o bot não está mais ocupado
        app_state["bot_busy"] = False

# Inicia o agendador de tarefas
def start_scheduler():
    """Inicia o agendador de tarefas"""
    if app_state["scheduler_thread"] is None or not app_state["scheduler_thread"].is_alive():
        app_state["running"] = True
        app_state["scheduler_thread"] = threading.Thread(
            target=scheduler_thread,
            daemon=True
        )
        app_state["scheduler_thread"].start()
        logger.info("Agendador iniciado")
        return True
    return False

# Para o agendador de tarefas
def stop_scheduler():
    """Para o agendador de tarefas"""
    app_state["running"] = False
    
    # Fecha o bot se estiver aberto
    if app_state["bot_instance"]:
        loop = asyncio.get_event_loop()
        loop.run_until_complete(app_state["bot_instance"].close())
        app_state["bot_instance"] = None
        
    logger.info("Agendador parado")
    return True

# Rotas da API
@app.route('/api/status', methods=['GET'])
def get_status():
    """Retorna o status atual do sistema"""
    return jsonify({
        "running": app_state["running"],
        "bot_busy": app_state.get("bot_busy", False),
        "last_error": app_state["last_error"],
        "last_activity": app_state["last_activity"]
    })

@app.route('/api/start', methods=['POST'])
def start_system():
    """Inicia o sistema de automação"""
    success = start_scheduler()
    return jsonify({"success": success})

@app.route('/api/stop', methods=['POST'])
def stop_system():
    """Para o sistema de automação"""
    success = stop_scheduler()
    return jsonify({"success": success})

@app.route('/api/groups', methods=['GET'])
def get_groups():
    """Retorna a lista de grupos"""
    groups = load_groups()
    return jsonify(groups)

@app.route('/api/groups', methods=['POST'])
def add_group():
    """Adiciona um novo grupo à lista"""
    data = request.json
    groups = load_groups()
    
    # Verifica se já existe
    for group in groups:
        if group["id"] == data["id"]:
            return jsonify({"success": False, "message": "Grupo já existe"})
    
    # Adiciona o novo grupo
    groups.append(data)
    success = save_groups(groups)
    
    return jsonify({"success": success})

@app.route('/api/groups/<group_id>', methods=['PUT'])
def update_group(group_id):
    """Atualiza um grupo existente"""
    data = request.json
    groups = load_groups()
    
    # Encontra e atualiza o grupo
    for i, group in enumerate(groups):
        if group["id"] == group_id:
            groups[i] = data
            success = save_groups(groups)
            return jsonify({"success": success})
    
    return jsonify({"success": False, "message": "Grupo não encontrado"})

@app.route('/api/groups/<group_id>', methods=['DELETE'])
def delete_group(group_id):
    """Remove um grupo da lista"""
    groups = load_groups()
    
    # Filtra o grupo a ser removido
    new_groups = [g for g in groups if g["id"] != group_id]
    
    if len(new_groups) < len(groups):
        success = save_groups(new_groups)
        return jsonify({"success": success})
    
    return jsonify({"success": False, "message": "Grupo não encontrado"})

@app.route('/api/account', methods=['GET'])
def get_account():
    """Retorna informações da conta configurada"""
    account = load_accounts()
    
    # Garantir que estamos trabalhando com um dicionário
    if isinstance(account, list):
        if len(account) > 0:
            account = account[0]  # Usar o primeiro elemento
        else:
            account = {}  # Lista vazia, retorna dicionário vazio
    
    # Remove a senha da resposta por segurança
    if "password" in account:
        account_copy = account.copy()
        account_copy["password"] = "********"
        return jsonify(account_copy)
    
    return jsonify(account)

@app.route('/api/account', methods=['POST'])
def update_account():
    """Atualiza as informações da conta"""
    data = request.json
    account = load_accounts()
    
    # Garantir que estamos trabalhando com um dicionário
    if isinstance(account, list):
        # Se for uma lista, use o primeiro elemento ou crie um novo dicionário
        if len(account) > 0:
            account_dict = account[0]
            # Atualiza os campos
            for key, value in data.items():
                if key != "cookies":  # Não sobrescreve cookies pelo frontend
                    account_dict[key] = value
            # Substitui o primeiro elemento da lista
            account[0] = account_dict
        else:
            # Se a lista estiver vazia, adicione um novo dicionário
            account_dict = {k: v for k, v in data.items() if k != "cookies"}
            account.append(account_dict)
    else:
        # Se já for um dicionário, atualize normalmente
        for key, value in data.items():
            if key != "cookies":  # Não sobrescreve cookies pelo frontend
                account[key] = value
    
    success = save_account(account)
    return jsonify({"success": success})

@app.route('/api/schedule', methods=['GET'])
def get_schedule():
    """Retorna a agenda de tarefas"""
    schedule = load_schedule()
    return jsonify(schedule)

@app.route('/api/schedule', methods=['POST'])
def add_scheduled_task():
    """Adiciona uma nova tarefa agendada"""
    data = request.json
    schedule = load_schedule()
    
    # Gera ID único se não for fornecido
    if "id" not in data:
        data["id"] = f"task_{int(time.time())}"
    
    # Define como não completada por padrão
    if "completed" not in data:
        data["completed"] = False
    
    schedule.append(data)
    success = save_schedule(schedule)
    
    return jsonify({"success": success, "task_id": data["id"]})

@app.route('/api/schedule/<task_id>', methods=['PUT'])
def update_scheduled_task(task_id):
    """Atualiza uma tarefa agendada"""
    data = request.json
    schedule = load_schedule()
    
    # Encontra e atualiza a tarefa
    for i, task in enumerate(schedule):
        if task["id"] == task_id:
            schedule[i] = data
            success = save_schedule(schedule)
            return jsonify({"success": success})
    
    return jsonify({"success": False, "message": "Tarefa não encontrada"})

@app.route('/api/schedule/<task_id>', methods=['DELETE'])
def delete_scheduled_task(task_id):
    """Remove uma tarefa da agenda"""
    schedule = load_schedule()
    
    # Filtra a tarefa a ser removida
    new_schedule = [t for t in schedule if t["id"] != task_id]
    
    if len(new_schedule) < len(schedule):
        success = save_schedule(new_schedule)
        return jsonify({"success": success})
    
    return jsonify({"success": False, "message": "Tarefa não encontrada"})

@app.route('/api/generate-post', methods=['POST'])
def generate_post():
    """Gera conteúdo para postagem usando o gerador de posts"""
    data = request.json
    
    post_content = post_generator.generate_post(
        post_type=data.get("post_type"),
        topic_category=data.get("category"),
        include_emoji=data.get("include_emoji", True),
        include_hashtags=data.get("include_hashtags", True),
        typo_probability=data.get("typo_probability", 0.1),
        length=data.get("length", "medium")
    )
    
    return jsonify({
        "success": True,
        "content": post_content
    })

@app.route('/api/test-bot', methods=['POST'])
def test_bot():
    """Testa a conexão do bot com o Facebook"""
    try:
        print("1. Recebendo dados da requisição")
        data = request.get_json(force=True)
        print(f"2. Dados recebidos: {data}, tipo: {type(data)}")
        
        # TRATAMENTO ROBUSTO - log de cada passo
        if isinstance(data, list):
            print("3. Dados são uma lista")
            if not data:
                print("3.1. Lista vazia")
                return jsonify({"success": False, "message": "Nenhum dado fornecido"}), 400
            
            print(f"3.2. Primeiro item: {data[0]}, tipo: {type(data[0])}")
            data = data[0]  # usa o primeiro item da lista
        
        print(f"4. Após tratamento: {data}, tipo: {type(data)}")
        if not isinstance(data, dict):
            print(f"4.1. Não é um dicionário, é {type(data)}")
            return jsonify({"success": False, "message": f"Formato inválido: esperado dicionário, recebido {type(data).__name__}"}), 400
        
        email = data.get("email")
        password = data.get("password")
        print(f"5. Email: {email}, Senha: {'*' * len(password) if password else None}")
        
        if not email or not password:
            print("5.1. Email ou senha não fornecidos")
            return jsonify({"success": False, "message": "Email e senha são obrigatórios"}), 400
        
        print("6. Iniciando função assíncrona")
        
        async def run_test():
            bot = None
            try:
                print("7. Importando FacebookBot")
                from automation.facebook_bot import FacebookBot
                
                print("8. Iniciando o bot")
                bot = await FacebookBot().start()
                
                print("9. Tentando login")
                login_success = await bot.login(email, password)
                
                if login_success:
                    print("10. Login bem-sucedido")
                    return {"success": True, "message": "Login realizado com sucesso"}
                else:
                    print("10. Login falhou")
                    return {"success": False, "message": "Falha no login, verifique o e-mail e senha"}
            except Exception as e:
                print(f"X. Erro durante execução: {str(e)}")
                import traceback
                traceback.print_exc()
                return {"success": False, "message": f"Erro: {str(e)}"}
            finally:
                if bot:
                    print("11. Fechando o bot")
                    await bot.close()
        
        print("12. Configurando event loop")
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            print("13. Executando run_test")
            result = loop.run_until_complete(run_test())
            print(f"14. Resultado: {result}")
        except Exception as e:
            print(f"Y. Erro no event loop: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({"success": False, "message": f"Erro: {str(e)}"}), 500
        finally:
            print("15. Fechando event loop")
            loop.run_until_complete(loop.shutdown_asyncgens())
            loop.close()
        
        print("16. Retornando resposta")
        return jsonify(result)
    
    except Exception as e:
        print(f"Z. Erro global: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": f"Erro do servidor: {str(e)}"}), 500

@app.route('/api/manual-post', methods=['POST'])
def manual_post():
    """Executa uma postagem manual imediatamente"""
    if app_state.get("bot_busy", False):
        return jsonify({
            "success": False, 
            "message": "Bot está ocupado, tente novamente mais tarde"
        })
    
    data = request.json
    group_id = data.get("group_id")
    content = data.get("content")
    image_path = data.get("image_path")
    
    # Marca o bot como ocupado
    app_state["bot_busy"] = True
    
    threading.Thread(
        target=execute_manual_post,
        args=(group_id, content, image_path),
        daemon=True
    ).start()
    
    return jsonify({"success": True, "message": "Postagem iniciada"})

def execute_manual_post(group_id, content, image_path=None):
    """Executa uma postagem manual"""
    try:
        # Cria uma instância do bot se não existir
        if app_state["bot_instance"] is None:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            app_state["bot_instance"] = loop.run_until_complete(
                FacebookBot().start()
            )
            
            # Faz login
            account = load_accounts()
            loop.run_until_complete(
                app_state["bot_instance"].login(
                    account.get("email"), 
                    account.get("password")
                )
            )
        
        # Executa a postagem
        bot = app_state["bot_instance"]
        loop = asyncio.get_event_loop()
        
        # Cria a postagem
        success = loop.run_until_complete(
            bot.create_post(group_id, content, image_path)
        )
        
        if success:
            logger.info(f"Postagem manual no grupo {group_id} realizada com sucesso")
            
            # Registra a atividade
            app_state["last_activity"] = {
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "task_type": "post",
                "target": f"Grupo {group_id}",
                "status": "success"
            }
        else:
            logger.error(f"Falha ao realizar postagem manual no grupo {group_id}")
            app_state["last_error"] = {
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "message": "Falha ao realizar postagem manual"
            }
    except Exception as e:
        logger.error(f"Erro ao executar postagem manual: {e}")
        app_state["last_error"] = {
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "message": str(e)
        }
    finally:
        # Marca que o bot não está mais ocupado
        app_state["bot_busy"] = False

@app.route('/api/logs', methods=['GET'])
def get_logs():
    """Retorna os logs de atividade"""
    date = request.args.get('date')
    
    if not date:
        # Usa a data atual se não for especificada
        date = datetime.now().strftime('%Y%m%d')
    
    log_file = f"D:/AutoPy/data/logs/activity_{date}.json"
    
    if os.path.exists(log_file):
        try:
            with open(log_file, 'r', encoding='utf-8') as f:
                logs = json.load(f)
            return jsonify(logs)
        except Exception as e:
            return jsonify({"error": str(e)})
    else:
        return jsonify([])

# Arquivo de requisitos para o backend
def create_requirements_file():
    """Cria o arquivo requirements.txt"""
    requirements = [
        "flask==2.0.1",
        "flask-cors==3.0.10",
        "playwright==1.20.0",
        "pyautogui==0.9.53",
        "python-dotenv==0.19.2",
        "requests==2.27.1"
    ]
    
    with open("D:/AutoPy/backend/requirements.txt", 'w') as f:
        f.write("\n".join(requirements))

# Arquivo README com instruções
def create_readme():
    """Cria o arquivo README.md"""
    readme_content = """# AutoPy - Automação de Posts no Facebook

## Visão Geral
AutoPy é uma ferramenta para automatizar postagens em grupos do Facebook, simulando comportamento humano para evitar detecção.

## Requisitos
- Python 3.8+
- Node.js 14+
- Navegador Chrome ou Firefox

## Instalação

### Backend
1. Navegue até a pasta `backend`
2. Instale as dependências: `pip install -r requirements.txt`
3. Instale o Playwright: `playwright install`

### Frontend
1. Navegue até a pasta `frontend`
2. Instale as dependências: `npm install`

## Execução

### Backend
1. Navegue até a pasta `backend`
2. Execute: `python app.py`

### Frontend
1. Navegue até a pasta `frontend`
2. Execute: `npm start`
3. Acesse o aplicativo em: `http://localhost:3000`

## Configuração
1. Configure sua conta do Facebook na interface
2. Adicione os grupos nos quais deseja postar
3. Crie agendamentos e personalize o conteúdo

## Funcionalidades
- Agendamento de postagens
- Geração de conteúdo baseado em templates
- Simulação de comportamento humano
- Monitoramento de atividades

## Observações Importantes
Esta ferramenta foi desenvolvida apenas para fins educacionais. O uso desta ferramenta para spam ou violação dos Termos de Serviço do Facebook é de total responsabilidade do usuário.
"""
    
    with open("D:/AutoPy/README.md", 'w', encoding='utf-8') as f:
        f.write(readme_content)

# Inicializa arquivos necessários
def initialize_project_files():
    """Inicializa arquivos necessários para o projeto"""
    # Cria requirements.txt
    create_requirements_file()
    
    # Cria README.md
    create_readme()
    
    # Cria arquivos de dados iniciais se não existirem
    load_accounts()
    load_groups()
    load_schedule()

# Inicializa o projeto quando o arquivo é executado diretamente
if __name__ == '__main__':
    app.run(debug=True, port=5000)  # ou qualquer porta que você esteja usando