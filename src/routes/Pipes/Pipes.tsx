import { Typography } from "@mui/material";
import { FunctionComponent } from "react";

interface PipesProps {
  
}
 
const Pipes: FunctionComponent<PipesProps> = () => {
  return (
  <>
    <Typography variant="h1">Pipes</Typography>
    <Typography>Click to rotate pipe sections. Connect all the pipes so they show up blue.</Typography>
    {}
    <hr/>
    <Typography>Configuration</Typography>
  </>
  );
}
 
export default Pipes;