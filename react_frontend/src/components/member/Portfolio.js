import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AxiosApiClient from '../../components/utils/AxiosApiClient';
import AuthUtility from '../frontend/auth/AuthUtility';
import PortfolioManager from './PortfolioManager';
import LoadingSpinner from '../frontend/LoadingSpinner';

import axios from 'axios';
import swal from 'sweetalert';

import plus_icon from '../../assets/frontend/images/plus_icon_black.png';
import close_icon from '../../assets/frontend/images/close_icon_black.png';
import checkmark_icon from '../../assets/frontend/images/checkmark_icon.png';
import delete_icon from '../../assets/frontend/images/delete_icon.png';
import arrow_left_90 from '../../assets/frontend/images/arrow_left_90.png';
import arrow_right_90 from '../../assets/frontend/images/arrow_right_90.png';

function Portfolio() {

	const navHistory = useNavigate();

	//for all API calls
	const auth_api = 'phpLaravel';
	if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') !== '') {
		auth_api = localStorage.getItem('auth_api');
	}

	// using hooks
	const [isLoading, setIsLoading] = useState(true);
	const [isAdd, setAdd] = useState(false);
	const [isEdit, setEdit] = useState(false);
	const [disable, setDisable] = useState(true);
	const [portfolio, setPortfolio] = useState({
		name: '',
		random_id: '',
		data: [
			//{ id: 1, user_id: "", symbol: "", status: "", order: 1, random_id: "", created: "", updated: "" },
		],
	});
	const [portfolioForCancel, setPortfolioForCancel] = useState({
		data: [
			//{ id: 1, user_id: "", symbol: "", status: "", order: 1, random_id: "", created: "", updated: "" },
		],
	});
	const [portfolioMessage, setPortfolioMessage] = useState('');

	const handlePortfolioManagerOpen = (isPortfolioManagerOpen) => {
		if (isPortfolioManagerOpen) {
			//hide some elements
		} else {
			//show some elements
		}
	};

	const handleApiResponses = (defaultPortfolio, defaultPortfolioData, apiResponses) => {

		// Handle the API responses here
		var portfolioDataWithPrices = [];
		if (apiResponses) {
			for (let i = 0; i < apiResponses.length; i++) {
				let responseData = apiResponses[i];

				var filteredDefaultPortfolioData = defaultPortfolioData.filter(symbol_obj => symbol_obj.symbol === responseData['Global Quote']['01. symbol']).map(symbol_obj => {
					return (
						symbol_obj
					)
				});

				var symbol_api_data = {
					open: parseFloat(responseData['Global Quote']['02. open'].replace(/,/g, '')).toFixed(2),
					high: parseFloat(responseData['Global Quote']['03. high'].replace(/,/g, '')).toFixed(2),
					low: parseFloat(responseData['Global Quote']['04. low'].replace(/,/g, '')).toFixed(2),
					price: parseFloat(responseData['Global Quote']['05. price'].replace(/,/g, '')).toFixed(2),
					volume: parseInt(responseData['Global Quote']['06. volume']),
					previous_close: parseFloat(responseData['Global Quote']['08. previous close'].replace(/,/g, '')).toFixed(2),
					change: parseFloat(responseData['Global Quote']['09. change'].replace(/,/g, '')).toFixed(2),
					change_percent: parseFloat(responseData['Global Quote']['10. change percent'].replace(/,/g, '').replace('%', '')).toFixed(2),
				};

				const merged_data = { ...filteredDefaultPortfolioData[0], ...symbol_api_data };

				portfolioDataWithPrices.push(merged_data);
			}

			setPortfolio({ ...portfolio, name: defaultPortfolio.name, random_id: defaultPortfolio.random_id, data: portfolioDataWithPrices });

		} else {
			setPortfolio({ ...portfolio, name: '', random_id: '', data: [] });
		}

		setIsLoading(false);
	};

	const handlePortfolioData = (defaultPortfolio, defaultPortfolioData) => {//properties coming from PortfolioManager

		if (defaultPortfolioData && defaultPortfolioData.length > 0) {

			setPortfolioMessage('');

			const apiPromises = [];

			defaultPortfolioData.forEach((symbol_obj) => {

				const promise = axios.get('https://www.alphavantage.co/query', {
					params: {
						function: 'GLOBAL_QUOTE',
						symbol: symbol_obj.symbol.toUpperCase(),
						apikey: 'YN3NA1LG2J91KYH0'
					},
					withCredentials: false, // Disable credentials mode
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
					}
				}).then(response => {
					return response.data;
				}).catch(error => {
					console.log('Portfolio.handlePortfolioData - Error: [alphavantage api call]', error);
				});

				apiPromises.push(promise);

			});

			//resolve all promises together
			Promise.all(apiPromises).then((apiResponses) => {
				handleApiResponses(defaultPortfolio, defaultPortfolioData, apiResponses);
			}).catch((error) => {
				console.log('Portfolio.handlePortfolioData - Error: [Promise.all alphavantage api call]', error);

				setIsLoading(false);
			});
		} else if (defaultPortfolio) {
			setPortfolio({ ...portfolio, name: defaultPortfolio.name, random_id: defaultPortfolio.random_id, data: [] });
			setPortfolioMessage('');
		} else {
			setPortfolio({ ...portfolio, name: '', random_id: '', data: [] });
			setPortfolioMessage('No Portfolios Exist');
		}

		setIsLoading(false);
	};

	// Function For adding new row object
	const handleAdd = () => {
		var list = [...portfolio.data];

		//cache on first click of add button
		if (!isAdd) {
			const clonedList = JSON.parse(JSON.stringify(list));

			//cache rows before changing for cancelling
			if (list.length === 0) {
				setPortfolioForCancel({ ...portfolioForCancel, data: [] });
			} else {
				setPortfolioForCancel({ ...portfolioForCancel, data: clonedList });
			}
		}

		list.push({ id: portfolio.data.length + 1, symbol: "" });
		setPortfolio({ ...portfolio, data: list });

		setAdd(true);
		setEdit(true);
	};

	const handleCancel = () => {
		const list = [...portfolioForCancel.data];
		const clonedList = JSON.parse(JSON.stringify(list));

		//set rows to the old cached rows
		setPortfolio({ ...portfolio, data: clonedList });

		setDisable(true);
		setAdd(!isAdd);
		setEdit(!isEdit);
	}

	// The handleInputChange handler can be set up to handle
	// many different inputs in the form, listen for changes 
	// to input elements and record their values in state
	const handleInputChange = (event, index) => {
		event.stopPropagation()

		const { name, value } = event.target;

		const list = [...portfolio.data];

		list[index][name] = value.toUpperCase();

		setPortfolio({ ...portfolio, data: list });

		setDisable(false);
	};

	// Function to handle save
	const handleSavePortfolioSymbols = () => {
		setPortfolio({ ...portfolio, data: portfolio.data });

		savePortfolioSymbols();

		setAdd(!isAdd);
		setEdit(!isEdit);
		setDisable(true);

		//remove cached rows  for cancelling
		setPortfolioForCancel([]);
	};

	function savePortfolioSymbols() {

		setIsLoading(true);

		//values sent to api
		var payload = {
			portfolio_random_id: portfolio.random_id,
			//entire rows list converted to string
			portfolio_symbols_json_string: JSON.stringify(portfolio.data),
		}

		const fetchApiDataSavePortfolioSymbols = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('post', '/api/save_portfolio_symbols', payload, {});

				setApiDataSavePortfolioSymbols(response, "Portfolio.savePortfolioSymbols");
			} catch (error) {
				handleApiErrorSavePortfolioSymbols(error, "Portfolio.savePortfolioSymbols");
			}
		};

		fetchApiDataSavePortfolioSymbols();
	}
	function setApiDataSavePortfolioSymbols(response, theFunction) {
		if (response && response.data) {

			var portfolio_data;
			var error_message;

			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//update all state properties
				portfolio_data = response.data.portfolio_data;

				error_message = '';
				for (let i = 0; i < portfolio_data.length; i++) {
					if (portfolio_data[i].hasOwnProperty('error')) {
						error_message = error_message + ' ' + portfolio_data[i]['symbol'] + ' ' + portfolio_data[i]['error'];
						portfolio_data.splice(i, 1);
						i--;
					}
				}

				if (error_message) {
					swal("Warning", error_message, "warning");
				} else {
					//needs swal success
				}

				//update all state properties
				setPortfolio({ ...portfolio, data: portfolio_data });
			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
				swal("Warning", response.data.message, "warning");
				navHistory('/login');
			} else if (response.data.status === 422) {//HTTP_UNPROCESSABLE_ENTITY
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				portfolio_data = response.data.portfolio_data;

				error_message = '';
				for (let i = 0; i < portfolio_data.length; i++) {
					if (portfolio_data[i].hasOwnProperty('error')) {
						error_message = error_message + ' ' + portfolio_data[i]['symbol'] + ' ' + portfolio_data[i]['error'];
						portfolio_data.splice(i, 1);
						i--;
					}
				}

				if (error_message) {
					//update all state properties
					setPortfolio({ ...portfolio, data: portfolio_data });
					swal("Warning", error_message, "warning");
				} else {
					swal("Warning", response.data.message, "warning");
				}
			} else {//more errors
			}
		}

		setIsLoading(false);
	}
	function handleApiErrorSavePortfolioSymbols(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	// Showing delete all confirmation to users
	const handleConfirmToRemoveAllPortfolioSymbols = () => {
		swal({
			title: 'Delete All Portfolio Symbols',
			text: 'This will delete all symbols but not the portfolio itself.',
			icon: "warning",
			buttons: {
				cancel: true,
				confirm: {
					text: "Delete All Symbols",
					value: true,
				},
			},
			showCancelButton: true,
			confirmButtonText: "Yes, delete it!"
		}).then((result) => {
			if (result) {
				deletePortfolioSymbols();
			}
		});
	};
	const handleConfirmToRemovePortfolioSymbol = (i) => {
		const list = [...portfolio.data];

		swal({
			title: 'Delete Portfolio Symbol',
			text: 'This will delete the symbol ' + list[i]['symbol'] + '.',
			icon: "warning",
			buttons: {
				cancel: true,
				confirm: {
					text: "Delete Symbol",
					value: true,
				},
			},
			showCancelButton: true,
			confirmButtonText: "Yes, delete it!"
		}).then((result) => {
			if (result) {
				handleRemovePortfolioSymbol(i);
			}
		});
	};

	// Delete row of id:i
	const handleRemovePortfolioSymbol = (i) => {
		const list = [...portfolio.data];

		if (list[i]['random_id'] && list[i]['random_id'] !== '') {
			deletePortfolioSymbols(list[i]['random_id']);//send a specific unique ID to delete
		}
	};

	function deletePortfolioSymbols(portfolio_symbol_random_id) {

		setIsLoading(true);

		if (!portfolio_symbol_random_id || portfolio_symbol_random_id === '') {
			portfolio_symbol_random_id = 'none';
		}

		const fetchApiDataDeletePortfolioSymbols = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('delete', '/api/delete_portfolio_symbol/' + portfolio.random_id + '/' + portfolio_symbol_random_id, null, {});

				setApiDataDeletePortfolioSymbols(response, "CheckList.deletePortfolioSymbols", portfolio_symbol_random_id);
			} catch (error) {
				handleApiErrorDeletePortfolioSymbols(error, "CheckList.deletePortfolioSymbols");
			}
		};

		fetchApiDataDeletePortfolioSymbols();
	}
	function setApiDataDeletePortfolioSymbols(response, theFunction, portfolio_symbol_random_id) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				var list = [];

				if (portfolio_symbol_random_id && portfolio_symbol_random_id !== 'none' && response.data.portfolio_data) {
					list = response.data.portfolio_data;
				}

				//update state properties
				setPortfolio({ ...portfolio, data: list });

				if (!portfolio_symbol_random_id || portfolio_symbol_random_id === 'none' || portfolio_symbol_random_id === '') {
					swal("Deleted!", "All Portfolio Symbols have been deleted.", "success");
				} else {
					swal("Deleted!", "Symbol has been deleted.", "success");
				}
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
	function handleApiErrorDeletePortfolioSymbols(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	return (
		<div className="body-content bg-fff pt-70l-110m-50s pb-40">

			<div className="panel large pt-20l-10s">
				<div className="grid-x">
					<div className="large-11 medium-11 small-10 cell text-left">
						<div className="font-source-sans font-size-20 font-weight-800 txt-dark-blue bb1-dark-blue uppercase pb-5">Portfolio</div>
						<div className="font-source-sans font-size-18l-16m font-weight-600 pt-5">
							{portfolio.name}
						</div>
					</div>
					<div className="large-1 medium-1 small-2 cell text-right">
						<PortfolioManager onPortfolioData={handlePortfolioData} onPortfolioManagerOpen={handlePortfolioManagerOpen} />
					</div>
				</div>
			</div>

			<div className="panel large">
				<div className="grid-x">

					{portfolio.name ? (
						<div className="large-12 medium-12 small-12 cell pt-20l-10s">
							{isEdit ? (
								<div className="horizontal-container float-left">
									<span className="left">
										<Link onClick={handleAdd} onTouchEnd={handleAdd} className="no-underline">
											<span className="button icon">
												<img src={plus_icon} alt="add" />
											</span>
											<span className="font-source-sans font-size-16l-14s font-weight-500 pt-10 pl-5 pr-20">
												ADD
											</span>
										</Link>
									</span>
									{portfolio.data.length > 0 && (
										<span className="left">
											<Link onClick={handleCancel} onTouchEnd={handleCancel} className="no-underline">
												<span className="button icon">
													<img src={close_icon} alt="cancel" />
												</span>
												<span className="font-source-sans font-size-16l-14s font-weight-500 pt-10 pl-5 pr-20">
													CANCEL
												</span>
											</Link>
											{disable ? (
												<Link disabled className="disabled no-underline">
													<span className="button icon disabled">
														<img src={checkmark_icon} alt="save" />
													</span>
													<span className="font-source-sans font-size-16l-14s font-weight-500 pt-10 pl-5 pr-20">
														SAVE
													</span>
												</Link>
											) : (
												<Link onClick={handleSavePortfolioSymbols} onTouchEnd={handleSavePortfolioSymbols} className="no-underline">
													<span className="button icon">
														<img src={checkmark_icon} alt="save" />
													</span>
													<span className="font-source-sans font-size-16l-14s font-weight-500 pt-10 pl-5 pr-20">
														SAVE
													</span>
												</Link>
											)}
										</span>
									)}
								</div>
							) : (
								<div className="horizontal-container float-left">
									<span className="left">
										<Link onClick={handleAdd} onTouchEnd={handleAdd} className="no-underline">
											<span className="button icon">
												<img src={plus_icon} alt="add new check list" />
											</span>
											<span className="font-source-sans font-size-16l-14s font-weight-500 pt-10 pl-5 pr-20">
												ADD
											</span>
										</Link>
									</span>
									{portfolio.data.length > 0 && (
										<span className="left">
											<Link onClick={handleConfirmToRemoveAllPortfolioSymbols} onTouchEnd={handleConfirmToRemoveAllPortfolioSymbols} className="no-underline">
												<span className="button icon">
													<img src={delete_icon} alt="delete all" />
												</span>
												<span className="font-source-sans font-size-16l-14s font-weight-500 pt-10 pl-5 pr-20">
													DELETE ALL
												</span>
											</Link>
										</span>
									)}
								</div>
							)}
						</div>
					) : (
						<></>
					)}

					{portfolio.data.length > 0 ? (
						<div id="portfolio_data" className="large-12 medium-12 small-12 cell b1-ccc mt-10">
							<table key={portfolio.name} className="mb-0">
								<tbody>
									{portfolio.data.map((data_item, i) => (
										isEdit ? (
											data_item.random_id ? (
												<tr key={i}>
													<td key={data_item.random_id + '_1'} className="font-source-sans font-size-18l-16m font-weight-600 ptb-10 pl-5">{data_item.symbol}</td>
													<td key={data_item.random_id + '_2'} className={data_item.change < 0 ? "font-source-sans font-size-16l-14s font-weight-600 txt-red ptb-10 pl-5" : "font-source-sans font-size-16l-14s font-weight-600 txt-green ptb-10 pl-5"} align="left">{data_item.price}</td>
													<td key={data_item.random_id + '_3'} className={data_item.change < 0 ? "font-source-sans font-size-16l-14s font-weight-600 txt-red ptb-10 pl-5" : "font-source-sans font-size-16l-14s font-weight-600 txt-green ptb-10 pl-5"} align="left">{data_item.change < 0 ? '' : '+'}{data_item.change}</td>
													<td key={data_item.random_id + '_4'} className={data_item.change < 0 ? "font-source-sans font-size-16l-14s font-weight-600 txt-red ptb-10 pl-5" : "font-source-sans font-size-16l-14s font-weight-600 txt-green ptb-10 pr-5"} align="left">{data_item.change < 0 ? '' : '+'}{data_item.change_percent}%</td>
													<td key={data_item.random_id + '_5'} className="text-center p-5 width-40px">
														<Link onClick={() => handleConfirmToRemovePortfolioSymbol(i)} onTouchEnd={() => handleConfirmToRemovePortfolioSymbol(i)} className="no-underline">
															<span className="button icon small">
																<img src={delete_icon} alt="delete" />
															</span>
														</Link>
													</td>
												</tr>
											) : (
												<tr key={i}>
													<td key={data_item.id + '_1'} colSpan="2" className="ptb-10 pl-5"><input type="text" className="small width-200px uppercase" value={data_item.symbol} name="symbol" onChange={(e) => handleInputChange(e, i)} placeholder="Symbol" /></td>
													<td colSpan="3"></td>
												</tr>
											)
										) : (
											<tr key={i}>
												<td key={data_item.random_id + '_1'} className="font-source-sans font-size-18l-16m font-weight-600 ptb-10 pl-5">{data_item.symbol}</td>
												<td key={data_item.random_id + '_2'} className={data_item.change < 0 ? "font-source-sans font-size-16l-14s font-weight-600 txt-red ptb-10 pl-5" : "font-source-sans font-size-16l-14s font-weight-600 txt-green ptb-10 pl-5"} align="left">{data_item.price}</td>
												<td key={data_item.random_id + '_3'} className={data_item.change < 0 ? "font-source-sans font-size-16l-14s font-weight-600 txt-red ptb-10 pl-5" : "font-source-sans font-size-16l-14s font-weight-600 txt-green ptb-10 pl-5"} align="left">{data_item.change < 0 ? '' : '+'}{data_item.change}</td>
												<td key={data_item.random_id + '_4'} className={data_item.change < 0 ? "font-source-sans font-size-16l-14s font-weight-600 txt-red ptb-10 pl-5" : "font-source-sans font-size-16l-14s font-weight-600 txt-green ptb-10 pr-5"} align="left">{data_item.change < 0 ? '' : '+'}{data_item.change_percent}%</td>
												<td key={data_item.random_id + '_5'} className="text-center p-5 width-40px">
													<Link onClick={() => handleConfirmToRemovePortfolioSymbol(i)} onTouchEnd={() => handleConfirmToRemovePortfolioSymbol(i)} className="no-underline">
														<span className="button icon small">
															<img src={delete_icon} alt="delete" />
														</span>
													</Link>
												</td>
											</tr>
										)
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="large-12 medium-12 small-12 cell">
							{portfolio.name ? (
								portfolio.data.length > 0 ? (
									<></>
								) : (
									<div className="pt-5">
										<span className="font-source-sans font-size-16l-14s font-weight-600element"><img src={arrow_left_90} width="35" alt="note for order" /> Add Symbols</span>
									</div>
								)
							) : (
								<>
									<div className="horizontal-container vertical-center-content pt-5 pr-5">
										<span className="font-source-sans font-size-16l-14s font-weight-600 left">{portfolioMessage}</span>
										<span className="font-source-sans font-size-16l-14s font-weight-600 right">Add Portfolio <img src={arrow_right_90} width="35" alt="note for order" /></span>
									</div>
									<div className="text-center p-20 b1-ccc bg-fafafa mt-20">
										<span className="font-source-sans font-size-16l-14s font-weight-600 txt-333">Data Provided by AlphaVantage API</span>
									</div>
								</>
							)}
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

		</div >
	);
}

export default Portfolio;