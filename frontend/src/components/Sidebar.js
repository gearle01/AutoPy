import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
  Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

// Largura da barra lateral
const drawerWidth = 240;

function Sidebar({ open }) {
  const location = useLocation();
  
  // Lista de itens do menu
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Grupos', icon: <GroupIcon />, path: '/groups' },
    { text: 'Agendamentos', icon: <ScheduleIcon />, path: '/schedule' },
    { text: 'Conta', icon: <AccountIcon />, path: '/account' },
    { text: 'Configurações', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Logs', icon: <AssessmentIcon />, path: '/logs' }
  ];
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : 64,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 64,
          boxSizing: 'border-box',
          transition: 'width 0.2s ease-in-out',
          overflowX: 'hidden'
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                bgcolor: location.pathname === item.path ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.12)'
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: location.pathname === item.path ? 'primary.main' : 'inherit'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  opacity: open ? 1 : 0,
                  color: location.pathname === item.path ? 'primary.main' : 'inherit'
                }} 
              />
            </ListItem>
          ))}
        </List>
        <Divider />
        {open && (
          <Box sx={{ p: 2, position: 'absolute', bottom: 0, width: '100%' }}>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              AutoPy v0.1.0 - &copy; 2025
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}

export default Sidebar;