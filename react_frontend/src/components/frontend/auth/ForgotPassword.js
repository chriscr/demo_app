import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import AxiosApiClient from '../../utils/AxiosApiClient';
import AuthUtility from './AuthUtility';
import LoadingSpinner from '../LoadingSpinner';

import swal from 'sweetalert';

const error_style = 'font-source-sans font-small font-weight-500 txt-000 bg-light-red p-5';

function ForgotPassword() {

	const navHistory = useNavigate();

	//for all API calls
	const auth_api = 'phpLaravel';
	if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') !== '') {
		auth_api = localStorage.getItem('auth_api');
	}

	// using hooks
	const [isLoading, setIsLoading] = React.useState(false);
	const [forgotPasswordInput, setForgotPassword] = useState({
		email: '',
		errorList: [],
		errorStyle: [],
	});

	const handleInput = (event) => {
		event.persist();

		setForgotPassword({ ...forgotPasswordInput, [event.target.name]: event.target.value });

		//remove the target error message no matter the new input, it will be validated on the server
		if (forgotPasswordInput.errorList.hasOwnProperty(event.target.name)) {
			delete forgotPasswordInput.errorList[event.target.name];
			delete forgotPasswordInput.errorStyle[event.target.name];
		}
	}

	const forgotPasswordSubmit = (event) => {
		event.preventDefault();

		setIsLoading(true);

		//values sent to api
		const payload = {
			email: forgotPasswordInput.email,
		}

		const fetchApiData = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('post', '/api/forgot_password', payload, {});

				setApiData(response, "forgotPasswordSubmit");
			} catch (error) {
				handleApiError(error, "forgotPasswordSubmit");
			}
		};

		fetchApiData();
	}
	function setApiData(response, theFunction) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction+': ', response.data.message);

				localStorage.removeItem('password');

				swal("Success", response.data.message, "success");
				navHistory('/login');

			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction+' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
				swal("Warning", response.data.message, "warning");
			} else if (response.data.status === 404) {//HTTP_NOT_FOUND
				setForgotPassword({ ...forgotPasswordInput, errorList: { email: [response.data.message] }, errorStyle: { email: [error_style] } });
			} else if (response.data.status === 800) {//HTTP_FORM_VALIDATION_FAILED
				console.log(theFunction+': ', response.data.message + ' HTTP_FORM_VALIDATION_FAILED');

				var errorStyleTemp = JSON.parse(JSON.stringify(response.data.validation_errors));
				Object.keys(errorStyleTemp).map((key) => (
					errorStyleTemp[key] = error_style
				));

				//validation errors mapped to input fields
				setForgotPassword({ ...forgotPasswordInput, errorList: response.data.validation_errors, errorStyle: errorStyleTemp });

			} else {//more errors
			}
		}

		setIsLoading(false);
	}
	function handleApiError(error, theFunction) {
		console.log(theFunction+' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	return (
		<div className="body-content bg-fff pt-70l-110m-50s pb-40">

			<div className="panel small pt-20l-10s">
				<div className="grid-x bg-fff b1-ddd p-20l-10s">
					<div className="large-12 medium-12 small-12 cell text-center">
						<div className="font-source-sans font-size-18 font-weight-700 underline uppercase">Password Assistance</div>
						<div className="font-source-sans font-size-16l-14s font-weight-500 text-center p-10">Not registered with us yet? <Link to="/register" className="font-source-sans font-size-16 font-weight-500">Register</Link></div>

						<div id="sign_in_info_and_error" className="font-source-sans font-size-16 text-center ptb-10 hide"></div>

						<form onSubmit={forgotPasswordSubmit}>
							<div className="grid-x">
								<div className="large-12 medium-12 small-12 cell text-left">
									<div className={forgotPasswordInput.errorStyle.email}>{forgotPasswordInput.errorList.email}</div>
									<div className="input-group">
										<span className="input-group-label"><span className="fas fa-envelope txt-555"></span></span>
										<input type="text" name="email" onChange={handleInput} value={forgotPasswordInput.email} className="input-group-field" placeholder="name@example.com" />
									</div>
								</div>
								<div className="large-12 medium-12 small-12 cell text-right">
									<button type="submit" className="button width-125px-100px">Submit</button>
								</div>
							</div>
							<div className="grid-x pt-20">
								<div className="large-12 medium-12 small-12 cell text-center bg-fafafa p-10 br-5">
									<Link to="/login" className="font-source-sans font-size-16 font-weight-500">Have an account? Login!</Link>
								</div>
							</div>
						</form>

					</div>
				</div>
				{isLoading &&
					<LoadingSpinner paddingClass="pt-10" />
				}
			</div>

		</div>
	);
}

export default ForgotPassword;