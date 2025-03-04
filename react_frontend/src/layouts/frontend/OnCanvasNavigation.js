import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AxiosApiClient from '../../components/utils/AxiosApiClient';
import AuthUtility from '../../components/frontend/auth/AuthUtility';

import swal from 'sweetalert';

import home_icon from '../../assets/frontend/images/home_icon.png';
import check_list_icon from '../../assets/frontend/images/check_list_icon.png';
import portfolio_icon from '../../assets/frontend/images/portfolio_icon.png';
import location_finder_icon from '../../assets/frontend/images/location_finder_icon.png';
import weather_icon from '../../assets/frontend/images/weather_icon.png';
import videos_icon from '../../assets/frontend/images/videos_icon.png';
import payments_icon from '../../assets/frontend/images/payments_icon.png';
import account_icon from '../../assets/frontend/images/account_icon.png';

const OnCanvasNavigation = () => {

	//logout should be its own component
	const navHistory = useNavigate();

	//for all API calls
	const auth_api = 'phpLaravel';
	if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') !== '') {
		auth_api = localStorage.getItem('auth_api');
	}

	// using hooks
	const [isLoading, setIsLoading] = useState(false);

	const logoutSubmit = (event) => {
		event.preventDefault();

		setIsLoading(true);

		const fetchApiData = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('get', '/api/logout', null, {});

				setApiData(response, "logoutSubmit");
			} catch (error) {
				handleApiError(error, "logoutSubmit");
			}
		};

		fetchApiData();
	}
	function setApiData(response, theFunction) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();

				//redirect to home page
				navHistory('/');

			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();

				swal("Warning", response.data.message, "warning");

				navHistory('/login');

			} else {//more errors
			}
		}

		setIsLoading(false);
	}
	function handleApiError(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
		navHistory('/login');
	}

	return (
		<div className="sticky-bottom z-index-1010">
			<div className="sticky bg-eee bt1-ddd plr-20l-10sz ptb-10l-5s">

				<div className="panel large">
					<div className="horizontal-container center">
						<div className="element mlr-20l-10m-5s">
							<Link to="/home" className="button icon-sticky-bottom image-container no-underline">
								<div className="hide-for-small-only">
									<div className="hide-for-780px">
										<img src={home_icon} alt="add icon" width="38" className="pb-5" />
										<div className="font-source-sans font-size-12 font-weight-600 letter-spacing-0px uppercase">Home</div>
									</div>
									<div className="show-for-780px">
										<img src={home_icon} alt="add icon" width="36" className="pb-5" />
										<div className="font-source-sans font-size-12 font-weight-600 letter-spacing-0px uppercase">Home</div>
									</div>
								</div>
								<div className="show-for-small-only">
									<div className="hide-for-520px">
										<img src={home_icon} alt="add icon" width="30" className="pb-5" />
										<div className="font-source-sans font-size-11 font-weight-600 letter-spacing-0px uppercase">Home</div>
									</div>
									<div className="show-for-520px">
										<img src={home_icon} alt="add icon" width="30" className="pb-5" />
										<div className="font-source-sans font-size-11 font-weight-600 letter-spacing-0px uppercase">Home</div>
									</div>
								</div>
							</Link>
						</div>
						<div className="element mlr-20l-10m-5s">
							<Link to="/member/check_list" className="button icon-sticky-bottom image-container no-underline">
								<div className="hide-for-small-only">
									<div className="hide-for-780px">
										<img src={check_list_icon} alt="check_list_icon" width="38" className="pb-5" />
										<div className="font-source-sans font-size-12 font-weight-600 letter-spacing-0px uppercase">Lists</div>
									</div>
									<div className="show-for-780px">
										<img src={check_list_icon} alt="add icon" width="36" className="pb-5" />
										<div className="font-source-sans font-size-12 font-weight-600 letter-spacing-0px uppercase">Lists</div>
									</div>
								</div>
								<div className="show-for-small-only">
									<div className="hide-for-520px">
										<img src={check_list_icon} alt="check_list_icon" width="30" className="pb-5" />
										<div className="font-source-sans font-size-11 font-weight-600 letter-spacing-0px uppercase">Lists</div>
									</div>
									<div className="show-for-520px">
										<img src={check_list_icon} alt="check_list_icon" width="30" className="pb-5" />
										<div className="font-source-sans font-size-11 font-weight-600 letter-spacing-0px uppercase">Lists</div>
									</div>
								</div>
							</Link>
						</div>
						<div className="element mlr-20l-10m-5s">
							<Link to="/member/portfolio" className="button icon-sticky-bottom image-container no-underline">
								<div className="hide-for-small-only">
									<div className="hide-for-780px">
										<img src={portfolio_icon} alt="portfolio_icon" width="38" className="pb-5" />
										<div className="font-source-sans font-size-12 font-weight-600 letter-spacing-0px uppercase">Port</div>
									</div>
									<div className="show-for-780px">
										<img src={portfolio_icon} alt="add icon" width="36" className="pb-5" />
										<div className="font-source-sans font-size-12 font-weight-600 letter-spacing-0px uppercase">Port</div>
									</div>
								</div>
								<div className="show-for-small-only">
									<div className="hide-for-520px">
										<img src={portfolio_icon} alt="portfolio_icon" width="30" className="pb-5" />
										<div className="font-source-sans font-size-11 font-weight-600 letter-spacing-0px uppercase">Port</div>
									</div>
									<div className="show-for-520px">
										<img src={portfolio_icon} alt="portfolio_icon" width="30" className="pb-5" />
										<div className="font-source-sans font-size-11 font-weight-600 letter-spacing-0px uppercase">Port</div>
									</div>
								</div>
							</Link>
						</div>
						<div className="element mlr-20l-10m-5s">
							<Link to="/member/location_finder" className="button icon-sticky-bottom image-container no-underline">
								<div className="hide-for-small-only">
									<div className="hide-for-780px">
										<img src={location_finder_icon} alt="location_finder_icon" width="38" className="pb-5" />
										<div className="font-source-sans font-size-12 font-weight-600 letter-spacing-0px uppercase">Location</div>
									</div>
									<div className="show-for-780px">
										<img src={location_finder_icon} alt="add icon" width="36" className="pb-5" />
										<div className="font-source-sans font-size-12 font-weight-600 letter-spacing-0px uppercase">Location</div>
									</div>
								</div>
								<div className="show-for-small-only">
									<div className="hide-for-520px">
										<img src={location_finder_icon} alt="location_finder_icon" width="30" className="pb-5" />
										<div className="font-source-sans font-size-11 font-weight-600 letter-spacing-0px uppercase">Loc</div>
									</div>
									<div className="show-for-520px">
										<img src={location_finder_icon} alt="location_finder_icon" width="30" className="pb-5" />
										<div className="font-source-sans font-size-11 font-weight-600 letter-spacing-0px uppercase">Loc</div>
									</div>
								</div>
							</Link>
						</div>
						<div className="element mlr-20l-10m-5s">
							<Link to="/member/weather" className="button icon-sticky-bottom image-container no-underline">
								<div className="hide-for-small-only">
									<div className="hide-for-780px">
										<img src={weather_icon} alt="weather_icon" width="38" className="pb-5" />
										<div className="font-source-sans font-size-12 font-weight-600 letter-spacing-0px uppercase">Weather</div>
									</div>
									<div className="show-for-780px">
										<img src={weather_icon} alt="add icon" width="36" className="pb-5" />
										<div className="font-source-sans font-size-12 font-weight-600 letter-spacing-0px uppercase">Weather</div>
									</div>
								</div>
								<div className="show-for-small-only">
									<div className="hide-for-520px">
										<img src={weather_icon} alt="weather_icon" width="30" className="pb-5" />
										<div className="font-source-sans font-size-11 font-weight-600 letter-spacing-0px uppercase">Wea</div>
									</div>
									<div className="show-for-520px">
										<img src={weather_icon} alt="weather_icon" width="30" className="pb-5" />
										<div className="font-source-sans font-size-11 font-weight-600 letter-spacing-0px uppercase">Wea</div>
									</div>
								</div>
							</Link>
						</div>
						<div className="element mlr-20l-10m-5s">
							<Link to="/member/videos" className="button icon-sticky-bottom image-container no-underline">
								<div className="hide-for-small-only">
									<div className="hide-for-780px">
										<img src={videos_icon} alt="videos_icon" width="38" className="pb-5" />
										<div className="font-source-sans font-size-12 font-weight-600 letter-spacing-0px uppercase">Videos</div>
									</div>
									<div className="show-for-780px">
										<img src={videos_icon} alt="add icon" width="36" className="pb-5" />
										<div className="font-source-sans font-size-12 font-weight-600 letter-spacing-0px uppercase">Videos</div>
									</div>
								</div>
								<div className="show-for-small-only">
									<div className="hide-for-520px">
										<img src={videos_icon} alt="videos_icon" width="30" className="pb-5" />
										<div className="font-source-sans font-size-11 font-weight-600 letter-spacing-0px uppercase">Videos</div>
									</div>
									<div className="show-for-520px">
										<img src={videos_icon} alt="videos_icon" width="30" className="pb-5" />
										<div className="font-source-sans font-size-11 font-weight-600 letter-spacing-0px uppercase">Vids</div>
									</div>
								</div>
							</Link>
						</div>
						<div className="element mlr-20l-10m-5s">
							<Link to="/member/payments" className="button icon-sticky-bottom image-container no-underline">
								<div className="hide-for-small-only">
									<div className="hide-for-780px">
										<img src={payments_icon} alt="payments_icon" width="38" className="pb-5" />
										<div className="font-source-sans font-size-12 font-weight-600 letter-spacing-0px uppercase">Payments</div>
									</div>
									<div className="show-for-780px">
										<img src={payments_icon} alt="add icon" width="36" className="pb-5" />
										<div className="font-source-sans font-size-12 font-weight-600 letter-spacing-0px uppercase">Pay</div>
									</div>
								</div>
								<div className="show-for-small-only">
									<div className="hide-for-520px">
										<img src={payments_icon} alt="payments_icon" width="30" className="pb-5" />
										<div className="font-source-sans font-size-11 font-weight-600 letter-spacing-0px uppercase">Pay</div>
									</div>
									<div className="show-for-520px">
										<img src={payments_icon} alt="payments_icon" width="30" className="pb-5" />
										<div className="font-source-sans font-size-11 font-weight-600 letter-spacing-0px uppercase">Pay</div>
									</div>
								</div>
							</Link>
						</div>
						<div className="element mlr-20l-10m-5s">
							<Link to="/member/account" className="button icon-sticky-bottom image-container no-underline">
								<div className="hide-for-small-only">
									<div className="hide-for-780px">
										<img src={account_icon} alt="account_icon" width="38" className="pb-5" />
										<div className="font-source-sans font-size-12 font-weight-600 letter-spacing-0px uppercase">Acct</div>
									</div>
									<div className="show-for-780px">
										<img src={account_icon} alt="add icon" width="36" className="pb-5" />
										<div className="font-source-sans font-size-12 font-weight-600 letter-spacing-0px uppercase">Acct</div>
									</div>
								</div>
								<div className="show-for-small-only">
									<div className="hide-for-520px">
										<img src={account_icon} alt="account_icon" width="30" className="pb-5" />
										<div className="font-source-sans font-size-11 font-weight-600 letter-spacing-0px uppercase">Acct</div>
									</div>
									<div className="show-for-520px">
										<img src={account_icon} alt="account_icon" width="30" className="pb-5" />
										<div className="font-source-sans font-size-11 font-weight-600 letter-spacing-0px uppercase">Acct</div>
									</div>
								</div>
							</Link>
						</div>

					</div>
				</div>

			</div>
		</div>
	);
}

export default OnCanvasNavigation;