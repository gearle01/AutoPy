import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  Box,
  CircularProgress,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Link as LinkIcon,
  OpenInNew as OpenIcon,
  Facebook as FacebookIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Serviços
import { getGroups, addGroup, updateGroup, deleteGroup } from '../services/api';

function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' ou 'edit'
  const [currentGroup, setCurrentGroup] = useState({
    id: '',
    name: '',
    url: '',
    category: 'general',
    active: true
  });
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  
  // Categorias disponíveis
  const categories = [
    { value: 'tech', label: 'Tecnologia' },
    { value: 'business', label: 'Negócios' },
    { value: 'lifestyle', label: 'Estilo de Vida' },
    { value: 'education', label: 'Educação' },
    { value: 'general', label: 'Geral' }
  ];
  
  // Busca a lista de grupos
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      toast.error(`Erro ao buscar grupos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Abre o diálogo para adicionar grupo
  const handleAddGroup = () => {
    setCurrentGroup({
      id: '',
      name: '',
      url: '',
      category: 'general',
      active: true
    });
    setDialogMode('add');
    setOpenDialog(true);
  };
  
  // Abre o diálogo para editar grupo
  const handleEditGroup = (group) => {
    setCurrentGroup(group);
    setDialogMode('edit');
    setOpenDialog(true);
  };
  
  // Abre o diálogo de confirmação para excluir grupo
  const handleConfirmDelete = (group) => {
    setCurrentGroup(group);
    setConfirmDeleteDialog(true);
  };
  
  // Salva um grupo (adiciona ou atualiza)
  const handleSaveGroup = async () => {
    // Validações básicas
    if (!currentGroup.name || !currentGroup.url) {
      toast.error('Nome e URL são campos obrigatórios');
      return;
    }
    
    // Extrai ID do grupo da URL se não for fornecido
    if (!currentGroup.id && currentGroup.url) {
      const matches = currentGroup.url.match(/groups\/(\d+)|groups\/([^\/]+)/);
      if (matches) {
        currentGroup.id = matches[1] || matches[2];
      }
    }
    
    // Verifica se o ID foi extraído ou fornecido
    if (!currentGroup.id) {
      toast.error('Não foi possível identificar o ID do grupo a partir da URL');
      return;
    }
    
    setLoading(true);
    try {
      if (dialogMode === 'add') {
        // Adiciona novo grupo
        await addGroup(currentGroup);
        toast.success('Grupo adicionado com sucesso');
      } else {
        // Atualiza grupo existente
        await updateGroup(currentGroup.id, currentGroup);
        toast.success('Grupo atualizado com sucesso');
      }
      
      // Fecha o diálogo e atualiza a lista
      setOpenDialog(false);
      fetchGroups();
    } catch (error) {
      console.error('Erro ao salvar grupo:', error);
      toast.error(`Erro ao salvar grupo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Exclui um grupo
  const handleDeleteGroup = async () => {
    setLoading(true);
    try {
      await deleteGroup(currentGroup.id);
      toast.success('Grupo excluído com sucesso');
      setConfirmDeleteDialog(false);
      fetchGroups();
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      toast.error(`Erro ao excluir grupo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Alterna o status ativo/inativo de um grupo
  const handleToggleActive = async (group) => {
    setLoading(true);
    try {
      const updatedGroup = { ...group, active: !group.active };
      await updateGroup(group.id, updatedGroup);
      toast.success(`Grupo ${updatedGroup.active ? 'ativado' : 'desativado'} com sucesso`);
      fetchGroups();
    } catch (error) {
      console.error('Erro ao atualizar status do grupo:', error);
      toast.error(`Erro ao atualizar status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Atualiza o campo do grupo atual no formulário
  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    setCurrentGroup({
      ...currentGroup,
      [name]: name === 'active' ? checked : value
    });
  };
  
  // Efeito para carregar os grupos na montagem do componente
  useEffect(() => {
    fetchGroups();
  }, []);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Grupos do Facebook
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddGroup}
        >
          Adicionar Grupo
        </Button>
      </Box>
      
      {loading && groups.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : groups.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum grupo cadastrado
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Adicione grupos do Facebook para começar a automatizar suas postagens.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddGroup}
          >
            Adicionar seu primeiro grupo
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {groups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group.id}>
              <Card className="group-card" sx={{ 
                opacity: group.active ? 1 : 0.7,
                borderLeft: `4px solid ${group.active ? '#4caf50' : '#f44336'}`
              }}>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom noWrap>
                    {group.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LinkIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {group.id}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Chip 
                      label={categories.find(c => c.value === group.category)?.label || 'Geral'}
                      size="small"
                      color="secondary"
                    />
                    <Chip 
                      label={group.active ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={group.active ? 'success' : 'error'}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Box>
                    <Tooltip title="Editar grupo">
                      <IconButton onClick={() => handleEditGroup(group)} size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir grupo">
                      <IconButton onClick={() => handleConfirmDelete(group)} size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Box>
                    <Tooltip title="Abrir no Facebook">
                      <IconButton 
                        href={group.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        size="small"
                        color="primary"
                      >
                        <FacebookIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={group.active ? 'Desativar' : 'Ativar'}>
                      <Switch
                        checked={group.active}
                        onChange={() => handleToggleActive(group)}
                        color="success"
                        size="small"
                      />
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Diálogo para adicionar/editar grupo */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Adicionar Novo Grupo' : 'Editar Grupo'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nome do Grupo"
            type="text"
            fullWidth
            variant="outlined"
            value={currentGroup.name}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            name="url"
            label="URL do Grupo"
            type="url"
            fullWidth
            variant="outlined"
            value={currentGroup.url}
            onChange={handleFormChange}
            helperText="Ex: https://www.facebook.com/groups/123456789"
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="category-label">Categoria</InputLabel>
            <Select
              labelId="category-label"
              name="category"
              value={currentGroup.category}
              label="Categoria"
              onChange={handleFormChange}
            >
              {categories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={currentGroup.active}
                onChange={handleFormChange}
                name="active"
                color="success"
              />
            }
            label="Grupo ativo"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleSaveGroup} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={confirmDeleteDialog} onClose={() => setConfirmDeleteDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o grupo "{currentGroup.name}"?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleDeleteGroup} 
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

export default GroupsPage;