import React, {useState} from 'react';

import TrafficManager from './TrafficManager';
import AuthUtility from '../frontend/auth/AuthUtility';
import LoadingSpinner from '../frontend/LoadingSpinner';

import $ from "jquery";

import arrow_right_90 from '../../assets/frontend/images/arrow_right_90.png';

function Traffic(){
	
	
	// using hooks
    const [isLoading, setIsLoading] = useState(true);
	const [trafficIncidentData, setTrafficIncidentData] = useState({
		location: {
			city: '',
			state: '',
			country: '',
			lat: '',
			lng: '',
		},
		incidents: [],
		incident_locations: [],
	});
	const [trafficLocationMessage, setTrafficLocationMessage] = useState('');

	const handleLocationManagerOpen = (isLocationManagerOpen) => {
		if(isLocationManagerOpen){
			$('#map_container').addClass('hide');
			$('#incident_data').addClass('hide');
		}else{
			$('#map_container').removeClass('hide');
			$('#incident_data').removeClass('hide');
		}
	};

	const handleTrafficIncidentData = (onClicktrafficIncidentDataFromLM, default_location) => {

		if(onClicktrafficIncidentDataFromLM && onClicktrafficIncidentDataFromLM.incidents && onClicktrafficIncidentDataFromLM.incidents.length > 0){

			setTrafficLocationMessage('');
			
			var incident_locations  = [];
			for (let i = 0; i < onClicktrafficIncidentDataFromLM.incidents.length; i++) {
				if(onClicktrafficIncidentDataFromLM.incidents[i].severity === 1){
					incident_locations.push({ lat: onClicktrafficIncidentDataFromLM.incidents[i].lat, lng: onClicktrafficIncidentDataFromLM.incidents[i].lng, icon: 'yellow', short_desc:  onClicktrafficIncidentDataFromLM.incidents[i].shortDesc});
				}else if(onClicktrafficIncidentDataFromLM.incidents[i].severity === 2){
					incident_locations.push({ lat: onClicktrafficIncidentDataFromLM.incidents[i].lat, lng: onClicktrafficIncidentDataFromLM.incidents[i].lng, icon: 'orange', short_desc:  onClicktrafficIncidentDataFromLM.incidents[i].shortDesc });
				}else if(onClicktrafficIncidentDataFromLM.incidents[i].severity === 3){
					incident_locations.push({ lat: onClicktrafficIncidentDataFromLM.incidents[i].lat, lng: onClicktrafficIncidentDataFromLM.incidents[i].lng, icon: 'red', short_desc:  onClicktrafficIncidentDataFromLM.incidents[i].shortDesc });
				}else if(onClicktrafficIncidentDataFromLM.incidents[i].severity === 4){
					incident_locations.push({ lat: onClicktrafficIncidentDataFromLM.incidents[i].lat, lng: onClicktrafficIncidentDataFromLM.incidents[i].lng, icon: 'purple', short_desc:  onClicktrafficIncidentDataFromLM.incidents[i].shortDesc });
				}if(onClicktrafficIncidentDataFromLM.incidents[i].severity === 5){
					incident_locations.push({ lat: onClicktrafficIncidentDataFromLM.incidents[i].lat, lng: onClicktrafficIncidentDataFromLM.incidents[i].lng, icon: 'pink', short_desc:  onClicktrafficIncidentDataFromLM.incidents[i].shortDesc });
				}
        
			}
			
			setTrafficIncidentData({...trafficIncidentData,
				location: onClicktrafficIncidentDataFromLM.location,
				incidents: onClicktrafficIncidentDataFromLM.incidents,
				incident_locations: incident_locations,
			});
			
		}else{

			setTrafficLocationMessage('No Traffic Locations Exist');

			setTrafficIncidentData({...trafficIncidentData,
				location: {
					city: '',
					state: '',
					country: '',
					lat: '',
					lng: '',
				},
				incidents: [],
				incident_locations: [],
			});
		}
		
		setIsLoading(false);
	};

	return(
		<div className="body-content z-index-0 bg-fff pt-70l-110m-50s pb-20l-10s">
		
			<div className="panel largeX ptb-20 plr-20l-10s">
			
				<div className="grid-x">
				
					<div className="large-11 medium-11 small-10 cell text-left">
						<div className="font-source-sans page-header font-weight-800 txt-slate-blue bb2-slate-blue letter-spacing-1px uppercase pb-5">Traffic </div>
						<div className="pt-5">
							<span className="font-source-sans font-size-16 font-weight-600">
							{trafficIncidentData.location.city ? trafficIncidentData.location.city+', '+trafficIncidentData.location.state +' '+trafficIncidentData.location.country: ''}
							</span>
							<span className="font-source-sans font-standard font-weight-500 pl-5 hide-for-480px">
							{trafficIncidentData.location.city ? '('+trafficIncidentData.location.lat+', '+trafficIncidentData.location.lng+')' : ''}
							</span>
						</div>
					</div>
					<div className="large-1 medium-1 small-2 cell text-right">
						<TrafficManager onTrafficIncidentData={handleTrafficIncidentData} onLocationManagerOpen={handleLocationManagerOpen} />
 					</div>
				
				</div>
				
				{trafficIncidentData.incidents.length > 0 ? ( 
				<div className="grid-x pt-10">
					<div id="incident_data" className="large-12 medium-12 small-12 cell pt-10">
							<table className=" ">
								<thead className="bg-ccc">
									<td className="p-5">Sev.</td>
									<td></td>
									<td></td>
									<td>Start</td>
									<td>End</td>
								</thead>
								<tbody>
								{trafficIncidentData.incidents.map((incident, index) => (
									<tr key={incident.id}>
										<td key={incident.id + '_4'} className="font-source-sans font-standard font-weight-500 plr-10">{incident.severity}</td>
										<td key={incident.id + '_2'} className="width-40px"><img src={incident.iconURL} width="40" alt="incident"/></td>
										<td key={incident.id + '_3'} className="font-source-sans font-standard font-weight-500 ptb-10 pl-5">{incident.address}<div className="pt-5">{incident.fullDesc}<br/>{'('+incident.lat+', '+incident.lng+')'}</div></td>
										<td key={incident.id + '_5'} className="font-source-sans font-small font-weight-500">{incident.startTime}</td>
										<td key={incident.id + '_6'} className="font-source-sans font-small font-weight-500">{incident.endTime}</td>
									</tr>
						    	))}
						    	</tbody>
						    </table>
					</div>
				</div>
				): (
				<div className="grid-x">
					<div className="large-12 medium-12 small-12 cell">
						{trafficIncidentData.location.city  ? (
							trafficIncidentData.incidents.length > 0 ? (
								<></>
							) : (
							<span className="font-source-sans page-text font-weight-600 txt-dark-blue left">No Traffic Incidents</span>
							)
						) : (
						<div>
							
						<div className="clearfix vertical-center-content pt-10 pr-5">
							<span className="font-source-sans page-text font-weight-600 txt-dark-blue left">{trafficLocationMessage}</span>
							<span className="font-source-sans page-standard font-weight-600 txt-dark-blue right">Add Traffic Location <img src={arrow_right_90} width="35" alt="note for order"/></span>
						</div>
						
						<div className="text-center p-20 b1-ccc bg-fafafa mt-20">
							<span className="font-source-sans page-text font-weight-600 txt-333">Data Provided by TomTom API</span>
						</div>
						</div>
						)}
					</div>
				</div>
				)
				}
					
					
				{isLoading && 
				<div className="large-12 medium-12 small-12 cell text-center">
				<LoadingSpinner paddingClass="p-20l-10s" />
				</div>
				}
			</div>
		</div>
	);
}

export default Traffic;