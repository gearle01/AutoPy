import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  IconButton,
  Grid,
  Switch,
  FormControlLabel,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Send as SendIcon,
  InsertEmoticon as EmojiIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Serviços
import { generatePost, manualPost } from '../services/api';

function PostEditor({ groups = [], onPostCreated }) {
  const [content, setContent] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [includeEmoji, setIncludeEmoji] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [category, setCategory] = useState('general');
  const [postLength, setPostLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [typosProbability, setTyposProbability] = useState(0.1);
  
  // Categorias disponíveis
  const categories = [
    { value: 'tech', label: 'Tecnologia' },
    { value: 'business', label: 'Negócios' },
    { value: 'lifestyle', label: 'Estilo de Vida' },
    { value: 'education', label: 'Educação' },
    { value: 'general', label: 'Geral' }
  ];
  
  // Opções de tamanho de post
  const postLengths = [
    { value: 'short', label: 'Curto (1-2 parágrafos)' },
    { value: 'medium', label: 'Médio (3-4 parágrafos)' },
    { value: 'long', label: 'Longo (5+ parágrafos)' }
  ];
  
  // Atualiza a categoria quando o grupo selecionado muda
  useEffect(() => {
    if (selectedGroup) {
      const group = groups.find(g => g.id === selectedGroup);
      if (group && group.category) {
        setCategory(group.category);
      }
    }
  }, [selectedGroup, groups]);
  
  // Gera conteúdo para o post
  const handleGenerateContent = async () => {
    if (!selectedGroup) {
      toast.warning('Selecione um grupo primeiro');
      return;
    }
    
    setLoading(true);
    try {
      const response = await generatePost({
        post_type: null, // deixa a API escolher aleatoriamente
        category: category,
        include_emoji: includeEmoji,
        include_hashtags: includeHashtags,
        typo_probability: typosProbability,
        length: postLength
      });
      
      if (response.success) {
        setContent(response.content);
        toast.success('Conteúdo gerado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      toast.error(`Erro ao gerar conteúdo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Envia o post para o grupo
  const handleSendPost = async () => {
    if (!selectedGroup) {
      toast.warning('Selecione um grupo primeiro');
      return;
    }
    
    if (!content.trim()) {
      toast.warning('O conteúdo do post não pode estar vazio');
      return;
    }
    
    setLoading(true);
    try {
      const response = await manualPost({
        group_id: selectedGroup,
        content: content,
        image_path: null // sem imagem por enquanto
      });
      
      if (response.success) {
        toast.success('Post publicado com sucesso');
        // Limpa o editor
        setContent('');
        
        // Notifica o componente pai que um post foi criado
        if (onPostCreated) {
          onPostCreated();
        }
      }
    } catch (error) {
      console.error('Erro ao publicar post:', error);
      toast.error(`Erro ao publicar post: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Adiciona formatação ao texto
  const handleFormatText = (format) => {
    const textarea = document.querySelector('textarea[name="content"]');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText;
    let cursorPosition;
    
    if (selectedText) {
      // Texto selecionado
      if (format === 'bold') {
        formattedText = content.substring(0, start) + `**${selectedText}**` + content.substring(end);
        cursorPosition = end + 4; // 4 é o comprimento de '**' + '**'
      } else if (format === 'italic') {
        formattedText = content.substring(0, start) + `*${selectedText}*` + content.substring(end);
        cursorPosition = end + 2; // 2 é o comprimento de '*' + '*'
      }
    } else {
      // Nenhum texto selecionado
      if (format === 'bold') {
        formattedText = content.substring(0, start) + '**texto em negrito**' + content.substring(start);
        cursorPosition = start + 10; // Posiciona o cursor no meio do texto formatado
      } else if (format === 'italic') {
        formattedText = content.substring(0, start) + '*texto em itálico*' + content.substring(start);
        cursorPosition = start + 9; // Posiciona o cursor no meio do texto formatado
      }
    }
    
    setContent(formattedText);
    
    // Redefine o foco e a posição do cursor após a renderização
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 10);
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Editor de Posts
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="group-select-label">Grupo</InputLabel>
            <Select
              labelId="group-select-label"
              value={selectedGroup}
              label="Grupo"
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <MenuItem value="" disabled>
                Selecione um grupo
              </MenuItem>
              {groups.map((group) => (
                <MenuItem 
                  key={group.id} 
                  value={group.id}
                  disabled={!group.active}
                >
                  {group.name}
                  {!group.active && (
                    <Chip 
                      label="Inativo" 
                      size="small" 
                      color="error" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="category-select-label">Categoria</InputLabel>
            <Select
              labelId="category-select-label"
              value={category}
              label="Categoria"
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={includeEmoji}
              onChange={(e) => setIncludeEmoji(e.target.checked)}
              color="primary"
            />
          }
          label="Emojis"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={includeHashtags}
              onChange={(e) => setIncludeHashtags(e.target.checked)}
              color="primary"
            />
          }
          label="Hashtags"
        />
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="length-select-label">Tamanho</InputLabel>
          <Select
            labelId="length-select-label"
            value={postLength}
            label="Tamanho"
            size="small"
            onChange={(e) => setPostLength(e.target.value)}
          >
            {postLengths.map((length) => (
              <MenuItem key={length.value} value={length.value}>
                {length.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Tooltip title="Negrito">
            <IconButton size="small" onClick={() => handleFormatText('bold')}>
              <BoldIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Itálico">
            <IconButton size="small" onClick={() => handleFormatText('italic')}>
              <ItalicIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Inserir emoji">
            <IconButton size="small">
              <EmojiIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <TextField
          fullWidth
          multiline
          rows={8}
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Digite o conteúdo do post aqui ou clique em 'Gerar Conteúdo'..."
          variant="outlined"
        />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={handleGenerateContent}
          disabled={loading || !selectedGroup}
        >
          Gerar Conteúdo
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          onClick={handleSendPost}
          disabled={loading || !selectedGroup || !content.trim()}
        >
          Publicar
        </Button>
      </Box>
    </Paper>
  );
}

export default PostEditor;