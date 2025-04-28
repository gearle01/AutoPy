#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Módulo para simular comportamento humano nas interações com o navegador
"""

import random
import asyncio
import math
from datetime import datetime


class HumanBehavior:
    """Classe para simular comportamento humano na automação"""
    
    # Lista de user agents para randomização
    USER_AGENTS = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.76',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
    ]
    
    # Opções de idioma/localidade
    LOCALES = [
        'pt-BR', 'pt-PT', 'en-US', 'en-GB', 'es-ES'
    ]
    
    # Tamanhos comuns de tela
    VIEWPORTS = [
        {'width': 1366, 'height': 768},   # Comum
        {'width': 1920, 'height': 1080},  # Full HD
        {'width': 1440, 'height': 900},   # Laptop
        {'width': 1536, 'height': 864},   # Comum
        {'width': 1280, 'height': 720},   # HD
        {'width': 1600, 'height': 900},   # Comum
    ]
    
    def __init__(self):
        """Inicializa o gerador de comportamento humano"""
        # Define a hora do dia para ajustar o comportamento
        now = datetime.now()
        self.hour = now.hour
        
        # Perfil de usuário - ajusta comportamento com base na hora
        if 5 <= self.hour < 9:
            # Usuário da manhã - mais rápido/eficiente
            self.speed_factor = random.uniform(0.7, 0.9)
            self.error_probability = 0.05
        elif 9 <= self.hour < 18:
            # Usuário do trabalho - velocidade média
            self.speed_factor = random.uniform(0.8, 1.0)
            self.error_probability = 0.1
        elif 18 <= self.hour < 23:
            # Usuário da noite - mais lento/relaxado
            self.speed_factor = random.uniform(0.9, 1.1)
            self.error_probability = 0.15
        else:
            # Usuário da madrugada - muito lento/sonolento
            self.speed_factor = random.uniform(1.0, 1.3)
            self.error_probability = 0.2
    
    def random_user_agent(self):
        """Retorna um user agent aleatório"""
        return random.choice(self.USER_AGENTS)
    
    def random_locale(self):
        """Retorna uma configuração de localidade aleatória"""
        return random.choice(self.LOCALES)
        
    def random_viewport(self):
        """Retorna um tamanho de tela aleatório"""
        base_viewport = random.choice(self.VIEWPORTS)
        
        # Adiciona pequena variação para parecer ainda mais natural
        width_variation = random.randint(-10, 10)
        height_variation = random.randint(-10, 10)
        
        return {
            'width': base_viewport['width'] + width_variation,
            'height': base_viewport['height'] + height_variation
        }
    
    def typing_speed(self):
        """
        Retorna a velocidade de digitação em milissegundos por tecla
        
        Um humano médio digita entre 40-60 palavras por minuto
        Isso dá aproximadamente 200-300 caracteres por minuto
        Ou 3-5 caracteres por segundo
        Que resulta em ~200-333ms por caractere
        """
        base_speed = random.uniform(180, 350)  # Base ms por caractere
        
        # Aplica o fator de velocidade baseado na hora do dia
        adjusted_speed = base_speed * self.speed_factor
        
        # Adiciona aleatoriedade para variação natural
        final_speed = adjusted_speed * random.uniform(0.8, 1.2)
        
        return final_speed
    
    async def human_click(self, page, element):
        """
        Simula um clique humano no elemento
        
        Args:
            page: instância da página do Playwright
            element: elemento a ser clicado
        """
        try:
            # Obtem a posição e tamanho do elemento
            box = await element.bounding_box()
            
            if not box:
                # Se não conseguir obter a caixa, faz um clique normal
                await element.click()
                return
                
            # Calcula um ponto aleatório dentro do elemento
            x = box['x'] + random.uniform(box['width'] * 0.2, box['width'] * 0.8)
            y = box['y'] + random.uniform(box['height'] * 0.2, box['height'] * 0.8)
            
            # Simula movimento do mouse até o elemento
            await self._simulate_mouse_movement(page, x, y)
            
            # Pequena pausa antes do clique
            await asyncio.sleep(random.uniform(0.1, 0.3))
            
            # Simula erro ocasional (clique em lugar errado e correção)
            if random.random() < self.error_probability:
                # Clica levemente fora e depois corrige
                error_x = x + random.uniform(-20, 20)
                error_y = y + random.uniform(-20, 20)
                
                # Evita que o erro saia da tela
                error_x = max(0, min(error_x, page.viewport_size()['width']))
                error_y = max(0, min(error_y, page.viewport_size()['height']))
                
                await self._simulate_mouse_movement(page, error_x, error_y)
                await page.mouse.click(error_x, error_y)
                await asyncio.sleep(random.uniform(0.2, 0.5))
                
                # Corrige com o clique correto
                await self._simulate_mouse_movement(page, x, y)
            
            # Clique final
            await page.mouse.click(x, y)
            
        except Exception as e:
            # Fallback para clique normal
            await element.click()
    
    async def _simulate_mouse_movement(self, page, target_x, target_y):
        """
        Simula movimento de mouse até coordenadas específicas
        Usando uma curva de Bezier para movimento natural
        """
        # Obtem posição atual
        current_position = await page.evaluate('''() => {
            return {x: window.mouseX || 0, y: window.mouseY || 0};
        }''')
        
        start_x = current_position.get('x', 0)
        start_y = current_position.get('y', 0)
        
        # Número de pontos na trajetória (quanto maior, mais suave)
        steps = random.randint(10, 25)
        
        # Pontos de controle para a curva de Bezier
        # Adiciona pontos intermediários para criar um movimento mais natural
        control_points = []
        
        # Cria de 1 a 3 pontos de controle para a curva
        num_control_points = random.randint(1, 3)
        for _ in range(num_control_points):
            # Variação aleatória na trajetória
            control_x = start_x + (target_x - start_x) * random.uniform(0.2, 0.8)
            control_y = start_y + (target_y - start_y) * random.uniform(0.2, 0.8)
            
            # Adiciona alguma oscilação
            control_x += random.uniform(-50, 50)
            control_y += random.uniform(-50, 50)
            
            control_points.append((control_x, control_y))
        
        # Gera pontos na curva de Bezier
        for i in range(steps + 1):
            t = i / steps
            
            # Fórmula da curva de Bezier para n pontos de controle
            point_x = start_x * self._bezier_value(t, 0, num_control_points + 1)
            point_y = start_y * self._bezier_value(t, 0, num_control_points + 1)
            
            for j, (cx, cy) in enumerate(control_points):
                point_x += cx * self._bezier_value(t, j + 1, num_control_points + 1)
                point_y += cy * self._bezier_value(t, j + 1, num_control_points + 1)
                
            point_x += target_x * self._bezier_value(t, num_control_points + 1, num_control_points + 1)
            point_y += target_y * self._bezier_value(t, num_control_points + 1, num_control_points + 1)
            
            # Move o mouse para o ponto
            await page.mouse.move(point_x, point_y)
            
            # Pausa com duração variável para simular aceleração/desaceleração
            sleep_time = random.uniform(0.005, 0.015)
            if i < steps / 4:  # Aceleração no início
                sleep_time *= 2
            elif i > steps * 3 / 4:  # Desaceleração no final
                sleep_time *= 1.5
                
            await asyncio.sleep(sleep_time)
            
        # Atualiza a posição do mouse no contexto da página
        await page.evaluate(f'''() => {{
            window.mouseX = {target_x};
            window.mouseY = {target_y};
        }}''')
    
    def _bezier_value(self, t, i, n):
        """
        Calcula o valor do coeficiente de Bezier
        """
        # Coeficiente binomial
        coef = math.comb(n, i)
        return coef * (t ** i) * ((1 - t) ** (n - i))
    
    async def scroll_naturally(self, page, distance, speed="medium"):
        """
        Realiza rolagem natural da página
        
        Args:
            page: instância da página do Playwright
            distance: distância a rolar (positivo para baixo, negativo para cima)
            speed: velocidade da rolagem ('slow', 'medium', 'fast')
        """
        speeds = {
            "slow": (15, 30, 0.02, 0.04),  # (min_step, max_step, min_delay, max_delay)
            "medium": (30, 60, 0.01, 0.02),
            "fast": (60, 100, 0.005, 0.01)
        }
        
        min_step, max_step, min_delay, max_delay = speeds.get(
            speed, speeds["medium"]
        )
        
        # Direção da rolagem
        direction = 1 if distance > 0 else -1
        distance = abs(distance)
        
        # Simula rolagem em pequenos incrementos
        scrolled = 0
        while scrolled < distance:
            # Tamanho do próximo passo
            step = min(random.randint(min_step, max_step), distance - scrolled)
            
            # Executa a rolagem
            await page.evaluate(f"window.scrollBy(0, {step * direction})")
            
            # Atualiza o total rolado
            scrolled += step
            
            # Pequena pausa para tornar a rolagem natural
            await asyncio.sleep(random.uniform(min_delay, max_delay))
            
            # Pausa maior ocasional para simular leitura
            if random.random() < 0.1:
                await asyncio.sleep(random.uniform(0.5, 2))
    
    def generate_human_delay(self, action_type="default"):
        """
        Gera um atraso baseado em comportamento humano
        
        Args:
            action_type: tipo de ação para calibrar o atraso
                - 'default': atraso padrão
                - 'read': tempo de leitura
                - 'think': tempo de pensamento
                - 'navigate': tempo entre páginas
        """
        delays = {
            "default": (0.5, 2),
            "read": (2, 10),   # Tempo para ler conteúdo
            "think": (1, 5),   # Tempo para "pensar" antes de agir
            "navigate": (3, 8)  # Tempo entre navegações
        }
        
        min_delay, max_delay = delays.get(action_type, delays["default"])
        
        # Aplica fator de velocidade baseado na hora do dia
        min_delay *= self.speed_factor
        max_delay *= self.speed_factor
        
        return random.uniform(min_delay, max_delay)
    
    def determine_browse_time(self, content_length="medium"):
        """
        Determina tempo de navegação baseado no tamanho do conteúdo
        
        Args:
            content_length: tamanho do conteúdo ('short', 'medium', 'long')
        """
        # Tempo base em segundos
        base_times = {
            "short": (10, 30),
            "medium": (30, 120),
            "long": (120, 300)
        }
        
        min_time, max_time = base_times.get(content_length, base_times["medium"])
        
        # Ajusta pelo fator de velocidade
        min_time *= self.speed_factor
        max_time *= self.speed_factor
        
        return random.uniform(min_time, max_time)