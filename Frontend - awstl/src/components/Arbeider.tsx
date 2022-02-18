import { Box } from '@mui/material'
import '../App.css';
import React from 'react'
import ArbeiderKort from './ArbeiderKort';

import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EngineeringIcon from '@mui/icons-material/Engineering';
import FlightIcon from '@mui/icons-material/Flight';

function Arbeider() {

  const arbeiderne = [
    ['Bakkemannskap', <EngineeringIcon sx={{ fontSize: 100 }}></ EngineeringIcon>], 
    ['Flygeleder', <SupportAgentIcon sx={{ fontSize: 100 }}></ SupportAgentIcon>], 
    ['Pilot', <FlightIcon sx={{ fontSize: 100 }}></ FlightIcon>]];

  return (
    <>
    <Box id="arbeiderBox" sx={{ mt: 8, mb: 5 }} style={{ display: 'flex', justifyContent: 'space-evenly', flexFlow: 'row wrap', alignItems: 'center'}}>
      
      {arbeiderne.map((personen) => {
        return <ArbeiderKort key={personen[0].toString()} arbeider={personen[0].toString()} ikonComp={personen[1]} />
      })}
        
    </Box>
        
        
    </>

  )
}

export default Arbeider