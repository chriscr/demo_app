import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AxiosApiClient from '../../components/utils/AxiosApiClient';
import AuthUtility from '../frontend/auth/AuthUtility';
import LoadingSpinner from '../frontend/LoadingSpinner';

import swal from 'sweetalert';
import $ from 'jquery'; // Import jQuery

import payments_icon from '../../assets/frontend/images/payments_icon.png';
import arrow_right_90 from '../../assets/frontend/images/arrow_right_90.png';

const per_page = 10;

function Payments() {

	const navHistory = useNavigate();

	//for all API calls
	const auth_api = 'phpLaravel';
	if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') !== '') {
		auth_api = localStorage.getItem('auth_api');
	}

	// Initial states
	const [isLoading, setIsLoading] = useState(true);
	const [isMounted, setIsMounted] = useState(false);
	const [payments, setPayments] = useState([
		//{ id: '', title: "", amount: "", gateway: "", trx_id: "", trx_intent: "", trx_status: "", trx_payer_eamil: "", trx_payer_name: "", random_id: "", created: "", updated: "" },
	]);
	const [paymentsMessage, setPaymentsMessage] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [lastPage, setLastPage] = useState(1);
	const [nextPage, setNextPage] = useState(null);
	const [prevPage, setPrevPage] = useState(null);

	// Initial call for payments
	useEffect(() => {
		if (!AuthUtility.isLoggedIn()) {
			//user not authenticated on server so remove from local storage
			AuthUtility.clearAuthData();
			navHistory('/');
		}

		if (isMounted) {
			console.log('Payments.useEffect: mounted');

			var page = 1;
			readPayments(page);

		} else {
			setIsMounted(true);
		}

	}, [isMounted]);

	function readPayments(page) {
		if (!AuthUtility.isLoggedIn()) {
			//user not authenticated on server so remove from local storage
			AuthUtility.clearAuthData();
			navHistory('/');
		}

		setIsLoading(true);

		const fetchApiDataReadPayments = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('get', '/api/read_payments', null, {
					params: {
						per_page: per_page, // Set your preferred number of items per page
						page: page, // Specify the page number you want to fetch
					}
				});

				setApiDataReadPayments(response, "Payments.useEffect");
			} catch (error) {
				handleApiErrorReadPayments(error, "Payments.useEffect");
			}
		};
		fetchApiDataReadPayments();
	}

	function setApiDataReadPayments(response, theFunction) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//set data
				if (response.data.payments && response.data.payments.length > 0) {
					setPayments(response.data.payments);
					setCurrentPage(response.data.pagination_data.current_page);
					setLastPage(response.data.pagination_data.last_page);
					setNextPage(response.data.pagination_data.next_page);
					setPrevPage(response.data.pagination_data.prev_page);
					setPaymentsMessage('');
				} else {
					setPayments([]);
					setCurrentPage(null);
					setLastPage(null);
					setNextPage(null);
					setPrevPage(null);
					setPaymentsMessage('No Payments Exist');
				}

			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
				navHistory('/login');
			} else if (response.data.status === 404) {//HTTP_NOT_FOUND
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//set data
				if (response.data.payments && response.data.payments.length > 0) {
					setPayments(response.data.payments);
					setCurrentPage(response.data.pagination_data.current_page);
					setLastPage(response.data.pagination_data.last_page);
					setNextPage(response.data.pagination_data.next_page);
					setPrevPage(response.data.pagination_data.prev_page);
					setPaymentsMessage('');
				} else {
					setPayments([]);
					setCurrentPage(null);
					setLastPage(null);
					setNextPage(null);
					setPrevPage(null);
					setPaymentsMessage('No Payments Exist');
				}
			} else if (response.data.status === 422) {//HTTP_UNPROCESSABLE_ENTITY
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//set data
				if (response.data.payments && response.data.payments.length > 0) {
					setPayments(response.data.payments);
					setCurrentPage(response.data.pagination_data.current_page);
					setLastPage(response.data.pagination_data.last_page);
					setNextPage(response.data.pagination_data.next_page);
					setPrevPage(response.data.pagination_data.prev_page);
					setPaymentsMessage('');
				} else {
					setPayments([]);
					setCurrentPage(null);
					setLastPage(null);
					setNextPage(null);
					setPrevPage(null);
					setPaymentsMessage('No Payments Exist');
				}
			} else if (response.data.status === 800) {//HTTP_FORM_VALIDATION_FAILED
				console.log(theFunction + ': ', response.data.message + ' HTTP_FORM_VALIDATION_FAILED');
			} else {//more errors
			}
		}

		setIsLoading(false);
	}
	function handleApiErrorReadPayments(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	const handleConfirmToRemovePayment = (i) => {
		const list = [...payments];

		swal({
			title: 'Delete Payment',
			text: 'This will delete payment ' + list[i]['title'] + '.',
			icon: "warning",
			buttons: {
				cancel: true,
				confirm: {
					text: "Delete Payment",
					value: true,
				},
			},
			showCancelButton: true,
			confirmButtonText: "Yes, delete it!"
		}).then((result) => {
			if (result) {
				handleRemovePayment(i);
			}
		});
	};

	// Delete row of id:i
	const handleRemovePayment = (i) => {
		const list = [...payments];

		// If the user confirms, proceed with the deletion
		if (list[i]['random_id'] && list[i]['random_id'] !== '') {
			deletePayment(list[i]['random_id']);//send a specific unique ID to delete
		}
	};

	function deletePayment(payment_random_id) {

		setIsLoading(true);

		const fetchApiDataDeletePayment = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('delete', '/api/delete_payment/' + payment_random_id, null, {});

				setApiDataDeletePayment(response, "Payments.deletePayment", payment_random_id);
			} catch (error) {
				handleApiErrorDeletePayment(error, "Payments.deletePayment");
			}
		};

		fetchApiDataDeletePayment();
	}
	function setApiDataDeletePayment(response, theFunction, payment_random_id) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//update state properties
				if (response.data.payments && response.data.payments.length > 0) {
					setPayments(response.data.payments);
				} else {
					setPayments([]);
				}

				swal("Deleted!", "Payment has been deleted.", "success");
			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
				swal("Warning", response.data.message, "warning");
				navHistory('/login');
			} else if (response.data.status === 422) {//HTTP_UNPROCESSABLE_ENTITY
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				swal("Warning", response.data.message, "warning");
			} else {//more errors
			}
		}

		setIsLoading(false);
	}
	function handleApiErrorDeletePayment(error, theFunction) {
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
					<div className="large-11 medium-11 small-10 cell text-left">
						<div className="font-source-sans font-size-20 font-weight-800 txt-dark-blue bb1-dark-blue uppercase pb-5">Payments</div>
					</div>
					<div className="large-1 medium-1 small-2 cell text-right">
						<Link to="/member/payment_manager" className="hover-opacity-50">
							<img src={payments_icon} width="40" alt="add payment" />
						</Link>
					</div>
				</div>
			</div>

			<div className="panel large mt-10">

				{payments.length > 0 ? (
					<div className="b1-ccc">
						<div className="grid-x bg-ddd">
							<div className="large-5 medium-7 small-8 cell p-5 text-left">
								<div className="font-source-sans font-size-16l-14s font-weight-600 txt-000">Payment</div>
							</div>
							<div className="large-3 medium-2 small-2 cell p-5 text-center">
								<div className="font-source-sans font-size-16l-14s font-weight-600 txt-000">Details</div>
							</div>
							<div className="large-4 medium-3 small-2 cell p-5 text-center">
								<div className="font-source-sans font-size-16l-14s font-weight-600 txt-000">Transaction</div>
							</div>
						</div>
						{payments.map((payment, i) => (
							<div className="grid-x">
								<div key={'no_edit_1a_' + payment.id + payment.random_id} className={i % 2 === 0 ? 'large-5 medium-7 small-8 cell bg-fff p-5 text-left' : 'large-5 medium-7 small-8 cell bg-eee p-5 text-left'}>
									<div className="font-source-sans font-size-16l-14s font-weight-600" valign="top">{payment.title}</div>
									<div className="font-source-sans font-size-16l-14s font-weight-500 pt-3" valign="top">{payment.trx_payer_name}</div>
									<div className="font-source-sans font-size-16l-14s font-weight-500 pt-3" valign="top">{payment.trx_payer_email}</div>
								</div>
								<div key={'no_edit_5_' + payment.id + payment.random_id} className={i % 2 === 0 ? 'large-3 medium-2 small-2 cell bg-fff p-5 text-center' : 'large-3 medium-2 small-2 cell bg-eee p-5 text-center'}>
									<div className="font-source-sans font-size-16l-14s font-weight-600" valign="top">${payment.amount}</div>
									<div className="font-source-sans font-size-16l-14s font-weight-500 pt-3" valign="top">{convertDateTimeToText(payment.created_at)}</div>
									<div className="font-source-sans font-size-16l-14s font-weight-500 pt-3" valign="top">{payment.gateway}</div>
								</div>
								<div key={'no_edit_6_' + payment.id + payment.random_id} className={i % 2 === 0 ? 'large-4 medium-3 small-2 cell bg-fff p-5 text-center' : 'large-4 medium-3 small-2 cell bg-eee p-5 text-center'}>
									<div className="font-source-sans font-size-16l-14s font-weight-500" valign="top"><span className="hide-for-small-only">{payment.trx_id}</span><span className="show-for-small-only">{shortenSomeString(payment.trx_id)}</span></div>
									<div className="font-source-sans font-size-16l-14s font-weight-500 pt-3" valign="top">{payment.trx_intent}</div>
									<div className="font-source-sans font-size-16l-14s font-weight-500 pt-3" valign="top">{payment.trx_status}</div>
								</div>
							</div>
						))}
						{/* Pagination links */}
						{lastPage > 1 && (
							<div className="grid-x">
								<div id="payments_pagination" className="large-12 medium-12 small-12 cell pt-10">
									<ul className="pagination">
										{prevPage && (
											<li className="page-item">
												<Link className="page-link" onClick={() => readPayments(currentPage - 1)}>Previous</Link>
											</li>
										)}

										{[...Array(lastPage).keys()].map(page => (
											<li key={page + 1} className={`page-item ${page + 1 === currentPage ? 'active' : ''}`}>
												<Link className="page-link" onClick={() => readPayments(page + 1)}>{page + 1}</Link>
											</li>
										))}

										{nextPage && (
											<li className="page-item">
												<Link className="page-link" onClick={() => readPayments(currentPage + 1)}>Next</Link>
											</li>
										)}
									</ul>
								</div>
							</div>
						)}
					</div>
				) : (
					<div className="grid-x">
						<div className="large-12 medium-12 small-12 cell">
							<div className="horizontal-container vertical-center-content pt-5 pr-5">
								<span className="font-source-sans font-size-16l-14s font-weight-600 left">{paymentsMessage}</span>
								<span className="font-source-sans font-size-16l-14s font-weight-600 right">Add Payment <img src={arrow_right_90} width="35" alt="note for order" /></span>
							</div>
							<div className="text-center p-20 b1-ccc bg-fafafa mt-20">
								<span className="font-source-sans font-size-16l-14s font-weight-600">Payment Transactions Provided by Paypal API (sandbox)</span>
							</div>
						</div>
					</div>
				)}

				{isLoading &&
					<div className="grid-x">
						<div className="large-12 medium-12 small-12 cell text-center">
							<LoadingSpinner paddingClass="p-20l-10s" />
						</div>
					</div>
				}

			</div>
		</div >
	);
}

export default Payments;


function convertDateTimeToText(some_date_time) {

	if (!some_date_time || some_date_time === '') {
		return '';
	} else {
		var date = new Date(some_date_time);

		var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
		var month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
		var year = String(date.getFullYear()).slice(-2);

		return month + '/' + day + '/' + year;
	}

}
function shortenSomeString(some_string) {
	return some_string.slice(0, some_string.length / 2) + '...';
}