import './App.css';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AppBar, Box, Button, Drawer, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

function App() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  function open() { setIsOpen(true) }
  function close() { setIsOpen(false) }

  return (
    <Box>
      <AppBar position="absolute">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" onClick={open} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          {location.pathname && location.pathname !== "/" ?
            <>
              <img src="/favicon.svg" alt='' style={{height: "2rem", marginRight: "8px"}}/>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                <Link to="/" style={{color:"white", textDecoration:"none"}}>Porta.Quest</Link>
              </Typography>
            </>
          : null}
        </Toolbar>
      </AppBar>
      <Toolbar/>
      <Outlet/>
      <Drawer open={isOpen} onClose={close} sx={{"& .MuiBackdrop-root": {bgcolor:"rgba(0,0,0,0.75)"}, "& .MuiPaper-root": {bgcolor:"#050505"}}}>
        <Box className="vbox" sx={{alignItems:"stretch", p:"8px", gap: "0px"}}>
          <Button component={Link} to="/" onClick={close} color='inherit' className="hbox" sx={{textTransform:"none", justifyContent: "start", alignItems: "center"}}>
            <img src="/favicon.svg" alt='' style={{height: "3rem", marginRight: "4px"}}/>
            <Typography variant="h4">Porta.Quest</Typography>
          </Button>
          <hr style={{borderColor:"#808080",width:"50%"}}/>
          <Button component={Link} to="/hangman" onClick={close} color='inherit' className="hbox" sx={{textTransform:"none", justifyContent: "start", alignItems: "center"}}>
            <img src="/hangman_icon.svg" alt='' style={{height: "3rem", marginRight: "4px"}}/>
            <Typography variant="h4" sx={{pt:"3px"}}>Hangman</Typography>
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}

export default App;
