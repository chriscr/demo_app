import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OffCanvas, OffCanvasMenu, OffCanvasBody } from "react-offcanvas";

import AxiosApiClient from '../../components/utils/AxiosApiClient';
import AuthUtility from '../../components/frontend/auth/AuthUtility';
import LoadingSpinner from '../../components/frontend/LoadingSpinner';
import Copyright from './Copyright';

import swal from 'sweetalert';

import close_icon from '../../assets/frontend/images/close_icon_black.png';

const OffCanvasNav = () => {

	//logout should be its own component
	const navHistory = useNavigate();

	//for all API calls
	const auth_api = 'phpLaravel';
	if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') !== '') {
		auth_api = localStorage.getItem('auth_api');
	}

	// using hooks
	const [isLoading, setIsLoading] = useState(false);
	const [isNavOpen, setIsNavOpen] = useState(false);
	const [isHomeOpen, setIsHomeOpen] = useState(false);
	const [isDashboardOpen, setIsDashboardOpen] = useState(false);
	const [isUserProfileSettingsOpen, setIsUserProfileSettingsOpen] = useState(false);

	//check if clicked target is not within the offcanvasnav
	const mobileIconRef = useRef();
	const navRef = useRef();
	const closeNavRef = useRef();

	useEffect(() => {
		const handleClickOutside = (event) => {

			// add event listener to close menu when clicked outside		
			if (navRef.current && !navRef.current.contains(event.target)) {
				setIsNavOpen(false);
			}

			//open nav with mobile icon click which is in the div id=navigation
			if (!isNavOpen && mobileIconRef.current && mobileIconRef.current.contains(event.target) && mobileIconRef.current.id === 'mobile_icon') {
				setIsNavOpen(true);
			}
		}

		//get and set nav and menu states
		if (localStorage.getItem('auth_role')) {
			if (localStorage.getItem('is_home_open') && (localStorage.getItem('is_home_open') === true || localStorage.getItem('is_home_open') === 'true')) {
				setIsHomeOpen(true);
			} else {
				localStorage.setItem('is_home_open', false);
				setIsHomeOpen(false);
			}
			if (localStorage.getItem('is_dashboard_open') && (localStorage.getItem('is_dashboard_open') === true || localStorage.getItem('is_dashboard_open') === 'true')) {
				setIsDashboardOpen(true);
			} else {
				localStorage.setItem('is_dashboard_open', false);
				setIsDashboardOpen(false);
			}
			if (localStorage.getItem('is_user_profile_settings_open') && (localStorage.getItem('is_user_profile_settings_open') === true || localStorage.getItem('is_user_profile_settings_open') === 'true')) {
				setIsUserProfileSettingsOpen(true);
			} else {
				localStorage.setItem('is_user_profile_settings_open', false);
				setIsUserProfileSettingsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside)

		return () => {
			// Cleanup the event listener
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [isNavOpen]);

	const toggleNav = (event) => {
		event.preventDefault();

		if (localStorage.getItem('auth_role')) {
			console.log('is_home_open: ' + localStorage.getItem('is_home_open'));
			console.log('is_dashboard_open: ' + localStorage.getItem('is_dashboard_open'));
			console.log('is_user_profile_settings_open: ' + localStorage.getItem('is_user_profile_settings_open'));

			//get and set nav and menu states
			if (localStorage.getItem('is_home_open') && (localStorage.getItem('is_home_open') === true || localStorage.getItem('is_home_open') === 'true')) {
				setIsHomeOpen(true);
			} else {
				localStorage.setItem('is_home_open', false);
				setIsHomeOpen(false);
			}
			if (localStorage.getItem('is_dashboard_open') && (localStorage.getItem('is_dashboard_open') === true || localStorage.getItem('is_dashboard_open') === 'true')) {
				setIsDashboardOpen(true);
			} else {
				localStorage.setItem('is_dashboard_open', false);
				setIsDashboardOpen(false);
			}
			if (localStorage.getItem('is_user_profile_settings_open') && (localStorage.getItem('is_user_profile_settings_open') === true || localStorage.getItem('is_user_profile_settings_open') === 'true')) {
				setIsUserProfileSettingsOpen(true);
			} else {
				localStorage.setItem('is_user_profile_settings_open', false);
				setIsUserProfileSettingsOpen(false);
			}
		}

		setIsNavOpen(!isNavOpen);
	}

	const toggleMenuItem = (event) => {
		event.stopPropagation();

		if (localStorage.getItem('auth_role')) {
			if (event.target.id === 'home') {
				localStorage.setItem('is_home_open', !isHomeOpen);
				setIsHomeOpen(!isHomeOpen);
			} else if (event.target.id === 'dashboard') {
				localStorage.setItem('is_dashboard_open', !isDashboardOpen);
				setIsDashboardOpen(!isDashboardOpen);
			} else if (event.target.id === 'user_profile_settings') {
				localStorage.setItem('is_user_profile_settings_open', !isUserProfileSettingsOpen);
				setIsUserProfileSettingsOpen(!isUserProfileSettingsOpen);
			}
		}
	};

	const handleMenuLinkItemClick = (event) => {
		event.stopPropagation();

		// close menu when submenu link item is clicked
		setIsNavOpen(false);

		// get the "to" attribute value from the clicked link
		const toAttribute = event.currentTarget.getAttribute('to');
		console.log('toAttribute: ' + toAttribute);
		// get the "href"" value from the clicked link
		const hrefValue = event.currentTarget.attributes.href.value;
		console.log('hrefValue: ' + hrefValue);

		if (toAttribute) {
			// navigate to the next view using the dynamically obtained "to" value
			navHistory(toAttribute);
		} else if (hrefValue) {
			// navigate to the next view using the dynamically obtained "to" value
			navHistory(hrefValue);
		} else {
			// handle the case when "to" attribute is not present
			console.error('Error: "to" attribute not found on the clicked link');
		}
	};

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

	var WebsiteLinks = '';
	var DashboardLinks = '';
	var RoleLinks = '';
	var RoleAccountLink = '';
	var RoleSettingsLink = '';

	var submenuLinkPadding = (
		<span className="pl-25"></span>
	);

	if (AuthUtility.isLoggedIn()) {

		if (localStorage.getItem('auth_role') === 'member') {
			RoleDashboardLink = '/member/dashboard';
			RoleAccountLink = '/member/profile';
			RoleSettingsLink = '/member/settings';

			DashboardLinks = (
				<ul className="menu-mobile-nav pt-5">
					<li className={isDashboardOpen ? 'submenu-active' : ''}><Link id="dashboard" className="uppercase" onClick={toggleMenuItem} onTouchEnd={toggleMenuItem}>Dashboard</Link>
						<ul className="submenu-mobile-nav">
							<li><Link to="/member/check_list" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Check List</Link></li>
							<li><Link to="/member/portfolio" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Portfolio</Link></li>
							<li><Link to="/member/location_finder" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Location</Link></li>
							<li><Link to="/member/weather" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Weather</Link></li>
							<li><Link to="/member/videos" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Videos</Link></li>
							<li><Link to="/member/payments" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Payments</Link></li>
						</ul>
					</li>
				</ul>
			);
		} else if (localStorage.getItem('auth_role') === 'admin') {
			RoleDashboardLink = '/admin/dashboard';
			RoleAccountLink = '/admin/profile';
			RoleSettingsLink = '/admin/settings';

			DashboardLinks = (
				<ul className="menu-mobile-nav pt-5">
					<li className={isDashboardOpen ? 'submenu-active' : ''}><Link id="dashboard" className="uppercase" onClick={toggleMenuItem} onTouchEnd={toggleMenuItem}>Dashboard</Link>
						<ul className="submenu-mobile-nav">
							<li><Link to="/admin/users" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Users</Link></li>
							<li><Link to="/admin/check_list" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Check List</Link></li>
							<li><Link to="/admin/portfolio" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Portfolio</Link></li>
							<li><Link to="/admin/location_finder" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Location</Link></li>
							<li><Link to="/admin/weather" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Weather</Link></li>
							<li><Link to="/admin/videos" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Videos</Link></li>
							<li><Link to="/admin/payments" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Payments</Link></li>
						</ul>
					</li>
				</ul>
			);
		}

		RoleLinks = (
			<ul className="menu-mobile-nav">
				<li className={isUserProfileSettingsOpen ? 'submenu-active' : ''}><Link id="user_profile_settings" className="uppercase" onClick={toggleMenuItem} onTouchEnd={toggleMenuItem}>{localStorage.getItem('auth_name')}</Link>
					<ul className="submenu-mobile-nav">
						<li><Link to={RoleAccountLink} className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Account</Link></li>
						<li><Link to={RoleSettingsLink} className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Settings</Link></li>
						<li><Link className="uppercase" onClick={logoutSubmit} onTouchEnd={logoutSubmit}>{submenuLinkPadding}Logout</Link></li>
					</ul>
				</li>
			</ul>
		);

		Navigation = (
			<ul className="menu-mobile-nav pt-5">
				<li className={isHomeOpen ? 'submenu-active' : ''}><Link id="home" className="uppercase" onClick={toggleMenuItem} onTouchEnd={toggleMenuItem}>Website</Link>
					<ul className="submenu-mobile-nav">
						<li><Link to="/" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Home</Link></li>
						<li><Link to="/about" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}About</Link></li>
						<li><Link to="/contact" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Contact</Link></li>
						<li><Link to="/help" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Help</Link></li>
						<li><Link to="/technical_highlights" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Technical</Link></li>
						<li><Link to="/instructions" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>{submenuLinkPadding}Instructions</Link></li>
					</ul>
				</li>
			</ul>
		);
	} else {
		Navigation = (
			<ul className="menu-mobile-nav guest">
				<li><Link to="/login" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>Login</Link></li>
				<li><Link to="/register" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>Register</Link></li>
				<li><Link to="/" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>Home</Link></li>
				<li><Link to="/about" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>About</Link></li>
				<li><Link to="/contact" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>Contact</Link></li>
				<li><Link to="/help" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>Help</Link></li>
				<li><Link to="/technical_highlights" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>Technical</Link></li>
				<li><Link to="/instructions" className="uppercase" onClick={handleMenuLinkItemClick} onTouchEnd={handleMenuLinkItemClick}>Instructions</Link></li>
			</ul>
		);
	}

	return (
		<OffCanvas width={200} transitionDuration={300} effect={"parallax"} isMenuOpened={isNavOpen} position={"right"}>
			<OffCanvasBody>
				<div id="mobile_icon" className="horizontal-container float-right" ref={mobileIconRef}>
					<button className="button mobile-icon right" type="button" onClick={toggleNav} onTouchEnd={toggleNav}>
						<div className="hamburger-mobile-nav">
							<span className="bar"></span>
							<span className="bar"></span>
							<span className="bar"></span>
						</div>
					</button>
				</div>
			</OffCanvasBody>
			<OffCanvasMenu>
				<div id="mobile_nav" className="bg-fafafa bl1-ccc" ref={navRef}>

					<div className="panel">
						<div className="grid-x p-10">
							<div className="large-10 medium-10 small-9 cell text-center">
								{isLoading &&
									<span className="element"><LoadingSpinner paddingClass="none" sizeClass="small" /></span>
								}
							</div>
							<div className="large-2 medium-2 small-3 cell text-right">
								<Link to="#" className="button icon text-center" onClick={toggleNav} onTouchEnd={toggleNav} ref={closeNavRef}>
									<img src={close_icon} className="" width="40" alt="add new check list" />
								</Link>
							</div>
						</div>
					</div>

					<div className="plr-10 pb-5">
						{RoleLinks}
						{DashboardLinks}
						{Navigation}
					</div>
					<Copyright />
				</div>
			</OffCanvasMenu>
		</OffCanvas>
	);

}

export default OffCanvasNav;