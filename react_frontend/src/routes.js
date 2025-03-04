
import Home from './components/frontend/Home';
import About from './components/frontend/About';
import Contact from './components/frontend/Contact';
import Help from './components/frontend/Help';
import TechnicalHighlights from './components/frontend/TechnicalHighlights';
import Instructions from './components/frontend/Instructions';

import Login from './components/frontend/auth/Login';
import Register from './components/frontend/auth/Register';
import ActivateAccount from './components/frontend/auth/ActivateAccount';
import ForgotPassword from './components/frontend/auth/ForgotPassword';
import ResetPassword from './components/frontend/auth/ResetPassword';

import SearchVideos from './components/frontend/SearchVideos';

import MemberDashboard from './components/member/Dashboard';
import MemberAccount from './components/member/Account';
import MemberProfile from './components/member/Profile';
import MemberSettings from './components/member/Settings';
import MemberCheckList from './components/member/CheckList';
import MemberPortfolio from './components/member/Portfolio';
import MemberLocationFinder from './components/member/LocationFinder';
import MemberWeather from './components/member/Weather';
import MemberVideos from './components/member/Videos';
import MemberVideoManager from './components/member/VideoManager';
import MemberPayments from './components/member/Payments';
import MemberPaymentManager from './components/member/PaymentManager';

import AdminDashboard from './components/admin/Dashboard';
import AdminProfile from './components/admin/Profile';
import AdminSettings from './components/admin/Settings';
import AdminUsers from './components/admin/Users';
import AdminCategories from './components/admin/Categories';
import AdminAddCategory from './components/admin/AddCategory';

// Tests

const ActivateAccountWithId = ({ id }) => <ActivateAccount id={id} />;
const ResetPasswordWithIdEmail =  ({ id, email }) => <ResetPassword id={id} email={email} />;

const routes = [
	{
		path: '/',
		element: <Home />,
		type: 'public',
	}, {
		path: '/home',
		element: <Home />,
		type: 'public',
	}, {
		path: '/about',
		element: <About />,
		type: 'public',
	}, {
		path: '/contact',
		element: <Contact />,
		type: 'public',
	}, {
		path: '/help',
		element: <Help />,
		type: 'public',
	}, {
		path: '/technical_highlights',
		element: <TechnicalHighlights />,
		type: 'public',
	}, {
		path: '/instructions',
		element: <Instructions />,
		type: 'public',
	}, {
		path: '/login',
		element: <Login />,
		type: 'public',
	}, {
		path: '/register',
		element: <Register />,
		type: 'public',
	}, {
		path: '/activate_account/:id',
		element: <ActivateAccountWithId />,
		type: 'public',
	}, {
		path: '/forgot_password',
		element: <ForgotPassword />,
		type: 'public',
	}, {
		path: '/reset_password/:id/:email',
		element: <ResetPasswordWithIdEmail />,
		type: 'public',
	}, {
		path: '/search_videos',
		element: <SearchVideos />,
		type: 'public',
	}, {
		path: '/member/dashboard',
		element: <MemberDashboard />,
		type: 'private member',
	}, {
		path: '/member/account',
		element: <MemberAccount />,
		type: 'private member',
	}, {
		path: '/member/profile',
		element: <MemberProfile />,
		type: 'private member',
	}, {
		path: '/member/settings',
		element: <MemberSettings />,
		type: 'private member',
	}, {
		path: '/member/check_list',
		element: <MemberCheckList />,
		type: 'private member',
	}, {
		path: '/member/portfolio',
		element: <MemberPortfolio />,
		type: 'private member',
	}, {
		path: '/member/location_finder',
		element: <MemberLocationFinder />,
		type: 'private member',
	}, {
		path: '/member/weather',
		element: <MemberWeather />,
		type: 'private member',
	}, {
		path: '/member/videos',
		element: <MemberVideos />,
		type: 'private member',
	}, {
		path: '/member/video_manager',
		element: <MemberVideoManager />,
		type: 'private member',
	}, {
		path: '/member/payments',
		element: <MemberPayments />,
		type: 'private member',
	}, {
		path: '/member/payment_manager',
		element: <MemberPaymentManager />,
		type: 'private member',
	}, {
		path: '/admin/dashboard',
		element: <AdminDashboard />,
		type: 'private admin',
	}, {
		path: '/admin/profile',
		element: <AdminProfile />,
		type: 'private admin',
	}, {
		path: '/admin/settings',
		element: <AdminSettings />,
		type: 'private admin',
	}, {
		path: '/admin/users',
		element: <AdminUsers />,
		type: 'private admin',
	}, {
		path: '/admin/categories',
		element: <AdminCategories />,
		type: 'private admin',
	}, {
		path: '/admin/add_category',
		element: <AdminAddCategory />,
		type: 'private admin',
	},
	// And so on.

	//Tests
];

export default routes;