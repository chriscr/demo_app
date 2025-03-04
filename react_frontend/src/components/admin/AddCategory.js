import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';

import LoadingSpinner from '../frontend/LoadingSpinner';

import axios from 'axios';
import swal from 'sweetalert';

const error_style = 'font-raleway font-small font-weight-500 txt-error bg-error p-5';

function AddCategory(){

	const navHistory = useNavigate();

	// using hooks
    const [isLoading, setIsLoading] = React.useState(false);
	const [categoryInput, setCategoryInput] = useState({
		title: '',
		status: '',
		errorList: [],
		errorStyle: [],
	});
	
	const handleInput = (event) => {
		event.persist();

		setCategoryInput({...categoryInput, [event.target.name]: event.target.value });

		//remove the target error message no matter the new input, it will be validated on the server
		if (categoryInput.errorList.hasOwnProperty(event.target.name)){
			delete categoryInput.errorList[event.target.name];
			delete categoryInput.errorStyle[event.target.name];
		}
	}

	const categorySubmit = (event) => {
		event.preventDefault();
		
		setIsLoading(true);

		//values sent to api
		const data = {
			title: categoryInput.title,
			status: categoryInput.status,
		}

		axios.post('/api/save_category', data, {
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
			}
		}).then(response =>{
			if(response.data.status === 200){//HTTP_OK
                	
				swal("Success",response.data.message,"success");
				navHistory('/admin/categories');
					
            }else if(response.data.status === 401){//HTTP_UNAUTHORIZED
            
				//user not authenticated on server so remove from local storage
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_role');

				if(!localStorage.getItem('remember_me') || localStorage.getItem('remember_me') !== 'true'){
                	localStorage.removeItem('auth_users_name');
            		localStorage.removeItem('auth_users_last_name');
                	localStorage.removeItem('auth_email');
                	localStorage.removeItem('password');
				}
            
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
				setCategoryInput({...categoryInput, errorList: response.data.validation_errors, errorStyle: errorStyleTemp });

            }else{//more errors
			}
			
			setIsLoading(false);
			
		}).catch(function (error) {
			console.log('categorySubmit error: ',error + ' back-end api call error');
		
			setIsLoading(false);
				
			swal("Error",error,"error");
	                	
			navHistory('/profile');
		
		});
	}
    
	return(
		<div className="body-content bg-fff pt-70l-110m-50s pb-40">
		
			<div className="panel medium pt-20l-10s">
				<div className="grid-x">
					<div className="large-12 medium-12 small-12 cell text-left">
						<div className="font-raleway page-header font-weight-800 italic txt-dark-blue bb2-dark-blue uppercase pb-5">Add Category</div>
					</div>
				</div>
		
				<form onSubmit={categorySubmit}>
				<div className="grid-x pt-20">
					<div className="large-8 medium-8 small-12 cell text-left pr-5l-0s">
						<label>Title <span className={categoryInput.errorStyle.title}>{categoryInput.errorList.title}</span>
							<input type="text" name="title" onChange={handleInput} value={categoryInput.title} className="input-group-fieldx" />
						</label>
					</div>
					<div className="large-4 medium-4 small-12 cell text-left pl-5l-0s">
						<div className="pt-10 show-for-small-only"></div>
						<label>Status <span className={categoryInput.errorStyle.status}>{categoryInput.errorList.status}</span>
							<select name="status" onChange={handleInput} value={categoryInput.status}>
								<option value="">Select</option>
								<option value="active">Active</option>
								<option value="suspended">Suspended</option>
								<option value="deleted">Deleted</option>
							</select>
						</label>
					</div>
					<div className="large-12 medium-12 small-12 cell text-right">
						<button type="submit" className="button width-125px-100px uppercase">Submit</button>
					</div>
					<div className="large-12 medium-12 small-12 cell text-center">
						{isLoading && 
						<LoadingSpinner paddingClass="" />
						}
					</div>
				</div>
				</form>
					
			</div>
		</div>
	);
}

export default AddCategory;