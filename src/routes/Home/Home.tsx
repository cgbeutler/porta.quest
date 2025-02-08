import { Box, Button, Typography } from "@mui/material";
import { FunctionComponent } from "react";
import { Link } from "react-router-dom";

const Home: FunctionComponent = () => {
  return (
    <Box className="content">
      <Box className="hbox" sx={{alignItems: "center"}}>
        <img src="/favicon.svg" alt='' style={{height: "3rem", marginRight: "4px"}}/>
        <Typography variant="h2">Porta.Quest</Typography>
      </Box>
      <Typography>Mini-games designed to be easily shareable.<br/>At the bottom of each game will be a place to randomize or customize a new game.</Typography>
      <br/>
      <Box className="vbox" sx={{maxWidth: "fit-content", alignItems:"stretch", p:"8px", gap: "0px", margin:"0px auto"}}>
        <Typography variant="h4">Games</Typography>
        <hr style={{borderColor:"#808080",width:"50%"}}/>
        <Button component={Link} to="/hangman" color='inherit' className="hbox" sx={{textTransform:"none", justifyContent: "start", alignItems: "center"}}>
          <img src="/hangman_icon.svg" alt='' style={{height: "3rem", marginRight: "4px"}}/>
          <Typography variant="h4" sx={{pt:"3px"}}>Hangman</Typography>
        </Button>
        <Button component={Link} to="/tordle" color='inherit' className="hbox" sx={{textTransform:"none", justifyContent: "start", alignItems: "center"}}>
          <img src="/tordle_icon.svg" alt='' style={{height: "3rem", marginRight: "4px"}}/>
          <Typography variant="h4" sx={{pt:"3px"}}>Tordle</Typography>
        </Button>
        <Typography sx={{color: "gray"}}>... More coming soon</Typography>
      </Box>
    </Box>
  );
}
 
export default Home;