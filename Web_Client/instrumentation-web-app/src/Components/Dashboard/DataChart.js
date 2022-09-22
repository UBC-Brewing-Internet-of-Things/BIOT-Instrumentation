import React , { useState, useEffect } from 'react';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js';

ChartJS.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);




function DataChart(props) {

	
	const [chartData, setChartData] = useState({datasets: []});


	useEffect(() => {
		const setChart = () => {
			setChartData({
				labels: "test",
				datasets: [
					{
						label: "pH",
						data: [1,2,3,4,5,6,7,8,9,10],
						backgroundColor: "rgba(75,192,192,0.6)",
						borderColor: "rgba(75,192,192,1)",
					}
				]
			});
		}
		setChart();	
	}, []);




	return (
		<Chart type='line' data={chartData}/>
	)


}

export default DataChart;
