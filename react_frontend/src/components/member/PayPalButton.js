import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { PayPalButtons, PayPalScriptProvider, FUNDING } from '@paypal/react-paypal-js';

import AxiosApiClient from '../utils/AxiosApiClient';
import AuthUtility from '../frontend/auth/AuthUtility';

import swal from 'sweetalert';

const PayPalButton = ({ subscriptionInfo, onSubscriptionPaymentComplete }) => {

	const navHistory = useNavigate();


	console.log('PayPalButton member:', subscriptionInfo.profile_pay_type);
	console.log('PayPalButton Subscription plan:', subscriptionInfo.payment_paid_plan);
	console.log('PayPalButton Subscription amount:', subscriptionInfo.payment_paid_amount);

	var paypal_client_id;
	var paypal_subscription_plan_id;
	if (process.env.REACT_APP_ENV == 'development') {
		paypal_client_id = process.env.REACT_APP_PAYPAL_CLIENT_ID_DEV;
		if (subscriptionInfo.profile_pay_type == 'payee' && subscriptionInfo.payment_paid_plan == 'monthly') {
			paypal_subscription_plan_id = process.env.REACT_APP_PAYPAL_MONTHLY_SUBSCRIPTION_PLAN_ID_DEV;
		} else if (subscriptionInfo.profile_pay_type == 'payee' && subscriptionInfo.payment_paid_plan == 'yearly') {
			paypal_subscription_plan_id = process.env.REACT_APP_PAYPAL_YEARLY_SUBSCRIPTION_PLAN_ID_DEV;
		} else if (subscriptionInfo.profile_pay_type == 'vip' && subscriptionInfo.payment_paid_plan == 'monthly') {
			paypal_subscription_plan_id = process.env.REACT_APP_PAYPAL_VIP_MONTHLY_SUBSCRIPTION_PLAN_ID_DEV;
		} else if (subscriptionInfo.profile_pay_type == 'vip' && subscriptionInfo.payment_paid_plan == 'yearly') {
			paypal_subscription_plan_id = process.env.REACT_APP_PAYPAL_VIP_YEARLY_SUBSCRIPTION_PLAN_ID_DEV;
		}
	} else if (process.env.REACT_APP_ENV == 'production') {
		paypal_client_id = process.env.REACT_APP_PAYPAL_CLIENT_ID;
		if (subscriptionInfo.profile_pay_type == 'payee' && subscriptionInfo.payment_paid_plan == 'monthly') {
			paypal_subscription_plan_id = process.env.REACT_APP_PAYPAL_MONTHLY_SUBSCRIPTION_PLAN_ID;
		} else if (subscriptionInfo.profile_pay_type == 'payee' && subscriptionInfo.payment_paid_plan == 'yearly') {
			paypal_subscription_plan_id = process.env.REACT_APP_PAYPAL_YEARLY_SUBSCRIPTION_PLAN_ID;
		} else if (subscriptionInfo.profile_pay_type == 'vip' && subscriptionInfo.payment_paid_plan == 'monthly') {
			paypal_subscription_plan_id = process.env.REACT_APP_PAYPAL_VIP_MONTHLY_SUBSCRIPTION_PLAN_ID;
		} else if (subscriptionInfo.profile_pay_type == 'vip' && subscriptionInfo.payment_paid_plan == 'yearly') {
			paypal_subscription_plan_id = process.env.REACT_APP_PAYPAL_VIP_YEARLY_SUBSCRIPTION_PLAN_ID;
		}
	}
	console.log('PayPalButton REACT_APP_ENV:', process.env.REACT_APP_ENV);
	console.log('PayPalButton paypal_client_id:', paypal_client_id);
	console.log('PayPalButton paypal_subscription_plan_id:', paypal_subscription_plan_id);

	function subscriptionPreSubmit() {
		subscriptionSubmit('paypal', 'cr-payment-id-' + subscriptionInfo.profile_pay_type + '-test-' + Math.floor(Date.now() * Math.random()))
	}

	function subscriptionSubmit(vendor, recurring_payment_id) {

		//values sent to api
		const payload = {
			amount: subscriptionInfo.payment_paid_amount,
			plan: subscriptionInfo.payment_paid_plan,
			vendor: vendor,
			recurring_payment_id: recurring_payment_id,
		}

		var auth_api = 'phpLaravel';
		if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') != '') {
			auth_api = localStorage.getItem('auth_api');
		}

		const fetchData = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('post', '/api/subscription_payment', payload, {});

				setApiData(response);
			} catch (error) {
				handleApiError(error);
			}
		};

		fetchData();

	}
	function setApiData(response) {

		if (response && response.data) {

			if (response.data.status === 200) {//HTTP_OK

				if (response.data.payment_paid && response.data.profile && response.data.profile.subscription == "subscribed") {

					AuthUtility.setSubscriptionData(response.data.payment_paid.plan, response.data.payment_paid.start_date, response.data.payment_paid.end_date,
						response.data.payment_paid.status, response.data.profile.subscription);

					const userPaymentData = {
						profile: response.data.profile,
						payment_paid: response.data.payment_paid,
					};

					// Pass the payment data back to the parent component
					onSubscriptionPaymentComplete(userPaymentData);

					//sweet alert on next page
					swal("Success", response.data.message, "success");
					navHistory('../account');
				}

			} else if (response.data.status === 404) {//HTTP_NOT_FOUND

			} else {//more errors
			}
		}
	}
	function handleApiError(error) {
		console.log('subscriptionSubmit error: ', error + ' back-end api call error');
	}

	const initialOptions = {
		//production or sandbox
		"client-id": paypal_client_id,
		"vault": true, // Required for subscription
		"intent": "subscription",
		"currency": "USD"
	};
	return (
		<>
			{process.env.REACT_APP_ENV == 'development' &&
				<div className="panel large pb-20">
					<div className="grid-x p-20 b1-red">
						<div className="large-12 medium-12 small-12 cell">
							<div className="font-source-sans font-weight-600 txt-333 text-center">
								<div className="text-center font-size-16 txt-red">The subscriptions are in test mode on the dev env. There are no $$$ transactions on PayPal. It goes directly into the DB.</div>
								<div className="pt-20">
									<Link onClick={subscriptionPreSubmit} className="button medium width-300px">Subscribe - Test Mode</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			}
			<PayPalScriptProvider options={initialOptions}>
				{/* PayPal Button */}
				<PayPalButtons
					//fundingSource={FUNDING.PAYPAL} // Explicitly set to PayPal
					amount={subscriptionInfo.payment_paid_amount}
					style={{
						shape: 'rect',
						color: 'gold',
						layout: 'vertical',
						label: 'subscribe'
					}}
					createSubscription={(data, actions) => {
						return actions.subscription.create({
							plan_id: paypal_subscription_plan_id, // Replace with your actual plan ID
						});
					}}
					onApprove={(data, actions) => {
						console.log('Subscription completed successfully:', data);

						// Handle post-subscription logic here
						var vendor = data.paymentSource; //paypal
						var recurring_payment_id = data.subscriptionID;

						subscriptionSubmit(vendor, recurring_payment_id);

					}}
					onError={(err) => {
						console.error('Subscription error:', err);
						// Handle subscription error here
					}}
				/>
				{/* Venmo Button 
            <PayPalButtons
                fundingSource={FUNDING.VENMO} // Explicitly set to Venmo
                amount={subscriptionInfo.payment_paid_amount}
                style={{
                    shape: 'rect',
                    color: 'blue',
                    layout: 'vertical',
                    label: 'pay'
                }}
                createSubscription={(data, actions) => {
                    return actions.subscription.create({
                        plan_id: paypal_subscription_plan_id, // Replace with your actual plan ID
                    });
                }}
                onApprove={(data, actions) => {
                    console.log('Venmo Subscription completed successfully:', data);

                    // Handle post-subscription logic here
                    const vendor = data.paymentSource || 'venmo';
                    const recurring_payment_id = data.subscriptionID;

                    subscriptionSubmit(vendor, recurring_payment_id);
                }}
                onError={(err) => {
                    console.error('Venmo Subscription error:', err);
                }}
            />
			*/}
			</PayPalScriptProvider>
		</>
	);
};

export default PayPalButton;
