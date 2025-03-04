import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';

import AuthUtility from '../frontend/auth/AuthUtility';
import LoadingSpinner from '../frontend/LoadingSpinner';

import axios from 'axios';
import swal from 'sweetalert';

import edit_icon from '../../assets/frontend/images/edit_icon.png';
import add_icon from '../../assets/frontend/images/add_icon.png';

const error_style = 'font-source-sans font-small font-weight-500 txt-000 bg-light-red p-5';

function Profile(){
	
	const navHistory = useNavigate();
	
	if(!AuthUtility.isLoggedIn()){
            
		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
        	
		navHistory('/');
	}
	
	// using hooks
    const [isLoading, setIsLoading] = useState(false);
	const [passwordInput, setPasswordInput] = useState({
		password: '',
		info: '',
		errorList: [],
		errorStyle: [],
	});
    // Initial states
    const [isPasswordEdit, setPasswordEdit] = useState(false);
    const [disablePassword, setDisablePassword] = useState(true);
  
    // Function to handle edit
    const handlePasswordEdit = (i) => {
		
        // toggle edit mode
        setPasswordEdit(!isPasswordEdit);
			
		setPasswordInput({...passwordInput, info: '' });
    };
  
    // The handleInputChange handler can be set up to handle
    // many different inputs in the form, listen for changes 
    // to input elements and record their values in state
	const handlePasswordInput = (event) => {
		event.persist();
		
        setDisablePassword(false);
			
		setPasswordInput({...passwordInput, [event.target.name]: event.target.value });
		
		//remove the target error message no matter the new input, it will be validated on the server
		if (passwordInput.errorList.hasOwnProperty(event.target.name)){
			delete passwordInput.errorList[event.target.name];
			delete passwordInput.errorStyle[event.target.name];
		}
	}
  
    // Function to handle save
    const handleSavePassword = () => {
		savePassword();
    };

	function savePassword(){
		
		setIsLoading(true);
			
		//values sent to api
		const payload = {
			password: passwordInput.password,
		}
	
		axios.get('/sanctum/csrf-cookie').then(response_csrf => {// CSRF Protection through Laravel
			axios.put('/api/save_password', payload, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
				}
			}).then(response =>{
				if(response.data.status === 200){//HTTP_OK
					
					if(localStorage.getItem('remember_me') === 'true'){
	                	localStorage.setItem('password', passwordInput.password);
					}
	
					//update all state properties
					setPasswordInput({...passwordInput, password: '', info: 'Password Updated', errorList: [], errorStyle: [] });
			        setPasswordEdit(false);
			        setDisablePassword(true);
						
	            }else if(response.data.status === 401){//HTTP_UNAUTHORIZED
					//user not authenticated on server so remove from local storage
					AuthUtility.clearAuthData();
	            
					swal("Warning",response.data.message,"warning");
	                	
					navHistory('/login');
					
	            }else if(response.data.status === 404){//HTTP_NOT_FOUND
	                swal("Warning",response.data.message,"warning");
	            }else if(response.data.status === 422){//HTTP_UNPROCESSABLE_ENTITY
	                swal("Warning",response.data.message,"warning");
				}else if(response.data.status === 800){//HTTP_FORM_VALIDATION_FAILED
					
					var errorStyleTemp = JSON.parse(JSON.stringify(response.data.validation_errors));
					Object.keys(errorStyleTemp).map((key) => (
						errorStyleTemp[key] = error_style
					));
					
					//validation errors mapped to input fields
					setPasswordInput({...passwordInput, errorList: response.data.validation_errors, errorStyle: errorStyleTemp });
	
	            }else{//more errors
				}
				
				setIsLoading(false);
					
			}).catch(function (error) {
				console.log('savePassword error: ',error + ' back-end api call error');
				
			});
		}).catch(function (error) {
			//csrf-cookie is outdated
			console.log('savePassword error: ',error + ' csrf-cookie is outdated');
			
			//user not authenticated on server so remove from local storage
			AuthUtility.clearAuthData();
	                	
			setIsLoading(false);
			
			navHistory('/login');
					
		});
	}

	const handleCancelPassword = () => {
        setPasswordEdit(false);
        setDisablePassword(true);
		setPasswordInput({...passwordInput, password: '', errorList: [], errorStyle: [] });
	}
  
	
	return(
		<div className="body-content bg-fff pt-70l-110m-50s pb-170l-150s">
		
			<div className="panel large pt-20l-10s">
				<div className="grid-x">
					<div className="large-12 medium-12 small-12 cell text-left">
						<div className="font-source-sans font-size-20 font-weight-700 txt-333 uppercase bb1-333 pb-5">Profile</div>
					</div>
				</div>
			</div>
		
			<div className="panel large">
				<div className="grid-x">

					<div className="large-6 medium-6 small-12 cell text-left pt-20 pr-10">
						<table className="unstriped unbordered mb-0">
							<tbody>
							<tr><td className="font-source-sans font-weight-400 width-100px pb-20">Name:</td><td className="font-source-sans font-weight-600 pb-20">{localStorage.getItem('auth_first_name') + ' ' + localStorage.getItem('auth_last_name')}</td></tr>
							<tr><td className="font-source-sans font-weight-400 width-100px pb-20">Email:</td><td className="font-source-sans font-weight-600 pb-20">{localStorage.getItem('auth_email')}</td></tr>
							<tr><td className="font-source-sans font-weight-400 width-100px pb-20">Role:</td><td className="font-source-sans font-weight-600 pb-20">{localStorage.getItem('auth_role')}</td></tr>
							<tr><td className="font-source-sans font-weight-400 width-100px pb-20">Password:</td><td className="font-source-sans font-weight-600 ">********&nbsp;&nbsp;
				            <Link onClick={handlePasswordEdit} className="button icon"><img src={edit_icon} className="" width="20" alt="change password"/></Link>
							</td></tr>
							</tbody>
						</table>
					</div>
					<div className="small-12 cell pt-20l-10s show-for-small-only"></div>
					<div className="large-6 medium-6 small-12 cell pt-20l-10s">
						{isPasswordEdit &&
						<div className="bg-fff b1-ddd p-20l-10s">
							<div className="grid-x">
								<div className="large-12 medium-12 small-12 cell text-center">
									<div className="font-source-sans font-size-20 font-weight-700 txt-333 underline uppercase pb-20">Change Password</div>
								</div>
								<div className="large-12 medium-12 small-12 cell">
									<div className={passwordInput.errorStyle.password}>{passwordInput.errorList.password}</div>
									<div className="input-group">
										<span className="input-group-label"><span className="fas fa-lock txt-555"></span></span>
										<input type="password" name="password" onChange={handlePasswordInput} placeholder="Enter New Password" />
									</div>
								</div>
								<div className="large-6 medium-6 small-6 cell text-left">
									<Link onClick={handleCancelPassword} className="button medium">CANCEL</Link>
								</div>
								<div className="large-6 medium-6 small-6 cell text-right">
									{disablePassword ? (
										<Link disabled className="button medium disabled">SAVE</Link>
									) : (
										<Link onClick={handleSavePassword} className="button medium">SAVE</Link>
									)}
								</div>
							</div>
							{passwordInput.info &&
								<div className="font-source-sans font-weight-600 pt-20">{passwordInput.info}</div>
							}
						</div>
				        }
						<div className="text-center">
							{isLoading && 
							<div className="text-center">
							<LoadingSpinner paddingClass="p-10" />
							</div>
							}
						</div>
					</div>
					
				</div>
			</div>
			
		</div>
	);
}

export default Profile;