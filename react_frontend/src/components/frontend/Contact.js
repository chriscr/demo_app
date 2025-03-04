import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AxiosApiClient from '../utils/AxiosApiClient';
import AuthUtility from './auth/AuthUtility';
import LoadingSpinner from './LoadingSpinner';

import swal from 'sweetalert';

const error_style = 'font-source-sans font-size-12 font-weight-500 txt-000 bg-light-red p-5';

function Contact() {

	const navHistory = useNavigate();

	//for all API calls
	const auth_api = 'phpLaravel';
	if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') !== '') {
		auth_api = localStorage.getItem('auth_api');
	}

	// using hooks
	const [isLoading, setIsLoading] = React.useState(false);
	const [contactInput, setContact] = useState({
		firstName: localStorage.getItem('auth_users_name') ? localStorage.getItem('auth_users_name') : '',
		lastName: '',
		email: localStorage.getItem('auth_email') ? localStorage.getItem('auth_email') : '',
		message: '',
		phone: '',
		errorList: [],
		errorStyle: [],
	});

	const handleInput = (event) => {
		event.persist();

		setContact({ ...contactInput, [event.target.name]: event.target.value });

		//remove the target error message no matter the new input, it will be validated on the server
		if (contactInput.errorList.hasOwnProperty(event.target.name)) {
			delete contactInput.errorList[event.target.name];
			delete contactInput.errorStyle[event.target.name];
		}
	}

	const contactSubmit = (event) => {
		event.preventDefault();

		setIsLoading(true);

		//values sent to api
		const payload = {
			firstName: contactInput.firstName,
			lastName: contactInput.lastName,
			email: contactInput.email,
			phone: contactInput.phone,
			message: contactInput.message,
		}

		const fetchApiData = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('post', '/api/contact', payload, {});

				setApiData(response, "contactSubmit");
			} catch (error) {
				handleApiError(error, "contactSubmit");
			}
		};

		fetchApiData();
	}
	function setApiData(response, theFunction) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

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
				setContact({ ...contactInput, errorList: response.data.validation_errors, errorStyle: errorStyleTemp });

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
						<div className="font-source-sans font-size-18 font-weight-700 underline uppercase">Contact</div>
						<div className="font-source-sans font-size-16l-14s font-weight-500 text-center p-10">Please provide your information.</div>

						<form onSubmit={contactSubmit}>
							<div className="grid-x">
								<div className="large-6 medium-6 small-12 cell text-left pr-5l-0s">
									<div className={contactInput.errorStyle.firstName}>{contactInput.errorList.firstName}</div>
									<div className="input-group">
										<span className="input-group-label"><span className="fas fa-user txt-555"></span></span>
										<input type="text" name="firstName" onChange={handleInput} value={contactInput.firstName} className="input-group-fieldx" placeholder="First Name" />
									</div>
								</div>
								<div className="large-6 medium-6 small-12 cell text-left pl-5l-0s">
									<div className={contactInput.errorStyle.lastName}>{contactInput.errorList.lastName}</div>
									<div className="input-group">
										<span className="input-group-label"><span className="fas fa-user txt-555"></span></span>
										<input type="text" name="lastName" onChange={handleInput} value={contactInput.lastName} className="input-group-field" placeholder="Last Name" />
									</div>
								</div>
								<div className="large-6 medium-6 small-12 cell text-left pr-5l-0s">
									<div className={contactInput.errorStyle.email}>{contactInput.errorList.email}</div>
									<div className="input-group">
										<span className="input-group-label"><span className="fas fa-envelope txt-555"></span></span>
										<input type="text" name="email" onChange={handleInput} value={contactInput.email} className="input-group-field" placeholder="Email" />
									</div>
								</div>
								<div className="large-6 medium-6 small-12 cell text-left pl-5l-0s">
									<div className={contactInput.errorStyle.phone}>{contactInput.errorList.phone}</div>
									<div className="input-group">
										<span className="input-group-label"><span className="fas fa-lock txt-555"></span></span>
										<input type="text" name="phone" onChange={handleInput} value={contactInput.phone} className="input-group-field" placeholder="Phone" />
									</div>
								</div>
								<div className="large-12 medium-12 small-12 cell text-left">
									<div className={contactInput.errorStyle.message}>{contactInput.errorList.message}</div>
									<div className="input-group">
										<textarea name="message" onChange={handleInput} value={contactInput.message} className="input-group-field" placeholder="Message" />
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
											<button type="submit" className="button width-125px-100px">Submit</button>
										</span>
									</div>
								</div>
							</div>
						</form>

					</div>
				</div>
			</div>
		</div>
	);
}

export default Contact;