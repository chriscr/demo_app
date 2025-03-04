import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OffCanvas, OffCanvasMenu, OffCanvasBody } from "react-offcanvas";

import AxiosApiClient from '../../components/utils/AxiosApiClient';
import AuthUtility from '../frontend/auth/AuthUtility';
import LoadingSpinner from '../frontend/LoadingSpinner';
import Copyright from '../../layouts/frontend/Copyright';

import $ from "jquery";
import swal from 'sweetalert';

import check_list_icon from '../../assets/frontend/images/check_list_icon.png';
import plus_icon from '../../assets/frontend/images/plus_icon_black.png';
import close_icon from '../../assets/frontend/images/close_icon_black.png';
import checkmark_icon from '../../assets/frontend/images/checkmark_icon.png';
import delete_icon from '../../assets/frontend/images/delete_icon.png';

const CheckListManager = ({ onCheckListData, onCheckListManagerOpen }) => {//sends forecast data and boolean for opening/closing the location finder

	const navHistory = useNavigate();

	//for all API calls
	const auth_api = 'phpLaravel';
	if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') !== '') {
		auth_api = localStorage.getItem('auth_api');
	}

	//check if clicked target is not within the offcanvasnav
	const checkListIconRef = useRef();
	const checkListManagerRef = useRef();
	const closeCheckListManagerRef = useRef();

	//using hooks
	const [isLoading, setIsLoading] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isCheckListManagerOpen, setIsCheckListManagerOpen] = useState(false);
	const [newCheckList, setNewCheckList] = useState({
		name: '',
		info: '',
	});
	const [checkLists, setCheckLists] = useState([]);

	//handles click outside slide out
	useEffect(() => {
		const handleClickOutside = (event) => {
			//add event listener to close menu when clicked outside		
			if (checkListManagerRef.current && !checkListManagerRef.current.contains(event.target)) {
				onCheckListManagerOpen(false);
				setIsCheckListManagerOpen(false);
			}
			//open nav with mobile icon click which is in the div id=navigation
			if (!isCheckListManagerOpen && checkListIconRef.current && checkListIconRef.current.contains(event.target) && checkListIconRef.current.id === 'chec_lList_icon') {
				onCheckListManagerOpen(true);
				setIsCheckListManagerOpen(true);
				$('#chec_lList_icon').addClass('hide');
			} else {
				$('#chec_lList_icon').removeClass('hide');
			}
		}

		document.addEventListener("mousedown", handleClickOutside)

		return () => {
			//cleanup the event listener
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [isCheckListManagerOpen, onCheckListManagerOpen]);

	//initial call for check list and items
	useEffect(() => {
		if (!AuthUtility.isLoggedIn()) {
			//user not authenticated on server so remove from local storage
			AuthUtility.clearAuthData();
			navHistory('/');
		}

		setIsLoading(true);

		if (isMounted) {
			console.log('CheckListManager.useEffect: mounted');

			const fetchApiDataReadCheckLists = async () => {
				try {
					const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
					await getBearerToken();
					const response = await makeRequestWithHeaders('get', '/api/read_check_lists', null, {});

					setApiDataReadCheckLists(response, "CheckListManager.useEffect");
				} catch (error) {
					handleApiErrorReadCheckLists(error, "CheckListManager.useEffect");
				}
			};
			fetchApiDataReadCheckLists();

		} else {
			setIsMounted(true);
		}

	}, [isMounted]);

	function setApiDataReadCheckLists(response, theFunction) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//set data
				if (response.data.check_lists) {
					setCheckLists(response.data.check_lists);
				}
				setIsCheckListManagerOpen(false);
				setNewCheckList({ ...newCheckList, name: '', info: '' });
				//pass data
				onCheckListManagerOpen(false);
				onCheckListData(response.data.default_check_list, response.data.default_check_list_data);

			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
				navHistory('/login');
			} else if (response.data.status === 404) {//HTTP_NOT_FOUND
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				onCheckListData(null);
			} else if (response.data.status === 422) {//HTTP_UNPROCESSABLE_ENTITY
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				onCheckListData(null);
			} else if (response.data.status === 800) {//HTTP_FORM_VALIDATION_FAILED
				console.log(theFunction + ': ', response.data.message + ' HTTP_FORM_VALIDATION_FAILED');
			} else {//more errors
			}
		}

		setIsLoading(false);
	}
	function handleApiErrorReadCheckLists(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	const toggleCheckListManager = (event) => {
		event.preventDefault();

		setIsCheckListManagerOpen(!isCheckListManagerOpen);
		onCheckListManagerOpen(!isCheckListManagerOpen);
	}

	const handleInputChange = (event) => {
		event.stopPropagation();

		const { name, value } = event.target;

		setNewCheckList({ ...newCheckList, name: value, info: '', });
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			event.preventDefault(); // Prevent form submission

			if (event.target.name === 'newCheckList') {
				const { name, value } = event.target;

				setNewCheckList({ ...newCheckList, name: value, info: '', });

				handleSaveNewCheckList(event);
			}
		}
	};

	// Function to handle save
	const handleSaveNewCheckList = (event) => {
		event.stopPropagation();

		if (newCheckList.name) {
			saveCheckList(newCheckList.name);
		} else {
			setNewCheckList({ ...newCheckList, info: 'Error: Empty Check List' });
		}
	};

	function saveCheckList(check_list_name) {
		setIsLoading(true);
		setIsSaving(true);

		var payload = {
			check_list_name: check_list_name,
		}

		const fetchApiDataSaveCheckList = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('post', '/api/save_check_list', payload, {});

				setApiDataSaveCheckList(response, "CheckListManager.saveCheckList");
			} catch (error) {
				handleApiErrorSaveCheckList(error, "CheckListManager.saveCheckList");
			}
		};

		fetchApiDataSaveCheckList();
	}
	function setApiDataSaveCheckList(response, theFunction) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//update state properties
				if (response.data.check_lists) {
					//set data
					setCheckLists(response.data.check_lists);
					if (response.data.check_lists.length === 1) {
						setIsCheckListManagerOpen(!isCheckListManagerOpen);
						//pass data
						onCheckListManagerOpen(!isCheckListManagerOpen);
						onCheckListData(response.data.default_check_list, response.data.default_check_list_data);
					}
				}
				setNewCheckList({ ...newCheckList, name: '', info: '' });
			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
				swal("Warning", response.data.message, "warning");
				navHistory('/login');
			} else if (response.data.status === 422) {//HTTP_UNPROCESSABLE_ENTITY
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//set data
				setNewCheckList({ ...newCheckList, info: 'Error: location does not exist.' });
			} else {//more errors
			}
		}

		setIsLoading(false);
	}
	function handleApiErrorSaveCheckList(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	// Delete row of id:i
	const handleRemoveClick = (i) => {
		const list = [...checkLists];

		if (list[i]['random_id'] && list[i]['random_id'] !== '') {
			deleteCheckList(list[i]['random_id']);//send a specific unique ID to delete
		}
	};

	function deleteCheckList(check_list_random_id) {
		setIsLoading(true);
		setIsDeleting(true);

		const fetchApiDataDeleteCheckList = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('delete', '/api/delete_check_list/' + check_list_random_id, null, {});

				setApiDataDeleteCheckList(response, "CheckListManager.deleteCheckList", check_list_random_id);
			} catch (error) {
				handleApiErrorDeleteCheckList(error, "CheckListManager.deleteCheckList");
			}
		};

		fetchApiDataDeleteCheckList();
	}
	function setApiDataDeleteCheckList(response, theFunction, check_list_random_id) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//update all state properties
				if (response.data.check_lists) {
					setCheckLists(response.data.check_lists);
					if (response.data.check_lists.length === 1) {
						onCheckListManagerOpen(!isCheckListManagerOpen);
						setIsCheckListManagerOpen(!isCheckListManagerOpen);
					}
				} else {//update by filtering it out
					setCheckLists(oldCheckLists => {
						return oldCheckLists.filter(checkList => checkList.random_id !== check_list_random_id)
					});
				}
				onCheckListData(response.data.default_check_list, response.data.default_check_list_data);
				setNewCheckList({ ...newCheckList, name: '', info: '' });

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
	function handleApiErrorDeleteCheckList(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	//change default using id:i
	const handleChangeDefaultCheckList = (i) => {
		const list = [...checkLists];

		if (list[i]['random_id'] && list[i]['random_id'] !== '') {
			changeDefaultCheckList(list[i]['random_id']);//send a specific unique ID to delete
		}
	};

	function changeDefaultCheckList(check_list_random_id) {
		setIsLoading(true);

		const fetchApiDataChangeDefaultCheckList = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('put', '/api/change_default_check_list/' + check_list_random_id, null, {});

				setApiDataChangeDefaultCheckList(response, "CheckListManager.changeDefaultCheckList");
			} catch (error) {
				handleApiErrorChangeDefaultCheckList(error, "CheckListManager.changeDefaultCheckList");
			}
		};

		fetchApiDataChangeDefaultCheckList();
	}
	function setApiDataChangeDefaultCheckList(response, theFunction) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//update all state properties
				if (response.data.check_lists) {
					setCheckLists(response.data.check_lists);
				}
				setNewCheckList({ ...newCheckList, name: '', info: '' });
				setIsCheckListManagerOpen(false);

				onCheckListData(response.data.default_check_list, response.data.default_check_list_data);
				onCheckListManagerOpen(false);

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
	function handleApiErrorChangeDefaultCheckList(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	return (
		<OffCanvas width={270} transitionDuration={300} effect={"parallax"} isMenuOpened={isCheckListManagerOpen} position={"right"}>
			<OffCanvasBody>
				<div id="chec_lList_icon" className="p-0 m-0" ref={checkListIconRef}>
					<Link className="hover-opacity-50" onClick={toggleCheckListManager} onTouchEnd={toggleCheckListManager}>
						<img src={check_list_icon} className="br-5" width="40" alt="check list manager" />
					</Link>
				</div>
			</OffCanvasBody>
			<OffCanvasMenu >
				<div id="check_list_manager" className="z-index-2100 bg-fafafa bl1-ccc pt-70l-110m-50s" style={{ height: "2000px", overflow: "hidden" }} ref={checkListManagerRef}>
					<div className="panel">
						<div className="grid-x p-10">
							<div className="large-10 medium-10 small-9 cell text-center">
								{isLoading &&
									<span className="element"><LoadingSpinner paddingClass="none" sizeClass="small" /></span>
								}
								{newCheckList && newCheckList.info &&
									<div className="font-source-sans font-size-16l-14s font-weight-600 txt-red text-center pt-10">{newCheckList.info}</div>
								}
							</div>
							<div className="large-2 medium-2 small-3 cell text-right">
								<Link className="button icon text-center" onClick={toggleCheckListManager} onTouchEnd={toggleCheckListManager} ref={closeCheckListManagerRef}>
									<img src={close_icon} className="" width="40" alt="add new check list" />
								</Link>
							</div>
						</div>
					</div>
					<div className="panel">
						<div className="grid-x bt1-ccc p-10">
							<div className="large-10 medium-10 small-9 cell text-left">
								<input type="text" className="medium" value={newCheckList.name} name="newCheckList" onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="My Shopping List" />

							</div>
							<div className="large-2 medium-2 small-3 cell text-right">
								{isSaving ? (
									<Link disabled className="hover-opacity-50 disabled">
										<span className="button icon">
											<img src={plus_icon} alt="add new check list" />
										</span>
									</Link>
								) : (
									<Link onMouseDown={handleSaveNewCheckList} onTouchStart={handleSaveNewCheckList}>
										<span className="button icon">
											<img src={plus_icon} alt="add new check list" />
										</span>
									</Link>
								)}
							</div>
						</div>
					</div>
					{checkLists.length > 0 ? (
						<div className="bt1-ccc ptb-5 mlr-10">
							{checkLists.map((checkList, i) => (
								<div key={i} className="horizontal-container vertical-center-content ptb-5">
									<span key={'symbol_' + i} className="left">
										{checkList.default ? (
											<Link onClick={() => handleChangeDefaultCheckList(i)} onTouchEnd={() => handleChangeDefaultCheckList(i)} className="no-underline">
												<img src={checkmark_icon} width="12" alt="default" />
												<span className="font-source-sans font-size-16l-14s font-weight-600 txt-green pl-10">{shortenString(checkList.name)}</span>
											</Link>
										) : (
											<Link onClick={() => handleChangeDefaultCheckList(i)} onTouchEnd={() => handleChangeDefaultCheckList(i)} className="no-underline">
												<span className="font-source-sans font-size-16l-14s font-weight-600 txt-333 pl-5">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{shortenString(checkList.name)}</span>
											</Link>
										)
										}
									</span>
									{isDeleting ? (
										<span key={'delete_' + i} className="right">
											<Link disabled className="hover-opacity-50 disabled">
												<span className="button icon small">
													<img src={delete_icon} alt="delete" />
												</span>
											</Link>
										</span>
									) : (
										<span key={'delete_' + i} className="right">
											<Link onClick={() => handleRemoveClick(i)} onTouchEnd={() => handleRemoveClick(i)} className="no-underline">
												<span className="button icon small">
													<img src={delete_icon} alt="delete check list" />
												</span>
											</Link>
										</span>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="bt1-ccc ptb-20 mlr-10">
							<div className="font-source-sans font-size-16l-14s font-weight-600 txt-dark-blue text-center mlr-10">No Check Lists</div>
						</div>
					)
					}
					<Copyright />
				</div>
			</OffCanvasMenu>
		</OffCanvas>
	);

}

export default CheckListManager;

function shortenString(str) {
	if (str.length > 22) {
		return str.substring(0, 22);
	} else {
		return str;
	}
}
