const AuthUtility = {
	setAuthData: (first_name, last_name, email, token, role, paypal_email, password, remember_me) => {

		var last_name_initial = '';
		if(last_name && last_name !== ''){
			last_name_initial = ' ' + last_name.charAt(0);
		}
		localStorage.setItem('auth_first_name', first_name);
        localStorage.setItem('auth_last_name', last_name);
		localStorage.setItem('auth_name', first_name + last_name_initial);
        localStorage.setItem('auth_email', email);

        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_role', role);

        localStorage.setItem('auth_paypal_email', paypal_email);
        
        if (typeof remember_me === 'boolean') {
			if(remember_me){
	        	localStorage.setItem('password', password);
	        	localStorage.setItem('remember_me', 'true');
			}else{
	        	localStorage.removeItem('password');
	        	localStorage.removeItem('remember_me');
			}
		}
	},
	clearAuthData: () => {

		if(!localStorage.getItem('remember_me') || localStorage.getItem('remember_me') !== 'true'){
        	localStorage.removeItem('auth_first_name');
        	localStorage.removeItem('auth_last_name');
        	localStorage.removeItem('auth_name');
        	localStorage.removeItem('auth_last_name');
        	localStorage.removeItem('password');
		}
			
        localStorage.removeItem('paypal_email');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_role');
	},
	getAuthData: () => {
	    const first_name = localStorage.getItem('auth_first_name');
	    const last_name = localStorage.getItem('auth_last_name');
	    const name = localStorage.getItem('auth_last_nauth_nameme');
	    const email = localStorage.getItem('auth_email');
	    const token = localStorage.getItem('auth_token');
	    const role = localStorage.getItem('auth_role');
	    const paypal_email = localStorage.getItem('paypal_email');

	    return { first_name, last_name, name, email, token, role, paypal_email };
	},
	isLoggedIn: () => {
		if(localStorage.getItem('auth_first_name') && localStorage.getItem('auth_last_name') && localStorage.getItem('auth_email')
		&& localStorage.getItem('auth_token') && localStorage.getItem('auth_role')){
			return true;
		}else{
			return false;
		}
	},
};

export default AuthUtility;
