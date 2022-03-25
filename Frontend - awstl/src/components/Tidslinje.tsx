import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
    useState,
    useEffect
} from "react";
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux';
import allActions from '../Actions';
import { calcFarge } from '../util/calcFarge';
import SliderWrapper from './SliderWrapper';
import { Slider } from '@mui/material';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

//import { getLabelForValue } from 'chart.js/helpers';

const ylabel = ['Rød', 'Grønn', 'Gul'];

const getGradient = (ctx: any, chartArea: any) => {
    let width, height, gradient;
    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;
    if (!gradient || width !== chartWidth || height !== chartHeight) {
        // Create the gradient because this is either the first render
        // or the size of the chart has changed
        width = chartWidth;
        height = chartHeight;
        gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0.7, "red");
        gradient.addColorStop(0.5, "yellow");
        gradient.addColorStop(0.3, "green");
    }
    return gradient
}

function Tidslinje() {

    let scroll = document.getElementById("scrollableDiv")

    scroll?.addEventListener("wheel", (evt: any) => {
        evt.preventDefault()
        if (Math.abs(evt.deltaY) > Math.abs(evt.deltaX)) {
            scroll!!.scrollLeft += evt.deltaY;
        } else {
            scroll!!.scrollLeft += evt.deltaX;
        }

    })

    const airport:any = useSelector<string>((state:any) => state.airport.value)
    const terskel = useSelector((state: any) => state.terskel.value);
    const locfor = useSelector((state: any) => state.weather.value)

    let url = ""
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') { // Uavhengig om det er local testing eller deployment så fungerer API kall
        if (process.env.REACT_APP_URL_ENV == "prod") {
            url = "/api/locationforecast?icao="
        } else {
            url = "http://localhost:8080/api/locationforecast?icao="
        }
    } else {
        url = "/api/locationforecast?icao="
    }

    const [ver, setVer] = useState<any>()
    const [labels, setLabels] = useState<any[]>([])
    const [dataset, setDataset] = useState<any[]>([])


    const [int, setInt] = useState<any>(null)
    const [sliderValue, setSliderValue] = React.useState<number>(0);
    const [started, setStarted] = useState<boolean>(false)
    const [startIndex, setStartIndex] = useState<number>(0)


    let index = 0;
    const start = () => {
        index = startIndex
        setSliderValue(index);
        console.log(started)
        if (!started) {
            setInt(setInterval(update, 1000))
            setStarted(true)
        }

    }

    const update = () => {
        dispatch(allActions.grafikkAction.setGrafikk(ver[sliderValue]))
        index = (index + 1) % ver.length
        setSliderValue(index)
        console.log(sliderValue)
    }

    const stop = () => {
        setStarted(false)
        clearInterval(int)
    }

    const dispatch = useDispatch()


    useEffect(()=> {
        if(!airport) return;
        const herVer = locfor?.data.properties.timeseries
        dispatch(allActions.grafikkAction.setGrafikk(herVer[0]))
        setVer(herVer)
        setLabels(herVer.map((it: any) => {
            let string = new Date(it.time).toLocaleString();
            let list = string.split(",")
            //console.table(list)

            let dato = list[0].split(".")
            dato.splice(2, 1)
            let datoString = dato.join(".")
            //console.log(datoString)
            list[0] = datoString

            let tid = list[1].split(":")
            tid.splice(1, 2)
            let tidString = tid.join()
            list[1] = tidString
            return list.join(", kl:")
        }))
        setDataset(herVer.map((it: any) => {
            let precipitation_amount = 0;
            let probThunder = 0
            if ( it.data.next_1_hours != undefined) {
                precipitation_amount =  it.data.next_1_hours.details.precipitation_amount
                probThunder = it.data.next_1_hours.details.probability_of_thunder
            } else if (it.data.next_6_hours != undefined) {
                precipitation_amount =  it.data.next_6_hours.details.precipitation_amount / 6
                probThunder = it.data.next_6_hours.details.probability_of_thunder
            } else {
                precipitation_amount =  it.data.next_12_hours.details.precipitation_amount / 12
                probThunder = it.data.next_12_hours.details.probability_of_thunder
            }

            const farge = calcFarge(it.data.instant.details, terskel, airport,
                {
                    precipitation_amount: precipitation_amount,
                    probThunder: probThunder
                })

            console.log(farge);
            switch (farge) {
                case "green" : return 1
                case "yellow" : return 2
                case "red": return 3
                default : return 0
            }
        }))
    }, [locfor])
    

    useEffect(() => {
        if (ver !== undefined) {
            setDataset(ver.map((it: any) => {
                let precipitation_amount = 0;
                let probThunder = 0
                if ( it.data.next_1_hours != undefined) {
                    precipitation_amount =  it.data.next_1_hours.details.precipitation_amount
                    probThunder = it.data.next_1_hours.details.probability_of_thunder
                } else if (it.data.next_6_hours != undefined) {
                    precipitation_amount =  it.data.next_6_hours.details.precipitation_amount / 6
                    probThunder = it.data.next_6_hours.details.probability_of_thunder
                } else {
                    precipitation_amount =  it.data.next_12_hours.details.precipitation_amount / 12
                    probThunder = it.data.next_12_hours.details.probability_of_thunder
                }

                const farge = calcFarge(it.data.instant.details, terskel, airport, {
                    precipitation_amount: precipitation_amount,
                    probThunder: probThunder
                })
                    switch (farge) {
                        case "green" : return 1
                        case "yellow" : return 2
                        case "red": return 3
                        default : return 0
                    }
            }))
        }
    }, [terskel])

    
    const options = {
        maintainAspectRatio: false,
        responsive: true,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                display: false
            }
        },
        onClick: function (evt: any, ctx: any) {
            dispatch(allActions.grafikkAction.setGrafikk(ver[ctx[0].index]))
            setStartIndex(ctx[0].index)
            //alert(`Du valgte ${labels[ctx[0].index]} med temp ${ver[ctx[0].index]}`)
        },
        scales: {
            y: {
                beginAtZero: false,
                suggestedMax: 4,
                suggestedMin: 0,
                grid: {
                    color: ['green', 'yellow', 'red'],
                },
                ticks: {
                    font: {
                        size: 30
                    },
                    color: ['green', 'yellow', 'red'],
                    precision: 0,
                    callback: function(value:any, index:number, ctx: any) {
                        let string = ""
                        if (value === 1) {
                            return "Grønn"
                        } else if (value === 2) {
                            return "Gul"
                        } else if (value === 3) {
                            return "Rød"
                        }

                        return

                    },
                    padding: 15,

                    grace: '10%'
                }
            },
        },
    };

    const data = {
        labels,
        datasets: [
            {
                label: 'Dataset 1',
                data: dataset,
                pointRadius: 15,
                borderColor: function (context: any) {
                    const chart = context.chart
                    const {ctx, chartArea} = chart

                    if (!chartArea) return

                    return getGradient(ctx, chartArea )
                },
                backgroundColor: dataset.map((it:any) => {
                    return it < 2 ? "rgba(0,255,0, 0.5)": it == 2 ? "rgba(255,255,0, 0.5)" : "rgba(255,0,0, 0.5)"

                }),
                color: dataset.map((it:any) => {
                    return it > 2 ? "rgba(0,255,0, 0.5)": it == 2 ? "rgba(255,255,0, 0.5)" : "rgba(255,0,0, 0.5)"
                }),
                tension: 0.1
            },
        ],
    };


    const tempSliderHandler = (event: Event, newValue: number | number[]) => {
        setSliderValue(newValue as number);
        dispatch(allActions.grafikkAction.setGrafikk(ver[sliderValue]))
    };

        //dispatch(allActions.grafikkAction.setGrafikk(ver[index]))
        //index = (index + 1) % ver.length
        //console.log(index)
    




    // @ts-ignore
    return (

        <div>
            
            <div id='scrollableDiv' style={{width: "100%", overflowX: 'scroll', marginBottom: "5em"}}>
                <div style={{width: '3000px', height: '500px'}}>
                    {/* @ts-ignore*/}
                    <Line options={options} data={data} />
                </div>

            </div>
            <button onClick={start}>ANIMASJON</button>
            <button onClick={stop}>STOPP</button>
            <Slider
            
            //onChangeCommitted={tempSliderHandler}
            onChange={tempSliderHandler}
            defaultValue={0}
            value={sliderValue}
            step={1}
            min={0}
            max={ver?.length - 1}
    
            //marks={SETT INN MARK FOR ALLE TIMER}
            valueLabelDisplay="auto"

            />
        </div>

  )
}

export default Tidslinje
