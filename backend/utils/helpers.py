#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Funções auxiliares para o projeto
"""

import os
import json
import random
import string
import time
from datetime import datetime, timedelta

def generate_random_id(length=10):
    """
    Gera um ID aleatório com o comprimento especificado
    
    Args:
        length (int): Comprimento do ID
    
    Returns:
        str: ID aleatório
    """
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def calculate_human_delay(min_seconds=1, max_seconds=5):
    """
    Calcula um atraso aleatório para simular tempo de resposta humano
    
    Args:
        min_seconds (int): Tempo mínimo em segundos
        max_seconds (int): Tempo máximo em segundos
    
    Returns:
        float: Tempo de atraso em segundos
    """
    return random.uniform(min_seconds, max_seconds)

def generate_random_schedule(num_posts=5, start_date=None, end_date=None, groups=None):
    """
    Gera uma agenda aleatória de postagens
    
    Args:
        num_posts (int): Número de postagens a gerar
        start_date (datetime): Data de início (default: hoje)
        end_date (datetime): Data de término (default: 7 dias a partir de hoje)
        groups (list): Lista de grupos para selecionar
    
    Returns:
        list: Lista de tarefas agendadas
    """
    if start_date is None:
        start_date = datetime.now()
    
    if end_date is None:
        end_date = start_date + timedelta(days=7)
    
    if groups is None or not groups:
        groups = [
            {"id": "123456789", "name": "Grupo de Exemplo", "category": "tech"}
        ]
    
    # Categorias padrão se não forem fornecidas nos grupos
    default_categories = ["tech", "business", "lifestyle", "education"]
    
    schedule = []
    
    for i in range(num_posts):
        # Seleciona um grupo aleatório
        group = random.choice(groups)
        
        # Determina uma data/hora aleatória entre start_date e end_date
        minutes_diff = int((end_date - start_date).total_seconds() / 60)
        random_minutes = random.randint(0, minutes_diff)
        random_time = start_date + timedelta(minutes=random_minutes)
        
        # Cria a tarefa
        category = group.get("category", random.choice(default_categories))
        
        task = {
            "id": f"task_{int(time.time())}_{i}",
            "type": "post",
            "target_id": group["id"],
            "target_name": group.get("name", f"Grupo {group['id']}"),
            "content": f"Postagem agendada automaticamente para o grupo {group.get('name', group['id'])}",
            "scheduled_time": random_time.strftime("%Y-%m-%d %H:%M"),
            "completed": False,
            "media_path": "",
            "category": category
        }
        
        schedule.append(task)
    
    return schedule

def ensure_directory_exists(path):
    """
    Garante que o diretório exista, criando-o se necessário
    
    Args:
        path (str): Caminho do diretório
    """
    os.makedirs(path, exist_ok=True)

def read_json_file(file_path, default_value=None):
    """
    Lê um arquivo JSON
    
    Args:
        file_path (str): Caminho do arquivo
        default_value: Valor padrão caso o arquivo não exista
    
    Returns:
        dict/list: Conteúdo do arquivo JSON ou valor padrão
    """
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Erro ao ler arquivo {file_path}: {e}")
            return default_value if default_value is not None else {}
    return default_value if default_value is not None else {}

def write_json_file(file_path, data):
    """
    Escreve dados em um arquivo JSON
    
    Args:
        file_path (str): Caminho do arquivo
        data: Dados a serem escritos
    
    Returns:
        bool: True se bem-sucedido, False caso contrário
    """
    try:
        # Garante que o diretório exista
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"Erro ao escrever arquivo {file_path}: {e}")
        return False

def extract_facebook_group_id(url):
    """
    Extrai o ID de um grupo do Facebook a partir da URL
    
    Args:
        url (str): URL do grupo
    
    Returns:
        str: ID do grupo ou None se não for possível extrair
    """
    # Padrões comuns de URLs de grupos
    import re
    
    patterns = [
        r'facebook\.com/groups/(\d+)',
        r'facebook\.com/groups/([^/]+)',
        r'fb\.com/groups/(\d+)',
        r'fb\.com/groups/([^/]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None

def is_valid_facebook_url(url):
    """
    Verifica se uma URL é válida para o Facebook
    
    Args:
        url (str): URL para verificar
    
    Returns:
        bool: True se for uma URL válida do Facebook
    """
    return (
        url.startswith('https://www.facebook.com/') or
        url.startswith('https://facebook.com/') or
        url.startswith('https://m.facebook.com/') or
        url.startswith('https://fb.com/')
    )

def format_time_difference(date_str):
    """
    Formata a diferença de tempo entre uma data e agora
    
    Args:
        date_str (str): Data no formato '%Y-%m-%d %H:%M'
    
    Returns:
        str: Texto formatado (ex: "em 3 horas", "há 2 dias")
    """
    try:
        date = datetime.strptime(date_str, '%Y-%m-%d %H:%M')
        now = datetime.now()
        
        diff = date - now
        
        # Futuro
        if diff.total_seconds() > 0:
            if diff.days > 0:
                return f"em {diff.days} dia{'s' if diff.days > 1 else ''}"
            hours = diff.seconds // 3600
            if hours > 0:
                return f"em {hours} hora{'s' if hours > 1 else ''}"
            minutes = (diff.seconds % 3600) // 60
            return f"em {minutes} minuto{'s' if minutes > 1 else ''}"
        # Passado
        else:
            diff = now - date
            if diff.days > 0:
                return f"há {diff.days} dia{'s' if diff.days > 1 else ''}"
            hours = diff.seconds // 3600
            if hours > 0:
                return f"há {hours} hora{'s' if hours > 1 else ''}"
            minutes = (diff.seconds % 3600) // 60
            return f"há {minutes} minuto{'s' if minutes > 1 else ''}"
    except:
        return date_str