import React from 'react';

function TechnicalHighlights(){
	return(
		<div className="body-content bg-fff pt-70l-110m-50s pb-100">

		<div className="panel large pt-20l-10s">
			<div className="grid-x">
				<div className="large-12 medium-12 small-12 cell text-left">
					<div className="font-source-sans font-size-20 font-weight-800 txt-dark-blue bb1-dark-blue uppercase pb-5">Technical Highlights</div>
				</div>
			</div>
		</div>
		
			<div className="panel large">
				<div className="grid-x">

					<div className="large-12 medium-12 small-12 cell text-left">
						<div className="font-source-sans font-size-16l-14s font-weight-500 txt-444 justify line-height-125per pt-20">
						The DEMO APP was created to demonstrate the implmentation of the modern front-end framework React.js,
						the PHP Laravel framework to facilitate the RESTful API, the MySQL database, and several 3rd party APIs for consuming and providing data. 
						Below are the key technical higlights for each of the major areas of development.
						</div>
						
						<div className="font-source-sans font-size-16 font-weight-800 txt-333 text-left pt-20">React.js Front-End SPA</div>
						<ul className="pt-10">
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Routes for open use, authenticated members, and authenticated admin of the web application.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Master Layout to handle content for on-canvas, off-canvas, body, footer.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Local Storage for user info and web token.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Axios for AJAX calls (post, get, delete, put) to the RESTful API end-points, including handling HTTP Response Codes.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Mobile Responsiveness using the Foundation Framework and custom media queries.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Off-Canvas capability for the mobile navigation and each of the utility child components.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">React hooks and components such as useEffect, useState, handlers, toggling, navigation, mounting, properties, states to handle "cancel" and return to the original objects.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">SPA Authentication for each RESTful API end-point including headers.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">User Authentication for both both members and admin including registration, automated email, account activation, login, logout, forgot password, reset password, and profile.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Form Validation of input fields.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Child-parent component relationship and passing properties, where the child does most of the heavy lifting and the parent provides the presentation.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Six features to CRUD high and low level objects through the parent and child components.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5"><b>CheckLists</b> allows a user to create/delete multiple checklists, then CRUD the checklist items. A key feature is multiple checklist items can be managed in one API call.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5"><b>Portfolios</b> allows a user to create/delete multiple portfolios, then CRUD the individual symbols. A key feature is multiple symbols can be managed in one API call. The utility uses the AlphaVantage API for 15-minute quote data.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5"><b>Location Search</b> allows a user to search for multiple locations, then provide location pins within a 10 mile radius. The utility uses the Google Maps and Google Places APIs.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5"><b>Weather</b> allows a user to create/delete multiple locations, then provide current weather conditions and a 3-day forcast with toggling and a temperature profile chart using the HighCharts library. A key feature is no additional API calls are required when toggling the 3-day forecast. The utility uses the WeatherAPI.com API.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5"><b>Videos</b> allows a user to create, read, update, delete, and view videos. A key feature is the video and image files are stored in AWS S3.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5"><b>Payments</b> allows a user to add a title and dollar ($) amount and select using a sandbox Paypal account or sandbox credt card.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5"><b>Pagination</b> list of videos and payments created by a member has pagination (called in chunks of 10) for long lists.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5"><b>Stateful User Naviation</b> member's mobile navigation remembers which menu is open.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5"><b>App Feature Naviation</b> a sticky bottom navigation to allow users to easily navigate from one feature to another.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5"><b>Member Profile</b> members can update their password and can add their Paypal credentials to accept video donations.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Parent-child components to request and pass the low level data automatically upon mounting.</li>
						</ul>
						
						<div className="font-source-sans font-size-16 font-weight-800 txt-333 text-left pt-20">PHP Laravel Back-End RESTful API</div>
						<ul className="pt-10">
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Use PHP artisan for create, make, serve, migrate, require, clear, list, etc.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Routes for the RESTful API end-points for open usage, authenticated members and  utilizing feature specific calls, and authenticated admin utilizing feature specific calls.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Sanctum for SPA Authentication and CSRF-Cookies.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">CORS accounted for because using two different subdomains.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Migrations used for new models and modified models and personal access tokens.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Form Validation mapped by name to the front-end form input fields.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Consuming 3rd party APIs and Exception Handling.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">HTTP Response Codes.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5">Libraries for the 3rd party APIs, EmailTemplate, Random ID Generation, and Global Data.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5"><b>AuthController</b> register, activate account, automated email, login, logout, forgot password, reset password. Uses the Validator, Auth, Session, Hash, Mail, Libraries, HTTP Response Codes.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5"><b>MessagingController</b> contact. Uses the Validator and Mail.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5"><b>CheckListController</b> save checklists, read checklists, delete checklists, change default checklist, save checklist items, delete checklist items. Uses the Auth, Libraries, HTTP Response Codes.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5"><b>PortfolioController</b> save portfolios, read portfolios, delete portfolios, change default portfolio, save portfolio symbols, delete portfolio symbols. Uses the Auth, Libraries, Exceptions, HTTP Response Codes, AlphaVantage API.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5"><b>LocationController</b> save locations, read locations, delete locations, change default locations. Uses the Auth, Libraries, Exceptions, HTTP Response Codes, Google API.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5"><b>WeatherController</b> save locations, read locations, delete locations, change default locations. Uses the Auth, Libraries, Exceptions, HTTP Response Codes, WeatherAPI.com API.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5"><b>VideoController</b> create, read, update, delete videos. Uses the Auth, Libraries, Exceptions, HTTP Response Codes, AWS S3.</li>
							<li className="font-source-sans font-size-16l-14s font-weight-500 txt-444 line-height-125per pt-5"><b>PaymentController</b> create, read, update, delete payments. Uses the Auth, Libraries, Exceptions, HTTP Response Codes, Paypal API.</li>
						</ul>
					
					</div>
				</div>
			</div>
		</div>
	);
}

export default TechnicalHighlights;