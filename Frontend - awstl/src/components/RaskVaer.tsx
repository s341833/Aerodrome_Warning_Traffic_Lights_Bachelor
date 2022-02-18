import { Container, AppBar, Typography } from '@mui/material'
import React, { useState, useEffect } from 'react';
import {useSelector, useDispatch} from 'react-redux'
import VaerBox from './VaerBox'
import axios from 'axios'
import vaerboksForecast from '../model/vaerboksForecast';
import allActions from '../Actions'



function RaskVaer() {

  const [vdata, setVData] = useState<vaerboksForecast | null>(null);

  const favoritt = "ENML";

  const nowcast = useSelector((state:any) => state.nowcast.value)
  const dispatch = useDispatch()

  useEffect(() => {
    if (nowcast === null || nowcast === undefined) {
      axios.get('api/nowcast?icao=ENDU')
      .then((response) => {
        setVData(response.data);
        dispatch(allActions.nowcastAction.setNowcast(response.data))

      })
    } else {
      setVData(nowcast)
    }
  },[])

  console.log(vdata);

  return (
    <>
    <Container>
        <AppBar sx={{ mb: 10 }} position='static' style= {{ background: 'white', textAlign: 'center' }}>
            <Typography sx={{ color: '#0090a8', fontSize: 30}}>
                Været akkurat nå
            </Typography>
        </AppBar>
        <div style={{ display: 'flex', justifyContent: 'space-evenly', flexFlow: 'row wrap', alignItems: 'center'}}>
          { vdata != null && 
            vdata.nowcasts.map((flyplass, index) => {
              return <VaerBox key={index} properties={flyplass.properties} airports={vdata.airports[index]} ></VaerBox>
            })}
        </div>
        
        { /* <VaerBox navn="Gardermoen" beskrivelse="Hei" temperatur={1} styrke="100" retning="øst" ikonNavn="clearsky_polartwilight.svg"/> */ }
    </Container>
    </>
  )
}

export default RaskVaer
