import React from 'react';
import {Routes, Route, useLocation } from 'react-router-dom';

import AuthUtility from '../../components/frontend/auth/AuthUtility';
import NotFound from '../../components/frontend/NotFound';
import OnCanvasHeader from './OnCanvasHeader';
import OnCanvasNavigation from './OnCanvasNavigation';
import Footer from './Footer';

import routes from '../../routes';

const MasterLayout = () => {

	const location = useLocation();
	console.log(location.pathname);
	
	var locationSplit = location.pathname.split("/");

	var OnCanvasBottomComponent = <Footer />;
	var auth_role;
    if(AuthUtility.isLoggedIn()){
		auth_role = localStorage.getItem('auth_role');
		if(auth_role == 'member'){
			OnCanvasBottomComponent = <OnCanvasNavigation />
		}
	}

	var filteredRoute = routes.filter(route => route.path === location.pathname
	|| route.path === '/'+locationSplit[1]+'/:id' //activate_account
	|| (route.path === '/'+locationSplit[1]+'/:id/:email') //reset password
	).map(route => { return(
		route
  	)});

	var RouteComponent = '';
	if(filteredRoute && filteredRoute.length > 0){
		var filtered_route_path = '';
		if(auth_role){//logged in
			//strip out the '/role' part of the path, already defined in App.js
			filtered_route_path = filteredRoute[0].path.replace('/'+auth_role,'');
		}else{//not logged in
			filtered_route_path = filteredRoute[0].path;
		}
		
		RouteComponent = (
			<Route path={filtered_route_path} element={filteredRoute[0].element} />
		)
	}else{
		RouteComponent = (
			<Route path="/*" element={<NotFound />} />
		)
	}

	return(
		<div>
			<div className="off-canvas-content">
				<OnCanvasHeader />
				<main className="body-content">
					<Routes>
						{RouteComponent}
					</Routes>
				</main>
				{OnCanvasBottomComponent}
			</div>
		</div>
	);

}

export default MasterLayout;

