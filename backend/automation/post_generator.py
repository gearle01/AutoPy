#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Gerador de conteúdo para postagens no Facebook
"""

import os
import json
import random
from datetime import datetime
import re


class PostGenerator:
    """Classe para gerar conteúdo para postagens com características humanas"""
    
    def __init__(self, templates_dir=None, data_dir=None):
        """
        Inicializa o gerador de posts
        
        Args:
            templates_dir (str): Diretório com templates de postagem
            data_dir (str): Diretório com dados para postagem
        """
        self.templates_dir = templates_dir or "D:/AutoPy/data/content/templates"
        self.data_dir = data_dir or "D:/AutoPy/data/content"
        
        # Cria diretórios se não existirem
        os.makedirs(self.templates_dir, exist_ok=True)
        os.makedirs(os.path.join(self.data_dir, "texts"), exist_ok=True)
        os.makedirs(os.path.join(self.data_dir, "images"), exist_ok=True)
        
        # Carrega dados e templates
        self.templates = self._load_templates()
        self.phrases = self._load_text_data("phrases.json")
        self.topics = self._load_text_data("topics.json")
        self.emoji_sets = self._load_text_data("emojis.json")
        
        # Padrões de postagem
        self.intro_patterns = [
            "Olá pessoal!",
            "Oi galera!",
            "Bom dia a todos!",
            "Boa tarde, grupo!",
            "Boa noite, amigos!",
            "E aí, tudo bem?",
            "Gente,",
            "Pessoal,",
            "Amigos,",
            "Galera,"
        ]
        
        # Erros comuns para simular digitação humana
        self.common_typos = {
            "que": ["qeu", "qie"],
            "para": ["pra", "paar"],
            "com": ["cmo", "ocm"],
            "não": ["nao", "nãp"],
            "está": ["esta", "estpa"],
            "você": ["vc", "voce", "voê"],
            "muito": ["mto", "muiot"],
            "também": ["tbm", "tambem", "tmbém"],
            "porque": ["pq", "porq"],
            "obrigado": ["obg", "obrigadu"],
            "hoje": ["hj", "hoej"],
        }
        
    def _load_templates(self):
        """Carrega templates de postagem de arquivos JSON"""
        templates = {}
        template_path = os.path.join(self.templates_dir, "post_templates.json")
        
        # Cria arquivo de template padrão se não existir
        if not os.path.exists(template_path):
            default_templates = {
                "question": [
                    "Alguém poderia me ajudar com {topic}? Estou tentando {action} mas {problem}.",
                    "O que vocês acham sobre {topic}? Vale a pena {action}?",
                    "Dúvida: como {action} quando {problem}? Alguém tem experiência com {topic}?"
                ],
                "info_sharing": [
                    "Acabei de descobrir isso sobre {topic}: {fact}. Achei super interessante!",
                    "Dica para quem trabalha com {topic}: {fact}. Isso me ajudou muito a {action}.",
                    "Para quem se interessa por {topic}, olha só: {fact}. #DicaValiosa"
                ],
                "opinion": [
                    "Na minha opinião, {topic} é fundamental para {action}. O que vocês acham?",
                    "Tenho pensado muito sobre {topic} ultimamente. Acho que {opinion}.",
                    "Sinceramente, {opinion} quando se trata de {topic}. Alguém concorda?"
                ],
                "discussion": [
                    "Vamos debater sobre {topic}? Eu {opinion}, mas gostaria de ouvir outras perspectivas.",
                    "Tema para discussão: {topic}. {question}?",
                    "O que está acontecendo com {topic} atualmente? {question}?"
                ]
            }
            
            os.makedirs(os.path.dirname(template_path), exist_ok=True)
            with open(template_path, 'w', encoding='utf-8') as f:
                json.dump(default_templates, f, indent=4)
                
            templates = default_templates
        else:
            try:
                with open(template_path, 'r', encoding='utf-8') as f:
                    templates = json.load(f)
            except Exception as e:
                print(f"Erro ao carregar templates: {e}")
                templates = {}
                
        return templates
    
    def _load_text_data(self, filename):
        """Carrega dados de texto de arquivos JSON"""
        filepath = os.path.join(self.data_dir, "texts", filename)
        
        # Dados padrão para cada tipo de arquivo
        default_data = {
            "phrases.json": {
                "greetings": ["Olá", "Oi", "E aí", "Bom dia", "Boa tarde", "Boa noite"],
                "closings": ["Abraços", "Até mais", "Valeu", "Obrigado", "Gratidão"],
                "transitions": ["Aliás", "Por falar nisso", "Inclusive", "Além disso", "Pensando bem"],
                "opinions": ["Acho que", "Na minha opinião", "Acredito que", "Tenho certeza que", "Parece que"]
            },
            "topics.json": {
                "tech": ["programação", "desenvolvimento web", "inteligência artificial", "apps", "startups"],
                "business": ["empreendedorismo", "marketing", "vendas", "negócios", "investimentos"],
                "lifestyle": ["saúde", "bem-estar", "viagens", "culinária", "exercícios"],
                "education": ["cursos", "livros", "aprendizado", "idiomas", "conhecimento"]
            },
            "emojis.json": {
                "positive": ["😊", "👍", "❤️", "🙌", "😁", "🎉", "✨", "🔥"],
                "negative": ["😔", "😢", "😕", "👎", "😞", "😫"],
                "neutral": ["🤔", "😐", "🙄", "👀", "💭", "🧐"],
                "topical": {
                    "tech": ["💻", "📱", "🖥️", "🌐", "📊", "📈"],
                    "business": ["💼", "📊", "💰", "📝", "🤝"],
                    "lifestyle": ["🏃‍♂️", "🍎", "✈️", "🏖️", "🧘‍♀️"],
                    "education": ["📚", "🎓", "✏️", "🔍", "📖"]
                }
            }
        }
        
        # Cria arquivo com dados padrão se não existir
        if not os.path.exists(filepath):
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(default_data.get(filename, {}), f, indent=4)
                
            return default_data.get(filename, {})
        else:
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Erro ao carregar {filename}: {e}")
                return default_data.get(filename, {})
    
    def generate_post(self, post_type=None, topic_category=None, include_emoji=True,
                     include_hashtags=True, typo_probability=0.1, length="medium"):
        """
        Gera uma postagem baseada em templates
        
        Args:
            post_type (str): Tipo de postagem ('question', 'info_sharing', 'opinion', 'discussion')
            topic_category (str): Categoria do tópico ('tech', 'business', 'lifestyle', 'education')
            include_emoji (bool): Incluir emojis na postagem
            include_hashtags (bool): Incluir hashtags na postagem
            typo_probability (float): Probabilidade de incluir erros de digitação
            length (str): Tamanho da postagem ('short', 'medium', 'long')
        
        Returns:
            str: Conteúdo da postagem
        """
        # Escolhe tipo de postagem aleatório se não especificado
        if not post_type or post_type not in self.templates:
            post_type = random.choice(list(self.templates.keys()))
            
        # Escolhe categoria de tópico aleatória se não especificada
        if not topic_category or topic_category not in self.topics:
            topic_category = random.choice(list(self.topics.keys()))
            
        # Seleciona template aleatório para o tipo de postagem
        template = random.choice(self.templates[post_type])
        
        # Seleciona tópico aleatório da categoria
        topic = random.choice(self.topics[topic_category])
        
        # Prepara os parâmetros para o template
        params = {
            "topic": topic,
            "action": self._generate_action(topic_category),
            "problem": self._generate_problem(topic_category),
            "fact": self._generate_fact(topic_category),
            "opinion": self._generate_opinion(topic_category),
            "question": self._generate_question(topic_category)
        }
        
        # Preenche o template com os parâmetros
        content = template.format(**params)
        
        # Adiciona introdução aleatória
        if random.random() < 0.7:
            intro = random.choice(self.intro_patterns)
            content = f"{intro} {content}"
        
        # Adiciona emojis
        if include_emoji and random.random() < 0.8:
            content = self._add_emojis(content, topic_category)
        
        # Adiciona hashtags
        if include_hashtags and random.random() < 0.7:
            content = self._add_hashtags(content, topic_category)
        
        # Adiciona fechamento
        if random.random() < 0.5:
            closing = random.choice(self.phrases.get("closings", []))
            content = f"{content}\n\n{closing}!"
        
        # Ajusta o tamanho da postagem
        content = self._adjust_length(content, length)
        
        # Adiciona erros de digitação para parecer mais humano
        if typo_probability > 0:
            content = self._add_typos(content, typo_probability)
        
        return content
    
    def _generate_action(self, category):
        """Gera uma ação relacionada à categoria"""
        actions = {
            "tech": [
                "desenvolver um aplicativo", 
                "programar em Python", 
                "criar um site", 
                "configurar um servidor", 
                "implementar um sistema"
            ],
            "business": [
                "montar uma estratégia de marketing", 
                "fazer um pitch para investidores", 
                "aumentar as vendas", 
                "gerenciar uma equipe", 
                "expandir o negócio"
            ],
            "lifestyle": [
                "manter uma rotina saudável", 
                "planejar uma viagem", 
                "começar a meditar", 
                "mudar minha alimentação", 
                "encontrar um hobby novo"
            ],
            "education": [
                "aprender um novo idioma", 
                "estudar para uma certificação", 
                "organizar meu tempo de estudo", 
                "escolher um curso", 
                "encontrar boas referências"
            ]
        }
        
        return random.choice(actions.get(category, ["fazer isso"]))
    
    def _generate_problem(self, category):
        """Gera um problema relacionado à categoria"""
        problems = {
            "tech": [
                "estou enfrentando vários bugs", 
                "não consigo fazer o deploy", 
                "a documentação está incompleta", 
                "o código está muito lento", 
                "não sei qual framework escolher"
            ],
            "business": [
                "não estou conseguindo conversões", 
                "o retorno sobre investimento está baixo", 
                "a concorrência está muito acirrada", 
                "estou com dificuldade para precificar", 
                "não sei como escalar"
            ],
            "lifestyle": [
                "não tenho tempo suficiente", 
                "não consigo manter a disciplina", 
                "fico ansioso(a) facilmente", 
                "os resultados demoram a aparecer", 
                "não sei por onde começar"
            ],
            "education": [
                "tenho dificuldade de concentração", 
                "não consigo memorizar o conteúdo", 
                "as informações são muito complexas", 
                "há muita distração", 
                "os cursos são muito caros"
            ]
        }
        
        return random.choice(problems.get(category, ["estou tendo dificuldades"]))
    
    def _generate_fact(self, category):
        """Gera um fato relacionado à categoria"""
        facts = {
            "tech": [
                "70% dos projetos de software ultrapassam o orçamento inicial", 
                "Python é a linguagem que mais cresce em popularidade", 
                "mais de 50% do tráfego na internet vem de dispositivos móveis", 
                "a computação quântica pode quebrar criptografias atuais", 
                "programadores passam mais tempo debugando que escrevendo código"
            ],
            "business": [
                "empresas com diversidade étnica têm 35% mais chances de performar acima da média", 
                "90% das startups fracassam nos primeiros anos", 
                "clientes satisfeitos têm 5x mais chances de comprar novamente", 
                "colaboradores engajados produzem 21% mais", 
                "o custo de aquisição de cliente é 5x maior que o de retenção"
            ],
            "lifestyle": [
                "apenas 30 minutos de exercício diário reduz o risco de depressão em 30%", 
                "pessoas que meditam regularmente têm o cérebro 'mais jovem'", 
                "a qualidade do sono afeta mais a saúde que a quantidade", 
                "viajar reduz o estresse e melhora a criatividade", 
                "comer devagar ajuda a consumir menos calorias"
            ],
            "education": [
                "estudar antes de dormir melhora a retenção de memória", 
                "aprender um novo idioma previne o declínio cognitivo", 
                "ensinar alguém é a melhor forma de dominar um assunto", 
                "intervalos regulares durante o estudo aumentam a produtividade", 
                "ler em voz alta melhora a compreensão em 10%"
            ]
        }
        
        return random.choice(facts.get(category, ["há muitas novidades nessa área"]))
    
    def _generate_opinion(self, category):
        """Gera uma opinião relacionada à categoria"""
        opinions = {
            "tech": [
                "qualidade de código é mais importante que velocidade de entrega", 
                "frameworks modernos facilitam mas também criam dependências", 
                "a IA vai complementar, não substituir os programadores", 
                "opensource é o futuro do desenvolvimento", 
                "a segurança ainda é muito negligenciada"
            ],
            "business": [
                "cultura organizacional é mais importante que estratégia", 
                "empresas que não se digitalizarem vão desaparecer", 
                "o foco no cliente deve vir antes do foco no produto", 
                "liderança é sobre desenvolver pessoas, não controlar", 
                "pequenas empresas precisam ser mais ágeis que as grandes"
            ],
            "lifestyle": [
                "equilíbrio é mais importante que intensidade", 
                "pequenas mudanças consistentes têm mais impacto que grandes transformações", 
                "saúde mental deveria ser prioridade nas empresas", 
                "o minimalismo traz mais felicidade que o consumismo", 
                "conexões sociais são tão importantes quanto dieta e exercício"
            ],
            "education": [
                "o sistema educacional atual está desatualizado", 
                "autodidatismo será essencial no futuro do trabalho", 
                "experiência prática ensina mais que teoria", 
                "educação continuada deve ser um hábito, não uma obrigação", 
                "tecnologia deve complementar, não substituir os professores"
            ]
        }
        
        return random.choice(opinions.get(category, ["precisamos pensar diferente sobre isso"]))
    
    def _generate_question(self, category):
        """Gera uma pergunta relacionada à categoria"""
        questions = {
            "tech": [
                "qual framework vocês recomendam para iniciantes", 
                "vale a pena migrar para a nuvem", 
                "como vocês lidam com segurança de dados", 
                "quais ferramentas são essenciais no dia a dia", 
                "como se manter atualizado com tantas mudanças"
            ],
            "business": [
                "como definir métricas que realmente importam", 
                "qual estratégia de marketing digital tem funcionado melhor", 
                "como encontrar um bom sócio", 
                "vale a pena buscar investimento externo", 
                "como lidar com a sazonalidade nas vendas"
            ],
            "lifestyle": [
                "como conciliar trabalho e vida pessoal", 
                "quais hábitos transformaram sua rotina", 
                "como manter a disciplina nos exercícios", 
                "quais destinos são subestimados para viagens", 
                "como começar a meditar de forma efetiva"
            ],
            "education": [
                "qual método de estudo vocês recomendam", 
                "como aplicar o conhecimento na prática", 
                "quais cursos online valem o investimento", 
                "como manter a motivação nos estudos", 
                "quais livros mudaram sua forma de pensar"
            ]
        }
        
        return random.choice(questions.get(category, ["o que vocês pensam sobre isso"]))
    
    def _add_emojis(self, content, category):
        """Adiciona emojis ao conteúdo"""
        # Determina o sentimento do texto
        sentiment = "positive"  # Default
        
        if "?" in content:
            sentiment = "neutral"
        if any(word in content.lower() for word in ["problema", "dificuldade", "não consigo", "dúvida"]):
            sentiment = "negative"
        
        # Seleciona emojis baseados no sentimento e categoria
        general_emojis = self.emoji_sets.get(sentiment, [])
        topical_emojis = self.emoji_sets.get("topical", {}).get(category, [])
        
        available_emojis = general_emojis + topical_emojis
        
        if not available_emojis:
            return content
            
        # Determina quantos emojis adicionar
        emoji_count = random.randint(1, 3)
        selected_emojis = random.sample(available_emojis, min(emoji_count, len(available_emojis)))
        
        # Decide onde adicionar os emojis
        if random.random() < 0.5:
            # No final da mensagem
            content = f"{content} {''.join(selected_emojis)}"
        else:
            # Distribuídos no texto
            sentences = re.split(r'([.!?])', content)
            
            for emoji in selected_emojis:
                if len(sentences) >= 3:
                    # Posição aleatória (exceto primeira e última frase)
                    pos = random.randint(2, len(sentences) - 2)
                    if sentences[pos].strip():
                        sentences[pos] = f"{sentences[pos]} {emoji}"
                else:
                    # Adiciona no final se texto for curto
                    content = f"{content} {emoji}"
                    return content
            
            content = ''.join(sentences)
        
        return content
    
    def _add_hashtags(self, content, category):
        """Adiciona hashtags relacionadas à categoria"""
        hashtags = {
            "tech": ["#TechTips", "#Programação", "#Tecnologia", "#Inovação", "#Desenvolvimento", "#Dev", "#Tech"],
            "business": ["#Empreendedorismo", "#Marketing", "#Business", "#Negócios", "#Vendas", "#Estratégia", "#Gestão"],
            "lifestyle": ["#BemEstar", "#Saúde", "#Lifestyle", "#Viagem", "#Fitness", "#SaúdeMental", "#Equilíbrio"],
            "education": ["#Educação", "#Aprendizado", "#Conhecimento", "#Estudo", "#Curso", "#Formação", "#Carreira"]
        }
        
        # Extrai palavras-chave do conteúdo
        words = re.findall(r'\b\w+\b', content.lower())
        
        # Lista de possíveis hashtags
        possible_tags = hashtags.get(category, [])
        
        # Adiciona algumas hashtags específicas baseadas nas palavras do texto
        for word in words:
            if len(word) > 4 and word not in ["sobre", "como", "para", "quando", "porque", "ainda", "entre", "assim", "muito"]:
                tag = f"#{word.capitalize()}"
                possible_tags.append(tag)
        
        # Remove duplicatas e seleciona algumas hashtags
        possible_tags = list(set(possible_tags))
        num_tags = random.randint(1, 3)
        selected_tags = random.sample(possible_tags, min(num_tags, len(possible_tags)))
        
        # Adiciona hashtags ao final do conteúdo
        return f"{content}\n\n{''.join(selected_tags)}"
    
    def _adjust_length(self, content, length):
        """Ajusta o tamanho do conteúdo conforme o parâmetro"""
        # Define tamanhos aproximados (caracteres)
        lengths = {
            "short": (100, 200),
            "medium": (200, 400),
            "long": (400, 800)
        }
        
        min_length, max_length = lengths.get(length, lengths["medium"])
        
        # Se o conteúdo estiver dentro do intervalo, retorna sem alteração
        if min_length <= len(content) <= max_length:
            return content
            
        # Se for muito curto, adiciona conteúdo
        if len(content) < min_length:
            while len(content) < min_length:
                additions = [
                    f"\n\nO que vocês acham disso? {random.choice(self.phrases.get('opinions', ['Tenho pensado sobre isso.']))}",
                    f"\n\nAlguém mais já passou por isso? {random.choice(self.phrases.get('questions', ['Compartilhem suas experiências!']))}",
                    f"\n\n{random.choice(self.phrases.get('transitions', ['Por falar nisso,']))} {self._generate_fact(random.choice(list(self.topics.keys())))}"
                ]
                
                content += random.choice(additions)
                
        # Se for muito longo, trunca e adiciona "..."
        elif len(content) > max_length:
            # Encontra um bom ponto para truncar (final de frase)
            for i in range(max_length, max_length - 100, -1):
                if i < len(content) and content[i] in ['.', '!', '?']:
                    return content[:i+1]
                    
            # Se não encontrar, trunca no espaço mais próximo
            return content[:max_length] + "..."
            
        return content
    
    def _add_typos(self, content, probability):
        """Adiciona erros de digitação para simular comportamento humano"""
        if probability <= 0:
            return content
            
        words = content.split()
        new_words = []
        
        for word in words:
            # Verifica se a palavra está no dicionário de erros comuns
            if word.lower() in self.common_typos and random.random() < probability:
                typo = random.choice(self.common_typos[word.lower()])
                
                # Preserva capitalização original
                if word[0].isupper() and len(typo) > 0:
                    typo = typo[0].upper() + typo[1:]
                    
                new_words.append(typo)
            
            # Adiciona erros aleatórios de digitação
            elif len(word) > 3 and random.random() < probability:
                typo_type = random.choice(['swap', 'double', 'missing', 'extra'])
                
                if typo_type == 'swap' and len(word) > 3:
                    # Troca duas letras adjacentes
                    pos = random.randint(0, len(word) - 2)
                    typo = word[:pos] + word[pos+1] + word[pos] + word[pos+2:]
                    
                elif typo_type == 'double' and len(word) > 2:
                    # Duplica uma letra
                    pos = random.randint(0, len(word) - 1)
                    typo = word[:pos] + word[pos] + word[pos:]
                    
                elif typo_type == 'missing' and len(word) > 3:
                    # Remove uma letra
                    pos = random.randint(1, len(word) - 2)  # Evita remover primeira/última letra
                    typo = word[:pos] + word[pos+1:]
                    
                elif typo_type == 'extra' and len(word) > 2:
                    # Adiciona uma letra próxima no teclado
                    pos = random.randint(0, len(word) - 1)
                    nearby_keys = {
                        'a': 'sqzw', 'b': 'vghn', 'c': 'xvd', 'd': 'serfcx', 'e': 'wsrdf',
                        'f': 'rgedcv', 'g': 'tfhvb', 'h': 'gyjbn', 'i': 'ujko', 'j': 'hynmk',
                        'k': 'ujml', 'l': 'kop', 'm': 'njk', 'n': 'bhjm', 'o': 'iklp',
                        'p': 'ol', 'q': 'wa', 'r': 'edft', 's': 'qazxdw', 't': 'rfgy',
                        'u': 'yihj', 'v': 'cfgb', 'w': 'qase', 'x': 'zsdc', 'y': 'tghu',
                        'z': 'asx'
                    }
                    
                    if word[pos].lower() in nearby_keys:
                        extra_char = random.choice(nearby_keys[word[pos].lower()])
                        typo = word[:pos] + extra_char + word[pos:]
                    else:
                        typo = word
                else:
                    typo = word
                
                new_words.append(typo)
            else:
                new_words.append(word)
        
        return ' '.join(new_words)
    
    def get_random_image(self, category=None):
        """
        Retorna um caminho de imagem aleatório para a categoria
        
        Args:
            category (str): Categoria da imagem ('tech', 'business', etc.)
        
        Returns:
            str: Caminho da imagem
        """
        images_dir = os.path.join(self.data_dir, "images")
        
        # Se especificar categoria, busca no subdiretório
        if category and os.path.exists(os.path.join(images_dir, category)):
            category_dir = os.path.join(images_dir, category)
            images = [f for f in os.listdir(category_dir) 
                     if os.path.isfile(os.path.join(category_dir, f)) and 
                     f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))]
            
            if images:
                return os.path.join(category_dir, random.choice(images))
        
        # Caso contrário, busca em todas as imagens
        all_images = []
        for root, _, files in os.walk(images_dir):
            for file in files:
                if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                    all_images.append(os.path.join(root, file))
        
        if all_images:
            return random.choice(all_images)
        
        return None
    
    def generate_comment(self, post_content, agreement_bias=0.7, include_emoji=True, typo_probability=0.1):
        """
        Gera um comentário relacionado a uma postagem
        
        Args:
            post_content (str): Conteúdo da postagem original
            agreement_bias (float): Probabilidade de concordar com o post (0-1)
            include_emoji (bool): Incluir emojis no comentário
            typo_probability (float): Probabilidade de erros de digitação
        
        Returns:
            str: Comentário gerado
        """
        # Extrai palavras-chave do post
        words = re.findall(r'\b\w{4,}\b', post_content.lower())
        keywords = [w for w in words if w not in [
            "como", "para", "isso", "sobre", "porque", "ainda", "entre",
            "quem", "quando", "onde", "qual", "hoje", "agora", "assim"
        ]]
        
        if not keywords:
            keywords = ["isso"]
        
        # Define o tom do comentário (concordância ou discordância)
        agrees = random.random() < agreement_bias
        
        # Estruturas de comentários de acordo com o tom
        agreement_templates = [
            "Concordo totalmente! {opinion}",
            "Exatamente isso! {opinion}",
            "Isso mesmo! {fact}",
            "Penso da mesma forma. {opinion}",
            "É isso aí! {opinion}",
            "Você tem razão. {fact}",
            "Já passei por isso também. {experience}"
        ]
        
        disagreement_templates = [
            "Não concordo muito. {opinion}",
            "Tenho uma visão diferente. {opinion}",
            "Entendo seu ponto, mas {opinion}",
            "Na verdade, {fact}",
            "Respeito sua opinião, mas {opinion}",
            "Não é bem assim. {fact}",
            "Minha experiência foi diferente. {experience}"
        ]
        
        question_templates = [
            "Interessante! Já tentou {question}?",
            "O que você acha sobre {question}?",
            "Você já {question}?",
            "E se {question}?",
            "Alguém mais {question}?"
        ]
        
        # Escolhe o tipo de resposta
        if "?" in post_content and random.random() < 0.7:
            # Responde a uma pergunta
            template = random.choice(agreement_templates)
        elif random.random() < 0.2:
            # Faz uma pergunta
            template = random.choice(question_templates)
        elif agrees:
            template = random.choice(agreement_templates)
        else:
            template = random.choice(disagreement_templates)
        
        # Gera o conteúdo baseado nas palavras-chave
        keyword = random.choice(keywords)
        
        # Identifica possível categoria baseada nas palavras-chave
        category = None
        for cat, topics in self.topics.items():
            if any(kw in topics for kw in keywords):
                category = cat
                break
        
        if not category:
            category = random.choice(list(self.topics.keys()))
        
        # Prepara parâmetros para o template
        params = {
            "opinion": self._generate_opinion(category),
            "fact": self._generate_fact(category),
            "experience": f"Quando {self._generate_action(category)}, percebi que {self._generate_opinion(category).lower()}",
            "question": self._generate_question(category)
        }
        
        comment = template.format(**params)
        
        # Adiciona emojis
        if include_emoji and random.random() < 0.6:
            comment = self._add_emojis(comment, category)
        
        # Adiciona erros de digitação
        if typo_probability > 0:
            comment = self._add_typos(comment, typo_probability)
        
        return comment


if __name__ == "__main__":
    # Exemplo de uso
    generator = PostGenerator()
    
    # Gera post para teste
    post = generator.generate_post(
        post_type="question", 
        topic_category="tech", 
        include_emoji=True,
        include_hashtags=True
    )
    
    print("=== Post Gerado ===")
    print(post)
    print("\n")
    
    # Gera comentário para o post
    comment = generator.generate_comment(post)
    print("=== Comentário Gerado ===")
    print(comment)