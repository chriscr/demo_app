import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OffCanvas, OffCanvasMenu, OffCanvasBody } from "react-offcanvas";

import AxiosApiClient from '../utils/AxiosApiClient';
import AuthUtility from '../frontend/auth/AuthUtility';
import LoadingSpinner from '../frontend/LoadingSpinner';
import Copyright from '../../layouts/frontend/Copyright';

import $ from "jquery";
import swal from 'sweetalert';

import weather_icon from '../../assets/frontend/images/weather_icon.png';
import plus_icon from '../../assets/frontend/images/plus_icon_black.png';
import close_icon from '../../assets/frontend/images/close_icon_black.png';
import checkmark_icon from '../../assets/frontend/images/checkmark_icon.png';
import delete_icon from '../../assets/frontend/images/delete_icon.png';

const WeatherManager = ({ onWeatherForecastData, onWeatherManagerOpen }) => {//sends forecast data and boolean for opening/closing the location finder

	const navHistory = useNavigate();

	//for all API calls
	const auth_api = 'phpLaravel';
	if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') !== '') {
		auth_api = localStorage.getItem('auth_api');
	}

	//check if clicked target is not within the offcanvasnav
	const weatherIconRef = useRef();
	const weatherManagerrRef = useRef();
	const closeWeatherManagerRef = useRef();

	//using hooks
	const [isLoading, setIsLoading] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isWeatherManagerOpen, setIsWeatherManagerOpen] = useState(false);
	const [newWeatherLocation, setNewWeatherLocation] = useState({
		location: '',
		info: '',
		weatherData: [],
	});
	const [weatherLocations, setWeatherLocations] = useState([]);

	//handles click outside slide out
	useEffect(() => {
		const handleClickOutside = (event) => {

			// add event listener to close menu when clicked outside		
			if (weatherManagerrRef.current && !weatherManagerrRef.current.contains(event.target)) {
				onWeatherManagerOpen(false);
				setIsWeatherManagerOpen(false);
			}

			//open nav with mobile icon click which is in the div id=navigation
			if (!isWeatherManagerOpen && weatherIconRef.current && weatherIconRef.current.contains(event.target) && weatherIconRef.current.id === 'weather_icon') {
				onWeatherManagerOpen(true);
				setIsWeatherManagerOpen(true);
				$('#weather_icon').addClass('hide');
			} else {
				$('#weather_icon').removeClass('hide');
			}
		}

		document.addEventListener("mousedown", handleClickOutside)

		return () => {
			// Cleanup the event listener
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [isWeatherManagerOpen, onWeatherManagerOpen]);

	// Initial call for user list items
	useEffect(() => {
		if (!AuthUtility.isLoggedIn()) {
			//user not authenticated on server so remove from local storage
			AuthUtility.clearAuthData();
			navHistory('/');
		}

		setIsLoading(true);

		if (isMounted) {
			console.log('WeatherManager.useEffect: mounted');

			const fetchApiDataReadWeatherLocations = async () => {
				try {
					const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
					await getBearerToken();
					const response = await makeRequestWithHeaders('get', '/api/read_weather_locations', null, {});

					setApiDataReadWeatherLocations(response, "WeatherManager.useEffect");
				} catch (error) {
					handleApiErrorReadWeatherLocations(error, "WeatherManager.useEffect");
				}
			};
			fetchApiDataReadWeatherLocations();

		} else {
			setIsMounted(true);
		}

	}, [isMounted]);

	function setApiDataReadWeatherLocations(response, theFunction) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//set data
				if (response.data.locations) {
					setWeatherLocations(response.data.locations);
				}
				setIsWeatherManagerOpen(false);
				setNewWeatherLocation({ ...newWeatherLocation, location: '', info: '' });

				//pass data
				onWeatherManagerOpen(false);
				onWeatherForecastData(response.data.weather_forecast_data, response.data.locations);

			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
				navHistory('/login');
			} else if (response.data.status === 404) {//HTTP_NOT_FOUND
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				onWeatherForecastData(null);
			} else if (response.data.status === 422) {//HTTP_UNPROCESSABLE_ENTITY
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				onWeatherForecastData(null);
			} else if (response.data.status === 800) {//HTTP_FORM_VALIDATION_FAILED
				console.log(theFunction + ': ', response.data.message + ' HTTP_FORM_VALIDATION_FAILED');
			} else {//more errors
			}
		}

		setIsLoading(false);
	}
	function handleApiErrorReadWeatherLocations(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	const toggleWeatherManager = (event) => {
		event.preventDefault();

		onWeatherManagerOpen(!isWeatherManagerOpen);

		setIsWeatherManagerOpen(!isWeatherManagerOpen);
	}

	const handleInputChange = (event) => {
		event.stopPropagation();

		const { name, value } = event.target;

		setNewWeatherLocation({ ...newWeatherLocation, location: value, info: '', });

		$('.weather-info').removeClass('font-source-sans font-standard font-weight-600 txt-red plr-10 pb-10').addClass('font-source-sans font-small font-weight-400').html('');
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			event.preventDefault(); // Prevent form submission

			if (event.target.name === 'newWeatherLocation') {
				const { name, value } = event.target;

				setNewWeatherLocation({ ...newWeatherLocation, location: value, info: '', });

				handleSaveNewWeatherLocation(event);

				$('.weather-info').removeClass('font-source-sans font-standard font-weight-600 txt-red plr-10 pb-10').addClass('font-source-sans font-small font-weight-400').html('');
			}
		}
	};

	// Function to handle save
	const handleSaveNewWeatherLocation = (event) => {
		//event.stopPropagation();

		if (newWeatherLocation.location) {
			saveWeatherLocation(newWeatherLocation.location);
		} else {
			setNewWeatherLocation({ ...newWeatherLocation, info: 'Error: Empty Location' });

			$('.weather-info').removeClass('font-source-sans font-small font-weight-400').addClass('font-source-sans font-standard font-weight-600 txt-red plr-10 pb-10');
		}
	};

	function saveWeatherLocation(weather_location_name) {

		setIsLoading(true);
		setIsSaving(true);

		var payload = {
			new_location: weather_location_name,
		}

		const fetchApiDataSaveWeatherLocation = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('post', '/api/save_weather_location', payload, {});

				setApiDataSaveWeatherLocation(response, "WeatherManager.saveWeatherLocation");
			} catch (error) {
				handleApiErrorSaveWeatherLocation(error, "WeatherManager.saveWeatherLocation");
			}
		};

		fetchApiDataSaveWeatherLocation();

	}
	function setApiDataSaveWeatherLocation(response, theFunction) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//uset data
				if (response.data.locations) {
					setWeatherLocations(response.data.locations);
					if (response.data.locations.length === 1) {
						setIsWeatherManagerOpen(!isWeatherManagerOpen);
						//pass data
						onWeatherForecastData(response.data.weather_forecast_data);
						onWeatherManagerOpen(!isWeatherManagerOpen);
					}
				}
				setNewWeatherLocation({ ...newWeatherLocation, location: '', info: '', });
			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
				swal("Warning", response.data.message, "warning");
				navHistory('/login');
			} else if (response.data.status === 422) {//HTTP_UNPROCESSABLE_ENTITY
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//set data
				setNewWeatherLocation({ ...newWeatherLocation, info: 'Error: location does not exist.' });
			} else {//more errors
			}
		}

		setIsLoading(false);
	}
	function handleApiErrorSaveWeatherLocation(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	// Delete row of id:i
	const handleRemoveClick = (i) => {
		const list = [...weatherLocations];

		if (list[i]['random_id'] && list[i]['random_id'] !== '') {
			deleteWeatherLocation(list[i]['random_id']);//send a specific unique ID to delete
		}
	};

	function deleteWeatherLocation(weather_location_random_id) {
		setIsLoading(true);
		setIsDeleting(true);

		const fetchApiDataDeleteWeatherLocation = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('delete', '/api/delete_weather_location/' + weather_location_random_id, null, {});

				setApiDataDeleteWeatherLocation(response, "WeatherManager.deleteWeatherLocation", weather_location_random_id);
			} catch (error) {
				handleApiErrorDeleteWeatherLocation(error, "WeatherManager.deleteWeatherLocation");
			}
		};

		fetchApiDataDeleteWeatherLocation();

	}
	function setApiDataDeleteWeatherLocation(response, theFunction, weather_location_random_id) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//set data
				if (response.data.locations) {
					setWeatherLocations(response.data.locations);
					if (response.data.locations.length === 1) {
						setIsWeatherManagerOpen(!isWeatherManagerOpen);
						//pass data
						onWeatherManagerOpen(!isWeatherManagerOpen);
					}
				} else {//update by filtering it out
					setWeatherLocations(oldLocations => {
						return oldLocations.filter(location => location.random_id !== weather_location_random_id)
					});
				}

				onWeatherForecastData(response.data.weather_forecast_data);

				setNewWeatherLocation({ ...newWeatherLocation, location: '', info: '', });

			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
				swal("Warning", response.data.message, "warning");
				navHistory('/login');
			} else if (response.data.status === 422) {//HTTP_UNPROCESSABLE_ENTITY
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				swal("Warning", response.data.message, "warning");
			} else {//more errors
			}
		}

		setIsLoading(false);
	}
	function handleApiErrorDeleteWeatherLocation(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	// Delete row of id:i
	const handleChangeDefaultWeatherLocation = (i) => {
		const list = [...weatherLocations];

		if (list[i]['random_id'] && list[i]['random_id'] !== '') {
			changeDefaultWeatherLocation(list[i]['random_id']);//send a specific unique ID to delete
		}
	};

	function changeDefaultWeatherLocation(weather_location_random_id) {
		setIsLoading(true);

		const fetchApiDataChangeDefaultWeatherLocation = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('put', '/api/change_default_weather_location/' + weather_location_random_id, null, {});

				setApiDataChangeDefaultWeatherLocation(response, "WeatherManager.changeDefaultWeatherLocation");
			} catch (error) {
				handleApiErrorChangeDefaultWeatherLocation(error, "WeatherManager.changeDefaultWeatherLocation");
			}
		};

		fetchApiDataChangeDefaultWeatherLocation();

	}
	function setApiDataChangeDefaultWeatherLocation(response, theFunction) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//update all state properties
				if (response.data.locations) {
					setWeatherLocations(response.data.locations);
				}
				setIsWeatherManagerOpen(false);
				setNewWeatherLocation({ ...newWeatherLocation, location: '', info: '', });

				//pass data
				onWeatherManagerOpen(false);
				onWeatherForecastData(response.data.weather_forecast_data);

			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
				swal("Warning", response.data.message, "warning");
				navHistory('/login');
			} else if (response.data.status === 422) {//HTTP_UNPROCESSABLE_ENTITY
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				swal("Warning", response.data.message, "warning");
			} else {//more errors
			}
		}

		setIsLoading(false);
	}
	function handleApiErrorChangeDefaultWeatherLocation(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	return (
		<OffCanvas width={270} transitionDuration={300} effect={"parallax"} isMenuOpened={isWeatherManagerOpen} position={"right"}>
			<OffCanvasBody>
				<div id="weather_icon" className="p-0 m-0" ref={weatherIconRef}>
					<Link to="#" className="hover-opacity-50" onClick={toggleWeatherManager} onTouchEnd={toggleWeatherManager}>
						<img src={weather_icon} className="br-5" width="40" alt="weather manager" />
					</Link>
				</div>
			</OffCanvasBody>
			<OffCanvasMenu >
				<div id="location_finder" className="z-index-2100 bg-fafafa bl1-ccc pt-70l-110m-50s" style={{ height: "2000px", overflow: "hidden" }} ref={weatherManagerrRef}>
					<div className="panel">
						<div className="grid-x p-10">
							<div className="large-10 medium-10 small-9 cell text-center">
								{isLoading &&
									<span className="element"><LoadingSpinner paddingClass="none" sizeClass="small" /></span>
								}
								{newWeatherLocation && newWeatherLocation.info &&
									<div className="font-source-sans font-size-16l-14s font-weight-600 txt-red text-center pt-10">{newWeatherLocation.info}</div>
								}
							</div>
							<div className="large-2 medium-2 small-3 cell text-right">
								<Link className="button icon text-center" onClick={toggleWeatherManager} onTouchEnd={toggleWeatherManager} ref={closeWeatherManagerRef}>
									<img src={close_icon} className="" width="40" alt="add new check list" />
								</Link>
							</div>
						</div>
					</div>
					<div className="panel">
						<div className="grid-x bt1-ccc p-10">
							<div className="large-10 medium-10 small-9 cell text-left">
								<input type="text" className="medium" value={newWeatherLocation.location} name="e" onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="My Shopping List" />

							</div>
							<div className="large-2 medium-2 small-3 cell text-right">
								{isSaving ? (
									<Link disabled className="hover-opacity-50 disabled">
										<span className="button icon">
											<img src={plus_icon} alt="add new weather location" />
										</span>
									</Link>
								) : (
									<Link onMouseDown={handleSaveNewWeatherLocation} onTouchStart={handleSaveNewWeatherLocation}>
										<span className="button icon">
											<img src={plus_icon} alt="add new weather location" />
										</span>
									</Link>
								)}
							</div>
						</div>
					</div>
					{weatherLocations.length > 0 ? (
						<div className="bt1-ccc ptb-5 mlr-10">
							{weatherLocations.map((location, i) => (
								<div key={i} className="horizontal-container vertical-center-content ptb-5">
									<span key={'symbol_' + i} className="left">
										{location.default ? (
											<Link onClick={() => handleChangeDefaultWeatherLocation(i)} onTouchEnd={() => handleChangeDefaultWeatherLocation(i)} className="no-underline">
												<img src={checkmark_icon} width="12" alt="default" />
												<span className="font-source-sans font-size-16l-14s font-weight-600 txt-green pl-10">{shortenString(location.name)}</span>
											</Link>
										) : (
											<Link onClick={() => handleChangeDefaultWeatherLocation(i)} onTouchEnd={() => handleChangeDefaultWeatherLocation(i)} className="no-underline">
												<span className="font-source-sans font-size-16l-14s font-weight-600 txt-333 pl-5">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{shortenString(location.name)}</span>
											</Link>
										)
										}
									</span>
									{isDeleting ? (
										<span key={'delete_' + i} className="right">
											<Link disabled className="hover-opacity-50 disabled">
												<span className="button icon small">
													<img src={delete_icon} alt="delete" />
												</span>
											</Link>
										</span>
									) : (
										<span key={'delete_' + i} className="right">
											<Link onClick={() => handleRemoveClick(i)} onTouchEnd={() => handleRemoveClick(i)} className="no-underline">
												<span className="button icon small">
													<img src={delete_icon} alt="delete weather location" />
												</span>
											</Link>
										</span>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="bt1-ccc ptb-20 mlr-10">
							<div className="font-source-sans font-size-16l-14s font-weight-600 txt-dark-blue text-center mlr-10">No Weather Locations</div>
						</div>
					)
					}
					<Copyright />
				</div>
			</OffCanvasMenu>
		</OffCanvas>
	);

}

export default WeatherManager;

function shortenString(str) {
	if (str.length > 22) {
		return str.substring(0, 22);
	} else {
		return str;
	}
}
