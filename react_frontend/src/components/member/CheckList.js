import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AxiosApiClient from '../../components/utils/AxiosApiClient';
import AuthUtility from '../frontend/auth/AuthUtility';
import CheckListManager from './CheckListManager';
import LoadingSpinner from '../frontend/LoadingSpinner';

import swal from 'sweetalert';

import plus_icon from '../../assets/frontend/images/plus_icon_black.png';
import edit_icon from '../../assets/frontend/images/edit_icon.png';
import close_icon from '../../assets/frontend/images/close_icon_black.png';
import checkmark_icon from '../../assets/frontend/images/checkmark_icon.png';
import checkmark_disabled_icon from '../../assets/frontend/images/checkmark_disabled_icon.png';
import cancel_icon from '../../assets/frontend/images/cancel_icon.png';
import delete_icon from '../../assets/frontend/images/delete_icon.png';
import arrow_left_90 from '../../assets/frontend/images/arrow_left_90.png';
import arrow_right_90 from '../../assets/frontend/images/arrow_right_90.png';

function CheckList() {

	const navHistory = useNavigate();

	//for all API calls
	const auth_api = 'phpLaravel';
	if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') !== '') {
		auth_api = localStorage.getItem('auth_api');
	}

	// Initial states
	const [isLoading, setIsLoading] = useState(true);
	const [isAdd, setAdd] = useState(false);
	const [isEdit, setEdit] = useState(false);
	const [disable, setDisable] = useState(true);
	const [checkList, setCheckList] = useState({
		name: '',
		random_id: '',
		data: [
			//{ id: data.length + 1, user_id: "", name: "", status: "", order: rows.length + 1, random_id: "", created: "", updated: "" },
		],
	});
	const [checkListForCancel, setCheckListForCancel] = useState({
		data: [
			//{ id: data.length + 1, user_id: "", name: "", status: "", order: rows.length + 1, random_id: "", created: "", updated: "" },
		],
	});
	const [checkListMessage, setCheckListMessage] = useState('');

	const handleCheckListManagerOpen = (isCheckListManagerOpen) => {
		if (isCheckListManagerOpen) {
			//hide some elements
		} else {
			//show some elements
		}
	};

	const handleCheckListData = (defaultCheckList, defaultCheckListData) => {//properties coming from CheckListManager

		if (defaultCheckListData && defaultCheckListData.length > 0) {
			setCheckList({ ...checkList, name: defaultCheckList.name, random_id: defaultCheckList.random_id, data: defaultCheckListData });
			setCheckListMessage('');
		} else if (defaultCheckList) {
			setCheckList({ ...checkList, name: defaultCheckList.name, random_id: defaultCheckList.random_id, data: [] });
			setCheckListMessage('');
		} else {
			setCheckList({ ...checkList, name: '', random_id: '', data: [] });
			setCheckListMessage('No Check Lists Exist');
		}

		setIsLoading(false);
	};

	// Function For adding new row object
	const handleAdd = () => {
		const list = [...checkList.data];

		//cache on first click of add button
		if (!isAdd) {

			const clonedList = JSON.parse(JSON.stringify(list));

			//cache rows before changing for cancelling
			if (list.length === 0) {
				setCheckListForCancel({ ...checkListForCancel, data: [] });
			} else {
				setCheckListForCancel({ ...checkListForCancel, data: clonedList });
			}
		}

		list.push({ id: checkList.data.length + 1, name: "", status: "" });
		setCheckList({ ...checkList, data: list });

		setAdd(true);
		setEdit(true);
	};

	// Function to handle edit
	const handleEdit = (i) => {
		const list = [...checkList.data];

		const clonedList = JSON.parse(JSON.stringify(list));

		//cache rows before changing for cancelling
		if (list.length === 0) {
			setCheckListForCancel([]);
		} else {
			setCheckListForCancel({ ...checkListForCancel, data: clonedList });
		}

		// toggle edit mode
		setEdit(!isEdit);
	};

	const handleCancel = () => {
		const list = [...checkListForCancel.data];
		const clonedList = JSON.parse(JSON.stringify(list));

		//set rows to the old cached rows
		setCheckList({ ...checkList, data: clonedList });

		setDisable(true);
		setAdd(!isAdd);
		setEdit(!isEdit);
	}

	// The handleInputChange handler can be set up to handle
	// many different inputs in the form, listen for changes 
	// to input elements and record their values in state
	const handleInputChange = (event, index) => {
		event.stopPropagation();

		const { name, value } = event.target;

		const list = [...checkList.data];

		if (name === 'status_' + index) {// specific to the status value
			if (event.target.checked) {
				list[index]["status"] = 'checked';
			} else {
				list[index]["status"] = 'unchecked';
			}
		} else {
			list[index][name] = value;
		}

		setCheckList({ ...checkList, data: list });

		setDisable(false);

	};

	// Function to handle save
	const handleSaveCheckListItems = () => {

		saveCheckListItems();

		setAdd(!isAdd);
		setEdit(!isEdit);
		setDisable(true);

		//remove cached rows  for cancelling
		setCheckListForCancel([]);
	};

	function saveCheckListItems() {

		setIsLoading(true);

		//values sent to api
		var payload = {
			check_list_random_id: checkList.random_id,
			//entire rows list converted to string
			check_list_items_json_string: JSON.stringify(checkList.data),
		}

		const fetchApiDataSaveCheckListItems = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('post', '/api/save_check_list_items', payload, {});

				setApiDataSaveCheckListItems(response, "CheckList.saveCheckListItems");
			} catch (error) {
				handleApiErrorSaveCheckListItems(error, "CheckList.saveCheckListItems");
			}
		};

		fetchApiDataSaveCheckListItems();
	}
	function setApiDataSaveCheckListItems(response, theFunction) {
		if (response && response.data) {

			var check_list_data;
			var error_message;

			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//update all state properties
				check_list_data = response.data.check_list_data;

				error_message = '';
				for (let i = 0; i < check_list_data.length; i++) {
					if (check_list_data[i].hasOwnProperty('error')) {
						error_message = error_message + ' ' + check_list_data[i]['symbol'] + ' ' + check_list_data[i]['error'];
						check_list_data.splice(i, 1);
						i--;
					}
				}

				if (error_message) {
					swal("Warning", error_message, "warning");
				} else {
					//needs swal success
				}

				//update all state properties
				setCheckList({ ...checkList, data: check_list_data });
			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
				swal("Warning", response.data.message, "warning");
				navHistory('/login');
			} else if (response.data.status === 422) {//HTTP_UNPROCESSABLE_ENTITY
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				check_list_data = response.data.check_list_data;

				error_message = '';
				for (let i = 0; i < check_list_data.length; i++) {
					if (check_list_data[i].hasOwnProperty('error')) {
						error_message = error_message + ' ' + check_list_data[i]['symbol'] + ' ' + check_list_data[i]['error'];
						check_list_data.splice(i, 1);
						i--;
					}
				}

				if (error_message) {
					//update all state properties
					setCheckList({ ...checkList, data: check_list_data });
					swal("Warning", error_message, "warning");
				} else {
					swal("Warning", response.data.message, "warning");
				}
			} else {//more errors
			}
		}

		setIsLoading(false);
	}
	function handleApiErrorSaveCheckListItems(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	// Showing delete all confirmation to users
	const handleConfirmToRemoveAllCheckListItems = () => {
		swal({
			title: 'Delete All Check List Items',
			text: 'This will delete all items but not the check list itself.',
			icon: "warning",
			buttons: {
				cancel: true,
				confirm: {
					text: "Delete All Items",
					value: true,
				},
			},
			showCancelButton: true,
			confirmButtonText: "Yes, delete it!"
		}).then((result) => {
			if (result) {
				deleteCheckListItems();
			}
		});
	};
	const handleConfirmToRemoveCheckListItem = (i) => {
		const list = [...checkList.data];

		swal({
			title: 'Delete Check List Item',
			text: 'This will delete item ' + list[i]['name'] + '.',
			icon: "warning",
			buttons: {
				cancel: true,
				confirm: {
					text: "Delete Item",
					value: true,
				},
			},
			showCancelButton: true,
			confirmButtonText: "Yes, delete it!"
		}).then((result) => {
			if (result) {
				handleRemoveCheckListItem(i);
			}
		});
	};

	// Delete row of id:i
	const handleRemoveCheckListItem = (i) => {
		const list = [...checkList.data];

		if (list[i]['random_id'] && list[i]['random_id'] !== '') {
			deleteCheckListItems(list[i]['random_id']);//send a specific unique ID to delete
		}
	};

	function deleteCheckListItems(check_list_item_random_id) {

		setIsLoading(true);

		if (!check_list_item_random_id || check_list_item_random_id === '') {
			check_list_item_random_id = 'none';
		}

		const fetchApiDataDeleteCheckListItems = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('delete', '/api/delete_check_list_item/' + checkList.random_id + '/' + check_list_item_random_id, null, {});

				setApiDataDeleteCheckListItems(response, "CheckList.deleteCheckListItems", check_list_item_random_id);
			} catch (error) {
				handleApiErrorDeleteCheckListItems(error, "CheckList.deleteCheckListItems");
			}
		};

		fetchApiDataDeleteCheckListItems();
	}
	function setApiDataDeleteCheckListItems(response, theFunction, check_list_item_random_id) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				var list = [];

				if (check_list_item_random_id && check_list_item_random_id !== 'none' && response.data.check_list_data) {
					list = response.data.check_list_data;
				}

				//update state properties
				setCheckList({ ...checkList, data: list });

				if (!check_list_item_random_id || check_list_item_random_id === 'none' || check_list_item_random_id === '') {
					swal("Deleted!", "All Check List Items have been deleted.", "success");
				} else {
					swal("Deleted!", "Item has been deleted.", "success");
				}
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
	function handleApiErrorDeleteCheckListItems(error, theFunction) {
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
						<div className="font-source-sans font-size-20 font-weight-800 txt-dark-blue bb1-dark-blue uppercase pb-5">Check List</div>
						<div className="font-source-sans font-size-18l-16m font-weight-600 pt-5">
							{checkList.name}
						</div>
					</div>
					<div className="large-1 medium-1 small-2 cell text-right">
						<CheckListManager onCheckListData={handleCheckListData} onCheckListManagerOpen={handleCheckListManagerOpen} />
					</div>
				</div>
			</div>

			<div className="panel large">
				<div className="grid-x">

					{checkList.name ? (
						<div className="large-12 medium-12 small-12 cell pt-20l-10s">
							{isEdit ? (
								<div className="horizontal-container float-left">
									<span className="left">
										<Link onClick={handleAdd} onTouchEnd={handleAdd} className="no-underline">
											<span className="button icon">
												<img src={plus_icon} alt="add" />
											</span>
											<span className="font-source-sans font-size-16l-14s font-weight-500 pt-10 pl-5 pr-20">
												ADD
											</span>
										</Link>
									</span>
									{checkList.data.length > 0 && (
										<span className="left">
											<Link onClick={handleCancel} onTouchEnd={handleCancel} className="no-underline">
												<span className="button icon">
													<img src={close_icon} alt="cancel" />
												</span>
												<span className="font-source-sans font-size-16l-14s font-weight-500 pt-10 pl-5 pr-20">
													CANCEL
												</span>
											</Link>
											{disable ? (
												<Link disabled className="disabled no-underline">
													<span className="button icon disabled">
														<img src={checkmark_icon} alt="save" />
													</span>
													<span className="font-source-sans font-size-16l-14s font-weight-500 pt-10 pl-5 pr-20">
														SAVE
													</span>
												</Link>
											) : (
												<Link onClick={handleSaveCheckListItems} onTouchEnd={handleSaveCheckListItems} className="no-underline">
													<span className="button icon">
														<img src={checkmark_icon} alt="save" />
													</span>
													<span className="font-source-sans font-size-16l-14s font-weight-500 pt-10 pl-5 pr-20">
														SAVE
													</span>
												</Link>
											)}
										</span>
									)}
								</div>
							) : (
								<div className="horizontal-container float-left">
									<span className="left">
										<Link onClick={handleAdd} onTouchEnd={handleAdd} className="no-underline">
											<span className="button icon">
												<img src={plus_icon} alt="add new check list" />
											</span>
											<span className="font-source-sans font-size-16l-14s font-weight-500 pt-10 pl-5 pr-20">
												ADD
											</span>
										</Link>
									</span>
									{checkList.data.length > 0 && (
										<>
											<span className="left">
												<Link onClick={handleEdit} onTouchEnd={handleEdit} className="no-underline">
													<span className="button icon">
														<img src={edit_icon} alt="edit" />
													</span>
													<span className="font-source-sans font-size-16l-14s font-weight-500 pt-10 pl-5 pr-20">
														EDIT
													</span>
												</Link>
											</span>
											<span className="left">
												<Link onClick={handleConfirmToRemoveAllCheckListItems} onTouchEnd={handleConfirmToRemoveAllCheckListItems} className="no-underline">
													<span className="button icon">
														<img src={delete_icon} alt="delete all" />
													</span>
													<span className="font-source-sans font-size-16l-14s font-weight-500 pt-10 pl-5 pr-20">
														DELETE ALL
													</span>
												</Link>
											</span>
										</>
									)}
								</div>
							)}
						</div>
					) : (
						<></>
					)}

					{checkList.data.length > 0 ? (
						<div id="checklist_data" className="large-12 medium-12 small-12 cell b1-ccc mt-10">
							<table key={checkList.name} className="mb-0">
								<tbody>
									{checkList.data.map((data_item, i) => (
										isEdit ? (
											<tr key={'edit' + data_item.id + data_item.random_id}>
												<td key={'edit_td1' + data_item.id + data_item.random_id} className="parent-to-checkboxx text-left p-5 width-50px">
													<input type="checkbox" value="1" name={"status_" + i} id={"status_" + i} checked={data_item.status === 'checked' ? true : false} onChange={(e) => handleInputChange(e, i)} />
													<label htmlFor={"status_" + i} className="checkbox-label "><span className="checkbox "></span></label>
												</td>
												<td key={'edit_td2' + data_item.id + data_item.random_id} className="text-left"><input type="text" className="small width-100per" value={data_item.name} name="name" onChange={(e) => handleInputChange(e, i)} placeholder="Item Title" /></td>
												<td key={'edit_td3' + data_item.id + data_item.random_id} className="text-left pl-5 width-40px"><input type="text" className="small" value={data_item.order} name="order" onChange={(e) => handleInputChange(e, i)} /></td>
												{/*<td  key={'edit_td4'+data_item.id+data_item.random_id} className="font-source-sans font-size-16l-14s font-weight-500 text-center width-75px hide-for-small-only">{convertDateTimeToText(data_item.created_at)}</td>*/}
												<td key={'edit_td5' + data_item.id + data_item.random_id} className="font-source-sans font-size-16l-14s font-weight-500 text-center width-100px hide-for-small-only">{convertDateTimeToText(data_item.updated_at)}</td>
												<td key={'edit_td6' + data_item.random_id + data_item.random_id} className="text-center p-5 width-40px">
													<Link disabled className="hover-opacity-50 disabled">
														<span className="button icon small">
															<img src={delete_icon} alt="delete" />
														</span>
													</Link>
												</td>
											</tr>
										) : (
											<tr key={'no_edit' + data_item.id + data_item.random_id}>
												<td key={'no_edit_td1' + data_item.id + data_item.random_id} className="font-source-sans font-size-18 font-weight-600 text-center width-30px">
													{data_item.status === 'checked' &&
														<img src={checkmark_icon} width="15" alt="checked" />
													}</td>
												<td key={'no_edit_td2' + data_item.id + data_item.random_id} className={"font-source-sans font-size-16l-14s font-weight-600 " + (data_item.name === '' ? "italic txt-999" : "") + ' pl-5'}>{(data_item.name === '' ? "No Title" : data_item.name)}</td>
												<td key={'no_edit_td3' + data_item.id + data_item.random_id} className="font-source-sans font-size-16l-14s font-weight-600 text-left pl-5 width-40px">{/*data_item.order*/' '}</td>
												{/*<td  key={'no_edit_td4'+data_item.id+data_item.random_id} className="font-source-sans font-size-16l-14s font-weight-500 text-center width-75px hide-for-small-only">{convertDateTimeToText(data_item.created_at)}</td>*/}
												<td key={'no_edit_td5' + data_item.id + data_item.random_id} className="font-source-sans font-size-16l-14s font-weight-500 text-center width-100px hide-for-small-only">{convertDateTimeToText(data_item.updated_at)}</td>
												<td key={'no_edit_td6' + data_item.id + data_item.random_id} className="text-center p-5 width-40px">
													<Link onClick={() => handleConfirmToRemoveCheckListItem(i)} onTouchEnd={() => handleConfirmToRemoveCheckListItem(i)} className="no-underline">
														<span className="button icon small">
															<img src={delete_icon} alt="delete" />
														</span>
													</Link>
												</td>
											</tr>
										)
									))}
									{isEdit &&
										<tr>
											<td className="pt-5"><img src={arrow_left_90} width="35" alt="note for order" /></td>
											<td className="font-source-sans font-size-16l-14s font-weight-400 text-left pt-5 pr-10x">Check Off Items</td>
											<td align="center" className="pt-5"><img src={arrow_left_90} width="35" alt="note for order" /></td>
											<td colSpan="2" className="font-source-sans font-size-16l-14s font-weight-400 text-left pt-5 plr-10">Order Items</td>
										</tr>
									}
								</tbody>
							</table>
						</div>
					) : (
						<div className="large-12 medium-12 small-12 cell text-left">
							{checkList.name ? (
								checkList.data.length > 0 ? (
									<></>
								) : (
									<div className="pt-5">
										<span className="font-source-sans font-size-16l-14s font-weight-600 element"><img src={arrow_left_90} width="25" alt="note for order" /> Add Check List Items</span>
									</div>
								)
							) : (
								<div className="horizontal-container vertical-center-content pt-5 pr-5">
									<span className="font-source-sans font-size-16l-14s font-weight-600 left">{checkListMessage}</span>
									<span className="font-source-sans font-size-16l-14s font-weight-600 right">Add Check List <img src={arrow_right_90} width="25" alt="note for order" /></span>
								</div>
							)}
						</div>
					)
					}

					{isLoading &&
						<div className="large-12 medium-12 small-12 cell text-center">
							<LoadingSpinner paddingClass="p-20l-10s" />
						</div>
					}
				</div>
			</div>

		</div >
	);
}

export default CheckList;

function convertDateTimeToText(some_date_time) {

	if (!some_date_time || some_date_time === '') {
		return '';
	} else {
		var date = new Date(some_date_time);

		var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
		var month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
		var year = date.getFullYear();

		return month + '/' + day + '/' + year;
	}

}
