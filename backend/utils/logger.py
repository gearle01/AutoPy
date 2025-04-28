#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Módulo de logging para o projeto
"""

import os
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime

def setup_logger(name, log_level=logging.INFO):
    """
    Configura e retorna um logger
    
    Args:
        name (str): Nome do logger
        log_level (int): Nível de log (default: logging.INFO)
    
    Returns:
        logging.Logger: Logger configurado
    """
    # Cria diretório de logs se não existir
    log_dir = "D:/AutoPy/data/logs"
    os.makedirs(log_dir, exist_ok=True)
    
    # Configura o logger
    logger = logging.getLogger(name)
    logger.setLevel(log_level)
    
    # Remove manipuladores existentes
    if logger.hasHandlers():
        logger.handlers.clear()
    
    # Formato de log
    log_format = logging.Formatter(
        '[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s',
        '%Y-%m-%d %H:%M:%S'
    )
    
    # Manipulador para console
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(log_format)
    logger.addHandler(console_handler)
    
    # Manipulador para arquivo
    today = datetime.now().strftime('%Y%m%d')
    log_file = os.path.join(log_dir, f"{name}_{today}.log")
    
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=10*1024*1024,  # 10 MB
        backupCount=5
    )
    file_handler.setFormatter(log_format)
    logger.addHandler(file_handler)
    
    return logger