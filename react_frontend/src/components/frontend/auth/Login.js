import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import AxiosApiClient from '../../utils/AxiosApiClient';
import AuthUtility from './AuthUtility';
import LoadingSpinner from '../LoadingSpinner';

import swal from 'sweetalert';

const error_style = 'font-source-sans font-size-12 font-weight-500 txt-000 bg-light-red p-5';

function Login() {

	const navHistory = useNavigate();

	//for all API calls
	const auth_api = 'phpLaravel';
	if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') !== '') {
		auth_api = localStorage.getItem('auth_api');
	}

	// using hooks
	const [isLoading, setIsLoading] = React.useState(false);
	const [loginInput, setLogin] = useState({
		email: localStorage.getItem('auth_email') ? localStorage.getItem('auth_email') : '',
		password: localStorage.getItem('password') ? localStorage.getItem('password') : '',
		errorList: [],
		errorStyle: [],
	});

	const [isChecked, setIsChecked] = useState(localStorage.getItem('remember_me') && localStorage.getItem('remember_me') === 'true' ? true : false);

	const handleInput = (event) => {
		event.persist();

		if (event.target.name !== 'rememberMe') {
			setLogin({ ...loginInput, [event.target.name]: event.target.value });
		}

		//remove the target error message no matter the new input, it will be validated on the server
		if (loginInput.errorList.hasOwnProperty(event.target.name)) {
			delete loginInput.errorList[event.target.name];
			delete loginInput.errorStyle[event.target.name];
		}
	}

	const loginSubmit = (event) => {
		event.preventDefault();

		setIsLoading(true);

		//values sent to api
		const payload = {
			email: loginInput.email,
			password: loginInput.password,
		}

		const fetchApiData = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('post', '/api/login', payload, {});

				setApiData(response, "loginSubmit");
			} catch (error) {
				handleApiError(error, "loginSubmit");
			}
		};

		fetchApiData();
	}
	function setApiData(response, theFunction) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				AuthUtility.setAuthData(response.data.auth_first_name, response.data.auth_last_name, response.data.auth_email,
					response.data.auth_token, response.data.auth_role, response.data.auth_paypal_email, loginInput.password, isChecked);

				//redirect to proper dashboard based on role
				if (response.data.auth_role === 'admin') {
					console.log(theFunction + ': redirecting to /admin/account');
					navHistory('/admin/account');
				} else if (response.data.auth_role === 'member') {
					console.log(theFunction + ': redirecting to /member/account');
					navHistory('/member/account');
				} else {
					navHistory('/');
				}

			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
				swal("Warning", response.data.message, "warning");
			} else if (response.data.status === 800) {//HTTP_FORM_VALIDATION_FAILED
				console.log(theFunction + ': ', response.data.message + ' HTTP_FORM_VALIDATION_FAILED');

				var errorStyleTemp = JSON.parse(JSON.stringify(response.data.validation_errors));
				Object.keys(errorStyleTemp).map((key) => (
					errorStyleTemp[key] = error_style
				));

				//validation errors mapped to input fields
				setLogin({ ...loginInput, errorList: response.data.validation_errors, errorStyle: errorStyleTemp });

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
	}

	const handleCheckboxChange = (event) => {
		const { checked } = event.target;
		setIsChecked(checked);
		localStorage.setItem('remember_me', checked);
	};

	return (
		<div className="body-content bg-fff pt-70l-110m-50s pb-40">

			<div className="panel medium pt-20l-10s">
				<div className="grid-x bg-fff b1-ddd p-20l-10s">
					<div className="large-12 medium-12 small-12 cell text-center">
						<div className="font-source-sans font-size-18 font-weight-700 uppercase underline uppercase">Login</div>
						<div className="font-source-sans font-size-16l-14s font-weight-500 text-center p-10">Not registered with us yet? <Link to="/register" className="font-source-sans font-size-16l-14s font-weight-500">Register</Link></div>

						<div id="sign_in_info_and_error" className="font-source-sans font-size-16l-14s text-center ptb-10 hide"></div>

						<form onSubmit={loginSubmit}>
							<div className="grid-x">
								<div className="large-6 medium-6 small-12 cell text-left pr-5l-0s">
									<div className={loginInput.errorStyle.email}>{loginInput.errorList.email}</div>
									<div className="input-group">
										<span className="input-group-label"><span className="fas fa-envelope txt-555"></span></span>
										<input type="text" name="email" onChange={handleInput} value={loginInput.email} className="input-group-field" placeholder="name@example.com" />
									</div>
								</div>
								<div className="large-6 medium-6 small-12 cell text-left pl-5l-0s">
									<div className={loginInput.errorStyle.password}>{loginInput.errorList.password}</div>
									<div className="input-group">
										<span className="input-group-label"><span className="fas fa-lock txt-555"></span></span>
										<input type="password" name="password" onChange={handleInput} value={loginInput.password} className="input-group-field" placeholder="Enter Password" />
									</div>
								</div>
								<div className="large-6 medium-6 small-7 cell text-left">
									<input type="checkbox" name="rememberMe" id="remember_me" value="1" checked={isChecked} onChange={handleCheckboxChange} />
									<label htmlFor="remember_me" className="checkbox-label"><span className="checkbox"></span><span className="message font-source-sans font-mesize-16dium font-weight-500">&nbsp;&nbsp;&nbsp;Remember<span className="hide-for-small-only"> Me</span></span></label>
								</div>
								<div className="large-6 medium-6 small-5 cell text-right">
									<div className="horizontal-container float-right">
										{isLoading &&
											<span className="element pr-10">
												<LoadingSpinner paddingClass="none" sizeClass="none" />
											</span>
										}
										<span className="element">
											<button type="submit" className="button width-125px-100px">Login</button>
										</span>
									</div>
								</div>
							</div>
							<div className="grid-x pt-20">
								<div className="large-12 medium-12 small-12 cell text-center bg-fafafa p-10 br-5">
									<Link to="/forgot_password" className="font-source-sans font-size-16l-14s font-weight-500">Forgot Password?</Link>
								</div>
							</div>
						</form>

					</div>
				</div>
			</div>

		</div>
	);
}

export default Login;
