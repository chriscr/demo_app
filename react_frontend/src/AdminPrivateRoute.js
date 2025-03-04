import { Outlet, Navigate } from 'react-router-dom'

const ClientPrivateRoutes = () => {
	
    let auth = {'token':false, 'role':'none'};
	let nav_path = '';

    if(localStorage.getItem('auth_users_name') && localStorage.getItem('auth_email')
	&& localStorage.getItem('auth_token') && localStorage.getItem('auth_role')){
		
		auth.token = true;
		
		if(localStorage.getItem('auth_role') === 'member'){
			auth.role = 'member';
			nav_path = 'member/my_list_items';
		}else if(localStorage.getItem('auth_role') === 'admin'){
			auth.role = 'admin';
		}
	}else{
			nav_path = '/login';
	}
		
    return(
        auth.token && auth.role === 'admin' ? <Outlet/> : <Navigate to={nav_path}/>
    )
}

export default ClientPrivateRoutes