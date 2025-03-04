import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import AxiosApiClient from '../../components/utils/AxiosApiClient';
import AuthUtility from '../frontend/auth/AuthUtility';
import WeatherManager from './WeatherManager';
import LoadingSpinner from '../frontend/LoadingSpinner';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import $ from "jquery";

import wind_icon from '../../assets/frontend/images/wind_icon.png';
import precip_icon from '../../assets/frontend/images/precip_icon.png';
import arrow_right_90 from '../../assets/frontend/images/arrow_right_90.png';

function Weather() {

	const chartRef = useRef();

	// using hooks
	const [isLoading, setIsLoading] = useState(true);
	const [weatherForecastData, setWeatherForecastData] = useState({
		current: {
			condition: {
				icon: ''
			}
		},
		location: {
			name: '',
			country: '',
			lat: '',
			lon: '',
		},
		forecast: {},
		daily_forecast_chart_options: [],
		daily_forecast_active_index: 0,
	});
	const [activeChartOption, setActiveChartOption] = useState([]);
	const [weatherLocationMessage, setWeatherLocationMessage] = useState('');

	const handleWeatherManagerOpen = (isWeatherManagerOpen) => {
		if (isWeatherManagerOpen) {
			$('#highchart').addClass('hide');
			$('#forecast_data').addClass('hide');
		} else {
			$('#highchart').removeClass('hide');
			$('#forecast_data').removeClass('hide');
		}
	};

	const handleWeatherForecastData = (weatherForecastDataFromWLM, locations) => {

		if (weatherForecastDataFromWLM) {

			setWeatherLocationMessage('');

			//prepare highcharts series data
			var daily_forecast_chart_options_temp = [];
			for (let i = 0; i < weatherForecastDataFromWLM.forecast.forecastday.length; i++) {
				var daily_forecast = weatherForecastDataFromWLM.forecast.forecastday[i];

				var hourly_temperature_data = [];
				for (let j = 0; j < daily_forecast.hour.length; j++) {
					var hourly_forecast = daily_forecast.hour[j];

					var date_string = hourly_forecast.date.replace(':00', ':00 ');
					const date = new Date(Date.parse(date_string));
					const hourly_forecast_timestamp_UTC = Date.UTC(
						date.getUTCFullYear(),
						date.getUTCMonth(),
						date.getUTCDate(),
						date.getUTCHours(),
						date.getUTCMinutes(),
						date.getUTCSeconds(),
						date.getUTCMilliseconds()
					);
					hourly_temperature_data.push([hourly_forecast_timestamp_UTC, hourly_forecast.temp_f]);
				}

				var options = {
					chart: {
						height: 200,
						backgroundColor: 'transparent',
						spacing: [20, 0, 0, 0], // set spacing to 0 on all sides
						margin: {
							top: 0,
							right: 0,
							bottom: 20, // set a larger bottom margin to give x-axis labels more space
							left: 30, // set a larger left margin to give y-axis title more space
						},
					},
					title: {
						text: ''
					},
					xAxis: {
						type: 'datetime',
						labels: {
							formatter: function () {
								return Highcharts.dateFormat("%I:%M", this.value);
							}
						}
					},
					yAxis: {
						title: ''
					},
					legend: {
						enabled: false,
					},
					series: [{
						name: 'Temp (F)',
						data: hourly_temperature_data,
						type: 'spline',
						zIndex: 2
					}],
					tooltip: {
						useHTML: true,
						headerFormat: '',
						pointFormat: '{point.y} &#176;F'
					}
				};

				daily_forecast_chart_options_temp.push(options);

			}

			setActiveChartOption(daily_forecast_chart_options_temp[0]);

			setWeatherForecastData({
				...weatherForecastData,
				current: weatherForecastDataFromWLM.current,
				location: weatherForecastDataFromWLM.location,
				forecast: weatherForecastDataFromWLM.forecast,
				daily_forecast_chart_options: daily_forecast_chart_options_temp,
				daily_forecast_active_index: 0,
			});
		} else {

			setWeatherLocationMessage('No Weather Locations Exist');

			setActiveChartOption([]);

			setWeatherForecastData({
				...weatherForecastData,
				current: {
					condition: {
						icon: '',
					},
				},
				location: {
					name: '',
					region: '',
					country: '',
					lat: '',
					lon: '',
				},
				forecast: {},
				daily_forecast_chart_options: [],
				daily_forecast_active_index: 0,
			});
		}

		setIsLoading(false);
	};

	const handleChangeDailyForecast = (event, daily_index) => {
		event.persist();

		setActiveChartOption(weatherForecastData.daily_forecast_chart_options[daily_index]);

		setWeatherForecastData((prevWeatherForecastData) => ({
			...prevWeatherForecastData,
			daily_forecast_active_index: daily_index
		}));

		//remove the focus off the button after it is clicked
		event.currentTarget.blur();
	}

	return (
		<div className="body-content bg-fff pt-70l-110m-50s pb-100">

			<div className="panel large pt-20l-10s">
				<div className="grid-x">
					<div className="large-11 medium-11 small-10 cell text-left">
						<div className="font-source-sans font-size-20 font-weight-800 txt-dark-blue bb1-dark-blue uppercase pb-5">Weather</div>
						<div className="pt-5">
							<span className="font-source-sans font-size-18l-16m font-weight-600">
								{weatherForecastData.location.name ? weatherForecastData.location.name + ', ' + weatherForecastData.location.region + ' ' + weatherForecastData.location.country : ''}
							</span>
							<span className="font-source-sans font-size-14 font-weight-500 pl-5 hide-for-480px">
								{weatherForecastData.location.name ? '(' + weatherForecastData.location.lat + ', ' + weatherForecastData.location.lon + ')' : ''}
							</span>
						</div>
					</div>
					<div className="large-1 medium-1 small-2 cell text-right">
						<WeatherManager onWeatherForecastData={handleWeatherForecastData} onWeatherManagerOpen={handleWeatherManagerOpen} />
					</div>
				</div>
			</div>

			<div className="panel large">

				{weatherForecastData.location.name ? (
					<div className="grid-x">
						<div className="large-12 medium-12 small-12 cell pt-10">
							<div className="grid-x bg-fafafa b1-ccc p-20l-10s">
								<div className="large-3 medium-6 small-6 cell text-center">
									<div className="font-source-sans font-size-18l-16m-14s font-weight-600">{weatherForecastData.location.localtime ? weatherForecastData.location.date : ''}</div>
									<div className="font-source-sans font-size-18l-16m-14s font-weight-600 pt-10">{weatherForecastData.location.localtime ? weatherForecastData.location.localtime : ''}</div>
								</div>
								<div className="large-3 medium-6 small-6 cell text-center">
									<span className="font-source-sans font-size-30 font-weight-600">
										{weatherForecastData.current.temp_f ? Math.round(weatherForecastData.current.temp_f) : ''}&#176;
									</span>
								</div>
								<div className="large-3 medium-6 small-6 cell text-center">
									<div className="font-source-sans font-size-18l-16m-14s font-weight-600 text-center">
										{weatherForecastData.current.condition.text}
									</div>
									<img src={weatherForecastData.current.condition.icon} width="45" alt="current condition" />
								</div>
								<div className="large-3 medium-6 small-6 cell text-center">
									<div className="font-source-sans font-size-18l-16m-14s font-weight-600 text-center">
										Max: {Math.round(weatherForecastData.forecast.forecastday[0].day.maxtemp_f)}&deg;&nbsp;&nbsp;Min: {Math.round(weatherForecastData.forecast.forecastday[0].day.mintemp_f)}&deg;
									</div>
									<div className="font-source-sans font-size-18l-16m-14s font-weight-600 text-center pt-10">
										Wind: {weatherForecastData.current.wind_dir}&nbsp;&nbsp;{Math.round(weatherForecastData.current.wind_mph)}&nbsp;mph
									</div>
								</div>
							</div>
						</div>
						<div id="highchart" className="large-12 medium-12 small-12 cell pt-10">
							<div className="grid-x bg-fafafa b1-ccc p-10">
								<div className="large-12 medium-12 small-12 cell text-center">
									<HighchartsReact
										highcharts={Highcharts}
										options={activeChartOption}
										ref={chartRef}
										onUpdate={(chart) => console.log('Chart Updated')}
									/>
								</div>
								{weatherForecastData.forecast.forecastday.map((daily_forecast, daily_index) =>
									<div key={daily_forecast.day_of_week} className="large-4 medium-4 small-4 cell text-center pt-5">
										<Link key={'daily_link_' + daily_index} to="#" onClick={(event) => handleChangeDailyForecast(event, daily_index)} onTouchEnd={(event) => handleChangeDailyForecast(event, daily_index)} className={daily_index === weatherForecastData.daily_forecast_active_index ? 'button disabled medium width-100px' : 'button medium width-100px'} disabled={daily_index === weatherForecastData.daily_forecast_active_index ? 'disabled' : ''}><span className="font-source-sans font-size-16l-14s font-weight-500 text-center">{daily_forecast.day_of_week}&nbsp;24hr</span></Link>
									</div>
								)}
							</div>
						</div>
						<div id="forecast_data" className="large-12 medium-12 small-12 cell b1-ccc mt-10">
							<table key={'table_' + weatherForecastData.daily_forecast_active_index} className="mb-0">
								<tbody>
									{weatherForecastData.forecast.forecastday[weatherForecastData.daily_forecast_active_index]?.hour.map((hourly_data) => (
										<tr key={hourly_data.time} className="">
											<td key={hourly_data.time + '_1'} className="font-source-sans font-size-16l-14s font-weight-500 width-100px pl-5"><span className="pl5">{hourly_data.day_of_week + ' ' + hourly_data.time}</span></td>
											<td key={hourly_data.time + '_2'} className="font-source-sans font-size-18l-16m-14s font-weight-600 width-50px">{Math.round(hourly_data.temp_f)}&#176;</td>
											<td key={hourly_data.time + '_3'} className="font-source-sans font-size-16l-14s font-weight-500"><img src={hourly_data.condition.icon} alt="condition" width="40" /><br className="show-for-480px" />{hourly_data.condition.text}</td>
											<td key={hourly_data.time + '_4'} className="font-source-sans font-size-16l-14s font-weight-500"><img src={wind_icon} width="20" alt="wind" /> <br className="show-for-480px" />Wind {hourly_data.wind_dir}&nbsp;&nbsp;{Math.round(hourly_data.wind_mph)} mph</td>
											<td key={hourly_data.time + '_5'} className="font-source-sans font-size-16l-14s font-weight-500"><img src={precip_icon} width="25" alt="precipitation" /> <br className="show-for-480px" />{hourly_data.precip_mm} mm</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

					</div>
				) : (
					<div className="grid-x">
						<div className="large-12 medium-12 small-12 cell">
							{weatherForecastData.location.name ? (
								weatherForecastData.forecast.length > 0 ? (
									<></>
								) : (
									<span className="font-source-sans page-text font-weight-600 txt-dark-blue left">No Weather Forecasts</span>
								)
							) : (
								<div>
									<div className="clearfix vertical-center-content pt-10 pr-5">
										<span className="font-source-sans page-text font-weight-600 txt-dark-blue left">{weatherLocationMessage}</span>
										<span className="font-source-sans page-standard font-weight-600 txt-dark-blue right">Add Weather Location <img src={arrow_right_90} width="35" alt="note for order" /></span>
									</div>
									<div className="text-center p-20 b1-ccc bg-fafafa mt-20">
										<span className="font-source-sans page-text font-weight-600">Data Provided by WeatherAPI.com API</span>
									</div>
								</div>
							)}
						</div>
					</div>
				)
				}

				{isLoading &&
					<div className="large-12 medium-12 small-12 cell text-center">
						<LoadingSpinner paddingClass="p-20l-10s" />
					</div>
				}

			</div>

		</div>
	);
}

export default Weather;