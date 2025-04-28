#!/bin/bash

echo "Iniciando o Projeto AutoPy..."

# Cria diretórios se não existirem
mkdir -p D:/AutoPy/backend/automation
mkdir -p D:/AutoPy/backend/utils
mkdir -p D:/AutoPy/frontend/src/components
mkdir -p D:/AutoPy/frontend/src/services
mkdir -p D:/AutoPy/frontend/src/styles
mkdir -p D:/AutoPy/data/logs
mkdir -p D:/AutoPy/data/content/images
mkdir -p D:/AutoPy/data/content/templates
mkdir -p D:/AutoPy/data/content/texts

echo "Diretórios criados com sucesso!"

# Inicia o backend
cd D:/AutoPy/backend
echo "Instalando dependências do backend..."

# Verifica se o Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "Python não encontrado. Por favor, instale o Python 3.8+ e tente novamente."
    exit 1
fi

# Cria um ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instala as dependências
pip install flask flask-cors playwright requests python-dotenv

# Instala o Playwright
python -m playwright install

echo "Dependências do backend instaladas!"

# Inicia o frontend em um novo terminal
(cd D:/AutoPy/frontend && echo "Iniciando o frontend..." && npm install && npm start) &

# Inicia o backend
echo "Iniciando o backend..."
python app.py