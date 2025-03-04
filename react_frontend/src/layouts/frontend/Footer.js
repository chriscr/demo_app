import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import swal from 'sweetalert';

import logo from '../../assets/frontend/images/demo_logo.png';

function Footer() {

	var margin_bottom = '';
	if (localStorage.getItem('auth_users_first_name') && localStorage.getItem('auth_users_last_name') && localStorage.getItem('auth_email')
		&& localStorage.getItem('auth_token') && localStorage.getItem('auth_role')) {
		margin_bottom = 'mb-110l-90s';
	}

	const showPrivacyPolicy = (event) => {
		event.preventDefault();

		//Type appropriate comment here, and begin script below
		swal({
			title: 'Privacy Policy',
			text: 'This is the privacy policy!',
			html: true,
			icon: 'info',
			showCancelButton: true,
			confirmButtonText: 'Yes, I understand the privacy policy!'
		});
	}

	const showTermsConditions = (event) => {
		event.preventDefault();

		//Type appropriate comment here, and begin script below
		swal({
			title: 'Terms & Conditions',
			text: 'These are the terms & conditions!',
			html: true,
			icon: 'info',
			showCancelButton: true,
			confirmButtonText: 'Yes, I understand the terms!'
		});
	}

	return (
		<div className="sticky-bottom">

			<div className="sticky footer ptb-10l-5s bg-fafafa bt1-ddd">
				<div className="panel large">
					<div className="grid-x">
						<div className="large-12 medium-12 small-12 cell bb1-ddd pb-10l-5s">
							<div className="hide-for-small-only">
								<span className="pr-10"><Link to="/about" className="font-source-sans font-size-14 font-weight-500 letter-spacing-0px">About</Link></span>
								<span className="plr-10"><Link to="/contact" className="font-source-sans font-size-14 font-weight-500 letter-spacing-0px">Contact</Link></span>
								<span className="plr-10"><Link to="/help" className="font-source-sans font-size-14 font-weight-500 letter-spacing-0px">Help</Link></span>
								<span className="plr-10"><Link className="font-source-sans font-size-14 font-weight-500 letter-spacing-0px" onClick={showTermsConditions}>Terms & Conditions</Link></span>
								<span className="plr-10"><Link className="font-source-sans font-size-14 font-weight-500 letter-spacing-0px" onClick={showPrivacyPolicy}>Privacy Policy</Link></span>
							</div>
							<div className="show-for-small-only">
								<span className="pr-5"><Link to="/about" className="font-source-sans font-size-14 font-weight-500 letter-spacing-0px">About</Link></span>
								<span className="plr-5"><Link to="/contact" className="font-source-sans font-size-14 font-weight-500 letter-spacing-0px">Contact</Link></span>
								<span className="plr-5"><Link to="/help" className="font-source-sans font-size-14 font-weight-500 letter-spacing-0px">Help</Link></span>
								<span className="plr-5"><Link className="font-source-sans font-size-14 font-weight-500 letter-spacing-0px" onClick={showTermsConditions}>Terms</Link></span>
								<span className="pl-5"><Link className="font-source-sans font-size-14 font-weight-500 letter-spacing-0px" onClick={showPrivacyPolicy}>Privacy</Link></span>
							</div>
						</div>
						<div className="large-12 medium-12 small-12 cell pt-10l-5s">
							<span className="font-source-sans font-size-14 font-weight-500 pr-20">&copy;&nbsp;2020-2025</span>
							<span className="font-source-sans font-size-14 font-weight-500">Update: 01/14/2025</span>
						</div>
					</div>
				</div>
				<div className={margin_bottom}></div>
			</div>

		</div>
	)

}

export default Footer;