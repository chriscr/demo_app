import { Outlet, Navigate } from 'react-router-dom';

import AuthUtility from './components/frontend/auth/AuthUtility';

const MemberPrivateRoutes = () => {
	
    let auth = {'token':false, 'role':'none'};
	let nav_path = '';

	if (AuthUtility.isLoggedIn()) {
		
		auth.token = true;
		
		if(localStorage.getItem('auth_role') === 'member'){
			auth.role = 'member';
		}else if(localStorage.getItem('auth_role') === 'admin'){
			auth.role = 'admin';
			nav_path = 'admin/account';
		}
	}else{
			nav_path = '/login';
	}
		
    return(
        auth.token && auth.role === 'member' ? <Outlet/> : <Navigate to={nav_path}/>
    )
}

export default MemberPrivateRoutes