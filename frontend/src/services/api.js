import axios from 'axios';

// Configuração base do axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Serviços do sistema
export const getStatus = async () => {
  const response = await api.get('/status');
  return response.data;
};

export const startSystem = async () => {
  const response = await api.post('/start');
  return response.data;
};

export const stopSystem = async () => {
  const response = await api.post('/stop');
  return response.data;
};

// Serviços de grupos
export const getGroups = async () => {
  const response = await api.get('/groups');
  return response.data;
};

export const addGroup = async (groupData) => {
  const response = await api.post('/groups', groupData);
  return response.data;
};

export const updateGroup = async (groupId, groupData) => {
  const response = await api.put(`/groups/${groupId}`, groupData);
  return response.data;
};

export const deleteGroup = async (groupId) => {
  const response = await api.delete(`/groups/${groupId}`);
  return response.data;
};

// Serviços de agendamento
export const getSchedule = async () => {
  const response = await api.get('/schedule');
  return response.data;
};

export const addScheduledTask = async (taskData) => {
  const response = await api.post('/schedule', taskData);
  return response.data;
};

export const updateScheduledTask = async (taskId, taskData) => {
  const response = await api.put(`/schedule/${taskId}`, taskData);
  return response.data;
};

export const deleteScheduledTask = async (taskId) => {
  const response = await api.delete(`/schedule/${taskId}`);
  return response.data;
};

// Serviços de conta
export const getAccount = async () => {
  const response = await api.get('/account');
  return response.data;
};

export const updateAccount = async (accountData) => {
  const response = await api.post('/account', accountData);
  return response.data;
};

// Serviços de geração de conteúdo
export const generatePost = async (options) => {
  const response = await api.post('/generate-post', options);
  return response.data;
};

// Serviços de teste
export const testBot = async (credentials) => {
  const response = await api.post('/test-bot', credentials);
  return response.data;
};

// Serviço de postagem manual
export const manualPost = async (postData) => {
  const response = await api.post('/manual-post', postData);
  return response.data;
};

// Serviço de logs
export const getLogs = async (date) => {
  const params = date ? { date } : {};
  const response = await api.get('/logs', { params });
  return response.data;
};

// Interceptor para tratamento de erros
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response || error);
    
    // Personaliza a mensagem de erro
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error || 
      error.message || 
      'Erro desconhecido';
    
    // Retorna um erro padronizado
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status || 500,
      originalError: error
    });
  }
);

export default api;