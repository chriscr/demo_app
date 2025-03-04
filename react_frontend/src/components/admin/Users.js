import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';

import LoadingSpinner from '../frontend/LoadingSpinner';

import axios from 'axios';
import swal from 'sweetalert';

import users_icon from '../../assets/frontend/images/users_icon.png';
import arrow_right_90 from '../../assets/frontend/images/arrow_right_90.png';

function Users(){
	
	const navHistory = useNavigate();
	
	// using hooks
    const [isLoading, setIsLoading] = useState(false);
	const [usersData, setUsersData] = useState({
		data: [],
	});

	//could implement a loading spinner
	
	const getUsers = (event) => {
		event.preventDefault();
            
		setIsLoading(true);

		axios.get('/api/read_users', {
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
			}
		}).then(response =>{
			if(response.data.status === 200){//success
			
				//update all state properties
				setUsersData({...usersData, data: response.data.users_list_data});
				
            }else if(response.data.status === 401){//user not logged in
            
				//user not authenticated on server so remove from local storage
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_role');

				if(!localStorage.getItem('remember_me') || localStorage.getItem('remember_me') !== 'true'){
	            	localStorage.removeItem('auth_users_name');
            		localStorage.removeItem('auth_users_last_name');
                	localStorage.removeItem('auth_email');
                	localStorage.removeItem('password');
				}
            
				//swal("Warning",response.data.message,"warning");
                	
				navHistory('/login');
            }else if(response.data.status === 422){//error with executing read
                swal("Warning",response.data.message,"warning");
            }else{
				//more errors
            }
            
			setIsLoading(false);
			
		}).catch(function (error) {
			console.log('[LocationFinder - getUsers - read_locations] error: ',error + ' back-end api call error');
		
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
	}

	const viewUser = (event) => {
		event.preventDefault();
		
		swal("Success","Use this window for user info","success");
	}

	return(
		<div className="body-content z-index-0 bg-fff pt-70l-110m-50s pb-20l-10s">
		
			<div className="panel large  pt-20l-10s">
			
				<div className="grid-x">
				
					<div className="large-11 medium-11 small-10 cell text-left">
						<div className="font-raleway page-header font-weight-800 italic txt-dark-blue bb2-dark-blue uppercase pb-5">Users</div>
						<div className="pt-5">
							<span className="font-raleway font-medium font-weight-600">
							Users = {usersData.data.length}
							</span>
						</div>
					</div>
					<div className="large-1 medium-1 small-2 cell text-right">
						<Link to="#" className="hover-opacity-50" onClick={getUsers} onTouchEnd={getUsers}>
							<img src={users_icon} className="br-5" width="40" alt="users"/>
						</Link>
 					</div>
				
				</div>

				{usersData.data.length ? ( 
				<div className="grid-x pt-10">
					<div className="large-12 medium-12 small-12 cell text-left">
						<table className="mb0">
							<thead className="bg-bbb">
								<tr className="ptb-5">
									<th className="font-source-sans font-standard font-weight-600 txt-333 p-5">Name</th>
									<th className="font-source-sans font-standard font-weight-600 txt-333 p-5">Email</th>
									<th className="font-source-sans font-standard font-weight-600 txt-333 p-5">Role</th>
									<th className="font-source-sans font-standard font-weight-600 txt-333">View</th>
								</tr>
							</thead>
							<tbody>
							{
							usersData.data.map(user=>(
								<tr key={user.id}>
									<td className="font-source-sans font-standard font-weight-400 p-5">{user.name}</td>
									<td className="font-source-sans font-standard font-weight-400 p-5">{user.email}</td>
									<td className="font-source-sans font-standard font-weight-400 p-5">{user.role}</td>
									<td className="font-source-sans font-standard font-weight-400 p-5"><Link className="nav-link" to="#" onClick={viewUser}> view</Link></td>
								</tr>
							))
							}
							</tbody>
						</table>
					</div>
				</div>
				): (
				<div className="grid-x">
					<div className="large-12 medium-12 small-12 cell text-left">
						<div className="clearfix vertical-center-content pt-10 pr-5">
							<span className="font-raleway page-standard font-weight-600 txt-dark-blue right">View Users <img src={arrow_right_90} width="35" alt="note for order"/></span>
						</div>
					</div>
				</div>
				)
				}
					
				{isLoading && 
				<div className="grid-x">
					<div className="large-12 medium-12 small-12 cell text-center">
					<LoadingSpinner paddingClass="p-20l-10s" />
					</div>
				</div>
				}
			</div>
		</div>
	);
}

export default Users;