import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  CardActions,
  Divider,
  Stack,
  Tab,
  Tabs
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ContentCopy as CopyIcon,
  PostAdd as PostAddIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Serviços
import {
  getSchedule,
  addScheduledTask,
  updateScheduledTask,
  deleteScheduledTask,
  getGroups,
  generatePost,
  manualPost
} from '../services/api';

function SchedulePage() {
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'generate'
  const [currentTask, setCurrentTask] = useState({
    id: '',
    type: 'post',
    target_id: '',
    target_name: '',
    content: '',
    scheduled_time: format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm"), // 1 hora no futuro
    completed: false,
    media_path: '',
    category: 'general'
  });
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0 = pendentes, 1 = concluídas
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredTasks, setFilteredTasks] = useState([]);

  // Carrega a lista de tarefas
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getSchedule();
      setTasks(data);
      filterTasks(data, tabValue);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      toast.error(`Erro ao buscar tarefas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Carrega a lista de grupos
  const fetchGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      toast.error(`Erro ao buscar grupos: ${error.message}`);
    }
  };

  // Filtra tarefas com base na aba selecionada
  const filterTasks = (tasksData, tab) => {
    const filtered = tasksData.filter(task => {
      return tab === 0 ? !task.completed : task.completed;
    });
    setFilteredTasks(filtered);
  };

  // Alterna entre as abas
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    filterTasks(tasks, newValue);
    setPage(0);
  };

  // Manipuladores de paginação
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Abre o diálogo para adicionar tarefa
  const handleAddTask = () => {
    const oneHourLater = new Date();
    oneHourLater.setHours(oneHourLater.getHours() + 1);
    
    setCurrentTask({
      id: '',
      type: 'post',
      target_id: '',
      target_name: '',
      content: '',
      scheduled_time: format(oneHourLater, "yyyy-MM-dd'T'HH:mm"),
      completed: false,
      media_path: '',
      category: 'general'
    });
    setDialogMode('add');
    setOpenDialog(true);
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
    setOpenDialog(true);
  };

  // Abre o diálogo de confirmação para excluir tarefa
  const handleConfirmDelete = (task) => {
    setCurrentTask(task);
    setConfirmDeleteDialog(true);
  };

  // Manipulador para mudanças nos campos do formulário
  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (name === 'completed') {
      setCurrentTask({ ...currentTask, [name]: checked });
    } else {
      setCurrentTask({ ...currentTask, [name]: value });
    }
  };

  // Gera conteúdo para a postagem
  const handleGeneratePost = async () => {
    if (!currentTask.target_id) {
      toast.warning('Selecione um grupo primeiro');
      return;
    }
    
    setLoading(true);
    try {
      const response = await generatePost({
        post_type: null, // deixa o backend escolher aleatoriamente
        category: currentTask.category,
        include_emoji: true,
        include_hashtags: true,
        typo_probability: 0.1,
        length: "medium"
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
      toast.error(`Erro ao gerar conteúdo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Salva uma tarefa (adiciona ou atualiza)
  const handleSaveTask = async () => {
    // Validações básicas
    if (!currentTask.target_id || !currentTask.content || !currentTask.scheduled_time) {
      toast.error('Grupo, conteúdo e horário são campos obrigatórios');
      return;
    }
    
    setLoading(true);
    try {
      // Adiciona o nome do grupo
      const selectedGroup = groups.find(g => g.id === currentTask.target_id);
      currentTask.target_name = selectedGroup ? selectedGroup.name : '';
      
      if (dialogMode === 'add') {
        // Adiciona nova tarefa
        await addScheduledTask(currentTask);
        toast.success('Tarefa agendada com sucesso');
      } else {
        // Atualiza tarefa existente
        await updateScheduledTask(currentTask.id, currentTask);
        toast.success('Tarefa atualizada com sucesso');
      }
      
      // Fecha o diálogo e atualiza a lista
      setOpenDialog(false);
      fetchTasks();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast.error(`Erro ao salvar tarefa: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Exclui uma tarefa
  const handleDeleteTask = async () => {
    setLoading(true);
    try {
      await deleteScheduledTask(currentTask.id);
      toast.success('Tarefa excluída com sucesso');
      setConfirmDeleteDialog(false);
      fetchTasks();
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast.error(`Erro ao excluir tarefa: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Publica manualmente
  const handlePublishNow = async (task) => {
    setLoading(true);
    try {
      await manualPost({
        group_id: task.target_id,
        content: task.content,
        image_path: task.media_path || null
      });
      
      toast.success('Post publicado com sucesso');
      
      // Atualiza o status da tarefa se for uma tarefa agendada
      if (task.id) {
        const updatedTask = {
          ...task,
          completed: true,
          execution_time: new Date().toISOString()
        };
        
        await updateScheduledTask(task.id, updatedTask);
        fetchTasks();
      }
    } catch (error) {
      console.error('Erro ao publicar:', error);
      toast.error(`Erro ao publicar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Duplica uma tarefa
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
    setOpenDialog(true);
  };

  // Efeito para carregar os grupos na montagem do componente
  useEffect(() => {
    fetchGroups();
  }, []);
  
  // Efeito para carregar tarefas e aplicar filtros na montagem do componente
  useEffect(() => {
    fetchTasks();
  }, []);
  
  // Efeito para filtrar tarefas quando a aba muda
  useEffect(() => {
    filterTasks(tasks, tabValue);
  }, [tabValue, tasks]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Agendamento de Posts
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchTasks}
            sx={{ mr: 1 }}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddTask}
          >
            Novo Agendamento
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Tarefas Pendentes" />
          <Tab label="Tarefas Concluídas" />
        </Tabs>
      </Paper>

      {loading && filteredTasks.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredTasks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {tabValue === 0 
              ? 'Nenhuma tarefa pendente' 
              : 'Nenhuma tarefa concluída'}
          </Typography>
          {tabValue === 0 && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddTask}
              sx={{ mt: 2 }}
            >
              Agendar sua primeira postagem
            </Button>
          )}
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Horário</TableCell>
                <TableCell>Ação</TableCell>
                <TableCell>Alvo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((task) => (
                  <TableRow
                    key={task.id}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      bgcolor: task.completed ? 'action.hover' : 'inherit'
                    }}
                  >
                    <TableCell>
                      {format(new Date(task.scheduled_time), "dd/MM HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {task.type === 'post' ? (
                          <PostAddIcon color="primary" sx={{ mr: 1 }} />
                        ) : (
                          <ChatIcon color="secondary" sx={{ mr: 1 }} />
                        )}
                        <Typography
                          variant="body2"
                          sx={{ 
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {task.type === 'post' ? 'Postagem' : 'Comentário'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={task.target_id}>
                        <Typography variant="body2" noWrap>
                          {task.target_name || task.target_id}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {task.completed ? (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Concluído"
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Chip
                          icon={<ScheduleIcon />}
                          label="Pendente"
                          color="warning"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {!task.completed && (
                          <>
                            <Tooltip title="Publicar agora">
                              <IconButton
                                onClick={() => handlePublishNow(task)}
                                size="small"
                                color="success"
                              >
                                <PostAddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <IconButton
                                onClick={() => handleEditTask(task)}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Duplicar">
                          <IconButton
                            onClick={() => handleDuplicateTask(task)}
                            size="small"
                            color="primary"
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            onClick={() => handleConfirmDelete(task)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {filteredTasks.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      )}

      {/* Diálogo para adicionar/editar tarefa */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add'
            ? 'Agendar Nova Postagem'
            : dialogMode === 'edit'
            ? 'Editar Agendamento'
            : 'Gerar Conteúdo'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="target-group-label">Grupo Alvo</InputLabel>
                <Select
                  labelId="target-group-label"
                  name="target_id"
                  value={currentTask.target_id}
                  label="Grupo Alvo"
                  onChange={handleFormChange}
                >
                  {groups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="task-type-label">Tipo de Tarefa</InputLabel>
                <Select
                  labelId="task-type-label"
                  name="type"
                  value={currentTask.type}
                  label="Tipo de Tarefa"
                  onChange={handleFormChange}
                >
                  <MenuItem value="post">Postagem</MenuItem>
                  <MenuItem value="comment">Comentário</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data e Hora"
                type="datetime-local"
                name="scheduled_time"
                value={currentTask.scheduled_time}
                onChange={handleFormChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Categoria</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={currentTask.category}
                  label="Categoria"
                  onChange={handleFormChange}
                >
                  <MenuItem value="tech">Tecnologia</MenuItem>
                  <MenuItem value="business">Negócios</MenuItem>
                  <MenuItem value="lifestyle">Estilo de Vida</MenuItem>
                  <MenuItem value="education">Educação</MenuItem>
                  <MenuItem value="general">Geral</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">Conteúdo</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleGeneratePost}
                  disabled={!currentTask.target_id || loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  Gerar Conteúdo
                </Button>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={6}
                name="content"
                value={currentTask.content}
                onChange={handleFormChange}
                placeholder="Digite o conteúdo da postagem aqui..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Caminho da Imagem (opcional)"
                name="media_path"
                value={currentTask.media_path}
                onChange={handleFormChange}
                placeholder="Ex: D:/AutoPy/data/content/images/foto.jpg"
              />
            </Grid>
            {dialogMode === 'edit' && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentTask.completed}
                      onChange={handleFormChange}
                      name="completed"
                      color="primary"
                    />
                  }
                  label="Marcar como concluída"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
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
        open={confirmDeleteDialog}
        onClose={() => setConfirmDeleteDialog(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir esta tarefa agendada?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialog(false)}>Cancelar</Button>
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
    </Container>
  );
}

export default SchedulePage;