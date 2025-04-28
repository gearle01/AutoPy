@echo off
echo Iniciando o Projeto AutoPy...

REM Cria diretórios se não existirem
mkdir D:\AutoPy\backend
mkdir D:\AutoPy\backend\automation
mkdir D:\AutoPy\backend\utils
mkdir D:\AutoPy\frontend
mkdir D:\AutoPy\frontend\src
mkdir D:\AutoPy\frontend\src\components
mkdir D:\AutoPy\frontend\src\services
mkdir D:\AutoPy\frontend\src\styles
mkdir D:\AutoPy\data
mkdir D:\AutoPy\data\logs
mkdir D:\AutoPy\data\content
mkdir D:\AutoPy\data\content\images
mkdir D:\AutoPy\data\content\templates
mkdir D:\AutoPy\data\content\texts

echo Diretórios criados com sucesso!

REM Inicia o backend
cd /d D:\AutoPy\backend
echo Instalando dependências do backend...

REM Verifica se o Python está instalado
python --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Python não encontrado. Por favor, instale o Python 3.8+ e tente novamente.
    pause
    exit /b
)

REM Cria um ambiente virtual
python -m venv venv
call venv\Scripts\activate

REM Instala as dependências
pip install flask flask-cors playwright requests pyautogui python-dotenv

REM Instala o Playwright
python -m playwright install

echo Dependências do backend instaladas!

REM Inicia o frontend em um novo terminal
start cmd /k "cd /d D:\AutoPy\frontend && echo Iniciando o frontend... && npm install && npm start"

REM Inicia o backend
echo Iniciando o backend...
python app.py

pause