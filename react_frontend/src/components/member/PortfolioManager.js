import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OffCanvas, OffCanvasMenu, OffCanvasBody } from "react-offcanvas";

import AxiosApiClient from '../../components/utils/AxiosApiClient';
import AuthUtility from '../frontend/auth/AuthUtility';
import LoadingSpinner from '../frontend/LoadingSpinner';
import Copyright from '../../layouts/frontend/Copyright';

import $ from "jquery";
import swal from 'sweetalert';

import portfolio_icon from '../../assets/frontend/images/portfolio_icon.png';
import plus_icon from '../../assets/frontend/images/plus_icon_black.png';
import close_icon from '../../assets/frontend/images/close_icon_black.png';
import checkmark_icon from '../../assets/frontend/images/checkmark_icon.png';
import delete_icon from '../../assets/frontend/images/delete_icon.png';

const PortfolioManager = ({ onPortfolioData, onPortfolioManagerOpen }) => {//sends portfolio data and boolean for opening/closing the manager

	const navHistory = useNavigate();

	//for all API calls
	const auth_api = 'phpLaravel';
	if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') !== '') {
		auth_api = localStorage.getItem('auth_api');
	}

	//check if clicked target is not within the offcanvasnav
	const portfolioIconRef = useRef();
	const portfolioManagerRef = useRef();
	const closePortfolioManagerRef = useRef();

	//using hooks
	const [isLoading, setIsLoading] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isPortfolioManagerOpen, setIsPortfolioManagerOpen] = useState(false);
	const [newPortfolio, setNewPortfolio] = useState({
		name: '',
		info: '',
	});
	const [portfolios, setPortfolios] = useState([]);

	//handles click outside slide out
	useEffect(() => {
		const handleClickOutside = (event) => {

			// add event listener to close menu when clicked outside		
			if (portfolioManagerRef.current && !portfolioManagerRef.current.contains(event.target)) {
				onPortfolioManagerOpen(false);
				setIsPortfolioManagerOpen(false);
			}

			//open nav with mobile icon click which is in the div id=navigation
			if (!isPortfolioManagerOpen && portfolioIconRef.current && portfolioIconRef.current.contains(event.target) && portfolioIconRef.current.id === 'portfolio_icon') {
				onPortfolioManagerOpen(true);
				setIsPortfolioManagerOpen(true);
				$('#portfolio_icon').addClass('hide');
			} else {
				$('#portfolio_icon').removeClass('hide');
			}
		}

		document.addEventListener("mousedown", handleClickOutside)

		return () => {
			// Cleanup the event listener
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [isPortfolioManagerOpen, onPortfolioManagerOpen]);

	// Initial call for user list items
	useEffect(() => {
		if (!AuthUtility.isLoggedIn()) {
			//user not authenticated on server so remove from local storage
			AuthUtility.clearAuthData();
			navHistory('/');
		}

		setIsLoading(true);

		if (isMounted) {
			console.log('PortfolioManager.useEffect: mounted');

			const fetchApiDataReadPortfolios = async () => {
				try {
					const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
					await getBearerToken();
					const response = await makeRequestWithHeaders('get', '/api/read_portfolios', null, {});

					setApiDataReadPortfolios(response, "PortfolioManager.useEffect");
				} catch (error) {
					handleApiErrorReadPortfolios(error, "PortfolioManager.useEffect");
				}
			};
			fetchApiDataReadPortfolios();

		} else {
			setIsMounted(true);
		}

	}, [isMounted, navHistory]);

	function setApiDataReadPortfolios(response, theFunction) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//set data
				if (response.data.portfolios) {
					setPortfolios(response.data.portfolios);
				}
				setIsPortfolioManagerOpen(false);
				setNewPortfolio({ ...newPortfolio, name: '', info: '' });
				//pass data
				onPortfolioManagerOpen(false);
				onPortfolioData(response.data.default_portfolio, response.data.default_portfolio_data);
			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
				navHistory('/login');
			} else if (response.data.status === 404) {//HTTP_NOT_FOUND
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				onPortfolioData(null);
			} else if (response.data.status === 422) {//HTTP_UNPROCESSABLE_ENTITY
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				onPortfolioData(null);
			} else if (response.data.status === 800) {//HTTP_FORM_VALIDATION_FAILED
				console.log(theFunction + ': ', response.data.message + ' HTTP_FORM_VALIDATION_FAILED');
			} else {//more errors
			}
		}

		setIsLoading(false);
	}
	function handleApiErrorReadPortfolios(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	const togglePortfolioManager = (event) => {
		event.preventDefault();

		onPortfolioManagerOpen(!isPortfolioManagerOpen);
		setIsPortfolioManagerOpen(!isPortfolioManagerOpen);
	}

	const handleInputChange = (event) => {
		event.stopPropagation();

		const { name, value } = event.target;

		setNewPortfolio({ ...newPortfolio, name: value, info: '', });
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			event.preventDefault(); // Prevent form submission

			if (event.target.name === 'newPortfolio') {
				const { name, value } = event.target;

				setNewPortfolio({ ...newPortfolio, name: value, info: '', });

				handleSaveNewPortfolio(event);
			}
		}
	};

	// Function to handle save
	const handleSaveNewPortfolio = (event) => {
		event.stopPropagation();

		if (newPortfolio.name) {
			savePortfolio(newPortfolio.name);
		} else {
			setNewPortfolio({ ...newPortfolio, info: 'Error: Empty Portfolio Name' });
		}
	};

	function savePortfolio(portfolio_name) {
		setIsLoading(true);
		setIsSaving(true);

		var payload = {
			new_portfolio_name: portfolio_name,
		}

		const fetchApiDataSavePortfolio = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('post', '/api/save_portfolio', payload, {});

				setoApiDataSavePortfolio(response, "CheckListManager.savePortfolio");
			} catch (error) {
				handleApiErrorSavePortfolio(error, "CheckListManager.savePortfolio");
			}
		};

		fetchApiDataSavePortfolio();
	}
	function setoApiDataSavePortfolio(response, theFunction) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//update state properties
				if (response.data.portfolios) {
					//set data
					setPortfolios(response.data.portfolios);
					if (response.data.portfolios.length === 1) {
						setIsPortfolioManagerOpen(!isPortfolioManagerOpen);
						//pass data
						onPortfolioManagerOpen(!isPortfolioManagerOpen);
						onPortfolioData(response.data.default_portfolio, response.data.default_portfolio_data);
					}
				}
				setNewPortfolio({ ...newPortfolio, name: '', info: '' });
			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
				swal("Warning", response.data.message, "warning");
				navHistory('/login');
			} else if (response.data.status === 422) {//HTTP_UNPROCESSABLE_ENTITY
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//set data
				setNewPortfolio({ ...newPortfolio, info: 'Error: location does not exist.' });
			} else {//more errors
			}
		}

		setIsLoading(false);
	}
	function handleApiErrorSavePortfolio(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	// Delete row of id:i
	const handleRemoveClick = (i) => {
		const list = [...portfolios];

		if (list[i]['random_id'] && list[i]['random_id'] !== '') {
			deletePortfolio(list[i]['random_id']);//send a specific unique ID to delete
		}
	};

	function deletePortfolio(portfolio_random_id) {
		setIsLoading(true);
		setIsDeleting(true);

		const fetchApitDataDeletePortfolio = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('delete', '/api/delete_portfolio/' + portfolio_random_id, null, {});

				setApiDataDeletePortfolio(response, "CheckListManager.deletePortfolio", portfolio_random_id);
			} catch (error) {
				handleApiErrorDeletePortfolio(error, "CheckListManager.deletePortfolio");
			}
		};

		fetchApitDataDeletePortfolio();
	}
	function setApiDataDeletePortfolio(response, theFunction, portfolio_random_id) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//update all state properties
				if (response.data.portfolios) {
					setPortfolios(response.data.portfolios);
					if (response.data.portfolios.length === 1) {
						onPortfolioManagerOpen(!isPortfolioManagerOpen);
						setIsPortfolioManagerOpen(!isPortfolioManagerOpen);
					}
				} else {//update by filtering it out
					setPortfolios(oldPortfolios => {
						return oldPortfolios.filter(portfolio => portfolio.random_id !== portfolio_random_id)
					});
				}
				onPortfolioData(response.data.default_portfolio, response.data.default_portfolio_data);
				setNewPortfolio({ ...newPortfolio, name: '', info: '' });

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
	function handleApiErrorDeletePortfolio(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	//change default using id:i
	const handleChangeDefaultPortfolio = (i) => {
		const list = [...portfolios];

		if (list[i]['random_id'] && list[i]['random_id'] !== '') {
			changeDefaultPortfolio(list[i]['random_id']);//send a specific unique ID to delete
		}
	};

	function changeDefaultPortfolio(portfolio_random_id) {
		setIsLoading(true);

		const fetchApiDataChangeDefaultPortfolio = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('put', '/api/change_default_portfolio/' + portfolio_random_id, null, {});

				setApiDataChangeDefaultPortfolio(response, "CheckListManager.changeDefaultPortfolio");
			} catch (error) {
				handleApiErrorChangeDefaultPortfolio(error, "CheckListManager.changeDefaultPortfolio");
			}
		};

		fetchApiDataChangeDefaultPortfolio();
	}
	function setApiDataChangeDefaultPortfolio(response, theFunction) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//update all state properties
				if (response.data.portfolios) {
					setPortfolios(response.data.portfolios);
				}
				setNewPortfolio({ ...newPortfolio, name: '', info: '' });
				setIsPortfolioManagerOpen(false);

				onPortfolioData(response.data.default_portfolio, response.data.default_portfolio_data);
				onPortfolioManagerOpen(false);

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
	function handleApiErrorChangeDefaultPortfolio(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	return (
		<OffCanvas width={270} transitionDuration={300} effect={"parallax"} isMenuOpened={isPortfolioManagerOpen} position={"right"}>
			<OffCanvasBody>
				<div id="portfolio_icon" className="p-0 m-0" ref={portfolioIconRef}>
					<Link className="hover-opacity-50" onClick={togglePortfolioManager} onTouchEnd={togglePortfolioManager}>
						<img src={portfolio_icon} className="br-5" width="40" alt="portfolio manager" />
					</Link>
				</div>
			</OffCanvasBody>
			<OffCanvasMenu >
				<div id="portfolio_manger" className="z-index-2100 bg-fafafa bl1-ccc pt-70l-110m-50s" style={{ height: "2000px", overflow: "hidden" }} ref={portfolioManagerRef}>
					<div className="panel">
						<div className="grid-x p-10">
							<div className="large-10 medium-10 small-9 cell text-center">
								{isLoading &&
									<span className="element"><LoadingSpinner paddingClass="none" sizeClass="small" /></span>
								}
								{newPortfolio && newPortfolio.info &&
									<div className="font-source-sans font-size-16l-14s font-weight-600 txt-red text-center pt-10">{newPortfolio.info}</div>
								}
							</div>
							<div className="large-2 medium-2 small-3 cell text-right">
								<Link className="button icon text-center" onClick={togglePortfolioManager} onTouchEnd={togglePortfolioManager} ref={closePortfolioManagerRef}>
									<img src={close_icon} className="" width="40" alt="add new portfolio" />
								</Link>
							</div>
						</div>
					</div>
					<div className="panel">
						<div className="grid-x bt1-ccc p-10">
							<div className="large-10 medium-10 small-9 cell text-left">
								<input type="text" className="medium" value={newPortfolio.name} name="newPortfolio" onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="My Portfolio" />

							</div>
							<div className="large-2 medium-2 small-3 cell text-right">
								{isSaving ? (
									<Link disabled className="hover-opacity-50 disabled">
										<span className="button icon">
											<img src={plus_icon} alt="add new portfolio" />
										</span>
									</Link>
								) : (
									<Link onMouseDown={handleSaveNewPortfolio} onTouchStart={handleSaveNewPortfolio}>
										<span className="button icon">
											<img src={plus_icon} alt="add new portfolio" />
										</span>
									</Link>
								)}
							</div>
						</div>
					</div>
					{portfolios.length > 0 ? (
						<div className="bt1-ccc ptb-5 mlr-10">
							{portfolios.map((portfolio, i) => (
								<div key={i} className="horizontal-container vertical-center-content ptb-5">
									<span key={'symbol_' + i} className="left">
										{portfolio.default ? (
											<Link onClick={() => handleChangeDefaultPortfolio(i)} onTouchEnd={() => handleChangeDefaultPortfolio(i)} className="no-underline">
												<img src={checkmark_icon} width="12" alt="default" />
												<span className="font-source-sans font-size-16l-14s font-weight-600 txt-green pl-10">{shortenString(portfolio.name)}</span>
											</Link>
										) : (
											<Link onClick={() => handleChangeDefaultPortfolio(i)} onTouchEnd={() => handleChangeDefaultPortfolio(i)} className="no-underline">
												<span className="font-source-sans font-size-16l-14s font-weight-600 txt-333 pl-5">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{shortenString(portfolio.name)}</span>
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
													<img src={delete_icon} alt="delete portfolio" />
												</span>
											</Link>
										</span>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="bt1-ccc ptb-20 mlr-10">
							<div className="font-source-sans font-size-16l-14s font-weight-600 txt-dark-blue text-center mlr-10">No Check Lists</div>
						</div>
					)
					}
					<Copyright />
				</div>
			</OffCanvasMenu>
		</OffCanvas>
	);

}

export default PortfolioManager;

function shortenString(str) {
	if (str.length > 22) {
		return str.substring(0, 22);
	} else {
		return str;
	}
}
