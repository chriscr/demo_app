import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import AxiosApiClient from '../../components/utils/AxiosApiClient';
import AuthUtility from '../frontend/auth/AuthUtility';
import LoadingSpinner from '../frontend/LoadingSpinner';

import swal from 'sweetalert';
import $ from 'jquery'; // Import jQuery

const error_style = 'font-source-sans font-size-16l-14s font-weight-400 bg-light-red p-3';

function PaymentManager() {

	const navHistory = useNavigate();

	//for all API calls
	const auth_api = 'phpLaravel';
	if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') !== '') {
		auth_api = localStorage.getItem('auth_api');
	}

	// using hooks
	const [isLoading, setIsLoading] = React.useState(false);
	const [paymentInput, setPaymentInput] = useState({
		title: '',
		amount: '',
		paypal_details: [],
		errorList: [],
		errorStyle: [],
	});
	const [showPaypalButtons, setShowPaypalButtons] = React.useState(false);

	const handleInput = (event) => {
		event.persist();

		setPaymentInput({ ...paymentInput, [event.target.name]: event.target.value });

		if (paymentInput.amount === null || paymentInput.amount === '' || paymentInput.amount <= 0) {
			setShowPaypalButtons(false);
		}

		//remove the target error message no matter the new input, it will be validated on the server
		if (paymentInput.errorList.hasOwnProperty(event.target.name)) {
			delete paymentInput.errorList[event.target.name];
			delete paymentInput.errorStyle[event.target.name];
		}
	}

	const handleCancel = (event) => {
		event.persist();

		navHistory('/member/payments');
	}

	const paymentSubmit = (event) => {
		event.persist();

		//validation errors mapped to input fields
		var validationErrors = [];
		var errorStyleTemp = [];
		if (paymentInput.title === null || paymentInput.title === '') {
			validationErrors["title"] = "Missing Title";
			errorStyleTemp["title"] = error_style
		}
		if (paymentInput.amount === null || paymentInput.amount === '' || paymentInput.amount <= 0) {
			validationErrors["amount"] = "Missing or Invalid Amount";
			errorStyleTemp["amount"] = error_style
		}

		if (validationErrors["title"] || validationErrors["amount"]) {
			setPaymentInput({ ...paymentInput, errorList: validationErrors, errorStyle: errorStyleTemp });
		} else {
			setShowPaypalButtons(true);
		}
	}

	const createOrder = (data, actions) => {
		return actions.order.create({
			purchase_units: [
				{
					amount: {
						value: paymentInput.amount,
						currency_code: 'USD',
					},
					payee: {
						email_address: 'sb-wduwx29178237@personal.example.com',
					},
					reference_id: 'sandbox account',
				}
			],
			application_context: {
				brand_name: 'Demo App',
			},
		});
	};

	const onApprove = (data, actions) => {
		return actions.order.capture().then((paypal_details) => {
			console.log('PaymentManager.onApprove: Paypal Approve');

			// Handle successful split payment
			setPaymentInput({ ...paymentInput, paypal_details: paypal_details });

			setTimeout(() => {
				savePayment(paypal_details);
			}, 250);

		});
	};

	function savePayment(paypal_details) {
		if (!AuthUtility.isLoggedIn()) {
			//user not authenticated on server so remove from local storage
			AuthUtility.clearAuthData();
			navHistory('/');
		}

		var payment_title = paymentInput.title;
		if (paymentInput.title === '' || paymentInput.title === null || paymentInput.title === undefined) {
			payment_title = 'Paypal Test Payment';
		}

		setIsLoading(true);

		//values sent to api
		const payload = {
			title: payment_title,
			amount: paymentInput.amount,
			paypal_transaction_id: paypal_details.id,
			paypal_transaction_intent: paypal_details.intent,
			paypal_transaction_status: paypal_details.status,
			paypal_transaction_payer_email: paypal_details.payer.email_address,
			paypal_transaction_payer_name: paypal_details.payer.name.given_name + ' ' + paypal_details.payer.name.surname,
		}

		const fetchApiDataSavePayment = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('post', '/api/save_payment', payload, {});

				setApiDataSavePayment(response, "PaymentManager.savePayment");
			} catch (error) {
				handleApiErrorSavePayment(error, "PaymentManager.savePayment");
			}
		};

		fetchApiDataSavePayment();

	}

	function setApiDataSavePayment(response, theFunction) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				navHistory('/member/payments');

			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
				navHistory('/login');
			} else if (response.data.status === 404) {//HTTP_NOT_FOUND
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				swal("Warning", response.data.message, "warning");
			} else if (response.data.status === 422) {//HTTP_UNPROCESSABLE_ENTITY
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				swal("Warning", response.data.message, "warning");
			} else if (response.data.status === 800) {//HTTP_FORM_VALIDATION_FAILED
				console.log(theFunction + ': ', response.data.message + ' HTTP_FORM_VALIDATION_FAILED');

				var errorStyleTemp = JSON.parse(JSON.stringify(response.data.validation_errors));
				Object.keys(errorStyleTemp).map((key) => (
					errorStyleTemp[key] = error_style
				));

				//validation errors mapped to input fields
				setPaymentInput({ ...paymentInput, errorList: response.data.validation_errors, errorStyle: errorStyleTemp });
			} else {//more errors
			}
		}

		setIsLoading(false);
	}
	function handleApiErrorSavePayment(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	return (
		<div className="body-content bg-fff pt-70l-110m-50s pb-40">

			<div className="panel large pt-20l-10s">
				<div className="grid-x">
					<div className="large-12 medium-12 small-12 cell text-left">
						<div className="font-source-sans font-size-20 font-weight-800 txt-dark-blue bb1-dark-blue uppercase pb-5">Payments - Add</div>
					</div>
				</div>
			</div>

			<div className="panel large pt-20l-10s">
				<div className="grid-x">
					<div className="large-12 medium-12 small-12 cell bg-fafafa b1-ccc p-10 ">
						<div className="font-source-sans font-size-18l-16m-14s font-weight-800 left">Instructions:</div>
						<div className="font-source-sans font-size-16l-14s font-weight-500 line-height-150per justify pt-10">
							The payment feature uses the Paypal Sandbox environment for testing purposes, so no real money is exchanging hands.
							Enter a payment title and amount then hit submit to trigger the Paypal Options. Select a payment option, either a Paypal Test Account (email & password) or a Test Credit Card.
						</div>
						<div className="font-source-sans font-size-16l-14s font-weight-500 line-height-150per pt-20">
							<span className="font-weight-600 underline">Paypal Test Account Credentials</span>
							<br />
							email:&nbsp;&nbsp;<span className="font-weight-600">sb-owtag29278995@personal.example.com</span>
							<br />
							password:&nbsp;&nbsp;<span className="font-weight-600">pppw1234</span>
						</div>
						<div className="font-source-sans font-size-16l-14s font-weight-500 line-height-150per pt-20">
							<span className="font-weight-600 underline">Test Credit Card</span>
							<br />
							CC #:&nbsp;&nbsp;<span className="font-weight-600">4032033002522956</span>
							<br />
							expires:&nbsp;&nbsp;<span className="font-weight-600">01/2029</span>
							<br />
							Any csv, name, and address can be provided.
						</div>
					</div>
					<div className="large-12 medium-12 small-12 cell bg-fafafa b1-ccc p-10 mt-20l-10s">
						<div className="grid-x">
							<div className="large-6 medium-6 small-12 cell text-left pt-10 pr-5l-0s">
								<div className="font-source-sans font-size-16l-14s font-weight-400 pb-5">Title <span className={paymentInput.errorStyle.title}>{paymentInput.errorList.title}</span></div>
								<input type="text" name="title" onChange={handleInput} value={paymentInput.title} />
							</div>
							<div className="large-6 medium-6 small-12 cell text-left pt-10 pl-5l-0s">
								<div className="font-source-sans font-size-16l-14s font-weight-400 pb-5">Amount ($) <span className={paymentInput.errorStyle.amount}>{paymentInput.errorList.amount}</span></div>
								<input type="number" step="any" name="amount" onChange={handleInput} value={paymentInput.amount} />
							</div>
							<div className="large-6 medium-6 small-6 cell text-left pt-20">
								<button onClick={handleCancel} className="button width-125px-100px">Cancel</button>
							</div>
							<div className="large-6 medium-6 small-6 cell text-right pt-20">
								<div className="horizontal-container float-right">
									{isLoading &&
										<span className="element pr-10">
											<LoadingSpinner paddingClass="none" sizeClass="none" />
										</span>
									}
									<span className="element">
										<button type="submit" onClick={paymentSubmit} className="button width-125px-100px">Submit</button>
									</span>
								</div>
							</div>
						</div>
					</div>
					{showPaypalButtons === true ? (
						<div className="large-12 medium-12 small-12 cell float-center pt-20">
							<PayPalScriptProvider
								options={{
									'client-id': process.env.REACT_APP_PAYPAL_CLIENT_ID_DEV,
								}}
							>
								<PayPalButtons
									style={{ layout: 'vertical' }}
									createOrder={createOrder}
									onApprove={onApprove}
								/>
							</PayPalScriptProvider>
						</div>
					) : (
						<></>
					)}

				</div>
			</div>
		</div >
	);
}

export default PaymentManager;