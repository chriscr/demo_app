import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useParams } from 'react-router-dom';

import AxiosApiClient from '../../utils/AxiosApiClient';
import AuthUtility from './AuthUtility';
import LoadingSpinner from '../LoadingSpinner';

//import axios from 'axios';
import swal from 'sweetalert';

function ActivateAccount() {

	const navHistory = useNavigate();

	//for all API calls
	const auth_api = 'phpLaravel';
	if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') !== '') {
		auth_api = localStorage.getItem('auth_api');
	}

	// using hooks
	const [isLoading, setIsLoading] = React.useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const [isActivated, setIsActivated] = useState(false);
	const [accountNavPath, setAccountNavPath] = useState('');

	const { id } = useParams();

	//initial call to activate account
	useEffect(() => {

		setIsLoading(true);

		if (isMounted) {

			const fetchApiData = async () => {
				try {
					const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
					await getBearerToken();
					const response = await makeRequestWithHeaders('put', '/api/activate_account/' + id, null, {});

					setApiData(response, "ActivateAccount.useEffect");
				} catch (error) {
					handleApiError(error, "ActivateAccount.useEffect");
				}
			};
			fetchApiData();

		} else {
			setIsMounted(true);
		}

	}, [isMounted, id, navHistory]);

	function setApiData(response, theFunction) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				AuthUtility.setAuthData(response.data.auth_first_name, response.data.auth_last_name, response.data.auth_email,
					response.data.auth_token, response.data.auth_role, response.data.auth_paypal_email, null, null);

				if (localStorage.getItem('auth_role') === 'member') {
					setAccountNavPath('/member/account');

					swal("Success", "Your Account has been successfully activated", "success");

				} else if (localStorage.getItem('auth_role') === 'admin') {
					setAccountNavPath('/admin/dashboard');
				}

				setIsActivated(true);

			} else if (response.data.status === 401 || response.data.status === 404) {//HTTP_UNAUTHORIZED OR HTTP_NOT_FOUND
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();

				setIsLoading(false);
				swal("Warning", response.data.message + ' Can not activate account. Please click on the link in your email after registering.', "warning");
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
		<div className="body-content bg-fff pt-70l-110m-50s pb-100">

			<div className="panel large pt-20l-10s">
				<div className="grid-x">
					<div className="large-12 medium-12 small-12 cell text-left">
						<div className="font-source-sans font-size-20 font-weight-800 txt-dark-blue bb1-dark-blue uppercase pb-5">Activate Account</div>
					</div>
				</div>
			</div>

			{isLoading ? (
				<LoadingSpinner paddingClass="pt-10" />
			) : (

				<div className="panel large pt-20l-10s">
					{isActivated &&
						<div className="grid-x bg-fafafa b1-ccc p-20l-10s">
							<div className="large-12 medium-12 small-12 cell text-left">
								<table className="unstriped unbordered mb-0">
									<tbody>
										<tr><td className="font-source-sans font-size-16l-14s font-weight-400 width-100px pb-20">Name:</td><td className="font-source-sans font-size-16l-14s font-weight-600 pb-20">{localStorage.getItem('auth_first_name') + ' ' + localStorage.getItem('auth_last_name')}</td></tr>
										<tr><td className="font-source-sans font-size-16l-14s font-weight-400 width-100px pb-20">Email:</td><td className="font-source-sans font-size-16l-14s font-weight-600 pb-20">{localStorage.getItem('auth_email')}</td></tr>
										<tr><td className="font-source-sans font-size-16l-14s font-weight-400 width-100px pb-20">Role:</td><td className="font-source-sans font-size-16l-14s font-weight-600 pb-20">{localStorage.getItem('auth_role')}</td></tr>
										<tr><td className="font-source-sans font-size-16l-14s font-weight-400 width-100px" valign="top">Status:</td><td className="font-source-sans font-size-16l-14s font-weight-600" valign="top">active</td></tr>
									</tbody>
								</table>
								<div className="text-center pt-40">
									<Link to={accountNavPath} className="button">Member Account</Link>
								</div>
							</div>
						</div>
					}
				</div>
			)}

		</div>
	);
}

export default ActivateAccount;