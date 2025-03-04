import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useParams } from 'react-router-dom';

import AxiosApiClient from '../../utils/AxiosApiClient';
import AuthUtility from './AuthUtility';
import LoadingSpinner from '../LoadingSpinner';

import swal from 'sweetalert';

const error_style = 'font-source-sans font-small font-weight-500 txt-000 bg-light-red p-5';

function ResetPassword() {

	const navHistory = useNavigate();

	//for all API calls
	const auth_api = 'phpLaravel';
	if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') !== '') {
		auth_api = localStorage.getItem('auth_api');
	}

	// using hooks
	const [isLoading, setIsLoading] = React.useState(false);
	const [resetPasswordInput, setResetPassword] = useState({
		password: '',
		errorList: [],
		errorStyle: [],
	});

	const { id, email } = useParams();

	const handleInput = (event) => {
		event.persist();

		setResetPassword({ ...resetPasswordInput, [event.target.name]: event.target.value });

		//remove the target error message no matter the new input, it will be validated on the server
		if (resetPasswordInput.errorList.hasOwnProperty(event.target.name)) {
			delete resetPasswordInput.errorList[event.target.name];
			delete resetPasswordInput.errorStyle[event.target.name];
		}
	}

	const resetPasswordSubmit = (event) => {
		event.preventDefault();

		setIsLoading(true);

		//values sent to api
		const payload = {
			email: email,
			password: resetPasswordInput.password,
			random_id: id,
		}

		const fetchApiData = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('put', '/api/reset_password', payload, {});

				setApiData(response, "resetPasswordSubmit");
			} catch (error) {
				handleApiError(error, "resetPasswordSubmit");
			}
		};

		fetchApiData();

	}
	function setApiData(response, theFunction) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				if (localStorage.getItem('remember_me') === 'true') {
					localStorage.setItem('password', resetPasswordInput.password);
				}

				swal("Success", response.data.message + ' Please login.', "success");
				navHistory('/login');

			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
				swal("Warning", response.data.message, "warning");
			} else if (response.data.status === 404) {//HTTP_NOT_FOUND
				swal("Warning", response.data.message + ' Can not reset the password. Please click on the link in your email with the subject "Reset Password with FAST AI".', "warning");
			} else if (response.data.status === 800) {//HTTP_FORM_VALIDATION_FAILED
				console.log(theFunction + ': ', response.data.message + ' HTTP_FORM_VALIDATION_FAILED');

				var errorStyleTemp = JSON.parse(JSON.stringify(response.data.validation_errors));
				Object.keys(errorStyleTemp).map((key) => (
					errorStyleTemp[key] = error_style
				));

				//validation errors mapped to input fields
				setResetPassword({ ...resetPasswordInput, errorList: response.data.validation_errors, errorStyle: errorStyleTemp });

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

	return (
		<div className="body-content bg-fff pt-70l-110m-50s pb-40">

			<div className="panel medium pt-20l-10s">
				<div className="grid-x bg-fff b1-ddd p-20l-10s">
					<div className="large-12 medium-12 small-12 cell text-center">
						<div className="font-source-sans font-size-18 font-weight-700 letter-spacing-1px underline uppercase">Reset Password</div>
						<div className="font-source-sans font-size-16l-14s font-weight-500 text-center p-10">Not registered with us yet? <Link to="/register" className="font-source-sans page-text font-weight-600">Register</Link></div>

						<div id="sign_in_info_and_error" className="font-source-sans font-medium text-center ptb-10 hide"></div>

						<form onSubmit={resetPasswordSubmit}>
							<div className="grid-x">
								<div className="large-6 medium-6 small-12 cell text-left pr-5l-0s">
									<div className="input-group">
										<span className="input-group-label"><span className="fas fa-envelope txt-555"></span></span>
										<input type="text" name="email" value={email} className="input-group-field" placeholder="Email" disabled />
									</div>
								</div>
								<div className="large-6 medium-6 small-12 cell text-left pl-5l-0s">
									<div className={resetPasswordInput.errorStyle.password}>{resetPasswordInput.errorList.password}</div>
									<div className="input-group">
										<span className="input-group-label"><span className="fas fa-lock txt-555"></span></span>
										<input type="password" name="password" onChange={handleInput} value={resetPasswordInput.password} className="input-group-field" placeholder="Reset Password" />
									</div>
								</div>
								<div className="large-12 medium-12 small-12 cell text-right">
									<div className="horizontal-container float-right">
										{isLoading &&
											<span className="element pr-10">
												<LoadingSpinner paddingClass="none" sizeClass="none" />
											</span>
										}
										<span className="element">
											<button type="submit" className="button width-125px-100px">Reset</button>
										</span>
									</div>
								</div>
							</div>
							<div className="grid-x pt-20">
								<div className="large-12 medium-12 small-12 cell text-center bg-fafafa p-20 br-5">
									<Link to="/login" className="font-source-sans page-text font-weight-600">Have an account? Login!</Link>
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

export default ResetPassword;