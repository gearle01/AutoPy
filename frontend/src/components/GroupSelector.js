import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Button
} from '@mui/material';
import { getGroups } from '../services/api';

function GroupSelector({ 
  selectedGroups = [], 
  onChange, 
  multiple = true, 
  activeOnly = true,
  displayCount = false
}) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Carregar lista de grupos
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Manipulador para mudança na seleção
  const handleChange = (event) => {
    const value = event.target.value;
    
    if (onChange) {
      onChange(value);
    }
  };
  
  // Manipulador para limpar seleção
  const handleClear = () => {
    if (onChange) {
      onChange(multiple ? [] : '');
    }
  };
  
  // Carrega grupos quando o componente é montado
  useEffect(() => {
    fetchGroups();
  }, []);
  
  // Filtra apenas grupos ativos se necessário
  const filteredGroups = activeOnly 
    ? groups.filter(group => group.active) 
    : groups;
  
  return (
    <Box>
      <FormControl fullWidth disabled={loading}>
        <InputLabel id="group-selector-label">
          {multiple ? 'Grupos' : 'Grupo'}
        </InputLabel>
        <Select
          labelId="group-selector-label"
          multiple={multiple}
          value={selectedGroups}
          onChange={handleChange}
          input={<OutlinedInput label={multiple ? 'Grupos' : 'Grupo'} />}
          renderValue={(selected) => {
            if (multiple) {
              return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((groupId) => {
                    const group = groups.find(g => g.id === groupId);
                    return (
                      <Chip 
                        key={groupId} 
                        label={group ? group.name : groupId}
                        size="small"
                      />
                    );
                  })}
                </Box>
              );
            } else {
              const group = groups.find(g => g.id === selected);
              return group ? group.name : selected;
            }
          }}
        >
          {filteredGroups.map((group) => (
            <MenuItem key={group.id} value={group.id}>
              {multiple && (
                <Checkbox checked={selectedGroups.indexOf(group.id) > -1} />
              )}
              <ListItemText 
                primary={group.name}
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {group.category}
                  </Typography>
                }
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {multiple && selectedGroups.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          {displayCount && (
            <Typography variant="caption" color="text.secondary">
              {selectedGroups.length} grupo{selectedGroups.length !== 1 ? 's' : ''} selecionado{selectedGroups.length !== 1 ? 's' : ''}
            </Typography>
          )}
          <Button 
            size="small" 
            onClick={handleClear}
            sx={{ ml: 'auto' }}
          >
            Limpar seleção
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default GroupSelector;