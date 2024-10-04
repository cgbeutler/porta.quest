import './App.css';
import { Outlet } from 'react-router-dom';
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

function App() {
  return (
    <Box>
      <AppBar position="absolute">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Porta.Quest
          </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar/>
      <Outlet/>
    </Box>
  );
}

export default App;
