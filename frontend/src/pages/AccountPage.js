import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Box,
  Grid,
  Alert,
  IconButton,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  CardActions,
  Snackbar
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Serviços
import { getAccount, updateAccount, testBot } from '../services/api';

function AccountPage() {
  const [account, setAccount] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Busca as informações da conta
  const fetchAccount = async () => {
    setLoading(true);
    try {
      const data = await getAccount();
      // A API não retorna a senha real por segurança
      setAccount({
        email: data.email || '',
        password: '',
        name: data.name || ''
      });
    } catch (error) {
      console.error('Erro ao buscar conta:', error);
      toast.error(`Erro ao buscar informações da conta: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Salva as alterações na conta
  const handleSaveAccount = async () => {
    // Validação básica
    if (!account.email) {
      toast.error('O email é obrigatório');
      return;
    }

    setLoading(true);
    try {
      // Envia apenas os campos preenchidos
      const dataToUpdate = {
        email: account.email,
        name: account.name
      };
      
      // Inclui a senha apenas se foi preenchida
      if (account.password) {
        dataToUpdate.password = account.password;
      }
      
      await updateAccount(dataToUpdate);
      toast.success('Informações da conta atualizadas com sucesso');
      
      // Se a senha foi atualizada, limpa o campo
      if (account.password) {
        setAccount({
          ...account,
          password: ''
        });
      }
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      toast.error(`Erro ao salvar informações da conta: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Testa a conexão do bot
  const handleTestBot = async () => {
    if (!account.email) {
      toast.error('Preencha o email para testar');
      return;
    }
    
    if (!account.password) {
      toast.error('Preencha a senha para testar');
      return;
    }
    
    setTestLoading(true);
    setTestResult(null);
    
    try {
      const result = await testBot({
        email: account.email,
        password: account.password
      });
      
      setTestResult(result);
      
      if (result.success) {
        setSnackbarMessage('Conexão com o Facebook testada com sucesso!');
      } else {
        setSnackbarMessage(`Falha no teste: ${result.message}`);
      }
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Erro ao testar bot:', error);
      setTestResult({
        success: false,
        message: error.message || 'Erro no teste de conexão'
      });
      setSnackbarMessage(`Erro no teste: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setTestLoading(false);
    }
  };

  // Alterna a visibilidade da senha
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Atualiza os campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount({
      ...account,
      [name]: value
    });
  };

  // Fecha o snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Carrega os dados da conta na montagem do componente
  useEffect(() => {
    fetchAccount();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Configurações da Conta
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure as informações da sua conta do Facebook para automação.
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Informações de Login
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Estas informações são necessárias para que o bot possa acessar sua conta do Facebook.
          Todas as credenciais são armazenadas apenas localmente.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email ou Telefone"
              name="email"
              value={account.email}
              onChange={handleChange}
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Senha"
              name="password"
              value={account.password}
              onChange={handleChange}
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              placeholder="Digite para alterar a senha"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nome de Exibição"
              name="name"
              value={account.name}
              onChange={handleChange}
              variant="outlined"
              helperText="Nome para identificação local (não afeta sua conta no Facebook)"
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAccount}
            disabled={loading}
          >
            Recarregar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
            onClick={handleSaveAccount}
            disabled={loading}
          >
            Salvar Alterações
          </Button>
        </Box>
      </Paper>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Testar Conexão
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Teste se o bot consegue fazer login na sua conta do Facebook antes de executar automações.
          </Typography>

          {testResult && (
            <Alert 
              severity={testResult.success ? "success" : "error"}
              sx={{ mb: 2 }}
            >
              {testResult.message}
            </Alert>
          )}
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleTestBot}
            disabled={testLoading}
            startIcon={testLoading ? <CircularProgress size={24} /> : null}
            fullWidth
          >
            {testLoading ? 'Testando...' : 'Testar Login no Facebook'}
          </Button>
        </CardActions>
      </Card>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Dicas de Segurança
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" paragraph>
          • Considere usar uma conta secundária do Facebook para testes iniciais
        </Typography>
        <Typography variant="body2" paragraph>
          • As credenciais são armazenadas apenas localmente e são usadas somente para autenticação
        </Typography>
        <Typography variant="body2" paragraph>
          • Configure autenticação de dois fatores no Facebook e deixe-a temporariamente desativada durante o uso do bot
        </Typography>
        <Typography variant="body2" paragraph>
          • Não compartilhe este aplicativo com suas credenciais
        </Typography>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CheckCircleIcon />
          </IconButton>
        }
      />
    </Container>
  );
}

export default AccountPage;