import React, {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';

import Modal from '../../layouts/frontend/Modal';
import DonationModal from './DonationModal';
import PaypalPaymentComponent from './PaypalPaymentComponent';

import LoadingSpinner from './LoadingSpinner';

import axios from 'axios';

import $ from 'jquery'; // Import jQuery

const error_style = 'font-source-sans font-size-12 font-weight-500 txt-error bg-error p-5';
const aws_s3_url = `https://video-app-s3-bucket.s3.us-west-1.amazonaws.com`;

function SearchVideos(){
	
	const navHistory = useNavigate();
  
    // Initial states
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
	const [searchInput, setSearchInput] = useState({
		search_terms: '',
		category_id: 0,
		errorList: [],
		errorStyle: [],
	});
	const [videoList, setVideoList] = useState([
        //{ id: '', category_id: "", title: "", description: "", privacy: "", audience: "", video_file: "", thumbnail_file: "", status: "", views: 0, random_id: "", created: "", updated: "" },
	]);
	const [videoListMessage, setVideoListMessage] = useState(null);
	const [isModalOpen, setModalOpen] = useState(false);
	const [modalContent, setModalContent] = useState('');
	const [donationInput, setDonationInput] = useState({
		amount: '',
		errorList: [],
		errorStyle: [],
	});
		
	// Remove the Foundation modal directly
	
	// Initialize Foundation after the component mounts
	useEffect(() => {
		if (isMounted) {
    		$(document).foundation();
    		
		    // Close the Foundation modal directly
			setModalContent('');
			setModalOpen(false);

		}else {
	      setIsMounted(true);
	    }
		
	}, [isMounted]);
	
	
	const handleSearchInput = (event) => {
		event.persist();
		
	    setSearchInput({...searchInput, [event.target.name]: event.target.value });
		
		//remove the target error message no matter the new input, it will be validated on the server
		if (searchInput.errorList.hasOwnProperty(event.target.name)){
			delete searchInput.errorList[event.target.name];
			delete searchInput.errorStyle[event.target.name];
		}
	}
	
	const searchVideosSubmit = (event) => {
		event.preventDefault();
		
		setIsLoading(true);

		//values sent to api
		const payload = {
			search_terms: searchInput.search_terms,
			category_id: searchInput.category_id,
		}
	
		axios.get('/sanctum/csrf-cookie').then(response1 => {// CSRF Protection through Laravel
			axios.post('/api/search_videos', payload, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
				}
			}).then(response =>{
				if(response.data.status === 200){//HTTP_OK
					
					//set data
					if(response.data.videos && response.data.videos.length > 0){
						setVideoList(response.data.videos);
						setVideoListMessage(null);
					}else{
						setVideoList([]);
						setVideoListMessage('No Videos Exists');
					}
					
	            }else if(response.data.status === 422){//HTTP_UNPROCESSABLE_ENTITY
					
					//set data
					if(response.data.videos && response.data.videos.length > 0){
						setVideoList(response.data.videos);
						setVideoListMessage(null);
					}else{
						setVideoList([]);
						setVideoListMessage('No Videos Exists');
					}
				}else if(response.data.status === 800){//HTTP_FORM_VALIDATION_FAILED
					
					var errorStyleTemp = JSON.parse(JSON.stringify(response.data.validation_errors));
					Object.keys(errorStyleTemp).map((key) => (
						errorStyleTemp[key] = error_style
					));
					
					//validation errors mapped to input fields
					setSearchInput({...searchInput, errorList: response.data.validation_errors, errorStyle: errorStyleTemp });
	            }else{//more errors
	            }
		
				setIsLoading(false);
				
			}).catch(function (error) {
				console.log('[Search Videos - search_videos] error: ',error + ' back-end api call error');
				
				setIsLoading(false);
			});

		}).catch(function (error) {
			console.log('[Search Videos - useEffect - search_videos] error: ',error + ' back-end api call error');
		
			setIsLoading(false);
            
			//user not authenticated on server so remove from local storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_role');

			if(!localStorage.getItem('remember_me') || localStorage.getItem('remember_me') !== 'true'){
            	localStorage.removeItem('auth_users_name');
        		localStorage.removeItem('auth_users_last_name');
            	localStorage.removeItem('auth_email');
            	localStorage.removeItem('password');
			}
                	
			navHistory('/login');
		});
	};
	
	const handleOpenVideoView = (event, video) => {
		event.preventDefault();
		
		setModalContent('');
		setModalOpen(false);
		
		const video_url = aws_s3_url + '/' + video.video_url;
		
    	//setSelectedVideo(video);
    	setTimeout(() => {
			const htmlContent = (
			<div className="grid-x">
				<div className="large-12 medium-12 small-12 cell text-center p10">
					<div className="font-source-sans font-size-18 font-weight-600 txt-000 left">{video.title}</div>
					<div className="video-container pt-5">
						<video controls>
						<source src={video_url} type="video/mp4" />
						Your browser does not support the video tag.
						</video>
					</div>
	
				</div>
			</div>
			);
			
			setModalContent(htmlContent);
			setModalOpen(true);
			
			updateVideoViews(video);
			
		    // Open the Foundation modal directly
		    $('#generic_modal').foundation('open');
	    }, 250);
	};
	
	function updateVideoViews(video) {

		//values sent to api
		const payload = {
			video_random_id: video.random_id,
		}
	
		axios.get('/sanctum/csrf-cookie').then(response1 => {// CSRF Protection through Laravel
			axios.post('/api/update_video_views', payload, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
				}
			}).then(response =>{
				if(response.data.status === 200){//HTTP_OK
					setVideoList((prevVideoList) => {
					    return prevVideoList.map((video) =>
					      video.random_id === response.data.video.random_id ? response.data.video : video
					    );
					});
	            }else if(response.data.status === 422){//HTTP_UNPROCESSABLE_ENTITY
				}else if(response.data.status === 800){//HTTP_FORM_VALIDATION_FAILED
	            }
		
				setIsLoading(false);
				
			}).catch(function (error) {
				console.log('[Search Videos - updateVideoViews] error: ',error + ' back-end api call error');
			});

		}).catch(function (error) {
			console.log('[Search Videos - updateVideoViews] error: ',error + ' back-end api call error');
            
			//user not authenticated on server so remove from local storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_role');

			if(!localStorage.getItem('remember_me') || localStorage.getItem('remember_me') !== 'true'){
            	localStorage.removeItem('auth_users_name');
        		localStorage.removeItem('auth_users_last_name');
            	localStorage.removeItem('auth_email');
            	localStorage.removeItem('password');
			}
                	
			navHistory('/login');
		});
	};
	
	const handleDonationInput = (event) => {
		event.persist();
		
	    setDonationInput({...donationInput, [event.target.name]: event.target.value });
		
		//remove the target error message no matter the new input, it will be validated on the server
		if (donationInput.errorList.hasOwnProperty(event.target.name)){
			delete donationInput.errorList[event.target.name];
			delete donationInput.errorStyle[event.target.name];
		}
	}
	
	const handleOpenVideoDonation = (event, video) => {
		event.preventDefault();

		alert('Donations Coming Soon. Click on the image to view the video.');
		
		/*
		setModalOpen(false);
		
    	setTimeout(() => {
			
	      const paymentComponent = (
	        <PaypalPaymentComponent video={video} amount={donationInput.amount} />
	      );
			setModalContent(paymentComponent);
			setModalOpen(true);
			
		    // Open the Foundation modal directly
		    $('#generic_modal').foundation('open');
	    }, 250);
		*/
	};
    
  	return (
		<div className="body-content bg-fff pt-70l-110m-50s">
			
			<div className="panel large ptb-20l-10s">
			
				<form onSubmit={searchVideosSubmit}>
				<div className="grid-x">
					<div className="large-7 medium-7 small-5 cell text-left pr-5">
						<label className="">Search Terms <span className={searchInput.errorStyle.search_terms}>{searchInput.errorList.search_terms}</span>
							<input type="text" name="search_terms" onChange={handleSearchInput} value={searchInput.search_terms} className="input-group-fieldx mt-10" />
						</label>
					</div>
					<div className="large-4 medium-3 small-4 cell text-left pr-5">
						<label className="">Categories <span className={searchInput.errorStyle.category_id}>{searchInput.errorList.category_id}</span>
							<select name="category_id" onChange={handleSearchInput} value={searchInput.category_id}>
								{categories.map((category, i) => (
								<option key={category.id} value={category.id}>{category.title}</option>
								))}
							</select>
						</label>
					</div>
					<div className="large-1 medium-2 small-3 cell text-right">
						<label className=""><span>&nbsp;</span></label>
						<button type="submit" className="button width-auto uppercase">Search</button>
					</div>
					
					<div className="large-12 medium-12 small-12 cell text-left pt-20">
						<div className="font-source-sans page-size-16 font-weight-800 txt-dark-blue bb2-slate-blue letter-spacing-1px uppercase pb-5 pb-5">Videos</div>
					</div>
				</div>
				</form>
				
				<div className="grid-x">
					{videoList.length > 0  ? (
					<div className="large-12 medium-12 small-12 cell">
        				<div id="video_list" className="grid-x grid-margin-x z-index-0">
				          {videoList.map((video, i) => (
				            <div key={'no_edit_' + video.id + video.random_id} className="large-3 medium-4 small-12 cell pt-10">
				              <div className="video-wrapper p-10 bg-eee br-3 text-center">
				                <Link onClick={(e) => handleOpenVideoView(e, video)} className="font-small text-center no-underline hover-opacity-50" valign="top">
				                	<img src={aws_s3_url + '/' + video.thumbnail_url} alt="Video thumbnail" width={250} />
				                  <div className="font-source-sans font-size-16 font-weight-600 txt-333 p-5 video-content" valign="top">
				                    {video.title}
				                    <div className="font-standard txt-777 text-justify pt-5">{video.description}&nbsp;&nbsp;<b>[{video.views}&nbsp;&nbsp;views]</b></div>
				                  </div>
				                </Link>
								{/*}
				                <div className="video-donate-button clearfix">
					                <div className="pt-10 pr-10 left">
					                  <input type="number" name="amount" onChange={handleDonationInput} value={donationInput.amount} className="donation" placeholder="$USD"/>
					                </div>
					                <div className="pt-10 right">
					                  <Link onClick={(e) => handleOpenVideoDonation(e, video)} className="button uppercase">Donate</Link>
					                </div>
					          	</div>
								*/}
				                <div className="video-donate-button text-center pt-10">
					                <Link onClick={(e) => handleOpenVideoDonation(e, video)} className="button uppercase">Donate</Link>
					          	</div>
				              </div>
				            </div>
						))}
						</div>
					</div>
					) : (
					<div id="video_list" className="large-12 medium-12 small-12 cell pt-5 font-source-sans font-size-16">{videoListMessage}</div>
					)}
					
					{isLoading && 
					<div className="large-12 medium-12 small-12 cell text-center">
					<LoadingSpinner paddingClass="p-20l-10s" />
					</div>
					}
					
				</div>
			</div>
      
			{/* Render the Modal component */}
			<Modal isOpen={isModalOpen} htmlContent={modalContent}></Modal>
		</div>
	);
}

export default SearchVideos;

const categories = [
  { id: 0, title: 'All Categories' },
  { id: 1, title: 'Category 1' },
  { id: 2, title: 'Category 2' },
  { id: 3, title: 'Category 3' },
  { id: 4, title: 'Category 4' },
  { id: 5, title: 'Category 5' },
  { id: 6, title: 'Category 6' },
  // Add more categories as needed
];

function explodeCategories(categoryIds){
	  const categoryIdArray = categoryIds.split(';').map(Number); // Convert string IDs to numbers
  const selectedCategories = categories.filter(category => categoryIdArray.includes(category.id));

  return (
    <div>
      {selectedCategories.map(category => (
        <div className="font-small txt-777 pb-5" key={category.id}>{category.title}</div>
      ))}
    </div>
  );
}

function convertDateTimeToText(some_date_time){
	
	if(!some_date_time || some_date_time === ''){
		return '';
	}else{
		var date = new Date(some_date_time);
		
	    var day = date.getDate() < 10 ? '0'+date.getDate() : date.getDate();
	    var month = (date.getMonth()+1) < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1;
		var year = date.getFullYear();
	
		return month + '/' + day + '/' + year;
	}
	
}
					