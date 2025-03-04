import React, {useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';

import AuthUtility from '../frontend/auth/AuthUtility';
import LoadingSpinner from '../frontend/LoadingSpinner';

import Dropzone from 'react-dropzone';
import axios from 'axios';
import swal from 'sweetalert';

const error_style = 'font-source-sans font-small font-weight-500 txt-000 bg-light-red p-5';

const categories = [
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

function VideoManager(){

	const navHistory = useNavigate();

	//const { categories, getCategoryTitleById } = useCategory();

	// using hooks
    const [isLoading, setIsLoading] = React.useState(false);
	const [videoInput, setVideoInput] = useState({
		title: '',
		description: '',
		categories: [{}],
		privacy: 'public',
		audience: 'all',
		videoFile: '',
		thumbnailFile: '',
		errorList: [],
		errorStyle: [],
	});
	
	const handleVideoDrop = (acceptedFiles) => {
		setVideoInput({...videoInput, videoFile: acceptedFiles[0]});
		delete videoInput.errorList['videoFile'];
		delete videoInput.errorStyle['videoFile'];
	};

	const handleThumbnailDrop = (acceptedFiles) => {
		setVideoInput({...videoInput, thumbnailFile: acceptedFiles[0]});
		delete videoInput.errorList['thumbnailFile'];
		delete videoInput.errorStyle['thumbnailFile'];
	};
	
	const handleInput = (event) => {
		event.persist();
		
	    if (event.target.name === 'categories') {
	      // Handle multi-select differently
	      const selectedOptions = Array.from(event.target.selectedOptions, (option) => option.value);
	      setVideoInput({ ...videoInput, [event.target.name]: selectedOptions });
	    } else {
			setVideoInput({...videoInput, [event.target.name]: event.target.value });
		}
		
		//remove the target error message no matter the new input, it will be validated on the server
		if (videoInput.errorList.hasOwnProperty(event.target.name)){
			delete videoInput.errorList[event.target.name];
			delete videoInput.errorStyle[event.target.name];
		}
	}
	
	const handleCancel = (event) => {
		event.persist();

		navHistory('/member/videos');
	}

	const videoSubmit = (event) => {
		event.preventDefault();
		
		setIsLoading(true);

		//values sent to api
		const payload = {
			title: videoInput.title,
			description: videoInput.description,
			categories: videoInput.categories,
			privacy: videoInput.privacy,
			audience: videoInput.audience,
			videoFile: videoInput.videoFile,
			thumbnailFile: videoInput.thumbnailFile,
		}

		axios.get('/sanctum/csrf-cookie').then(response1 => {// CSRF Protection through Laravel
			axios.post('/api/save_video', payload, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
					"Content-Type": "multipart/form-data",
				}
				}).then(response2 =>{
				if(response2.data.status === 200){//HTTP_OK
					
					//update all state properties
	                	
					navHistory('/member/videos');
						
	            }else if(response2.data.status === 401){//HTTP_UNAUTHORIZED
	            
					//user not authenticated on server so remove from local storage
					AuthUtility.clearAuthData();
	            
					swal("Warning",response2.data.message,"warning");
	                	
					navHistory('/login');
					
	            }else if(response2.data.status === 404){//HTTP_NOT_FOUND
	                swal("Warning",response2.data.message,"warning");
	            }else if(response2.data.status === 422){//HTTP_UNPROCESSABLE_ENTITY
	                swal("Warning",response2.data.message,"warning");
				}else if(response2.data.status === 800){//HTTP_FORM_VALIDATION_FAILED
					
					var errorStyleTemp = JSON.parse(JSON.stringify(response2.data.validation_errors));
					Object.keys(errorStyleTemp).map((key) => (
						errorStyleTemp[key] = error_style
					));
					
					//validation errors mapped to input fields
					setVideoInput({...videoInput, errorList: response2.data.validation_errors, errorStyle: errorStyleTemp });
	
	            }else{//more errors
				}
				
				setIsLoading(false);
		
			}).catch(function (error) {
				console.log('videoSubmit error: ',error + ' back-end api call error');
			
				setIsLoading(false);
			});

		}).catch(function (error) {
			console.log('videoSubmit error: ',error + ' csrf-cookie is outdated');
		
			setIsLoading(false);
			
			//user not authenticated on server so remove from local storage
			AuthUtility.clearAuthData();
			
			navHistory('/login');
		});

	}
    
	return(
		<div className="body-content bg-fff pt-70l-110m-50s pb-40">

			<div className="panel large pt-20l-10s">
				<div className="grid-x">
					<div className="large-12 medium-12 small-12 cell text-left">
						<div className="font-source-sans font-size-20 font-weight-800 txt-dark-blue bb1-dark-blue uppercase pb-5">Videos - Add</div>
					</div>
				</div>
			</div>

			<div className="panel large pt-20l-10s">
				<div className="grid-x">
					<div className="large-12 medium-12 small-12 cell bg-fafafa b1-ccc p-10 ">
						<form onSubmit={videoSubmit}>
						<div className="grid-x">
							<div className="large-12 medium-12 small-12 cell text-left pt-10">
								<div className="font-source-sans font-size-16l-14s font-weight-400 pb-5">Title <span className={videoInput.errorStyle.title}>{videoInput.errorList.title}</span></div>
									<input type="text" name="title" onChange={handleInput} value={videoInput.title}  />
							</div>
							<div className="large-12 medium-12 small-12 cell text-left pt-10">
							<div className="font-source-sans font-size-16l-14s font-weight-400 pb-5">Description <span className={videoInput.errorStyle.description}>{videoInput.errorList.description}</span></div>
									<textarea  name="description" onChange={handleInput} value={videoInput.description}  />
							</div>
							<div className="large-12 medium-12 small-12 cell text-left pt-10">
							<div className="font-source-sans font-size-16l-14s font-weight-400 pb-5">Categories <span className={videoInput.errorStyle.categories}>{videoInput.errorList.categories}</span></div>
									<select multiple name="categories" onChange={handleInput} value={videoInput.categories} className="custom-multiselect">
										{categories.map((category, i) => (
										<option key={category.id} value={category.id}>{category.title}</option>
										))}
									</select>
							</div>
							<div className="large-6 medium-6 small-12 cell text-left pt-10 pr-5l-0s">
							<div className="font-source-sans font-size-16l-14s font-weight-400 pb-5">Privacy <span className={videoInput.errorStyle.privacy}>{videoInput.errorList.privacy}</span></div>
									<select name="privacy" onChange={handleInput} value={videoInput.privacy}>
										<option disabled>Select Privacy Option</option>
										<option value="public" selected>Public</option>
										<option value="unlisted">Unlisted</option>
										<option value="private">Private</option>
									</select>
							</div>
							<div className="large-6 medium-6 small-12 cell text-left pt-10 pl-5l-0s">
							<div className="font-source-sans font-size-16l-14s font-weight-400 pb-5">Audience <span className={videoInput.errorStyle.audience}>{videoInput.errorList.audience}</span></div>
									<select name="audience" onChange={handleInput} value={videoInput.audience}>
										<option disabled>Select Audience Option</option>
										<option value="all" selected>All</option>
										<option value="adult">Adult</option>
										<option value="children">Children</option>
									</select>
							</div>
							<div className="large-6 medium-6 small-12 cell text-left pt-10 pr-5l-0s">
							<div className="font-source-sans font-size-16l-14s font-weight-400 pb-5">Video File <span className={videoInput.errorStyle.videoFile}>{videoInput.errorList.videoFile}</span></div>
								<Dropzone onDrop={handleVideoDrop} accept="video/*">
								{({ getRootProps, getInputProps }) => (
									<div {...getRootProps()} className="p-10 ptb-10 b1-bbb bg-555 txt-fff dropzone cursor-grab">
									<input {...getInputProps()} />
									{videoInput.videoFile ? 'Video File: '+videoInput.videoFile.name : 'Drop a video file here, or click to select one.'}
									</div>
								)}
								</Dropzone>
							</div>
							<div className="large-6 medium-6 small-12 cell text-left pt-10 pl-5l-0s">
							<div className="font-source-sans font-size-16l-14s font-weight-400 pb-5">Thumbnail File <span className={videoInput.errorStyle.descriptthumbnailFileion}>{videoInput.errorList.thumbnailFile}</span></div>
								<Dropzone onDrop={handleThumbnailDrop} accept="image/*">
								{({ getRootProps, getInputProps }) => (
									<div {...getRootProps()} className="p-10 ptb-10 b1-bbb bg-555 txt-fff dropzone cursor-grab">
									<input {...getInputProps()} />
									{videoInput.thumbnailFile ? 'Thumbnail Image: '+videoInput.thumbnailFile.name : 'Drop a thumbnail image here, or click to select one.'}
									</div>
								)}
								</Dropzone>
							</div>
							<div className="large-6 medium-6 small-6 cell text-left pt-20">
								<button onClick={handleCancel} className="button width-125px-100px">Cancel</button>
							</div>
							<div className="large-6 medium-6 small-6 cell text-right pt-20">
								<button type="submit" className="button width-125px-100px">Submit</button>
							</div>
							<div className="large-12 medium-12 small-12 cell text-center">
								{isLoading && 
								<LoadingSpinner paddingClass="" />
								}
							</div>
						</div>
						</form>
					</div>
					
				</div>
			</div>
		</div>
	);
}

export default VideoManager;