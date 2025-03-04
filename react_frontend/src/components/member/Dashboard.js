import React from 'react';
import {Link} from 'react-router-dom';

import check_list_icon from '../../assets/frontend/images/check_list_icon.png';
import portfolio_icon from '../../assets/frontend/images/portfolio_icon.png';
import location_finder_icon from '../../assets/frontend/images/location_finder_icon.png';
import weather_icon from '../../assets/frontend/images/weather_icon.png';
import videos_icon from '../../assets/frontend/images/videos_icon.png';
import payments_icon from '../../assets/frontend/images/payments_icon.png';

function Dashboard(){
    
	return(
		<div className="body-content bg-fff pt-70l-110m-50s">
		
			<div className="panel largeX ptb-20 plr-20l-10s">

				<div className="grid-x">
					<div className="large-12 medium-12 small-12 cell text-left">
						<div className="font-source-sans font-size-20 font-weight-800 txt-slate-blue bb2-slate-blue letter-spacing-1px uppercase pb-5">Dashboard</div>
					</div>
					
					<div className="large-3 medium-4 small-6 cell text-left pt-20">
						<Link to="/member/check_list" className="icon-with-text hover-opacity-50 no-underline">
							<img src={check_list_icon} className="" width="40" alt="check list"/> <span className="txt-dark-red">CHECK LIST</span>
						</Link>
					</div>
					<div className="large-3 medium-4 small-6 cell text-left pt-20">
						<Link to="/member/portfolio" className="icon-with-text hover-opacity-50 no-underline">
							<img src={portfolio_icon} className="" width="50" alt="portfolio"/> <span className="txt-dark-red">PORTFOLIO</span>
						</Link>
					</div>
					<div className="large-3 medium-4 small-6 cell text-left pt-20">
						<Link to="/member/traffic" className="icon-with-text hover-opacity-50 no-underline">
							<img src={location_finder_icon} className="" width="40" alt="traffic incidents"/> <span className="txt-dark-red">TRAFFIC</span>
						</Link>
					</div>
					<div className="large-3 medium-4 small-6 cell text-left pt-20">
						<Link to="/member/weather" className="icon-with-text hover-opacity-50 no-underline">
							<img src={weather_icon} className="br-5" width="42" alt="weather"/> <span className="txt-dark-red">WEATHER</span>
						</Link>
					</div>
					<div className="large-3 medium-4 small-6 cell text-left pt-20">
						<Link to="/member/videos" className="icon-with-text hover-opacity-50 no-underline">
							<img src={videos_icon} className="br-5" width="42" alt="videos"/> <span className="txt-dark-red">VIDEOS</span>
						</Link>
					</div>
					<div className="large-3 medium-4 small-6 cell text-left pt-20">
						<Link to="/member/payments" className="icon-with-text hover-opacity-50 no-underline">
							<img src={payments_icon} className="br-5" width="42" alt="payments"/> <span className="txt-dark-red">PAYMENTS</span>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Dashboard;