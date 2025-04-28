import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  Tooltip, 
  Badge, 
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

function Navbar({ toggleDarkMode, darkMode, toggleSidebar, systemStatus, refreshStatus }) {
  const navigate = useNavigate();
  
  // Verifica se há erros no sistema
  const hasError = systemStatus && systemStatus.last_error;
  
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1 }}
        >
          AutoPy Facebook Automation
        </Typography>
        
        {/* Status do sistema */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Typography variant="body2" color="inherit" sx={{ mr: 1 }}>
            Status:
          </Typography>
          <Box 
            sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              bgcolor: systemStatus?.running ? 'success.main' : 'error.main',
              boxShadow: '0 0 8px'
            }} 
          />
        </Box>
        
        {/* Botão de atualização */}
        <Tooltip title="Atualizar status">
          <IconButton color="inherit" onClick={refreshStatus}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        
        {/* Notificação de erro */}
        {hasError && (
          <Tooltip title={`Último erro: ${systemStatus.last_error.message}`}>
            <IconButton color="inherit">
              <Badge color="error" variant="dot">
                <ErrorIcon color="error" />
              </Badge>
            </IconButton>
          </Tooltip>
        )}
        
        {/* Alternador de tema */}
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={toggleDarkMode}
              color="default"
              size="small"
            />
          }
          label={
            <IconButton color="inherit" size="small">
              {darkMode ? <LightIcon /> : <DarkIcon />}
            </IconButton>
          }
          labelPlacement="start"
        />
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;