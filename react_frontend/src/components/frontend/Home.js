import React from 'react';
import { Link } from 'react-router-dom';

import demo_image from '../../assets/frontend/images/demo_image.png';

function Home() {

	return (
		<div className="body-content bg-fff pt-70l-110m-50s pb-40">

			<div className="panel large">
				<div className="grid-x">
					<div className="large-12 medium-12 small-12 cell text-center pt-40">
						<div className="font-source-sans font-size-30 font-weight-800 txt-dark-blue uppercase">DEMO APP</div>
						<div className="ptb-40l-30m-20s">
							<img src={demo_image} className="show-for-large" alt="main home image" width="300" />
							<img src={demo_image} className="show-for-medium-only" alt="main home image" width="250" />
							<img src={demo_image} className="show-for-small-only" alt="main home image" width="40%" />
						</div>
						<div className="font-source-sans font-size-18 font-weight-600 txt-dark-blue">&nbsp;By C. Romero</div>
					</div>
					<div className="large-12 medium-12 small-12 cell text-center pt-40">
						<div className="font-source-sans font-size-18l-16m-14s font-weight-500 justify line-height-125per">
							The DEMO APP was developed to demonstrate the usage of the React.js modern front-end framework leveraging its key components,
							the Laravel framework to facilitate the RESTful API, the database using the MySQL database, and utilize several 3rd party APIs for consuming and providing data.
							Detailed information can be reviewed in the <Link to="/technical_highlights">technical higlights</Link> for each of the major areas of development.
						</div>
					</div>
				</div>
			</div>

		</div>

	);
}

export default Home;