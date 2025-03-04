import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import AxiosApiClient from '../../utils/AxiosApiClient';
import AuthUtility from './AuthUtility';
import LoadingSpinner from '../LoadingSpinner';

import swal from 'sweetalert';

const error_style = 'font-source-sans font-small font-weight-500 txt-000 bg-light-red p-5';

function Register() {

	const navHistory = useNavigate();

	//for all API calls
	const auth_api = 'phpLaravel';
	if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') !== '') {
		auth_api = localStorage.getItem('auth_api');
	}

	// using hooks
	const [isLoading, setIsLoading] = React.useState(false);
	const [registerInput, setRegister] = useState({
		first_name: "",
		last_name: "",
		email: "",
		password: "",
		//confirmPassword: "",
		terms: "",
		role: "member",
		errorList: [],
		errorStyle: [],
	});

	const handleInput = (event) => {
		event.persist();

		setRegister({ ...registerInput, [event.target.name]: event.target.value });

		//remove the target error message no matter the new input, it will be validated on the server
		if (registerInput.errorList.hasOwnProperty(event.target.name)) {
			delete registerInput.errorList[event.target.name];
			delete registerInput.errorStyle[event.target.name];
		}
	}

	const registerSubmit = (event) => {
		event.preventDefault();

		setIsLoading(true);

		//values sent to api
		const payload = {
			first_name: registerInput.first_name,
			last_name: registerInput.last_name,
			email: registerInput.email,
			password: registerInput.password,
			//confirmPassword: registerInput.confirmPassword,
			terms: registerInput.terms,
			role: registerInput.role,
		}

		const fetchApiData = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('post', '/api/register', payload, {});

				setApiData(response, "registerSubmit");
			} catch (error) {
				handleApiError(error, "registerSubmit");
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
				//sweet alert on next page
				swal("Success", response.data.message, "success");
				navHistory('/');

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
				setRegister({ ...registerInput, errorList: response.data.validation_errors, errorStyle: errorStyleTemp });

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

	const showTermsConditions = (event) => {
		event.preventDefault();

		//Type appropriate comment here, and begin script below
		swal({
			title: 'Terms & Conditions',
			text: 'These are the terms & conditions!',
			html: true,
			icon: 'info',
			showCancelButton: true,
			confirmButtonText: 'Yes, I understand the terms!'
		});
	}

	return (
		<div className="body-content bg-fff pt-70l-110m-50s pb-40">

			<div className="panel medium pt-20l-10s">
				<div className="grid-x bg-fff b1-ddd p-20l-10s">
					<div className="large-12 medium-12 small-12 cell text-center">
						<div className="font-source-sans font-size-18 font-weight-700 uppercase underline uppercase">Register</div>
						<div className="font-source-sans font-size-16l-14s font-weight-500 text-center p-10">Already a member? <Link to="/login" className="font-source-sans font-size-16l-14s font-weight-500">Login</Link></div>

						<form onSubmit={registerSubmit}>
							<div className="grid-x">
								<div className="large-6 medium-6 small-12 cell text-left pr-5l-0s">
									<div className={registerInput.errorStyle.first_name}>{registerInput.errorList.first_name}</div>
									<div className="input-group">
										<span className="input-group-label"><span className="fas fa-user txt-555"></span></span>
										<input type="text" name="first_name" onChange={handleInput} value={registerInput.first_name} className="input-group-field" placeholder="First Name" />
									</div>
								</div>
								<div className="large-6 medium-6 small-12 cell text-left pl-5l-0s">
									<div className={registerInput.errorStyle.last_name}>{registerInput.errorList.last_name}</div>
									<div className="input-group">
										<span className="input-group-label"><span className="fas fa-user txt-555"></span></span>
										<input type="text" name="last_name" onChange={handleInput} value={registerInput.last_name} className="input-group-field" placeholder="Last Name" />
									</div>
								</div>
								<div className="large-6 medium-6 small-12 cell text-left pr-5l-0s">
									<div className={registerInput.errorStyle.email}>{registerInput.errorList.email}</div>
									<div className="input-group">
										<span className="input-group-label"><span className="fas fa-envelope txt-555"></span></span>
										<input type="text" name="email" onChange={handleInput} value={registerInput.email} className="input-group-field" placeholder="Email" />
									</div>
								</div>
								<div className="large-6 medium-6 small-12 cell text-left pl-5l-0s">
									<div className={registerInput.errorStyle.password}>{registerInput.errorList.password}</div>
									<div className="input-group">
										<span className="input-group-label"><span className="fas fa-lock txt-555"></span></span>
										<input type="password" name="password" onChange={handleInput} value={registerInput.password} className="input-group-field" placeholder="Password" />
									</div>
								</div>
								<div className="large-6 medium-6 small-6 cell text-left pr-5l-0s">
									<div className={registerInput.errorStyle.terms}>{registerInput.errorList.terms}</div>
									<input type="checkbox" name="terms" id="terms_a" onChange={handleInput} value="1" />
									<label htmlFor="terms_a" className="checkbox-label"><span className="checkbox"></span><span className="message">&nbsp;&nbsp;&nbsp;<Link to="#" className="font-source-sans font-size-16l-14s font-weight-500" onClick={showTermsConditions}>Terms<span className="hide-for-small-only"> & Conditions</span></Link></span></label>
								</div>
								<div className="large-6 medium-6 small-6 cell text-right pl-5l-0s">
									<div className="horizontal-container float-right">
										{isLoading &&
											<span className="element pr-10">
												<LoadingSpinner paddingClass="none" sizeClass="none" />
											</span>
										}
										<span className="element">
											<button type="submit" className="button width-125px-100px">Register</button>
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

export default Register;