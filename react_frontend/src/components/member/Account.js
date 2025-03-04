import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AxiosApiClient from '../../components/utils/AxiosApiClient';
import AuthUtility from '../frontend/auth/AuthUtility';
import LoadingSpinner from '../frontend/LoadingSpinner';

import swal from 'sweetalert';

import edit_icon from '../../assets/frontend/images/edit_icon.png';
import logout_icon from '../../assets/frontend/images/logout_icon.png';

function Account() {

	const navHistory = useNavigate();

	//for all API calls
	const auth_api = 'phpLaravel';
	if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') !== '') {
		auth_api = localStorage.getItem('auth_api');
	}

	// using hooks
	const [isLoading, setIsLoading] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	// Initial call for user list items
	useEffect(() => {

		if (!AuthUtility.isLoggedIn()) {
			//user not authenticated on server so remove from local storage
			AuthUtility.clearAuthData()
			navHistory('/');
		}

		if (isMounted) {
			console.log('[Account - useEffect] mounted');
		} else {
			setIsMounted(true);
		}

	}, [isMounted]);

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
		<div className="body-content bg-fff pt-70l-110m-50s pb-40">
		
			<div className="panel large pt-20l-10s">
				<div className="grid-x">
					<div className="large-12 medium-12 small-12 cell text-left">
						<div className="font-source-sans font-size-20 font-weight-800 txt-dark-blue bb1-dark-blue uppercase pb-5">Account</div>
					</div>
					{isLoading &&
						<div className="large-12 medium-12 small-12 cell text-center pt-20">
							<LoadingSpinner paddingClass="none" sizeClass="none" />
						</div>
					}
				</div>
			</div>

			<div className="panel large pt-20l-10s">
				<div className="grid-x bg-fafafa b1-ccc p-20l-10s">

					<div className="large-6 medium-6 small-6 cell text-left">
						<div className="font-source-sans font-size-18 font-weight-700 underline uppercase">Profile</div>
					</div>

					<div className="large-6 medium-6 small-6 cell text-right">
						{/*
						<Link to={localStorage.getItem('auth_role') + "/profile"} className="button icon"><img src={edit_icon} alt="profile" /></Link>
						*/}
					</div>

					<div className="large-12 medium-12 small-12 cell text-left pt-20l-10s">
						<table className="unstriped unbordered mb-0">
							<tbody>
								<tr><td className="font-source-sans font-size-16l-14s font-weight-400 width-100px pb-20">Name:</td><td className="font-source-sans font-size-16l-14s font-weight-600 pb-20">{localStorage.getItem('auth_first_name') + ' ' + localStorage.getItem('auth_last_name')}</td></tr>
								<tr><td className="font-source-sans font-size-16l-14s font-weight-400 width-100px pb-20">Email:</td><td className="font-source-sans font-size-16l-14s font-weight-600 pb-20">{localStorage.getItem('auth_email')}</td></tr>
								<tr><td className="font-source-sans font-size-16l-14s font-weight-400 width-100px pb-20">Role:</td><td className="font-source-sans font-size-16l-14s font-weight-600 pb-20">{localStorage.getItem('auth_role')}</td></tr>
								<tr><td className="font-source-sans font-size-16l-14s font-weight-400 width-100px">Password:</td><td className="font-source-sans font-size-16l-14s font-weight-600 ">********</td></tr>
							</tbody>
						</table>
					</div>

				</div>
			</div>

			<div className="panel large pt-20l-10s">
				<div className="grid-x bg-fafafa b1-ccc p-20l-10s">

					<div className="large-6 medium-6 small-6 cell text-left">
						<div className="font-source-sans font-size-18 font-weight-700 underline uppercase">Logout</div>
					</div>

					<div className="large-6 medium-6 small-6 cell text-right">
						<Link onClick={logoutSubmit} className="button icon"><img src={logout_icon} alt="logout" /></Link>
					</div>

				</div>
			</div>

		</div>
	);
}

export default Account;