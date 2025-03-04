import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AxiosApiClient from '../../components/utils/AxiosApiClient';
import AuthUtility from '../../components/frontend/auth/AuthUtility';

import OffCanvasNav from './OffCanvasNav';

import swal from 'sweetalert';

import logo from '../../assets/frontend/images/demo_logo.png';

const OnCanvasHeader = () => {

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

	var RoleDashboardLink = '';
	var RoleAccountLink = '';
	var RoleSettingsLink = '';
	var DashboardLinks = '';
	var Navigation = '';

	if (AuthUtility.isLoggedIn()) {

		RoleAccountLink = '/' + localStorage.getItem('auth_role') + '/profile';
		if (localStorage.getItem('auth_role') === 'member') {
			RoleDashboardLink = '/member/dashboard';
			RoleAccountLink = '/member/account';
			RoleSettingsLink = '/member/settings';
		} else if (localStorage.getItem('auth_role') === 'admin') {
			RoleDashboardLink = '/admin/dashboard';
			RoleAccountLink = '/admin/account';
			RoleSettingsLink = '/admin/settings';
		}

		DashboardLinks = (
			<ul>
				<li className="menu2"><Link to={"/" + localStorage.getItem('auth_role') + "/check_list"} className="font-source-sans font-size-14 font-weight-500 uppercase">Check List</Link></li>
				<li className="menu2"><Link to={"/" + localStorage.getItem('auth_role') + "/portfolio"} className="font-source-sans font-size-14 font-weight-500 uppercase">Portfolio</Link></li>
				<li className="menu2"><Link to={"/" + localStorage.getItem('auth_role') + "/search"} className="font-source-sans font-size-14 font-weight-500 uppercase">Search</Link></li>
				<li className="menu2"><Link to={"/" + localStorage.getItem('auth_role') + "/weather"} className="font-source-sans font-size-14 font-weight-500 uppercase">Weather</Link></li>
				<li className="menu2"><Link to={"/" + localStorage.getItem('auth_role') + "/videos"} className="font-source-sans font-size-14 font-weight-500 uppercase">Videos</Link></li>
				<li className="menu2"><Link to={"/" + localStorage.getItem('auth_role') + "/payments"} className="font-source-sans font-size-14 font-weight-500 uppercase">Payments</Link></li>
			</ul>
		);

		Navigation = (
			<nav className="nav horizontal-container float-right">
				<ul className="element">
					<li className="dropdown text-center">
						<Link to="/home" className="menu1 font-source-sans font-size-14 font-weight-500 uppercase">Home</Link>
						<ul>
							<li className="menu1"><Link to="/about" className="menu1 font-source-sans font-size-14 font-weight-500 uppercase">About</Link></li>
							<li className="menu1"><Link to="/contact" className="menu1 font-source-sans font-size-14 font-weight-500 uppercase">Contact</Link></li>
							<li className="menu1"><Link to="/help" className="menu1 font-source-sans font-size-14 font-weight-500 uppercase">Help</Link></li>
							<li className="menu1"><Link to="/technical_highlights" className="home font-source-sans font-size-14 font-weight-500 uppercase">Technical</Link></li>
							<li className="menu1"><Link to="/instructions" className="home font-source-sans font-size-14 font-weight-500 uppercase">Instructions</Link></li>
						</ul>
					</li>
					<li className="dropdown text-center">
						<Link to={RoleDashboardLink} className="menu2 font-source-sans font-size-14 font-weight-500 uppercase">Dashboard</Link>
						{DashboardLinks}
					</li>
					<li className="dropdown text-center">
						<Link to={RoleAccountLink} className="menu3 font-source-sans font-size-14 font-weight-500 uppercase">{localStorage.getItem('auth_name')}</Link>
						<ul>
							<li className="menu3"><Link to={RoleAccountLink} className="menu3 font-source-sans font-size-14 font-weight-500 uppercase">Account</Link></li>
							<li className="menu3"><Link to={RoleSettingsLink} className="menu3 font-source-sans font-size-14 font-weight-500 uppercase">Settings</Link></li>
							<li className="menu3"><Link to="#" className="menu3 font-source-sans font-size-14 font-weight-500 uppercase" onClick={logoutSubmit}>Logout</Link></li>
						</ul>
					</li>
				</ul>
			</nav>
		);
	} else {

		Navigation = (
			<nav className="nav horizontal-container float-right">
				<ul className="element">
					<li className="dropdown text-center">
						<Link to="/login" className="menu1 font-source-sans font-size-14 font-weight-500 uppercase">Login</Link>
					</li>
					<li className="dropdown text-center">
						<Link to="/register" className="menu1 font-source-sans font-size-14 font-weight-500 uppercase">Register</Link>
					</li>
					<li className="dropdown text-center">
						<Link to="/home" className="menu1 font-source-sans font-size-14 font-weight-500 uppercase">Home</Link>
						<ul>
							<li className="menu1"><Link to="/about" className="menu1 font-source-sans font-size-14 font-weight-500 uppercase">About</Link></li>
							<li className="menu1"><Link to="/contact" className="menu1 font-source-sans font-size-14 font-weight-500 uppercase">Contact</Link></li>
							<li className="menu1"><Link to="/help" className="menu1 font-source-sans font-size-14 font-weight-500 uppercase">Help</Link></li>
							<li className="menu1"><Link to="/technical_highlights" className="home font-source-sans font-size-14 font-weight-500 uppercase">Technical</Link></li>
							<li className="menu1"><Link to="/instructions" className="home font-source-sans font-size-14 font-weight-500 uppercase">Instructions</Link></li>
						</ul>
					</li>
				</ul>
			</nav>
		);
	}

	return (
		<div className="sticky-top z-index-1000">
			<div className="sticky bg-fafafa bb1-ddd plr-20l-10sz">

				<div className="panel large">

					<div id="nav_bar" className="nav-bar">
						<div className="nav-bar-left">
							<Link to="/" className="hover-opacity-50 hide-for-small-only">
								<div className="horizontal-container float-left">
									<span className="element">
										<img src={logo} alt="logo" width="50" />
									</span>
									<span className="text-left pl-10 left">
										<div className="font-source-sans font-size-24 font-weight-800 txt-dark-blue uppercase pt-7">DEMO APP</div>
										<div className="font-source-sans font-size-16 font-weight-600 txt-dark-blue letter-spacing-1px pt-10">By C. Romero</div>
									</span>
								</div>
							</Link>
							<Link to="/" className="hover-opacity-50 show-for-small-only">
								<div className="horizontal-container float-left">
									<span className="element">
										<img src={logo} alt="logo" width="40" />
									</span>
									<span className="text-left pl-10 left">
										<div className="font-source-sans font-size-20 font-weight-800 txt-dark-blue uppercase pt-5">DEMO APP</div>
										<div className="font-source-sans font-size-14 font-weight-600 txt-dark-blue letter-spacing-1px pt-5">By C. Romero</div>
									</span>
								</div>
							</Link>
						</div>
						<div className="nav-bar-right hide-for-small-only">
							{Navigation}
						</div>
						<div className="nav-bar-right show-for-small-only">
							<OffCanvasNav />
						</div>
					</div>
				</div>

			</div>
		</div>
	);
}

export default OnCanvasHeader;