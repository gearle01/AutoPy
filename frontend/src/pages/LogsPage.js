import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CircularProgress,
  Collapse
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  FileDownload as DownloadIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-toastify';

// Serviços
import { getLogs } from '../services/api';

function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expandedLog, setExpandedLog] = useState(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  
  // Carregar logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Converte a data para o formato esperado pela API (YYYYMMDD)
      const apiDate = selectedDate.replace(/-/g, '');
      
      const data = await getLogs(apiDate);
      setLogs(data);
      applyFilters(data, searchTerm, filterType);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      toast.error(`Erro ao buscar logs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Aplicar filtros aos logs
  const applyFilters = (logsData, term, type) => {
    let filtered = [...logsData];
    
    // Filtra por tipo de ação
    if (type !== 'all') {
      filtered = filtered.filter(log => log.action === type);
    }
    
    // Filtra por termo de busca
    if (term) {
      const lowercaseTerm = term.toLowerCase();
      filtered = filtered.filter(log => 
        (log.action && log.action.toLowerCase().includes(lowercaseTerm)) ||
        (log.target_id && log.target_id.toLowerCase().includes(lowercaseTerm)) ||
        (log.details && log.details.toLowerCase().includes(lowercaseTerm))
      );
    }
    
    setFilteredLogs(filtered);
  };
  
  // Manipuladores de eventos
  const handleSearchChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    applyFilters(logs, term, filterType);
  };
  
  const handleFilterTypeChange = (event) => {
    const type = event.target.value;
    setFilterType(type);
    applyFilters(logs, searchTerm, type);
  };
  
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleExpandLog = (logIndex) => {
    if (expandedLog === logIndex) {
      setExpandedLog(null);
    } else {
      setExpandedLog(logIndex);
    }
  };
  
  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };
  
  // Exportar logs para JSON
  const exportLogs = () => {
    try {
      const dataStr = JSON.stringify(logs, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `logs_${selectedDate}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Logs exportados com sucesso');
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
      toast.error('Erro ao exportar logs');
    }
  };
  
  // Obtém o chip de status apropriado para o tipo de ação
  const getActionChip = (action) => {
    switch (action) {
      case 'post_created':
        return <Chip label="Postagem" color="success" size="small" />;
      case 'comment_created':
        return <Chip label="Comentário" color="primary" size="small" />;
      case 'login':
        return <Chip label="Login" color="info" size="small" />;
      case 'error':
        return <Chip label="Erro" color="error" size="small" />;
      default:
        return <Chip label={action || 'Desconhecido'} size="small" />;
    }
  };
  
  // Efeito para carregar logs ao montar o componente ou quando a data muda
  useEffect(() => {
    fetchLogs();
  }, [selectedDate]);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Logs de Atividade
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportLogs}
            disabled={logs.length === 0}
            sx={{ mr: 2 }}
          >
            Exportar
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchLogs}
            disabled={loading}
          >
            Atualizar
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              label="Data"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              sx={{ width: 200, mr: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Button
              variant={filtersExpanded ? "contained" : "outlined"}
              startIcon={<FilterIcon />}
              onClick={toggleFilters}
              size="medium"
            >
              Filtros
            </Button>
          </Box>
          <TextField
            label="Buscar nos logs"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <Collapse in={filtersExpanded}>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Filtros Avançados
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="filter-type-label">Tipo de Ação</InputLabel>
                  <Select
                    labelId="filter-type-label"
                    value={filterType}
                    label="Tipo de Ação"
                    onChange={handleFilterTypeChange}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="post_created">Postagens</MenuItem>
                    <MenuItem value="comment_created">Comentários</MenuItem>
                    <MenuItem value="login">Logins</MenuItem>
                    <MenuItem value="error">Erros</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : logs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum log encontrado para esta data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tente selecionar outra data ou realizar automações para gerar logs.
          </Typography>
        </Paper>
      ) : (
        <>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Horário</TableCell>
                    <TableCell>Ação</TableCell>
                    <TableCell>Alvo</TableCell>
                    <TableCell>Detalhes</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((log, index) => {
                      const logIndex = page * rowsPerPage + index;
                      const isExpanded = expandedLog === logIndex;
                      
                      return (
                        <React.Fragment key={log.timestamp}>
                          <TableRow
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                              bgcolor: isExpanded ? 'action.hover' : 'inherit',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleExpandLog(logIndex)}
                          >
                            <TableCell>
                              {format(new Date(log.timestamp), "HH:mm:ss", { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              {getActionChip(log.action)}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap>
                                {log.target_id}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap>
                                {log.details ? 
                                  (log.details.length > 50 ? 
                                    `${log.details.substring(0, 50)}...` : 
                                    log.details) : 
                                  '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExpandLog(logIndex);
                                }}
                              >
                                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={5} sx={{ py: 0 }}>
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                  <Box sx={{ m: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom component="div">
                                      Detalhes do Log
                                    </Typography>
                                    <Grid container spacing={2}>
                                      <Grid item xs={12} sm={4}>
                                        <Typography variant="body2" color="text.secondary">
                                          Timestamp
                                        </Typography>
                                        <Typography variant="body1">
                                          {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={12} sm={4}>
                                        <Typography variant="body2" color="text.secondary">
                                          Ação
                                        </Typography>
                                        <Typography variant="body1">
                                          {log.action || '-'}
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={12} sm={4}>
                                        <Typography variant="body2" color="text.secondary">
                                          Alvo
                                        </Typography>
                                        <Typography variant="body1">
                                          {log.target_id || '-'}
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">
                                          Detalhes
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
                                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {log.details || 'Sem detalhes adicionais'}
                                          </Typography>
                                        </Paper>
                                      </Grid>
                                    </Grid>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredLogs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Itens por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </Paper>
          
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              {logs.length} logs encontrados para {format(new Date(selectedDate), "dd/MM/yyyy", { locale: ptBR })}
            </Typography>
          </Box>
        </>
      )}
    </Container>
  );
}

export default LogsPage;