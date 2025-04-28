#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Configurações para o projeto
"""

import os
from datetime import timedelta

# Diretório raiz do projeto
ROOT_DIR = "D:/AutoPy"

# Diretórios de dados
DATA_DIR = os.path.join(ROOT_DIR, "data")
ACCOUNTS_FILE = os.path.join(DATA_DIR, "accounts.json")
GROUPS_FILE = os.path.join(DATA_DIR, "groups.json")
SCHEDULE_FILE = os.path.join(DATA_DIR, "schedule.json")
LOGS_DIR = os.path.join(DATA_DIR, "logs")
CONTENT_DIR = os.path.join(DATA_DIR, "content")
IMAGES_DIR = os.path.join(CONTENT_DIR, "images")
TEMPLATES_DIR = os.path.join(CONTENT_DIR, "templates")
TEXTS_DIR = os.path.join(CONTENT_DIR, "texts")

# Configurações do servidor Flask
FLASK_HOST = "0.0.0.0"
FLASK_PORT = 5000
FLASK_DEBUG = True

# Configurações de segurança
SECRET_KEY = "bd8e3c4e9f6a2d7b1c5a3e8f2d6b9c7a"  # Trocar para produção

# Configurações de tempo
SCHEDULER_INTERVAL = 30  # Intervalo em segundos para verificar tarefas agendadas
LOGIN_TIMEOUT = 60  # Tempo limite para login em segundos
TASK_TIMEOUT = 180  # Tempo limite para execução de tarefas em segundos

# Configurações de comportamento humano
MIN_TYPING_DELAY = 0.05  # Delay mínimo entre teclas em segundos
MAX_TYPING_DELAY = 0.3  # Delay máximo entre teclas em segundos
MIN_ACTION_DELAY = 1  # Delay mínimo entre ações em segundos
MAX_ACTION_DELAY = 5  # Delay máximo entre ações em segundos
TYPO_PROBABILITY = 0.1  # Probabilidade de erro de digitação (0-1)

# Configurações de postagem
DEFAULT_POST_EMOJI = True  # Incluir emojis nas postagens por padrão
DEFAULT_POST_HASHTAGS = True  # Incluir hashtags nas postagens por padrão
DEFAULT_POST_LENGTH = "medium"  # Tamanho padrão das postagens (short, medium, long)
MAX_DAILY_POSTS = 5  # Número máximo de postagens por dia

# Configurações de navegador
HEADLESS = False  # Executar navegador em modo headless
BROWSER_TYPE = "chromium"  # Tipo de navegador (chromium, firefox, webkit)
SLOW_MO = 50  # Atraso entre ações do navegador em ms

# Inicializa diretórios se não existirem
for directory in [DATA_DIR, LOGS_DIR, CONTENT_DIR, IMAGES_DIR, TEMPLATES_DIR, TEXTS_DIR]:
    os.makedirs(directory, exist_ok=True)