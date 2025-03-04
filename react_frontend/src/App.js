import React, {useEffect} from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import MasterLayout from './layouts/frontend/MasterLayout';

import FrontEndPublicRoute from './FrontEndPublicRoute';
import MemberPrivateRoute from './MemberPrivateRoute';
import AdminPrivateRoute from './AdminPrivateRoute';

import axios from 'axios';

import './assets/frontend/css/html-tags-app.css';
import './assets/frontend/css/fonts.css';
import './assets/frontend/css/colors-grey.css';
import './assets/frontend/css/borders-grey.css';
import './assets/frontend/css/borders-radius.css';
import './assets/frontend/css/hide-show.css';
import './assets/frontend/css/widths-heights.css';

import './assets/frontend/css/html-tags.css';

import './assets/frontend/css/panels.css';
import './assets/frontend/css/reveal.css';
import './assets/frontend/css/forms.css';
import './assets/frontend/css/buttons.css';
import './assets/frontend/css/utils.css';

import './assets/frontend/css/borders-app.css';
import './assets/frontend/css/navigation-bar.css';
import './assets/frontend/css/navigation-mobile.css';
import './assets/frontend/css/navigation-desktop.css';
import './assets/frontend/css/colors-app.css';
import './assets/frontend/css/footer.css';
import './assets/frontend/css/spacing-mr.css';
import './assets/frontend/css/spacing.css';
import './assets/frontend/css/z-index.css';

/* from utils-app */
axios.defaults.baseURL = "http://localhost:8000";
//axios.defaults.baseURL = "http://demo-app-api.doubleintegration.com";
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
axios.defaults.withCredentials = true;

function App() {

  return (
    <div className="App">

		<Router>
			<Routes>
				<Route element={<FrontEndPublicRoute />}>
					<Route path="/*" exact element={<MasterLayout />} />
				</Route>
				<Route element={<MemberPrivateRoute />}>
					<Route path="/member/*" name="Member" element={<MasterLayout />} />
				</Route>
				<Route element={<AdminPrivateRoute />}>
					<Route path="/admin/*" name="Admin" element={<MasterLayout />} />
				</Route>
			</Routes>
		</Router>

    </div>
  );
}

export default App;