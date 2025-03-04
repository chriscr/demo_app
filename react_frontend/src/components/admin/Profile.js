import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';

import AuthUtility from '../frontend/auth/AuthUtility';
import LoadingSpinner from '../frontend/LoadingSpinner';

import axios from 'axios';
import swal from 'sweetalert';

import edit_icon from '../../assets/frontend/images/edit_icon.png';
import checkmark_icon from '../../assets/frontend/images/checkmark_icon.png';
import checkmark_disabled_icon from '../../assets/frontend/images/checkmark_disabled_icon.png';
import cancel_icon from '../../assets/frontend/images/cancel_icon.png';

const error_style = 'font-raleway font-small font-weight-500 txt-000 bg-light-red p-5';

function Profile(){
	
	const navHistory = useNavigate();
	
    if(!localStorage.getItem('auth_users_name') || !localStorage.getItem('auth_email')
	|| !localStorage.getItem('auth_token') || !localStorage.getItem('auth_role')){
            
		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
        	
		navHistory('/');
	}
	
	// using hooks
    const [isLoading, setIsLoading] = useState(false);
	const [passwordInput, setPassword] = useState({
		password: '',
		info: '',
		errorList: [],
		errorStyle: [],
	});
    // Initial states
    const [isEdit, setEdit] = useState(false);
    const [disable, setDisable] = useState(true);
  
    // Function to handle edit
    const handleEdit = (i) => {
		
        // toggle edit mode
        setEdit(!isEdit);
			
		setPassword({...passwordInput, info: '' });
    };
  
    // The handleInputChange handler can be set up to handle
    // many different inputs in the form, listen for changes 
    // to input elements and record their values in state
	const handleInput = (event) => {
		event.persist();
		
        setDisable(false);
			
		setPassword({...passwordInput, [event.target.name]: event.target.value });
		
		//remove the target error message no matter the new input, it will be validated on the server
		if (passwordInput.errorList.hasOwnProperty(event.target.name)){
			delete passwordInput.errorList[event.target.name];
			delete passwordInput.errorStyle[event.target.name];
		}
	}
  
    // Function to handle save
    const handleSave = () => {
		savePasswordToDB();
    };

	function savePasswordToDB(){
		
		setIsLoading(true);
			
		//values sent to api
		const data = {
			password: passwordInput.password,
		}
	
		axios.get('/sanctum/csrf-cookie').then(response_csrf => {// CSRF Protection through Laravel
			axios.put('/api/save_password', data, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
				}
			}).then(response =>{
				if(response.data.status === 200){//HTTP_OK
					
					if(localStorage.getItem('remember_me') === 'true'){
						localStorage.setItem('password', passwordInput.password);
					}

				
					//update all state properties
					setPassword({...passwordInput, password: '', info: 'Password Updated', errorList: [], errorStyle: [] });
					setEdit(false);
					setDisable(true);
						
				}else if(response.data.status === 401){//HTTP_UNAUTHORIZED
				
					//user not authenticated on server so remove from local storage
					AuthUtility.clearAuthData();
				
					swal("Warning",response.data.message,"warning");
						
					navHistory('/login');
					
				}else if(response.data.status === 422){//HTTP_UNPROCESSABLE_ENTITY
					swal("Warning",response.data.message,"warning");
				}else if(response.data.status === 800){//HTTP_FORM_VALIDATION_FAILED
					//more errors
					var errorStyleTemp = JSON.parse(JSON.stringify(response.data.validation_errors));
					Object.keys(errorStyleTemp).map((key) => (
						errorStyleTemp[key] = error_style
					));
					
					setPassword({...passwordInput, errorList: response.data.validation_errors, errorStyle: errorStyleTemp });

				}else{//more errors
				}
				
				setIsLoading(false);
					
			}).catch(function (error) {
				console.log('savePasswordToDB error: ',error + ' back-end api call error');
			
				setIsLoading(false);
			});

		}).catch(function (error) {
			console.log('savePasswordToDB error: ',error + ' csrf-cookie is outdated');
		
			setIsLoading(false);
			
			//user not authenticated on server so remove from local storage
			AuthUtility.clearAuthData();
			
			navHistory('/login');
		});
	}

	const handleCancel = () => {
        setEdit(false);
        setDisable(true);
		setPassword({...passwordInput, password: '', errorList: [], errorStyle: [] });
	}
	
	return(
		<div className="body-content bg-fff pt-70l-110m-50s pb-40">
		
			<div className="panel large pt-20l-10s">
				<div className="grid-x">
			
					<div className="large-12 medium-12 small-12 cell text-left">
						<div className="font-raleway page-header font-weight-800 italic txt-dark-blue bb2-dark-blue uppercase pb-5">Profile</div>
					</div>

					<div className="large-6 medium-6 small-12 cell text-left pt-20">
						<table className="unstriped unbordered mb-0">
							<tbody>
							<tr><td className="font-raleway font-weight-400 width-75px pb-20">Name:</td><td className="font-raleway font-weight-600 pb20">{localStorage.getItem('auth_users_name')}</td></tr>
							<tr><td className="font-raleway font-weight-400 width-75px pb-20">Email:</td><td className="font-raleway font-weight-600 pb20">{localStorage.getItem('auth_email')}</td></tr>
							<tr><td className="font-raleway font-weight-400 width-75px pb-20">Role:</td><td className="font-raleway font-weight-600 pb20">{localStorage.getItem('auth_role')}</td></tr>
							<tr><td className="font-raleway font-weight-400 width-75px ">Password:</td><td className="font-raleway font-weight-600 ">********</td></tr>
							</tbody>
						</table>
					</div>
					<div className="large-6 medium-6 small-12 cell pt-20">
						{isEdit ? (
						<div>
							<div className="clearfix">
								<span className="left">
				                {disable ? (
									<Link disabled className="icon-with-text hover-opacity-50 no-underline disabled">
										<img src={checkmark_disabled_icon} className="" width="20" alt="save items"/> <span className="txt-ccc">SAVE</span>
									</Link>
				                ) : (
									<Link onClick={handleSave} className="icon-with-text hover-opacity-50 no-underline">
										<img src={checkmark_icon} className="" width="20" alt="save items"/> <span className="txt-dark-red">SAVE</span>
									</Link>
				                )}
				                </span>
								<span className="left pl-20">
								<Link onClick={handleCancel} className="icon-with-text hover-opacity-50 no-underline">
									<img src={cancel_icon} className="" width="20" alt="cancel add items"/> <span className="txt-dark-red">CANCEL</span>
								</Link>
								</span>
							</div>
							
							<div className="pt-10">
								<div className={passwordInput.errorStyle.password}>{passwordInput.errorList.password}</div>
								<input type="password" name="password" onChange={handleInput} value={passwordInput.password} placeholder="Enter Password" />
							</div>
						</div>
			        	) : (
			            <Link onClick={handleEdit} className="icon-with-text hover-opacity-50 no-underline">
			            	<img src={edit_icon} className="" width="20" alt="change password"/> <span className="txt-dark-red">CHANGE PASSWORD</span>
			            </Link>
						)}
						{passwordInput.info &&
							<div className="font-raleway font-weight-600 pt-20">{passwordInput.info}</div>
						}
						{isLoading && 
						<div className="text-center">
						<LoadingSpinner paddingClass="p-10" />
						</div>
						}
					</div>
				</div>
			</div>
			
		</div>
	);
}

export default Profile;