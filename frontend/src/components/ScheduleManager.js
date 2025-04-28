import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Send as SendIcon,
  ContentCopy as DuplicateIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-toastify';

// Componentes
import GroupSelector from './GroupSelector';

// Serviços
import { 
  getSchedule, 
  addScheduledTask, 
  updateScheduledTask, 
  deleteScheduledTask, 
  manualPost, 
  generatePost 
} from '../services/api';

function ScheduleManager({ limit = 5 }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit'
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState({
    id: '',
    type: 'post',
    target_id: '',
    content: '',
    scheduled_time: '',
    completed: false,
    category: 'general'
  });
  const [groups, setGroups] = useState([]);
  
  // Carregar tarefas agendadas
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getSchedule();
      // Filtra apenas tarefas pendentes e ordena por data
      const pendingTasks = data
        .filter(task => !task.completed)
        .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));
      
      setTasks(pendingTasks);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };
  
  // Abre o diálogo para adicionar nova tarefa
  const handleAddTask = () => {
    // Define a data como 1 hora no futuro
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);
    
    setCurrentTask({
      id: '',
      type: 'post',
      target_id: '',
      content: '',
      scheduled_time: format(futureDate, "yyyy-MM-dd'T'HH:mm"),
      completed: false,
      category: 'general'
    });
    
    setDialogMode('add');
    setDialogOpen(true);
  };
  
  // Abre o diálogo para editar tarefa
  const handleEditTask = (task) => {
    // Converte o formato da data para o formato aceito pelo campo datetime-local
    const formattedDate = format(new Date(task.scheduled_time), "yyyy-MM-dd'T'HH:mm");
    
    setCurrentTask({
      ...task,
      scheduled_time: formattedDate
    });
    
    setDialogMode('edit');
    setDialogOpen(true);
  };
  
  // Abre o diálogo para confirmar exclusão
  const handleConfirmDelete = (task) => {
    setCurrentTask(task);
    setConfirmDeleteOpen(true);
  };
  
  // Manipulador para mudanças nos campos do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Se o target_id mudou, atualiza a categoria com base no grupo selecionado
    if (name === 'target_id') {
      const selectedGroup = groups.find(g => g.id === value);
      
      setCurrentTask({
        ...currentTask,
        target_id: value,
        category: selectedGroup ? selectedGroup.category : 'general'
      });
    } else {
      setCurrentTask({
        ...currentTask,
        [name]: value
      });
    }
  };
  
  // Gera conteúdo para postagem
  const handleGenerateContent = async () => {
    if (!currentTask.target_id) {
      toast.warning('Selecione um grupo primeiro');
      return;
    }
    
    setLoading(true);
    try {
      const response = await generatePost({
        category: currentTask.category,
        include_emoji: true,
        include_hashtags: true,
        typo_probability: 0.1,
        length: 'medium'
      });
      
      if (response.success) {
        setCurrentTask({
          ...currentTask,
          content: response.content
        });
        toast.success('Conteúdo gerado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      toast.error('Erro ao gerar conteúdo');
    } finally {
      setLoading(false);
    }
  };
  
  // Salva tarefa (adiciona ou atualiza)
  const handleSaveTask = async () => {
    // Validações
    if (!currentTask.target_id) {
      toast.warning('Selecione um grupo');
      return;
    }
    
    if (!currentTask.content) {
      toast.warning('O conteúdo não pode estar vazio');
      return;
    }
    
    if (!currentTask.scheduled_time) {
      toast.warning('Defina uma data e hora');
      return;
    }
    
    setLoading(true);
    try {
      // Adiciona o nome do grupo, se disponível
      const group = groups.find(g => g.id === currentTask.target_id);
      const taskToSave = {
        ...currentTask,
        target_name: group ? group.name : ''
      };
      
      if (dialogMode === 'add') {
        // Adiciona nova tarefa
        await addScheduledTask(taskToSave);
        toast.success('Tarefa agendada com sucesso');
      } else {
        // Atualiza tarefa existente
        await updateScheduledTask(taskToSave.id, taskToSave);
        toast.success('Tarefa atualizada com sucesso');
      }
      
      // Fecha o diálogo e atualiza a lista
      setDialogOpen(false);
      fetchTasks();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast.error('Erro ao salvar tarefa');
    } finally {
      setLoading(false);
    }
  };
  
  // Exclui tarefa
  const handleDeleteTask = async () => {
    setLoading(true);
    try {
      await deleteScheduledTask(currentTask.id);
      toast.success('Tarefa excluída com sucesso');
      setConfirmDeleteOpen(false);
      fetchTasks();
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast.error('Erro ao excluir tarefa');
    } finally {
      setLoading(false);
    }
  };
  
  // Executa tarefa imediatamente
  const handleExecuteNow = async (task) => {
    setLoading(true);
    try {
      // Envia a postagem imediatamente
      await manualPost({
        group_id: task.target_id,
        content: task.content,
        image_path: task.media_path || null
      });
      
      // Marca a tarefa como concluída
      const updatedTask = {
        ...task,
        completed: true,
        execution_time: new Date().toISOString()
      };
      
      await updateScheduledTask(task.id, updatedTask);
      toast.success('Tarefa executada com sucesso');
      fetchTasks();
    } catch (error) {
      console.error('Erro ao executar tarefa:', error);
      toast.error('Erro ao executar tarefa');
    } finally {
      setLoading(false);
    }
  };
  
  // Duplica tarefa
  const handleDuplicateTask = (task) => {
    // Cria uma cópia da tarefa com nova data (amanhã no mesmo horário)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const scheduledDate = new Date(task.scheduled_time);
    tomorrow.setHours(scheduledDate.getHours());
    tomorrow.setMinutes(scheduledDate.getMinutes());
    
    const duplicatedTask = {
      ...task,
      id: '', // ID será gerado pelo servidor
      scheduled_time: format(tomorrow, "yyyy-MM-dd'T'HH:mm"),
      completed: false
    };
    
    setCurrentTask(duplicatedTask);
    setDialogMode('add');
    setDialogOpen(true);
  };
  
  // Carrega tarefas ao montar o componente
  useEffect(() => {
    fetchTasks();
  }, []);
  
  // Formata a data para exibição
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
  };
  
  // Calcula o tempo restante
  const getTimeRemaining = (dateString) => {
    const targetDate = new Date(dateString);
    const now = new Date();
    const diffMs = targetDate - now;
    
    if (diffMs < 0) {
      return "Atrasado";
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} dia${diffDays !== 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    } else {
      return `${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Agendamentos Pendentes
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddTask}
          disabled={tasks.length >= limit}
          size="small"
        >
          Novo Agendamento
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      {loading && tasks.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      ) : tasks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography color="text.secondary">
            Nenhuma tarefa agendada
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddTask}
            sx={{ mt: 2 }}
          >
            Agendar Postagem
          </Button>
        </Box>
      ) : (
        <List>
          {tasks.slice(0, limit).map((task) => (
            <ListItem
              key={task.id}
              divider
              secondaryAction={
                <Box>
                  <Tooltip title="Executar agora">
                    <IconButton 
                      edge="end" 
                      onClick={() => handleExecuteNow(task)}
                      color="success"
                      size="small"
                    >
                      <SendIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton 
                      edge="end" 
                      onClick={() => handleEditTask(task)}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Duplicar">
                    <IconButton 
                      edge="end" 
                      onClick={() => handleDuplicateTask(task)}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <DuplicateIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton 
                      edge="end" 
                      onClick={() => handleConfirmDelete(task)}
                      color="error"
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemIcon>
                <ScheduleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1">
                      {task.target_name || task.target_id}
                    </Typography>
                    <Chip
                      label={formatDate(task.scheduled_time)}
                      size="small"
                      color="secondary"
                      sx={{ ml: 1 }}
                    />
                    <Chip
                      label={getTimeRemaining(task.scheduled_time)}
                      size="small"
                      color={
                        new Date(task.scheduled_time) < new Date() 
                          ? "error" 
                          : "default"
                      }
                      icon={
                        new Date(task.scheduled_time) < new Date() 
                          ? <WarningIcon fontSize="small" /> 
                          : <ScheduleIcon fontSize="small" />
                      }
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
                secondary={
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {task.content}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
      
      {tasks.length > limit && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            variant="text"
            size="small"
            href="/schedule"
          >
            Ver Todos ({tasks.length})
          </Button>
        </Box>
      )}
      
      {/* Diálogo para adicionar/editar tarefa */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Agendar Nova Tarefa' : 'Editar Tarefa Agendada'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Grupo
            </Typography>
            <GroupSelector
              selectedGroups={currentTask.target_id}
              onChange={(groupId) => handleInputChange({ target: { name: 'target_id', value: groupId } })}
              multiple={false}
              activeOnly={true}
            />
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Data e Hora
            </Typography>
            <TextField
              type="datetime-local"
              name="scheduled_time"
              value={currentTask.scheduled_time}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Conteúdo
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleGenerateContent}
                disabled={!currentTask.target_id || loading}
              >
                Gerar Conteúdo
              </Button>
            </Box>
            <TextField
              multiline
              rows={6}
              name="content"
              value={currentTask.content}
              onChange={handleInputChange}
              fullWidth
              placeholder="Digite o conteúdo da postagem aqui..."
            />
          </Box>
          
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleSaveTask} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir esta tarefa agendada?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Agendada para: {currentTask.scheduled_time ? formatDate(currentTask.scheduled_time) : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleDeleteTask} 
            variant="contained" 
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default ScheduleManager;