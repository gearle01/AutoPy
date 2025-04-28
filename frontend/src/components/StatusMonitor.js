import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  AccessTime as TimeIcon,
  Done as DoneIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-toastify';

// Serviços
import { getStatus, startSystem, stopSystem } from '../services/api';

function StatusMonitor() {
  const [status, setStatus] = useState({
    running: false,
    bot_busy: false,
    last_error: null,
    last_activity: null
  });
  const [loading, setLoading] = useState(false);
  
  // Busca o status do sistema
  const fetchStatus = async () => {
    try {
      const data = await getStatus();
      setStatus(data);
    } catch (error) {
      console.error('Erro ao buscar status:', error);
    }
  };
  
  // Inicia o sistema
  const handleStartSystem = async () => {
    setLoading(true);
    try {
      await startSystem();
      toast.success('Sistema iniciado com sucesso');
      fetchStatus();
    } catch (error) {
      console.error('Erro ao iniciar sistema:', error);
      toast.error(`Erro ao iniciar sistema: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Para o sistema
  const handleStopSystem = async () => {
    setLoading(true);
    try {
      await stopSystem();
      toast.success('Sistema parado com sucesso');
      fetchStatus();
    } catch (error) {
      console.error('Erro ao parar sistema:', error);
      toast.error(`Erro ao parar sistema: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Efeito para buscar o status periodicamente
  useEffect(() => {
    fetchStatus();
    
    const interval = setInterval(() => {
      fetchStatus();
    }, 10000); // A cada 10 segundos
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Status do Sistema
        </Typography>
        <Tooltip title="Atualizar status">
          <IconButton onClick={fetchStatus} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Chip
          icon={status.running ? <CheckCircleIcon /> : <StopIcon />}
          label={status.running ? 'Ativo' : 'Inativo'}
          color={status.running ? 'success' : 'error'}
          sx={{ mr: 2 }}
        />
        
        {status.bot_busy && (
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              Executando tarefa...
            </Typography>
            <LinearProgress sx={{ flex: 1 }} />
          </Box>
        )}
        
        {!status.bot_busy && status.running && (
          <Typography variant="body2" color="text.secondary">
            Bot disponível para tarefas
          </Typography>
        )}
      </Box>
      
      {status.last_error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Último erro:</strong> {status.last_error.message}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(status.last_error.time).toLocaleString()}
          </Typography>
        </Alert>
      )}
      
      {status.last_activity && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Última atividade:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                {status.last_activity.status === 'success' ? 
                  <DoneIcon color="success" /> : 
                  <ScheduleIcon color="warning" />
                }
              </ListItemIcon>
              <ListItemText
                primary={`${status.last_activity.task_type === 'post' ? 'Postagem' : 'Comentário'} em ${status.last_activity.target}`}
                secondary={format(new Date(status.last_activity.time), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
              />
            </ListItem>
          </List>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {status.running ? (
          <Button
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            onClick={handleStopSystem}
            disabled={loading}
          >
            Parar Sistema
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            startIcon={<PlayIcon />}
            onClick={handleStartSystem}
            disabled={loading}
          >
            Iniciar Sistema
          </Button>
        )}
      </Box>
    </Paper>
  );
}

export default StatusMonitor;