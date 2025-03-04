import React, {useState, useEffect, useRef} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { OffCanvas, OffCanvasMenu, OffCanvasBody } from "react-offcanvas";

import AxiosApiClient from '../utils/AxiosApiClient';
import AuthUtility from '../frontend/auth/AuthUtility';
import LoadingSpinner from '../frontend/LoadingSpinner';
import Copyright from '../../layouts/frontend/Copyright';

import $ from "jquery";
import swal from 'sweetalert';

import location_finder_icon from '../../assets/frontend/images/location_finder_icon.png';
import plus_icon from '../../assets/frontend/images/plus_icon_white.png';
import close_icon from '../../assets/frontend/images/close_icon_black.png';
import delete_icon from '../../assets/frontend/images/delete_icon.png';

const TrafficManager = ({ onTrafficIncidentData, onLocationManagerOpen }) => {//sends incident data and boolean for opening/closing the location finder
	
	const navHistory = useNavigate();
	
	//check if clicked target is not within the offcanvasnav
	const locationIconRef = useRef();
	const locationManagerRef = useRef();
	const closeLocationManagerRef = useRef();
	
	//using hooks
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
	const [isLocationManagerOpen, setIsLocationManagerOpen] = useState(false);
	const [newLocation, setNewLocation] = useState({
			location: '',
			info: '',
			trafficData: [],
	});
	const [trafficLocations, setTrafficLocations] = useState([]);
	
	//handles click outside slide out
	useEffect(() => {
		const handleClickOutside = (event) => {
			
			// add event listener to close menu when clicked outside		
			if (locationManagerRef.current && !locationManagerRef.current.contains(event.target)) {
				onLocationManagerOpen(false);
				setIsLocationManagerOpen(false);
			}
			
			//open nav with mobile icon click which is in the div id=navigation
			if (!isLocationManagerOpen && locationIconRef.current && locationIconRef.current.contains(event.target) && locationIconRef.current.id === 'location_icon') {
				onLocationManagerOpen(true);
				setIsLocationManagerOpen(true);
			}
		}
		
		document.addEventListener("mousedown", handleClickOutside)
			
		return () => {
			// Cleanup the event listener
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [isLocationManagerOpen, onLocationManagerOpen]);
  
	// Initial call for user list items
	useEffect(() => {
		
		setIsLoading(true);
		
		if (isMounted) {
			
			console.log('[TrafficManager - useEffect] mounted');

			axios.get('/sanctum/csrf-cookie').then(response_csrf => {// CSRF Protection through Laravel
				axios.get('/api/read_traffic_locations', {
					headers: {
						'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
					}
				}).then(response =>{
					if(response.data.status === 200){//HTTP_OK
					
						//set data
						if(response.data.locations){
							setTrafficLocations(response.data.locations);
						}
						setIsLocationManagerOpen(false);
						setNewLocation({...newLocation, location: '', info: ''});
						
						const default_location = response.data.locations.filter(location => location.default === 1) // Filter by default === 1
    					.map(location => location.name); // Extract only the name property

						//pass data
						onLocationManagerOpen(false);
						//onTrafficIncidentData(response.data.traffic_incident_data, response.data.locations);
						onTrafficIncidentData([], default_location);
							
					}else if(response.data.status === 401){//HTTP_UNAUTHORIZED
					
						//user not authenticated on server so remove from local storage
						AuthUtility.clearAuthData();
				
						swal("Warning",response.data.message,"warning");
						navHistory('/login');
						
					}else if(response.data.status === 422){//HTTP_UNPROCESSABLE_ENTITY
						onTrafficIncidentData([],null);
					}else{//more errors
						onTrafficIncidentData([],null);
					}
			
					setIsLoading(false);
			
				}).catch(function (error) {
					console.log('deleteVideoFromDB error: ',error + ' back-end api call error');
				});

			}).catch(function (error) {
				console.log('deleteVideoFromDB error: ',error + ' csrf-cookie is outdated');
				
				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
							
				setIsLoading(false);
				
				navHistory('/login');
			
			});
			
		}else {
	      setIsMounted(true);
	    }
		
	}, [isMounted]);

	const toggleLocationManager = (event) => {
		event.preventDefault();

		onLocationManagerOpen(!isLocationManagerOpen);
		
		setIsLocationManagerOpen(!isLocationManagerOpen);
	}

    const handleInputChange = (event) => {
		event.stopPropagation();
		
        const { name, value } = event.target;
        
		setNewLocation({...newLocation, location: value, info: '',});

		$('.location-info').removeClass('font-source-sans font-standard font-weight-600 txt-red plr-10 pb-10').addClass('font-source-sans font-small font-weight-400').html('');
    };
    
    const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			event.preventDefault(); // Prevent form submission
			
			if (event.target.name === 'newLocation') {
		        const { name, value } = event.target;
		        
				setNewLocation({...newLocation, location: value, info: '',});
		
				$('.location-info').removeClass('font-source-sans font-standard font-weight-600 txt-red plr-10 pb-10').addClass('font-source-sans font-small font-weight-400').html('');
				
				handleSaveNewLocation(event);
			}
		}
	};
  
    // Function to handle save
    const handleSaveNewLocation = (event) => {
		event.stopPropagation();
		
		if(newLocation.location){
			saveLocation(newLocation.location);
		}else{
			setNewLocation({...newLocation, info: 'Error: Empty Location'});
			
			$('.location-info').removeClass('font-source-sans font-small font-weight-400').addClass('font-source-sans font-standard font-weight-600 txt-red plr-10 pb-10');
		}
    };
    
	function saveLocation(location_name){
		
		setIsLoading(true);
		setIsSaving(true);
			
		var payload = {
			new_location: location_name,
			radius: 10,
		}
		
		axios.get('/sanctum/csrf-cookie').then(response_csrf => {// CSRF Protection through Laravel
			axios.post('/api/save_traffic_location', payload, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
				}
			}).then(response =>{
				if(response.data.status === 200){//HTTP_OK
				
					//set data
					if(response.data.locations){
						setTrafficLocations(response.data.locations);
						if(response.data.locations.length === 1){
							setIsLocationManagerOpen(!isLocationManagerOpen);

							const default_location = response.data.locations.filter(location => location.default === 1) // Filter by default === 1
    						.map(location => location.name); // Extract only the name property

							//pass data
							//onTrafficIncidentData(response.data.traffic_incident_data);
							onTrafficIncidentData([], default_location);
							onLocationManagerOpen(!isLocationManagerOpen);
						}
					}
					setNewLocation({...newLocation, location: '', info: '',});
						
				}else if(response.data.status === 401){//HTTP_UNAUTHORIZED
					
					//user not authenticated on server so remove from local storage
					AuthUtility.clearAuthData();
				
					swal("Warning",response.data.message,"warning");
					navHistory('/login');
					
				}else if(response.data.status === 422){//HTTP_UNPROCESSABLE_ENTITY
					setNewLocation({...newLocation, info: 'Error: location does not exist.'});
				
					$('.location-info').removeClass('font-source-sans font-small font-weight-400').addClass('font-source-sans font-standard font-weight-600 txt-red plr-10 pb-10');
				
				}else{//more errors
				}
					
				setIsLoading(false);
				setIsSaving(false);
		
			}).catch(function (error) {
				console.log('saveLocation error: ',error + ' back-end api call error');
			
				setIsLoading(false);
				setIsSaving(false);
			});

		}).catch(function (error) {
			console.log('saveLocation error: ',error + ' csrf-cookie is outdated');
					
			setIsLoading(false);
			setIsSaving(false);
			
			//user not authenticated on server so remove from local storage
			AuthUtility.clearAuthData();
			
			navHistory('/login');
		});
		
	}
	
    // Delete row of id:i
    const handleRemoveClick = (i) => {
        const list = [...trafficLocations];

		if(list[i]['random_id'] && list[i]['random_id'] !== ''){
			deleteLocation(list[i]['random_id']);//send a specific unique ID to delete
		}
    };
    
	function deleteLocation(location_random_id){
		
		setIsLoading(true);
		setIsDeleting(true);
		
		axios.get('/sanctum/csrf-cookie').then(response_csrf => {// CSRF Protection through Laravel
			axios.delete('/api/delete_traffic_location/'+location_random_id, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
				}
			}).then(response =>{
				if(response.data.status === 200){//HTTP_OK
				
					//update all state properties
					if(response.data.locations){
						setTrafficLocations(response.data.locations);
						if(response.data.locations.length === 1){
							setIsLocationManagerOpen(!isLocationManagerOpen);
							//pass data
							onLocationManagerOpen(!isLocationManagerOpen);
						}
					}else{//update by filtering it out
						setTrafficLocations(oldLocations => {
						return oldLocations.filter(location => location.random_id !== location_random_id)
						});
					}
					
					if(response.data.traffic_incident_data){
						const default_location = response.data.locations.filter(location => location.default === 1) // Filter by default === 1
						.map(location => location.name); // Extract only the name property

						//onTrafficIncidentData(response.data.traffic_incident_data);
						onTrafficIncidentData([], default_location);
					}
					
					setNewLocation({...newLocation, location: '', info: '',});
						
				}else if(response.data.status === 401){//HTTP_UNAUTHORIZED
					
					//user not authenticated on server so remove from local storage
					AuthUtility.clearAuthData();
						
					swal("Warning",response.data.message,"warning");
					navHistory('/login');
					
				}else if(response.data.status === 422){//HTTP_UNPROCESSABLE_ENTITY
					swal("Warning",response.data.message,"warning");
				}else{//more errors
				}
				
				setIsLoading(false);
		
			}).catch(function (error) {
				console.log('deleteLocation error: ',error + ' back-end api call error');
			
				setIsLoading(false);
			});

		}).catch(function (error) {
			console.log('deleteLocation error: ',error + ' csrf-cookie is outdated');
		
			setIsLoading(false);
			
			//user not authenticated on server so remove from local storage
			AuthUtility.clearAuthData();
			
			navHistory('/login');
		});
	}
	
    // Delete row of id:i
    const handleChangeDefaultLocation = (i) => {
        const list = [...trafficLocations];

		if(list[i]['random_id'] && list[i]['random_id'] !== ''){
			changeDefaultLocation(list[i]['random_id']);//send a specific unique ID to delete
		}
    };
    
	function changeDefaultLocation(location_random_id){
		
		setIsLoading(true);
		
		axios.get('/sanctum/csrf-cookie').then(response_csrf => {// CSRF Protection through Laravel
			axios.put('/api/change_default_traffic_location'+location_random_id, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
				}
			}).then(response =>{
				if(response.data.status === 200){//HTTP_OK
				
					//set data
					if(response.data.locations){
						setTrafficLocations(response.data.locations);
					}
					setIsLocationManagerOpen(false);
					setNewLocation({...newLocation, location: '', info: '',});
					
					const default_location = response.data.locations.filter(location => location.default === 1) // Filter by default === 1
					.map(location => location.name); // Extract only the name property

					//pass data
					onLocationManagerOpen(false);
					//onTrafficIncidentData(response.data.traffic_incident_data);
					onTrafficIncidentData([], default_location);
						
				}else if(response.data.status === 401){//HTTP_UNAUTHORIZED
					
					//user not authenticated on server so remove from local storage
					AuthUtility.clearAuthData();
				
					swal("Warning",response.data.message,"warning");
					navHistory('/login');
					
				}else if(response.data.status === 422){//HTTP_UNPROCESSABLE_ENTITY
					swal("Warning",response.data.message,"warning");
				}else{//more errors
				}
				
				setIsLoading(false);
		
			}).catch(function (error) {
				console.log('changeDefaultLocation error: ',error + ' back-end api call error');
			
				setIsLoading(false);
			});

		}).catch(function (error) {
			console.log('changeDefaultLocation error: ',error + ' csrf-cookie is outdated');
		
			setIsLoading(false);
			
			//user not authenticated on server so remove from local storage
			AuthUtility.clearAuthData();
			
			navHistory('/login');
		});
	}
	
	return(
		<OffCanvas width={270} transitionDuration={300} effect={"parallax"} isMenuOpened={isLocationManagerOpen} position={"right"}>
			<OffCanvasBody>
				<div id="location_icon" className="p-0 m-0" ref={locationIconRef}>
					<Link to="#" className="hover-opacity-50" onClick={toggleLocationManager} onTouchEnd={toggleLocationManager}>
						<img src={location_finder_icon} className="br-5" width="40" alt="location finder"/>
					</Link>
				</div>
			</OffCanvasBody>
			<OffCanvasMenu >
				<div id="location_finder" className="z-index-2100 bg-fafafa bl1-ccc pt-70l-110m-50s" style={{height:"2000px", overflow:"hidden"}} ref={locationManagerRef}>
					<div className="clearfix p-10">
						{isLoading && 
						<span className="left"><LoadingSpinner paddingClass="none" /></span>
						}
						<Link to="#" className="button icon close-mobile-nav text-center right" onClick={toggleLocationManager}  onTouchEnd={toggleLocationManager} ref={closeLocationManagerRef}>
							<img src={close_icon} className="" width="40" alt="add new city"/>
						</Link>
					</div>
					<div className="clearfix bt1-ccc ptb-10 mlr-10">
						<span className="left"><input type="text" className="medium" value={newLocation.location} name="newLocation" onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="San Francisco, CA" /></span>
						<span className="right">
						{isSaving ? (
							<span className="button icon disabled">
								<img src={plus_icon} width="40" alt="add new location"/>
							</span>
						) : (
							<Link onMouseDown={handleSaveNewLocation} onTouchStart={handleSaveNewLocation} className="button icon">
								<img src={plus_icon} width="40" alt="add new location"/>
							</Link>
						)}
						</span>
					</div>
					<div className="location-info text-left">{newLocation.info}</div>
		
					{trafficLocations.length > 0 ? (
					<div className="ptb-5 bt1-ccc mlr-10">
			        	{trafficLocations.map((location, i) => (
							<div key={i} className="clearfix vertical-center-content">
							<span key={'name_'+i} className="left">
							{location.default ? (
							<Button onClick={() => handleChangeDefaultLocation(i)} onTouchEnd={() => handleChangeDefaultLocation(i)} variant="text" style={{ width:220, justifyContent: 'flex-start', textTransform: 'none'}}>
	            			<DoneIcon style={{ color: '#10A37F', transform: "scale(0.90)" }} /><span className="font-source-sans font-weight-600 txt-green pl-5">{shortenString(location.name)}</span>
	            			</Button>
							) : (
							<Button onClick={() => handleChangeDefaultLocation(i)} onTouchEnd={() => handleChangeDefaultLocation(i)} variant="text" style={{ width:220, justifyContent: 'flex-start', textTransform: 'none'}}>
	            			<DoneIcon style={{ transform: "scale(0.90)" }} /><span className="font-source-sans font-weight-600 txt-333 pl-5">{shortenString(location.name)}</span>
	            			</Button>
							)
							}
							</span>
							{isDeleting ? (
							<span key={'delete_'+i} className="right">
								<span className="opacity-50">
									<img src={delete_icon} className="" width="20" alt="delete location"/>
								</span>
							</span>
							) : (
							<span key={'delete_'+i} className="right">
								<Link onClick={() => handleRemoveClick(i)} onTouchEnd={() => handleRemoveClick(i)}  className="hover-opacity-50">
									<img src={delete_icon} className="" width="20" alt="delete location"/>
								</Link>
							</span>
							)}
							</div>
						))}
					</div>
					) : (
					<div className="font-source-sans page-text font-weight-600 txt-dark-blue text-center ptb-20 bt1-ccc mlr-10">No Traffic Locations</div>
					)
					}

					<Copyright />
				</div>
			</OffCanvasMenu>
		</OffCanvas>
	);
	
}

export default TrafficManager;

function shortenString(str) {
  if (str.length > 24) {
    return str.substring(0, 24);
  } else {
    return str;
  }
}
