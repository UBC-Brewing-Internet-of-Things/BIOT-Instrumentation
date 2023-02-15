import React , { useState, useEffect , useRef} from 'react';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip } from 'chart.js';

ChartJS.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip);

function DataChart(props) {
	
	const [chartData, setChartData] = useState({
		labels: [" "],
		datasets: [
			{
				data: [],
				backgroundColor: [
					// a nice blue
					'rgba(54, 162, 235, 0.2)',
				],
				borderColor: [
					// a nice blue
					'rgba(54, 162, 235, 1)',
				],
				borderWidth: 1,
			}
		]
	});

	const options = {
		responsive: true,
		scales: {
			y: {
				beginAtZero: true,
				title: {
					display: true,
					text: props.name,
					// a nice blue color
					color: 'rgba(54, 162, 235, 1)',
					font: {
						size: 20
					}
				}
			}
		}			
	}

	// number of points to display on the chart
	const max_points = 15;
	const [points, setPoints] = useState(0);
	const chartRef = useRef(null);

	
	// Everytime props.value changes, we update the chart
	// this lifts the logic for when to update the component up to the parent device
	useEffect(() => {
		const updateChart = () => {
			const chart = chartRef.current;
			if (chart !== null) {
				if (points >= max_points) {
					chart.data.datasets[0].data.shift();
					chart.data.labels.shift();
				} else {
					setPoints(points + 1);
				}
				chart.data.datasets[0].data.push(props.value);
				chart.data.labels.push(" ");
				chart.update();
			}	
		}
		updateChart();

	}, [props.value, chartRef]);

	return (
		<div id="chart-container" style={style_object.chart}>
			<Chart ref={chartRef} type='line' data={chartData} options={options}/>
			<p style={{display:"none"}}>{props.value}</p>
		</div>
	)

}

export default DataChart;

// STYLE

const style_object = {
	chart: {
		width: '50%',
		height: '33%',
	}
}