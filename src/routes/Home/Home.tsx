import { Box, Button, Typography } from "@mui/material";
import { FunctionComponent } from "react";
import { Link } from "react-router-dom";

const Home: FunctionComponent = () => {
  return (
    <Box className="content">
      <Typography variant="h2">Porta.Quest</Typography>
      <Typography>All mini-games are designed to be easily shareable with a single url. At the bottom of each game will be a place to randomize or customize a new game.</Typography>

      <Button component={Link} to="/hangman">
        <Typography variant="h4" sx={{textTransform:"none"}}><img src="/hangman_icon.svg" style={{height: "0.65lh", marginRight: "8px"}}/> Hangman</Typography>
      </Button>
    </Box>
  );
}
 
export default Home;