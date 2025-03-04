import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { Outlet, Navigate } from 'react-router-dom'

const PublicRoute = () => {
	const location = useLocation();
	
    let auth = {'token':false, 'role':'none'};
	let nav_path = '';

    if((location.pathname === '/login' || location.pathname === '/register')
	&& localStorage.getItem('auth_users_name') && localStorage.getItem('auth_email')
	&& localStorage.getItem('auth_token') && localStorage.getItem('auth_role')){
		
		auth.token = true;
		
		if(localStorage.getItem('auth_role') === 'member'){
			auth.role = 'member';
		}else if(localStorage.getItem('auth_role') === 'admin'){
			auth.role = 'admin';
		}
		
		if(auth.role !== 'none' && (location.pathname === '/login' || location.pathname === '/register')){
			if(localStorage.getItem('auth_role') === 'member'){
				nav_path = '/member/dashboard';
			}else if(localStorage.getItem('auth_role') === 'admin'){
				nav_path = '/admin/dashboard';
			}
		}else{
			nav_path = location.pathname;
		}
		
	}else if(location.pathname === '/'){
		nav_path = '/home';
	}else{
		nav_path = location.pathname;
	}
		
    return(
        location.pathname !== '/' && nav_path !== '/member/dashboard' && nav_path !== '/admin/dashboard' ? <Outlet/> : <Navigate to={nav_path}/>
    )
}

export default PublicRoute