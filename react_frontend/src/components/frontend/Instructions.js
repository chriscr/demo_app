import React from 'react';
import { Link } from 'react-router-dom';

function TechnicalHighlights() {
	return (
		<div className="body-content bg-fff pt-70l-110m-50s pb-40">

			<div className="panel large pt-20l-10s">
				<div className="grid-x">
					<div className="large-12 medium-12 small-12 cell text-left">
						<div className="font-source-sans font-size-20 font-weight-800 txt-dark-blue bb1-dark-blue uppercase pb-5">Instructions</div>
					</div>
				</div>
			</div>

			<div className="panel large">
				<div className="grid-x">

					<div className="large-12 medium-12 small-12 cell text-left">

						<div className="font-source-sans font-size-16 font-weight-800 txt-333 text-left pt-20">New Account&nbsp;&nbsp;&nbsp;&nbsp;<Link to="/register" className="font-source-sans font-size-16 font-weight-500">Register</Link></div>
						<ul className="pt-10">
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Use a real email to receive the automated emails and to activate the account.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Password requires at least 8 characters.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Activate account from the email.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Member dashboard has six icons for Check Lists, Portfolios, Location Search, Weather, Videos, Payments.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Use the "Add" icons and buttons to add check lists, check list items, portfolios, portfolio symbols, traffic locations, weather locations, videos, and payments.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Switch default check lists, portfolios, traffic locations, and weather locations.</li>
						</ul>

						<div className="font-source-sans font-size-16 font-weight-800 txt-333 text-left pt-20">Test Account&nbsp;&nbsp;&nbsp;&nbsp;<Link to="/login" className="font-source-sans font-size-16 font-weight-500">Login</Link></div>
						<ul className="pt-10">
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Login with an exiting test account<br /><br />email = john.smith.test.user@gmail.com<br />pw = aaaaaaaa<br /><br /></li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Member dashboard has six icons for Check Lists, Portfolios, Location Search, Weather, Videos, and Payments.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">At least one entity exists for Check Lists, Portfolios, Location Search, Weather, Videos, and Payments.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Use the "Add" icons and buttons to add check lists, check list items, portfolios, portfolio symbols, traffic locations, weather locations, videos, and payments.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Switch default check lists, portfolios, traffic locations, and weather locations.</li>
						</ul>

						<div className="font-source-sans font-size-16 font-weight-800 txt-333 text-left pt-20">Coming Soon</div>
						<ul className="pt-10">
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Java Spring Boot RESTful API</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Python SFastAPI RESTful API</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Donations for Individual Videos</li>
						</ul>

					</div>
				</div>
			</div>
		</div>
	);
}

export default TechnicalHighlights;