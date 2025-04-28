@echo off
echo Iniciando o Projeto AutoPy...

REM Cria diretórios se não existirem
mkdir D:\AutoPy\backend 2>nul
mkdir D:\AutoPy\backend\automation 2>nul
mkdir D:\AutoPy\backend\utils 2>nul
mkdir D:\AutoPy\frontend 2>nul
mkdir D:\AutoPy\frontend\src 2>nul
mkdir D:\AutoPy\frontend\src\components 2>nul
mkdir D:\AutoPy\frontend\src\services 2>nul
mkdir D:\AutoPy\frontend\src\styles 2>nul
mkdir D:\AutoPy\data 2>nul
mkdir D:\AutoPy\data\logs 2>nul
mkdir D:\AutoPy\data\content 2>nul
mkdir D:\AutoPy\data\content\images 2>nul
mkdir D:\AutoPy\data\content\templates 2>nul
mkdir D:\AutoPy\data\content\texts 2>nul

echo Diretórios criados com sucesso!

REM Verifica se o Python está instalado
python --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Python não encontrado. Por favor, instale o Python 3.8+ e tente novamente.
    pause
    exit /b
)

REM Verifica se o Node.js está instalado
node --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Node.js não encontrado. Por favor, instale o Node.js e tente novamente.
    pause
    exit /b
)

REM Inicia o backend
cd /d D:\AutoPy\backend
echo Instalando dependências do backend...

REM Cria um ambiente virtual se não existir
if not exist venv (
    echo Criando ambiente virtual Python...
    python -m venv venv
)

REM Ativa o ambiente virtual
call venv\Scripts\activate

REM Instala as dependências do backend
echo Instalando dependências do backend...
pip install -r requirements.txt

REM Instala o Playwright
echo Instalando Playwright...
python -m playwright install

echo Dependências do backend instaladas!

REM Inicia o frontend em um novo terminal
echo Iniciando o frontend...
start cmd /k "cd /d D:\AutoPy\frontend && echo Instalando dependências do frontend... && npm install && echo Iniciando o servidor de desenvolvimento... && npm start"

REM Aguarda um pouco para o frontend iniciar
timeout /t 5 /nobreak

REM Inicia o backend
echo Iniciando o backend...
python app.py

pause