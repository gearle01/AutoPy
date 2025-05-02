#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Facebook Bot: Módulo principal para automação do Facebook
Usa Playwright para controlar o navegador e simular comportamento humano
"""

import asyncio
import json
import random
import time
import os
from datetime import datetime
from playwright.async_api import async_playwright
from utils.logger import setup_logger
from .behavior import HumanBehavior


class FacebookBot:
    """Classe para automatizar interações com o Facebook"""
    
    def __init__(self, config_path=None, headless=False, slow_mo=50):
        """
        Inicializa o bot do Facebook
        
        Args:
            config_path (str): Caminho para o arquivo de configuração
            headless (bool): Executa em modo headless se True
            slow_mo (int): Atraso em ms entre ações para simular comportamento humano
        """
        self.config = self._load_config(config_path)
        self.headless = headless
        self.slow_mo = slow_mo
        self.browser = None
        self.context = None
        self.page = None
        self.is_logged_in = False
        self.logger = setup_logger("facebook_bot")
        self.behavior = HumanBehavior()
        
        # Cria diretório de logs caso não exista
        os.makedirs("D:/AutoPy/data/logs", exist_ok=True)
        
    def _load_config(self, config_path):
        """Carrega configurações do arquivo JSON"""
        if not config_path:
            config_path = "D:/AutoPy/data/accounts.json"
            
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Erro ao carregar configuração: {e}")
            return {}
    
    async def _random_sleep(self, min_seconds=1, max_seconds=5):
        """Simula pausa humana com duração aleatória"""
        sleep_time = random.uniform(min_seconds, max_seconds)
        await asyncio.sleep(sleep_time)
        
    async def start(self):
        #Inicia o navegador e abre uma nova página"""
        self.logger.info("Iniciando o navegador")
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(
            headless=self.headless,
            slow_mo=self.slow_mo
        )
    
        # Cria um contexto com tamanho de tela aleatório para cada execução
        viewport = self.behavior.random_viewport()
        self.context = await self.browser.new_context(
            viewport=viewport,
            user_agent=self.behavior.random_user_agent(),
            locale=self.behavior.random_locale()
        )
    
        # Ativa o cache para parecer usuário legítimo
        # Corrigido: verifica se config é dicionário antes de usar .get()
        cookies = self.config.get("cookies", []) if isinstance(self.config, dict) else []
        await self.context.add_cookies(cookies)
    
        # Cria a página antes de tentar configurar rotas
        self.page = await self.context.new_page()
    
        # Configura interceptação de requisições
        await self.page.route("**/*.{png,jpg,jpeg}", lambda route: route.continue_())
    
        self.logger.info(f"Navegador iniciado com viewport {viewport}")
        return self
    
    async def login(self, email=None, password=None):
        """Realiza login no Facebook com debugging aprimorado"""
        if not email:
            email = self.config.get("email")
        if not password:
            password = self.config.get("password")
        
        if not email or not password:
            self.logger.error("Email ou senha não fornecidos")
            return False
        
        try:
            self.logger.info(f"Tentando login com {email}")
            
            # Navega para a página de login com modo debug
            self.logger.info("Navegando para facebook.com")
            await self.page.goto("https://www.facebook.com/")
            
            # Tirar screenshot para debug
            await self.page.screenshot(path="D:/AutoPy/data/logs/pre_login.png")
            
            # Verifica se já está logado
            if await self._check_if_logged_in():
                self.logger.info("Já está logado")
                self.is_logged_in = True
                return True
                
            # Aceita cookies se necessário
            try:
                self.logger.info("Procurando banner de cookies")
                cookie_button = await self.page.wait_for_selector('[data-testid="cookie-policy-manage-dialog-accept-button"]', timeout=5000)
                if cookie_button:
                    self.logger.info("Banner de cookies encontrado, aceitando")
                    await self.behavior.human_click(self.page, cookie_button)
            except Exception as e:
                self.logger.info(f"Banner de cookies não encontrado: {e}")
            
            # Captura todos os campos de input na página para verificar
            inputs = await self.page.query_selector_all('input')
            self.logger.info(f"Campos encontrados: {len(inputs)}")
            for i, input_field in enumerate(inputs):
                input_type = await input_field.get_attribute('type')
                input_name = await input_field.get_attribute('name')
                input_id = await input_field.get_attribute('id')
                self.logger.info(f"Input {i}: type={input_type}, name={input_name}, id={input_id}")
            
            # Encontra o campo de email com mais robustez
            self.logger.info("Procurando campo de email")
            email_field = await self.page.query_selector('#email')
            if not email_field:
                email_field = await self.page.query_selector('input[name="email"]')
            if not email_field:
                self.logger.error("Campo de email não encontrado!")
                await self.page.screenshot(path="D:/AutoPy/data/logs/email_not_found.png")
                return False
            
            # Simula digitação humana no email usando type em vez de fill
            self.logger.info("Digitando email")
            await email_field.type(email, delay=self.behavior.typing_speed())
            await self._random_sleep(0.5, 1.5)
            
            # Encontra o campo de senha com mais robustez
            self.logger.info("Procurando campo de senha")
            password_field = await self.page.query_selector('#pass')
            if not password_field:
                password_field = await self.page.query_selector('input[name="pass"]')
            if not password_field:
                self.logger.error("Campo de senha não encontrado!")
                await self.page.screenshot(path="D:/AutoPy/data/logs/password_not_found.png")
                return False
            
            # Simula digitação humana na senha usando type em vez de fill
            self.logger.info("Digitando senha")
            await password_field.type(password, delay=self.behavior.typing_speed())
            await self._random_sleep(0.8, 2)
            
            # Captura screenshot antes de clicar no botão
            await self.page.screenshot(path="D:/AutoPy/data/logs/before_login_click.png")
            
            # Procura por botões na página
            buttons = await self.page.query_selector_all('button')
            self.logger.info(f"Botões encontrados: {len(buttons)}")
            for i, button in enumerate(buttons):
                button_text = await button.inner_text()
                button_type = await button.get_attribute('type')
                button_name = await button.get_attribute('name')
                self.logger.info(f"Botão {i}: text={button_text}, type={button_type}, name={button_name}")
            
            # Clica no botão de login com robustez
            self.logger.info("Procurando botão de login")
            login_button = await self.page.query_selector('[data-testid="royal_login_button"]')
            if not login_button:
                login_button = await self.page.query_selector('button[name="login"]')
            if not login_button:
                login_button = await self.page.query_selector('button[type="submit"]')
            if not login_button:
                login_button = await self.page.query_selector('button:has-text("Entrar")')
            
            if not login_button:
                self.logger.error("Botão de login não encontrado!")
                await self.page.screenshot(path="D:/AutoPy/data/logs/login_button_not_found.png")
                return False
            
            # Clica no botão de login
            self.logger.info("Clicando no botão de login")
            await self.behavior.human_click(self.page, login_button)
            
            # Aguarda até que a página carregue completamente
            self.logger.info("Aguardando carregamento da página")
            await self.page.wait_for_load_state("networkidle")
            
            # Captura screenshot após clicar
            await self.page.screenshot(path="D:/AutoPy/data/logs/after_login_click.png")
            
            # Verifica se há mensagens de erro na página
            error_messages = await self.page.query_selector_all('[role="alert"]')
            if error_messages:
                for error in error_messages:
                    error_text = await error.inner_text()
                    self.logger.error(f"Mensagem de erro encontrada: {error_text}")
                    
            # Verifica se o login foi bem-sucedido
            self.is_logged_in = await self._check_if_logged_in()
            
            # Screenshot final
            await self.page.screenshot(path="D:/AutoPy/data/logs/login_result.png")
            
            if self.is_logged_in:
                self.logger.info("Login realizado com sucesso")
                return True
            else:
                self.logger.error("Falha no login")
                return False
                
        except Exception as e:
            self.logger.error(f"Erro durante o login: {e}")
            self.logger.error(traceback.format_exc())
            return False
    
    async def _check_if_logged_in(self):
        """Verifica se está logado no Facebook"""
        try:
            # Verifica elementos que só existem quando logado
            feed_element = await self.page.query_selector('[aria-label="Feed de notícias"]')
            profile_button = await self.page.query_selector('[aria-label^="Seu perfil"]')
            return bool(feed_element or profile_button)
        except:
            return False
    
    async def navigate_to_group(self, group_id=None, group_url=None):
        """
        Navega para um grupo do Facebook
        
        Args:
            group_id (str): ID do grupo
            group_url (str): URL completa do grupo
        """
        if not self.is_logged_in:
            self.logger.error("Não está logado, impossível navegar para o grupo")
            return False
            
        try:
            url = group_url if group_url else f"https://www.facebook.com/groups/{group_id}"
            self.logger.info(f"Navegando para o grupo: {url}")
            
            await self.page.goto(url)
            await self.page.wait_for_load_state("networkidle")
            
            # Verifica se chegou corretamente ao grupo
            group_heading = await self.page.query_selector('[role="main"] h1')
            if group_heading:
                group_name = await group_heading.inner_text()
                self.logger.info(f"Grupo acessado: {group_name}")
                return True
            else:
                self.logger.warning("Não foi possível confirmar acesso ao grupo")
                return False
                
        except Exception as e:
            self.logger.error(f"Erro ao navegar para o grupo: {e}")
            return False
    
    async def create_post(self, group_id, content, image_path=None):
        """
        Cria uma nova postagem em um grupo
        
        Args:
            group_id (str): ID do grupo
            content (str): Conteúdo do post
            image_path (str): Caminho para imagem a ser anexada (opcional)
        """
        if not await self.navigate_to_group(group_id):
            return False
            
        try:
            # Clica no campo para criar post
            await self._random_sleep(2, 5)
            create_post_selector = '[role="main"] [aria-label^="Criar uma publicação"]'
            
            # Tenta múltiplas estratégias para encontrar o botão de criar post
            create_post_button = await self.page.wait_for_selector(create_post_selector)
            if not create_post_button:
                alternative_selectors = [
                    '[role="main"] .x1i10hfl',
                    '[data-pagelet="GroupFeed"] form',
                    '[role="main"] [contenteditable="true"]'
                ]
                
                for selector in alternative_selectors:
                    create_post_button = await self.page.query_selector(selector)
                    if create_post_button:
                        break
            
            if not create_post_button:
                self.logger.error("Não foi possível encontrar o campo para criar post")
                return False
                
            await self.behavior.human_click(self.page, create_post_button)
            
            # Aguarda o modal de postagem aparecer
            await self._random_sleep(1, 3)
            
            # Foca no campo de texto
            post_text_selector = '[contenteditable="true"][aria-label^="Criar uma publicação"]'
            post_text_field = await self.page.wait_for_selector(post_text_selector)
            
            if not post_text_field:
                # Tenta seletores alternativos
                alternative_text_selectors = [
                    '[role="dialog"] [contenteditable="true"]',
                    '[aria-label="O que você está pensando?"]',
                    '[data-lexical-editor="true"]'
                ]
                
                for selector in alternative_text_selectors:
                    post_text_field = await self.page.query_selector(selector)
                    if post_text_field:
                        break
            
            # Digita o conteúdo com velocidade humana variável
            if post_text_field:
                await post_text_field.focus()
                
                # Divide o conteúdo em linhas e simula digitação natural
                lines = content.split("\n")
                for i, line in enumerate(lines):
                    # Digita caractere por caractere com velocidade variável
                    for char in line:
                        await self.page.keyboard.press(char)
                        await asyncio.sleep(self.behavior.typing_speed() / 1000)
                    
                    # Adiciona quebra de linha exceto na última linha
                    if i < len(lines) - 1:
                        await self.page.keyboard.press("Enter")
                        await self._random_sleep(0.1, 0.5)
            else:
                self.logger.error("Não foi possível encontrar o campo de texto")
                return False
            
            # Anexa imagem se fornecida
            if image_path:
                try:
                    # Clica no botão de anexar foto
                    photo_button = await self.page.query_selector('[aria-label="Foto/vídeo"]')
                    if photo_button:
                        await self.behavior.human_click(self.page, photo_button)
                        await self._random_sleep(1, 2)
                        
                        # Usa o file chooser para anexar a imagem
                        async with self.page.expect_file_chooser() as fc_info:
                            await self.page.click('[aria-label="Adicionar fotos/vídeos"]')
                        file_chooser = await fc_info.value
                        await file_chooser.set_files(image_path)
                        await self._random_sleep(2, 4)  # Aguarda o upload
                except Exception as e:
                    self.logger.warning(f"Erro ao anexar imagem: {e}")
            
            # Clica no botão Publicar com comportamento humano
            await self._random_sleep(1, 3)
            publish_button = await self.page.query_selector('[aria-label="Publicar"]')
            
            if not publish_button:
                # Tenta outros seletores para o botão de publicar
                alternative_publish_selectors = [
                    '[aria-label="Post"]',
                    'button[type="submit"]',
                    '[role="button"]:has-text("Publicar")',
                    '[role="dialog"] form button[type="submit"]'
                ]
                
                for selector in alternative_publish_selectors:
                    publish_button = await self.page.query_selector(selector)
                    if publish_button:
                        break
            
            if publish_button:
                await self.behavior.human_click(self.page, publish_button)
                
                # Espera a publicação ser concluída
                await self._random_sleep(3, 7)
                await self.page.wait_for_load_state("networkidle")
                
                self.logger.info(f"Postagem criada com sucesso no grupo {group_id}")
                
                # Registra a atividade
                self._log_activity(group_id, "post_created", content[:50] + "...")
                
                return True
            else:
                self.logger.error("Não foi possível encontrar o botão Publicar")
                return False
                
        except Exception as e:
            self.logger.error(f"Erro ao criar postagem: {e}")
            return False
    
    async def comment_on_post(self, post_url, comment_text):
        """
        Comenta em uma postagem específica
        
        Args:
            post_url (str): URL da postagem
            comment_text (str): Texto do comentário
        """
        try:
            # Navega para a postagem
            await self.page.goto(post_url)
            await self.page.wait_for_load_state("networkidle")
            
            # Encontra o campo de comentário
            comment_field = await self.page.query_selector('[aria-label="Escreva um comentário..."]')
            if not comment_field:
                alternative_selectors = [
                    '[aria-label="Comentar"]',
                    '[placeholder="Escreva um comentário..."]',
                    '[role="article"] form textarea'
                ]
                
                for selector in alternative_selectors:
                    comment_field = await self.page.query_selector(selector)
                    if comment_field:
                        break
                
            if not comment_field:
                self.logger.error("Campo de comentário não encontrado")
                return False
                
            # Clica no campo de comentário
            await self.behavior.human_click(self.page, comment_field)
            
            # Digita o comentário com velocidade humana
            for char in comment_text:
                await self.page.keyboard.press(char)
                await asyncio.sleep(self.behavior.typing_speed() / 1000)
            
            # Pressiona Enter para enviar o comentário
            await self._random_sleep(0.5, 2)
            await self.page.keyboard.press("Enter")
            
            # Espera o comentário ser enviado
            await self._random_sleep(2, 4)
            
            self.logger.info("Comentário enviado com sucesso")
            return True
            
        except Exception as e:
            self.logger.error(f"Erro ao comentar na postagem: {e}")
            return False
    
    def _log_activity(self, target_id, action_type, details=None):
        """Registra atividade do bot em arquivo de log"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "action": action_type,
            "target_id": target_id,
            "details": details
        }
        
        log_file = f"D:/AutoPy/data/logs/activity_{datetime.now().strftime('%Y%m%d')}.json"
        
        # Carrega logs existentes ou cria novo arquivo
        try:
            if os.path.exists(log_file):
                with open(log_file, 'r', encoding='utf-8') as f:
                    logs = json.load(f)
            else:
                logs = []
                
            logs.append(log_entry)
            
            with open(log_file, 'w', encoding='utf-8') as f:
                json.dump(logs, f, indent=2)
                
        except Exception as e:
            self.logger.error(f"Erro ao salvar log: {e}")
    
    async def close(self):
        """Fecha o navegador e recursos"""
        if self.browser:
            self.logger.info("Fechando o navegador")
            await self.browser.close()
            self.browser = None
            self.context = None
            self.page = None
            self.is_logged_in = False
    
    async def run_scheduled_task(self, task):
        """
        Executa uma tarefa agendada
        
        Args:
            task (dict): Tarefa para execução
                - type: Tipo de tarefa (post, comment, etc)
                - target_id: ID do grupo ou post
                - content: Conteúdo da ação
                - media_path: Caminho para mídia (opcional)
        """
        if not self.is_logged_in:
            await self.login()
            
        if not self.is_logged_in:
            return False
            
        task_type = task.get("type")
        
        if task_type == "post":
            return await self.create_post(
                task.get("target_id"),
                task.get("content"),
                task.get("media_path")
            )
        elif task_type == "comment":
            return await self.comment_on_post(
                task.get("target_id"),
                task.get("content")
            )
        else:
            self.logger.error(f"Tipo de tarefa desconhecido: {task_type}")
            return False


# Exemplo de uso
async def main():
    # Inicializa o bot
    bot = FacebookBot()
    await bot.start()
    
    try:
        # Faz login
        logged_in = await bot.login()
        
        if logged_in:
            # Cria uma postagem em um grupo
            await bot.create_post(
                "123456789",  # ID do grupo
                "Olá pessoal! Alguém aqui interessado em Python e automação? Estou começando um novo projeto e gostaria de trocar ideias. #Python #Automação",
                "D:/AutoPy/data/content/images/python_image.jpg"
            )
    finally:
        # Fecha o navegador
        await bot.close()

if __name__ == "__main__":
    asyncio.run(main())