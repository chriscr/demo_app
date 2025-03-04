import React from 'react';
import {Link} from 'react-router-dom';

import users_icon from '../../assets/frontend/images/users_icon.png';

function Dashboard(){
    
	return(
		<div className="body-content bg-fff pt-70l-110m-50s pb-40">
		
			<div className="panel large pt-20l-10s">
				<div className="grid-x">
					<div className="large-12 medium-12 small-12 cell text-left">
						<div className="font-raleway page-header font-weight-800 italic txt-dark-blue bb2-dark-blue uppercase pb-5">Admin Dashbaord</div>
					</div>
					
					<div className="large-3 medium-4 small-6 cell text-left pt-20">
						<Link to="/admin/users" className="icon-with-text hover-opacity-50 no-underline">
							<img src={users_icon} className="" width="40" alt="users"/> <span className="txt-dark-red">USERS</span>
						</Link>
					</div>

				</div>
			</div>
		</div>
	);
}

export default Dashboard;