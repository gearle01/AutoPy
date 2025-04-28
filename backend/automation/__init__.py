 #!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Pacote de automação para o projeto
"""

from .facebook_bot import FacebookBot
from .post_generator import PostGenerator
from .behavior import HumanBehavior

__all__ = [
    'FacebookBot',
    'PostGenerator',
    'HumanBehavior'
]