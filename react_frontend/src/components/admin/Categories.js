import React, {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';

import LoadingSpinner from '../frontend/LoadingSpinner';

import axios from 'axios';
import swal from 'sweetalert';

import plus_icon from '../../assets/frontend/images/plus_icon_white.png';
import delete_icon from '../../assets/frontend/images/delete_icon.png';

function Categories(){
	
	const navHistory = useNavigate();
  
    // Initial states
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [openAlertDeleted, setOpenAlertDeleted] = useState(false);
	const [categoryList, setCategoryList] = useState([
        //{ id: '', title: "", status: "", random_id: "", created: "", updated: "" },
	]);
  
	// Initial call for user list items
	useEffect(() => {

		setIsLoading(true);
		
		if (isMounted) {
			
			console.log('[Admin Categories - useEffect] mounted');
		
			axios.get('/api/read_categories', {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
				}
			}).then(response =>{
				if(response.data.status === 200){//HTTP_OK
					
					//set data
					if(response.data.categories){
						setCategoryList(response.data.categories);
					}
						
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
	                	
					navHistory('/login');
					
	            }else if(response.data.status === 422){//HTTP_UNPROCESSABLE_ENTITY
	            }else{//more errors
	            }
		
				setIsLoading(false);
				
			}).catch(function (error) {
				console.log('[Admin Categories - useEffect - read_categories] error: ',error + ' back-end api call error');
			
				setIsLoading(false);
	            
				//user not authenticated on server so remove from local storage
	            localStorage.removeItem('auth_token');
	            localStorage.removeItem('auth_role');
	
				if(!localStorage.getItem('remember_me') || localStorage.getItem('remember_me') !== 'true'){
	            	localStorage.removeItem('auth_users_name');
	        		localStorage.removeItem('auth_users_last_name');
	            	localStorage.removeItem('auth_email');
	            	localStorage.removeItem('password');
				}
	                	
				navHistory('/login');
			});
			
		}else {
	      setIsMounted(true);
	    }
		
	}, [isMounted]);
	
    // Function For closing the alert snackbar
    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        
        setOpenAlertDeleted(false);
    };
    
    // Delete row of id:i
    const handleRemoveClick = (i) => {
        const list = [...categoryList];

		if(list[i]['random_id'] && list[i]['random_id'] !== ''){
			deleteCategoryFromDB(list[i]['random_id'], i);//send a specific unique ID to delete
		}
    };

	function deleteCategoryFromDB(category_random_id, indexToDelete){
		
		setIsLoading(true);
	}

  	return (
		<div className="body-content bg-fff pt-70l-110m-50s">
		
			
			<div className="panel large ptb-20l-10s">
			
				<div className="grid-x">
				
					<div className="large-11 medium-11 small-10 cell text-left">
						<div className="font-raleway page-header font-weight-800 italic txt-dark-blue bb2-dark-blue uppercase pb-5">Categories</div>
					</div>
					<div className="large-1 medium-1 small-2 cell text-right">
						<Link to="/admin/add_category" className="button icon">
							<img src={plus_icon} width="40" alt="category"/>
						</Link>
					</div>
					
					
					{categoryList.length > 0 &&
					<div id="category_list" className="large-12 medium-12 small-12 cell pt-10">
						<table className="mb-0">
							<thead className="bg-ddd p-5">
								<tr>
									<td className="font-source-sans font-standard font-weight-600 txt-000 text-left p-10 pl-5">Category</td>
									<td className="font-source-sans font-standard font-weight-600 txt-000 text-center plr-5">Status</td>
									<td className="font-source-sans font-standard font-weight-600 txt-000 text-center plr-5">Updated</td>
									<td className="font-source-sans font-standard font-weight-600 txt-000 text-center plr-5">Created</td>
									<td className="text-center p-10 width-40px"></td>
								</tr>
							</thead>
							<tbody>
				        	{categoryList.map((category, i) => (
								<tr key={'no_edit'+category.id+category.random_id}>
									<td  key={'noedit_td1'+category.id+category.random_id} className="font-source-sans font-standard font-weight-500 txt-333 text-left p-5" valign="center">{category.title}</td>
									<td  key={'noedit_td2'+category.id+category.random_id} className="font-source-sans font-standard font-weight-500 txt-333 text-center p-5" valign="center">{category.status}</td>
									<td  key={'noedit_td3'+category.id+category.random_id} className="font-source-sans font-standard font-weight-500 txt-333 text-center p-5" valign="center">{convertDateTimeToText(category.updated_at)}</td>
									<td  key={'noedit_td4'+category.id+category.random_id} className="font-source-sans font-standard font-weight-500 txt-333 text-center p-5" valign="center">{convertDateTimeToText(category.created_at)}</td>
									<td  key={'noedit_td5'+category.id+category.random_id} className="text-center p-5 width-40px" valign="center">
					            	<Link onClick={() => handleRemoveClick(i)} onTouchEnd={() => handleRemoveClick(i)} className="hover-opacity-50">
										<img src={delete_icon} className="" width="17" alt="delete category"/>
									</Link>
									</td>
								</tr>
							))}
							</tbody>
						</table>
					</div>
					}
					
					{isLoading && 
					<div className="large-12 medium-12 small-12 cell text-center">
					<LoadingSpinner paddingClass="p-20l-10s" />
					</div>
					}
				</div>
			</div>
			
		</div>
	);
}

export default Categories;

function convertDateTimeToText(some_date_time){
	
	if(!some_date_time || some_date_time === ''){
		return '';
	}else{
		var date = new Date(some_date_time);
		
	    var day = date.getDate() < 10 ? '0'+date.getDate() : date.getDate();
	    var month = (date.getMonth()+1) < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1;
		var year = date.getFullYear();
	
		return month + '/' + day + '/' + year;
	}
	
}
					