import { Container, Divider, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import {useDispatch, useSelector} from 'react-redux'
import TrafikklysBox from '../components/TrafikklysBox'
import VisSatteTerskelverdier from '../components/VisSatteTerskelverdier'

import Tidslinje from '../components/Tidslinje'
import GrafikkTrafikklys from '../components/GrafikkTrafikklys'
import PilotFlyplassTo from '../components/PilotFlyplassTo'

import { calcFarge } from '../util/calcFarge'
import PilotVelgDepArvl from '../components/PilotVelgDepArvl'
import TafMetar from '../components/TafMetar'
import allActions from '../Actions'
import GrafikkPilot from '../components/GrafikkPilot'
import axios from 'axios'



function Pilot() {

  const dispatch = useDispatch()
  

  const terskel = useSelector((state: any) => state.terskel.value)
  const airport = useSelector((state: any) => state.airport.value)
  const fromWeather = useSelector((state: any) => state.weather.value)
  const toAirportRedux = useSelector((state: any) => state.toAirport.value)
  const [toAirport, setToAirport] = useState<any>(null)

  const [weatherToAirport, setWeatherToAirport] = useState<any>(null);

    const updateAirportTo = (data: any) => {
      console.log(data)
      setToAirport(data)
    }

    useEffect(() => {
      if (toAirport != null) {
        const urlArvl = `/api/locationforecast?icao=${toAirport.icao}`

      axios.get(urlArvl)
            .then((response: any) => {
              setWeatherToAirport(response.data)
            })
            .catch((error:any) => {
                if (error.status === 400) {
                  setWeatherToAirport(null)
                }
            })
      }
      
      
    }, [toAirport])

  return (
    <>
    <Container>
    <div style={{ display: 'flex', justifyContent: 'space-evenly', textAlign: 'center', flexFlow: 'row wrap', alignItems: 'center'}}>
    </div>

    <Typography sx={{ color: '#0090a8', fontSize: 40, textAlign: 'center', mt: 5}}>
        Pilot
    </Typography>
    <Divider sx={{ mb: 5 }} />

    <PilotFlyplassTo update={updateAirportTo} />
    <PilotVelgDepArvl />
    <Divider sx={{ mb: 5 }} />
        <div style={{textAlign: 'center', color: '#0090a8', marginBottom: '1em'}}>
            <Typography sx={{ mb: 3 }} variant="h4">Taf metar</Typography>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2em'}}>
                { airport != undefined && 
                        <TafMetar icao={airport.icao} />
                }
                {toAirportRedux != undefined &&
                  <TafMetar icao={toAirportRedux.icao} />
                }
            </div>
        </div>
    <Divider sx={{ mb: 5 }} />

      <div style={{ display: 'flex', justifyContent: 'space-evenly', flexFlow: 'row wrap', alignItems: 'stretch', flexGrow: '1'}}>
        {terskel != undefined && 
        <VisSatteTerskelverdier terskel={terskel} />}
      </div>
          {airport != undefined && fromWeather != undefined && 
            <GrafikkPilot airport={airport} weather={fromWeather} time={'19:30'} />
          }
          { toAirport != undefined && weatherToAirport != undefined &&
          
          <GrafikkPilot airport={toAirport} weather={weatherToAirport} time={'21:30'} />

          }
      

    </Container>
    </ >
  )
}

export default Pilot

