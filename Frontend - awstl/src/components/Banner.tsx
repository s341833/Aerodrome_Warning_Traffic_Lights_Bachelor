import * as React from 'react';
import { useState, useEffect } from 'react';

// API kall
import axios from 'axios';

// Redux
import {useDispatch, useSelector} from 'react-redux'
import allActions from '../Actions'

// Interface
import flyplasser from '../model/flyplasser';

// Material UI
import Typography from '@mui/material/Typography';
import { Autocomplete, Container, TextField } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({ // Lager style til AutoComplete komponent 
  root: {
    
    '& .MuiInputLabel-outlined': { color: '#0090a8' } // Tekstfarge
  },
  inputRoot: {
    color: "#0090a8", // Farge etter input

    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#0090a8" // Farge på kant rundt input feltet
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#0494ac" // Farge på kant rundt input feltet ved hover
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#496c80" // Farge på kant rundt input feltet ved fokus
    }
  }
}));

export default function Banner() {

  const [flyplasserList, setFlyplasserList] = useState<flyplasser[]>([]); // Vi skal kunne lage en liste med alle flyplasser som passer til interfacet 'flyplasser'

  const classes = useStyles(); // bruker stylingen laget ovenfor

  const terskel = useSelector((state:any) => state.terskel.value)

  const dispatch = useDispatch(); // statemanager
  const handleChange = (event: React.ChangeEvent<any>, value: any) => {
    console.log(value)
    if (value !== null) {
      dispatch(allActions.airportAction.setAirport({icao: value.icao, navn: value.label, rwy: value.rwy}))
      const obj = terskel
      obj.flyplass = {icao: value.icao, navn: value.label}
      axios.post(urlTerskel, obj)
          .then((response:any) => {
              console.log(response)
          })
          .catch((error: any) => {
            console.log(error)
          })
    }
  }

  let url = "";
  let urlTerskel = "";
  console.log(process.env.URL_ENV)
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') { // For lokal testing og deployment endrer api kall
    if (process.env.REACT_APP_URL_ENV == "prod") {
      url = '/api/airport'
      urlTerskel = "/api/terskel"
    } else {
      url = 'http://localhost:8080/api/airport'
      urlTerskel = "http://localhost:8080/api/terskel"
    }
  } else {
      url = '/api/airport'
      urlTerskel = "/api/terskel"
  }

  const airportRedux = useSelector((state:any) => state.airport.value)
  const listAirport = airportRedux// != null ?
      //{icao: airportRedux.icao, label: airportRedux.navn} :
      //{icao: "ENDU", label: "Bardufoss Lufthavn"}

  useEffect(() => {

      axios.get(url) // Henter alle flyplasser
      .then((response) => {
        setFlyplasserList(response.data); // Setter alle flyplassene i en liste
      })
      
  },[])

  let relevantFlyplassData = []; // Lager en ny array som skal ta inn mindre data som skal settes inn i AutoComplete komponenten

  for (let i = 0; i < flyplasserList.length; i++){
    const nyPush = {label: flyplasserList[i].navn, icao: flyplasserList[i].icao, rwy: flyplasserList[i].rwy}; // Velger å kun sette inn navn og icao i den nye listen
    relevantFlyplassData.push(nyPush);
  }

  return (
    <>
    <div style={{ minHeight: 'fit-content', width: '100%', backgroundColor: '#dff2f6'}}> {/** banneret tar uansett halvparten av skjermen, men om den behøver mer vil den utvides */}
      <Container sx={{ color: '#0090a8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-evenly', flexFlow: 'row wrap', alignItems: 'center'}}> {/** Denne div-en inneholder tittel og AutoComplete komponent */}
        {/** Tittel */}
          <Typography style={{ maxWidth: '60%', textAlign: 'center'}} sx={{ pt: 5}} component="h1" variant="h3" color="inherit" gutterBottom>
            Aerodrome Warning Traffic Light System
          </Typography>
          {/** AutoComplete */}
          <div className='AutoCompleteCustom' style={{ paddingBottom: '2em' }}>
            <Autocomplete
            disablePortal
            id="combo-box-flyplasser"
            // Bruker styling laget ovenfor
            classes={classes}
            // redux endring av flyplasshåndtering
            onChange={handleChange}
            // setter flyplassen som valgt i listen
            value={listAirport}
            isOptionEqualToValue={(option, value) => option.icao === value.icao}
            // Listen med valg settes inn her. For å gjøre det enklere sorteres den alfabetisk
            options={relevantFlyplassData.sort((a, b) => -b.label.localeCompare(a.label))}
            // Listen grupperes også etter første bokstav
            groupBy={(relevantFlyplassData) => relevantFlyplassData.label.charAt(0).toString()}
            sx={{ width: 300, backgroundColor: '#FFFFFF'}}
            renderInput={(params) => <TextField {...params} label="Velg flyplass"
            // @ts-ignore
            />}
          />
          </div>
          
        </div>

        {/** Beskrivelse av nettsiden */}

      <Typography sx={{ pb: 5}} style={{textAlign: 'center'}} variant="h5" color="inherit" paragraph>
        Dette er en tjeneste for å fortelle om det er trygt med aktivitet på en flyplass i Norge.
      </Typography>
    </Container>
    </div>
    
    </>
  );
}
