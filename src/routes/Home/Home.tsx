import { Box, Button, Typography } from "@mui/material";
import { FunctionComponent } from "react";
import { Link } from "react-router-dom";

const Home: FunctionComponent = () => {
  return (
    <Box className="content">
      <Typography variant="h2">PortaQuest!</Typography>
      <Typography>All mini-games are designed to be easily shareable with a single url. At the bottom of each game will be a place to randomize or customize a new game.</Typography>

      <Button component={Link} to="/hangman">Hangman</Button>
    </Box>
  );
}
 
export default Home;