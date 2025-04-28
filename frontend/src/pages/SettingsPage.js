import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Divider,
  Grid,
  Slider,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  TextField,
  Button,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Info as InfoIcon,
  RestartAlt as ResetIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Configurações fictícias para demonstração
// Numa implementação real, estas seriam carregadas/salvas através da API
const DEFAULT_SETTINGS = {
  // Configurações de comportamento
  behavior: {
    typingSpeed: 60, // Velocidade de digitação em % (0-100)
    typosProbability: 10, // Probabilidade de erros de digitação (0-100)
    actionDelay: 50, // Atraso entre ações (0-100)
    randomPauses: true, // Pausas aleatórias entre ações
    mouseBehavior: 'natural', // natural, direct, random
  },
  
  // Configurações de navegação
  browser: {
    headless: false, // Navegador invisível
    browserType: 'chromium', // chromium, firefox, webkit
    userAgent: 'random', // random, desktop, mobile, custom
    customUserAgent: '', // Agente personalizado
    cookies: true, // Salvar cookies entre sessões
  },
  
  // Configurações de postagem
  posting: {
    maxDailyPosts: 5, // Limite diário de posts
    includeEmojis: true, // Incluir emojis
    includeHashtags: true, // Incluir hashtags
    defaultPostLength: 'medium', // short, medium, long
    randomizePostTime: true, // Aleatoriza o horário exato do post
    minTimeBetweenPosts: 30, // Tempo mínimo entre posts (minutos)
  },
  
  // Configurações de segurança
  security: {
    avoidDetection: true, // Aplica técnicas para evitar detecção
    logoutAfterComplete: false, // Encerra a sessão após concluir tarefas
    maxSessionDuration: 60, // Duração máxima da sessão (minutos)
  }
};

function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Carrega as configurações
  const loadSettings = () => {
    setLoading(true);
    try {
      // Tenta carregar do localStorage
      const savedSettings = localStorage.getItem('autoFbSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };
  
  // Salva as configurações
  const saveSettings = () => {
    setLoading(true);
    try {
      localStorage.setItem('autoFbSettings', JSON.stringify(settings));
      toast.success('Configurações salvas com sucesso');
      setSettingsChanged(false);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };
  
  // Reseta as configurações para o padrão
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setSettingsChanged(true);
    toast.info('Configurações resetadas para o padrão');
  };
  
  // Atualiza uma configuração específica
  const updateSetting = (category, name, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [name]: value
      }
    });
    setSettingsChanged(true);
  };
  
  // Manipulador para campos de entrada
  const handleChange = (category, name) => (event) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : event.target.value;
    
    updateSetting(category, name, value);
  };
  
  // Manipulador para sliders
  const handleSliderChange = (category, name) => (event, value) => {
    updateSetting(category, name, value);
  };
  
  // Carrega as configurações ao montar o componente
  useEffect(() => {
    loadSettings();
  }, []);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Configurações do Sistema
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<ResetIcon />}
            onClick={resetSettings}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Resetar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={saveSettings}
            disabled={!settingsChanged || loading}
          >
            Salvar Configurações
          </Button>
        </Box>
      </Box>
      
      {settingsChanged && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Você tem alterações não salvas. Clique em "Salvar Configurações" para aplicá-las.
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Configurações de Comportamento */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SettingsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Comportamento Humano
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Typography gutterBottom>
              Velocidade de Digitação
              <Tooltip title="Controla quão rápido o bot digita texto no Facebook">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Lenta
              </Typography>
              <Slider
                value={settings.behavior.typingSpeed}
                onChange={handleSliderChange('behavior', 'typingSpeed')}
                aria-labelledby="typing-speed-slider"
                valueLabelDisplay="auto"
                step={10}
                marks
                min={0}
                max={100}
                sx={{ mx: 1 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                Rápida
              </Typography>
            </Box>
            
            <Typography gutterBottom sx={{ mt: 3 }}>
              Probabilidade de Erros de Digitação
              <Tooltip title="Define a chance de inserir erros típicos de digitação humana">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Nenhum
              </Typography>
              <Slider
                value={settings.behavior.typosProbability}
                onChange={handleSliderChange('behavior', 'typosProbability')}
                aria-labelledby="typos-slider"
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={50}
                sx={{ mx: 1 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                Frequente
              </Typography>
            </Box>
            
            <Typography gutterBottom sx={{ mt: 3 }}>
              Atraso entre Ações
              <Tooltip title="Tempo de espera entre ações (cliques, digitação, etc.)">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Rápido
              </Typography>
              <Slider
                value={settings.behavior.actionDelay}
                onChange={handleSliderChange('behavior', 'actionDelay')}
                aria-labelledby="action-delay-slider"
                valueLabelDisplay="auto"
                step={10}
                marks
                min={0}
                max={100}
                sx={{ mx: 1 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                Lento
              </Typography>
            </Box>
            
            <FormGroup sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.behavior.randomPauses}
                    onChange={handleChange('behavior', 'randomPauses')}
                    name="randomPauses"
                  />
                }
                label="Pausas aleatórias entre ações"
              />
            </FormGroup>
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel id="mouse-behavior-label">Comportamento do Mouse</InputLabel>
              <Select
                labelId="mouse-behavior-label"
                value={settings.behavior.mouseBehavior}
                label="Comportamento do Mouse"
                onChange={handleChange('behavior', 'mouseBehavior')}
              >
                <MenuItem value="natural">Natural (curvas e aceleração)</MenuItem>
                <MenuItem value="direct">Direto (reta)</MenuItem>
                <MenuItem value="random">Aleatório</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>
        
        {/* Configurações do Navegador */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SettingsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Configurações do Navegador
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.browser.headless}
                    onChange={handleChange('browser', 'headless')}
                    name="headless"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Modo Headless
                    <Tooltip title="Executa o navegador sem interface gráfica (invisível)">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </FormGroup>
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel id="browser-type-label">Tipo de Navegador</InputLabel>
              <Select
                labelId="browser-type-label"
                value={settings.browser.browserType}
                label="Tipo de Navegador"
                onChange={handleChange('browser', 'browserType')}
              >
                <MenuItem value="chromium">Chromium</MenuItem>
                <MenuItem value="firefox">Firefox</MenuItem>
                <MenuItem value="webkit">WebKit (Safari)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel id="user-agent-label">User Agent</InputLabel>
              <Select
                labelId="user-agent-label"
                value={settings.browser.userAgent}
                label="User Agent"
                onChange={handleChange('browser', 'userAgent')}
              >
                <MenuItem value="random">Aleatório</MenuItem>
                <MenuItem value="desktop">Desktop</MenuItem>
                <MenuItem value="mobile">Mobile</MenuItem>
                <MenuItem value="custom">Personalizado</MenuItem>
              </Select>
            </FormControl>
            
            {settings.browser.userAgent === 'custom' && (
              <TextField
                fullWidth
                label="User Agent Personalizado"
                value={settings.browser.customUserAgent}
                onChange={handleChange('browser', 'customUserAgent')}
                margin="normal"
                size="small"
              />
            )}
            
            <FormGroup sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.browser.cookies}
                    onChange={handleChange('browser', 'cookies')}
                    name="cookies"
                  />
                }
                label="Salvar cookies entre sessões"
              />
            </FormGroup>
          </Paper>
        </Grid>
        
        {/* Configurações de Postagem */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SettingsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Configurações de Postagem
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Typography gutterBottom>
              Limite Diário de Posts
              <Tooltip title="Número máximo de posts que o bot fará por dia">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Slider
                value={settings.posting.maxDailyPosts}
                onChange={handleSliderChange('posting', 'maxDailyPosts')}
                aria-labelledby="max-posts-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={20}
                sx={{ mr: 2 }}
              />
              <Chip label={`${settings.posting.maxDailyPosts} posts`} />
            </Box>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.posting.includeEmojis}
                    onChange={handleChange('posting', 'includeEmojis')}
                    name="includeEmojis"
                  />
                }
                label="Incluir emojis nos posts"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.posting.includeHashtags}
                    onChange={handleChange('posting', 'includeHashtags')}
                    name="includeHashtags"
                  />
                }
                label="Incluir hashtags nos posts"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.posting.randomizePostTime}
                    onChange={handleChange('posting', 'randomizePostTime')}
                    name="randomizePostTime"
                  />
                }
                label="Aleatorizar horário exato da postagem"
              />
            </FormGroup>
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel id="post-length-label">Tamanho Padrão dos Posts</InputLabel>
              <Select
                labelId="post-length-label"
                value={settings.posting.defaultPostLength}
                label="Tamanho Padrão dos Posts"
                onChange={handleChange('posting', 'defaultPostLength')}
              >
                <MenuItem value="short">Curto (1-3 parágrafos)</MenuItem>
                <MenuItem value="medium">Médio (3-5 parágrafos)</MenuItem>
                <MenuItem value="long">Longo (5+ parágrafos)</MenuItem>
              </Select>
            </FormControl>
            
            <Typography gutterBottom sx={{ mt: 3 }}>
              Tempo Mínimo Entre Posts (minutos)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Slider
                value={settings.posting.minTimeBetweenPosts}
                onChange={handleSliderChange('posting', 'minTimeBetweenPosts')}
                aria-labelledby="min-time-slider"
                valueLabelDisplay="auto"
                step={10}
                marks
                min={10}
                max={120}
                sx={{ mr: 2 }}
              />
              <Chip label={`${settings.posting.minTimeBetweenPosts} min`} />
            </Box>
          </Paper>
        </Grid>
        
        {/* Configurações de Segurança */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SettingsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Configurações de Segurança
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.security.avoidDetection}
                    onChange={handleChange('security', 'avoidDetection')}
                    name="avoidDetection"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Evitar detecção de automação
                    <Tooltip title="Aplica técnicas avançadas para evitar detecção pelo Facebook">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.security.logoutAfterComplete}
                    onChange={handleChange('security', 'logoutAfterComplete')}
                    name="logoutAfterComplete"
                  />
                }
                label="Fazer logout após concluir tarefas"
              />
            </FormGroup>
            
            <Typography gutterBottom sx={{ mt: 3 }}>
              Duração Máxima da Sessão (minutos)
              <Tooltip title="Tempo máximo que o bot ficará logado antes de encerrar a sessão">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Slider
                value={settings.security.maxSessionDuration}
                onChange={handleSliderChange('security', 'maxSessionDuration')}
                aria-labelledby="session-duration-slider"
                valueLabelDisplay="auto"
                step={30}
                marks
                min={30}
                max={240}
                sx={{ mr: 2 }}
              />
              <Chip label={`${settings.security.maxSessionDuration} min`} />
            </Box>
            
            <Alert severity="info" sx={{ mt: 3 }}>
              Configurações de segurança mais restritivas podem reduzir a eficiência, 
              mas ajudam a evitar bloqueios da sua conta.
            </Alert>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
          onClick={saveSettings}
          disabled={!settingsChanged || loading}
          size="large"
        >
          Salvar Todas as Configurações
        </Button>
      </Box>
    </Container>
  );
}

export default SettingsPage;