// frontend/src/App.js (modificado)
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Componentes
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Páginas
import Dashboard from './pages/Dashboard';
import GroupsPage from './pages/GroupsPage';
import SchedulePage from './pages/SchedulePage';
import AccountPage from './pages/AccountPage';
import SettingsPage from './pages/SettingsPage';
import LogsPage from './pages/LogsPage';
import LoginPage from './pages/LoginPage';

// Serviços
import { getStatus } from './services/api';

// Estilos
import './styles/App.css';

// Tema escuro/claro
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
});

// Componente para rotas protegidas
function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    running: false,
    bot_busy: false,
    last_error: null,
    last_activity: null
  });
  
  // Atualiza o tema
  const theme = darkMode ? darkTheme : lightTheme;
  
  // Alterna o tema
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };
  
  // Alterna a abertura da barra lateral
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Busca o status do sistema
  const fetchStatus = async () => {
    try {
      const response = await getStatus();
      setSystemStatus(response);
    } catch (error) {
      console.error('Erro ao obter status do sistema:', error);
    }
  };
  
  // Efeito para buscar o status do sistema
  useEffect(() => {
    fetchStatus();
    
    // Configura intervalo para atualização
    const interval = setInterval(() => {
      fetchStatus();
    }, 10000); // A cada 10 segundos
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <div className="app">
                <Navbar 
                  toggleDarkMode={toggleDarkMode} 
                  darkMode={darkMode} 
                  toggleSidebar={toggleSidebar}
                  systemStatus={systemStatus}
                  refreshStatus={fetchStatus}
                />
                <div className="content-container">
                  <Sidebar open={sidebarOpen} />
                  <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    <Dashboard systemStatus={systemStatus} refreshStatus={fetchStatus} />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/groups" element={
            <ProtectedRoute>
              <div className="app">
                <Navbar 
                  toggleDarkMode={toggleDarkMode} 
                  darkMode={darkMode} 
                  toggleSidebar={toggleSidebar}
                  systemStatus={systemStatus}
                  refreshStatus={fetchStatus}
                />
                <div className="content-container">
                  <Sidebar open={sidebarOpen} />
                  <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    <GroupsPage />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          {/* Repita para outras rotas (SchedulePage, AccountPage, etc.) */}
        </Routes>
      </Router>
      <ToastContainer position="bottom-right" />
    </ThemeProvider>
  );
}

export default App;