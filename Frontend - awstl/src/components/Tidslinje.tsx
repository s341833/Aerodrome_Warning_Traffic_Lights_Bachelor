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
import { useSelector } from 'react-redux';


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

    let horizontalScroll = (e: any) => {
        e.preventDefault();
        const container = document.getElementById('scrollableDiv');
        const containerScrollPosition = container?.scrollLeft;
        container?.scrollTo({
            top: 0,
            left: containerScrollPosition + e.deltaY,
      })
    }

    var airport:any = useSelector<string>((state:any) => state.airport.value)
    if (airport == undefined) {
        airport = {icao: "ENGM"}
    }

    let url = ""
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') { // Uavhengig om det er local testing eller deployment så fungerer API kall
        url = "http://localhost:8080/api/locationforecast?icao="
    } else {
        url = "/api/locationforecast?icao="
    }

    const [ver, setVer] = useState<any>()
    const [temp,  setTemp] = useState(0);
    const [labels, setLabels] = useState<any[]>([1,2,2,2,3,3,2,3,1,1,1,2,2])
    const [dataset, setDataset] = useState<any[]>([1,2,2,2,3,3,2,3,1,1,1,2,2])

    //let labels = [1,2,2,2,3,3,2,3,1,1,1,2,2];
    //let dataset = [1,2,2,2,3,3,2,3,1,1,1,2,2]

    useEffect(()=> {
        console.log(airport)
        axios.get(url + airport.icao)
            .then((response:any) => {
                //console.log(response)
                const herVer = response.data.properties.timeseries
                setVer(herVer.map((it: any) => {
                    return it.data.instant.details.air_temperature
                }))
                setLabels(herVer.map((it: any) => {
                    return new Date(it.time).toLocaleString()
                }))
                setDataset(herVer.map((it: any) => {
                    return it.data.instant.details.air_temperature < temp ? 3 :
                        it.data.instant.details.air_temperature == temp ? 2: 1
                }))
            })
    }, [])

    useEffect(() => {
        if (ver !== undefined) {
            setDataset(ver.map((it: any) => {
                return it < temp ? 3 :
                    it == temp ? 2: 1
            }))
        }
    }, [temp])

    const [ctxSave, setCtxsave] = useState([])

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
            console.log(ctx)
            alert(`Du valgte ${labels[ctx[0].index]} med temp ${ver[ctx[0].index]}`)
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




    // @ts-ignore
    return (

        <div>
            <h3>{airport.icao}</h3>
            <input type="range" min="-20" max="20" value={temp} onChange={e => setTemp(Number(e.target.value))}></input><span>{temp}</span>
        <div id='scrollableDiv' onWheel={horizontalScroll} style={{width: "100%", overflowX: 'scroll'}}>
            <div style={{width: '200vw', height: '500px'}}>
                {/* @ts-ignore*/}
                <Line options={options} data={data} />
            </div>

        </div>
        </div>

  )
}

export default Tidslinje
