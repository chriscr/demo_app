import React from 'react';

import safari_popups_image from '../../assets/frontend/images/safari_popups.jpeg';

function Help() {
	return (
		<div className="body-content bg-fff pt-70l-110m-50s pb-40">

			<div className="panel large pt-20l-10s">
				<div className="grid-x">
					<div className="large-12 medium-12 small-12 cell text-left">
						<div className="font-source-sans font-size-20 font-weight-800 txt-dark-blue bb1-dark-blue uppercase pb-5">Help</div>
					</div>
				</div>
			</div>

			<div className="panel large pt-20l-10s">
				<div className="grid-x bg-fafafa b1-ddd p-20l-10s">
					<div className="large-12 medium-12 small-12 cell">
						<div className="font-raleway font-size-18 font-weight-700 uppercase text-left hide-for-small-only">Technical Issues</div>
						<div className="font-raleway font-size-18 font-weight-700 uppercase text-center show-for-small-only">Technical Issues</div>
						<div className="font-raleway font-size-16l-14s font-weight-500 line-height-125per justify pt-20">
						If you run into any technical issues please contact us at <a href="mailto:support@DoubleIntegration.com" className="" target="_blank">support@DoubleIntegration.com</a>.
						</div>
					</div>
				</div>
			</div>

			<div className="panel large pt-20l-10s">
				<div className="grid-x bg-fafafa b1-ddd p-20l-10s">
					<div className="large-12 medium-12 small-12 cell">
						<div className="font-raleway font-size-18 font-weight-700 uppercase text-left hide-for-small-only">Zoom App - Apple Devices</div>
						<div className="font-raleway font-size-18 font-weight-700 uppercase text-center show-for-small-only">Zoom App - Apple Devices</div>
						<div className="font-raleway font-size-16l-14s font-weight-500 line-height-125per justify pt-20">
						Due to increased security and permissions with Mac OS on Apple devices running Safari, you will be prompted to authorize the Zoom Client App to use the microphone, camera, and on Mac OS, screen recording.
						You will also be prompted to allow the Zoom Client App to allow others to remotely control your desktop. You can click OK during the initial request and you will be able to use your microphone and camera in Zoom.
						For more detailed information please visit the <a href="https://support.zoom.us/hc/en-us/articles/360016688031-Using-the-Zoom-Client-and-Zoom-Rooms-with-macOS" className="font-raleway font-size-16l-14s font-weight-500" target="_blank">Zoom App support for Apple users</a>.
						</div>
						<div className="font-raleway font-size-16l-14s font-weight-500 line-height-125per justify pt-20">
						If you are an <span className="font-weight-600">Apple Safari/macOS</span> user, you must go to your browser or macOS security settings and allow the Zoom App to launch.
						</div>
						<div className="text-center pt-20">
							<img src={safari_popups_image} alt="safari popups" width="600"/>
						</div>
						<div className="font-raleway font-size-16l-14s font-weight-500 line-height-125per justify pt-20">
						If you are a <span className="font-weight-500">Chrome</span> or <span className="font-weight-500">Firefox</span> user you may need to allow popup windows to launch the Zoom App.
						</div>
					</div>
				</div>
			</div>

		</div>
	);
}

export default Help;