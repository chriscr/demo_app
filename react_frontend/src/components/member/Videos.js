import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AxiosApiClient from '../../components/utils/AxiosApiClient';
import AuthUtility from '../frontend/auth/AuthUtility';
import LoadingSpinner from '../frontend/LoadingSpinner';
import Modal from '../../layouts/frontend/Modal';

import swal from 'sweetalert';
import $ from 'jquery'; // Import jQuery

import videos_icon from '../../assets/frontend/images/videos_icon.png';
import arrow_right_90 from '../../assets/frontend/images/arrow_right_90.png';

const aws_s3_url = process.env.REACT_APP_AWS_S3_URL_DEV;
const per_page = 10;

function Videos() {

	const navHistory = useNavigate();

	//for all API calls
	const auth_api = 'phpLaravel';
	if (localStorage.getItem('auth_api') && localStorage.getItem('auth_api') !== '') {
		auth_api = localStorage.getItem('auth_api');
	}

	// Initial states
	const [isLoading, setIsLoading] = useState(true);
	const [isMounted, setIsMounted] = useState(false);
	const [videos, setVideos] = useState([
		//{ id: '', category_id: "", title: "", description: "", privacy: "", audience: "", video_file: "", thumbnail_file: "", status: "", random_id: "", created: "", updated: "" },
	]);
	const [videosMessage, setVideosMessage] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [lastPage, setLastPage] = useState(1);
	const [nextPage, setNextPage] = useState(null);
	const [prevPage, setPrevPage] = useState(null);

	const [isModalOpen, setModalOpen] = useState(false);
	const [modalContent, setModalContent] = useState('');

	// Initial call for videos
	useEffect(() => {
		if (!AuthUtility.isLoggedIn()) {
			//user not authenticated on server so remove from local storage
			AuthUtility.clearAuthData();
			navHistory('/');
		}

		if (isMounted) {
			console.log('Videos.useEffect: mounted');

			var page = 1;
			readVideos(page);

		} else {
			setIsMounted(true);
		}

	}, [isMounted]);

	function readVideos(page) {
		if (!AuthUtility.isLoggedIn()) {
			//user not authenticated on server so remove from local storage
			AuthUtility.clearAuthData();
			navHistory('/');
		}

		setIsLoading(true);

		const fetchApiDataReadVideos = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('get', '/api/read_videos', null, {
					params: {
						per_page: per_page, // Set your preferred number of items per page
						page: page, // Specify the page number you want to fetch
					}
				});

				setApiDataReadVideos(response, "Videos.useEffect");
			} catch (error) {
				handleApiErrorReadVideos(error, "Videos.useEffect");
			}
		};
		fetchApiDataReadVideos();
	}

	function setApiDataReadVideos(response, theFunction) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//set data
				if (response.data.videos && response.data.videos.length > 0) {
					setVideos(response.data.videos);
					setCurrentPage(response.data.pagination_data.current_page);
					setLastPage(response.data.pagination_data.last_page);
					setNextPage(response.data.pagination_data.next_page);
					setPrevPage(response.data.pagination_data.prev_page);
					setVideosMessage('');
				} else {
					setVideos([]);
					setCurrentPage(null);
					setLastPage(null);
					setNextPage(null);
					setPrevPage(null);
					setVideosMessage('No Videos Exist');
				}

			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
				navHistory('/login');
			} else if (response.data.status === 404) {//HTTP_NOT_FOUND
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//set data
				if (response.data.videos && response.data.videos.length > 0) {
					setVideos(response.data.videos);
					setCurrentPage(response.data.pagination_data.current_page);
					setLastPage(response.data.pagination_data.last_page);
					setNextPage(response.data.pagination_data.next_page);
					setPrevPage(response.data.pagination_data.prev_page);
					setVideosMessage('');
				} else {
					setVideos([]);
					setCurrentPage(null);
					setLastPage(null);
					setNextPage(null);
					setPrevPage(null);
					setVideosMessage('No Videos Exist');
				}
			} else if (response.data.status === 422) {//HTTP_UNPROCESSABLE_ENTITY
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//set data
				if (response.data.videos && response.data.videos.length > 0) {
					setVideos(response.data.videos);
					setCurrentPage(response.data.pagination_data.current_page);
					setLastPage(response.data.pagination_data.last_page);
					setNextPage(response.data.pagination_data.next_page);
					setPrevPage(response.data.pagination_data.prev_page);
					setVideosMessage('');
				} else {
					setVideos([]);
					setCurrentPage(null);
					setLastPage(null);
					setNextPage(null);
					setPrevPage(null);
					setVideosMessage('No Videos Exist');
				}
			} else if (response.data.status === 800) {//HTTP_FORM_VALIDATION_FAILED
				console.log(theFunction + ': ', response.data.message + ' HTTP_FORM_VALIDATION_FAILED');
			} else {//more errors
			}
		}

		setIsLoading(false);
	}
	function handleApiErrorReadVideos(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	const handleOpenVideoView = (event, video) => {
		event.preventDefault();
		
		setModalContent('');
		setModalOpen(false);
		
		const video_url = aws_s3_url + '/' + video.video_url;

    	setTimeout(() => {
			const htmlContent = (
			<div className="grid-x">
				<div className="large-12 medium-12 small-12 cell text-center p10">
					<div className="font-source-sans font-large font-weight-600 txt-000 left">{video.title}</div>
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
			
		    // Open the Foundation modal directly
		    $('#generic_modal').foundation('open');
	    }, 250);
	};

	const handleVideoEditClick = (video) => {
    	alert('Video Editing Coming Soon.');
	};

	const handleConfirmToRemoveVideo = (i) => {
		const list = [...videos];

		swal({
			title: 'Delete Video',
			text: 'This will delete video ' + list[i]['title'] + '.',
			icon: "warning",
			buttons: {
				cancel: true,
				confirm: {
					text: "Delete Video",
					value: true,
				},
			},
			showCancelButton: true,
			confirmButtonText: "Yes, delete it!"
		}).then((result) => {
			if (result) {
				handleRemoveVideo(i);
			}
		});
	};

	// Delete row of id:i
	const handleRemoveVideo = (i) => {
		const list = [...videos];

		// If the user confirms, proceed with the deletion
		if (list[i]['random_id'] && list[i]['random_id'] !== '') {
			deleteVideo(list[i]['random_id']);//send a specific unique ID to delete
		}
	};

	function deleteVideo(video_random_id) {

		setIsLoading(true);

		const fetchApiDataDeleteVideo = async () => {
			try {
				const { apiClient, getBearerToken, makeRequestWithHeaders } = AxiosApiClient({ apiBackend: auth_api, token: localStorage.getItem('auth_token') });
				await getBearerToken();
				const response = await makeRequestWithHeaders('delete', '/api/delete_video/' + video_random_id, null, {});

				setApiDataDeleteVideo(response, "Videos.deleteVideo", video_random_id);
			} catch (error) {
				handleApiErrorDeleteVideo(error, "Videos.deleteVideo");
			}
		};

		fetchApiDataDeleteVideo();
	}
	function setApiDataDeleteVideo(response, theFunction, video_random_id) {
		if (response && response.data) {
			if (response.data.status === 200) {//HTTP_OK
				console.log(theFunction + ': ', response.data.message);

				//update state properties
				if (response.data.videos && response.data.videos.length > 0) {
					setVideos(response.data.videos);
				} else {
					setVideos([]);
				}

				swal("Deleted!", "Video has been deleted.", "success");
			} else if (response.data.status === 401) {//HTTP_UNAUTHORIZED
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				//user not authenticated on server so remove from local storage
				AuthUtility.clearAuthData();
				swal("Warning", response.data.message, "warning");
				navHistory('/login');
			} else if (response.data.status === 422) {//HTTP_UNPROCESSABLE_ENTITY
				console.log(theFunction + ' error: ', response.data.message + ' back-end api call error');

				swal("Warning", response.data.message, "warning");
			} else {//more errors
			}
		}

		setIsLoading(false);
	}
	function handleApiErrorDeleteVideo(error, theFunction) {
		console.log(theFunction + ' error: ', error + ' back-end api call error');

		//user not authenticated on server so remove from local storage
		AuthUtility.clearAuthData();
		setIsLoading(false);
		swal("Error", error, "error");
	}

	return (
		<div className="body-content bg-fff pt-70l-110m-50s pb-40">

			<div className="panel large pt-20l-10s">
				<div className="grid-x">
					<div className="large-11 medium-11 small-10 cell text-left">
						<div className="font-source-sans font-size-20 font-weight-800 txt-dark-blue bb1-dark-blue uppercase pb-5">Videos</div>
					</div>
					<div className="large-1 medium-1 small-2 cell text-right">
						<Link to="/member/video_manager" className="hover-opacity-50">
							<img src={videos_icon} width="40" alt="add video" />
						</Link>
					</div>
				</div>
			</div>

			<div className="panel large mt-10">

				{videos.length > 0 ? (
					<div className="b1-ccc">
						<div className="grid-x bg-ddd">
							<div className="large-2 medium-2 small-4 cell p-5 text-left hide-for-520px">
								<div className="font-source-sans font-size-16l-14s font-weight-600 txt-000">Video</div>
							</div>
							<div className="large-4 medium-4 small-0 cell p-5 text-left show-for-520px">
								<div className="font-source-sans font-size-16l-14s font-weight-600 txt-000">Description</div>
							</div>
							<div className="large-2 medium-2 small-0 cell p-5 text-center show-for-large-only">
								<div className="font-source-sans font-size-16l-14s font-weight-600 txt-000">Categories</div>
							</div>
							<div className="large-2 medium-2 small-4 cell p-5 text-center show-for-large-only">
								<div className="font-source-sans font-size-16l-14s font-weight-600 txt-000">Visibility</div>
							</div>
							<div className="large-2 medium-2 small-4 cell p-5 text-center show-for-large-only">
								<div className="font-source-sans font-size-16l-14s font-weight-600 txt-000">Date</div>
							</div>
						</div>
						{videos.map((video, i) => (
							<div className="grid-x">
								<div key={'no_edit_1_' + video.id + video.random_id} className={i % 2 === 0 ? 'large-2 medium-2 small-4 cell bg-fff p-5 text-left' : 'large-2 medium-2 small-4 cell bg-eee p-5 text-left'}>
									<img src={aws_s3_url + '/' + video.thumbnail_url} alt="Video thumbnail" />
								</div>
								<div key={'no_edit_2_' + video.id + video.random_id} className={i % 2 === 0 ? 'large-4 medium-4 small-0 cell bg-fff p-5 text-left hide-for-small-only' : 'large-4 medium-4 small-0 cell bg-eee p-5 text-left hide-for-small-only'}>
									<div className="font-source-sans font-standard font-weight-500" valign="top">
										<span className="font-source-sans font-medium font-weight-600 hide-for-small-only">{video.title}</span>
										<div className="hide-for-720px">
											<div className="font-standard txt-777 pt-5">{video.description}&nbsp;&nbsp;<b>{video.views}&nbsp;&nbsp;views</b></div>
										</div>
										<div className="hide-for-720px">
											<div className="pt-10">
												<Link onClick={(e) => handleOpenVideoView(e, video)} className="button tiny uppercase" valign="top">view</Link>
												&nbsp;
												&nbsp;
												&nbsp;
												<Link onClick={() => handleVideoEditClick(video)} className="button tiny uppercase" valign="top">edit</Link>
												&nbsp;
												&nbsp;
												&nbsp;
												<Link onClick={() => handleConfirmToRemoveVideo(i)} onTouchEnd={() => handleConfirmToRemoveVideo(i)} className="button tiny uppercase" valign="top">delete</Link>
											</div>
										</div>
									</div>
								</div>
								<div key={'no_edit_3_' + video.id + video.random_id} className={i % 2 === 0 ? 'large-2 medium-2 small-0 cell bg-fff p-5 text-center hide-for-small-only' : 'large-2 medium-2 small-0 cell bg-eee p-5 text-center hide-for-small-only'}>
									<div className="font-source-sans font-standard font-weight-500" valign="top">
										{explodeCategories(video.categories)}
									</div>
								</div>
								<div key={'no_edit_4_' + video.id + video.random_id} className={i % 2 === 0 ? 'large-2 medium-2 small-4 cell bg-fff p-5 text-center' : 'large-2 medium-2 small-4 cell bg-eee p-5 text-center'}>
									<div className="font-source-sans font-standard font-weight-500" valign="top">
										Privacy<div className="font-standard txt-777 ptb-5">{video.privacy}</div>
										Audience<div className="font-standard txt-777 pt-5">{video.audience}</div>
									</div>
								</div>
								<div key={'no_edit_5_' + video.id + video.random_id} className={i % 2 === 0 ? 'large-2 medium-2 small-4 cell bg-fff p-5 text-center' : 'large-2 medium-2 small-4 cell bg-eee p-5 text-center'}>
									<div className="font-source-sans font-standard font-weight-500" valign="top">
										Created<div className="font-standard txt-777 ptb-5">{convertDateTimeToText(video.created_at)}</div>
										Updated<div className="font-standard txt-777 pt-5">{convertDateTimeToText(video.updated_at)}</div>
									</div>
								</div>
								<div key={'no_edit_6_' + video.id + video.random_id} className={i % 2 === 0 ? 'large-0 medium-0 small-12 cell bg-fff p-5 pb-10 text-left show-for-720px' : 'large-0 medium-0 small-12 cell bg-eee p-5 pb-10 text-left show-for-720px'}>
									<div className="font-source-sans font-medium font-weight-600 pb-5 show-for-small-only">{video.title}</div>
									<div className="font-source-sans font-standard font-weight-500" valign="top">
										{video.description}&nbsp;&nbsp;<b>{video.views}&nbsp;&nbsp;views</b>
									</div>
									<div className="font-source-sans font-standard font-weight-500 pt-10 show-for-small-only" valign="top">
										{explodeCategories2(video.categories)}
									</div>
									<div className="pt-10">
										<Link onClick={(e) => handleOpenVideoView(e, video)} className="button tiny uppercase left" valign="top">view</Link>
										<Link onClick={() => handleConfirmToRemoveVideo(i)} onTouchEnd={() => handleConfirmToRemoveVideo(i)} className="button tiny uppercase right" valign="top">delete</Link>
										<span className="right">
											&nbsp;
											&nbsp;
											&nbsp;
											&nbsp;
											&nbsp;
										</span>
										<Link onClick={() => handleVideoEditClick(video)} className="button tiny uppercase right" valign="top">edit</Link>
									</div>
								</div>
							</div>
						))}
						{/* Pagination links */}
						{lastPage > 1 && (
							<div className="grid-x">
								<div id="videos_pagination" className="large-12 medium-12 small-12 cell pt-10">
									<ul className="pagination">
										{prevPage && (
											<li className="page-item">
												<Link className="page-link" onClick={() => readVideos(currentPage - 1)}>Previous</Link>
											</li>
										)}

										{[...Array(lastPage).keys()].map(page => (
											<li key={page + 1} className={`page-item ${page + 1 === currentPage ? 'active' : ''}`}>
												<Link className="page-link" onClick={() => readVideos(page + 1)}>{page + 1}</Link>
											</li>
										))}

										{nextPage && (
											<li className="page-item">
												<Link className="page-link" onClick={() => readVideos(currentPage + 1)}>Next</Link>
											</li>
										)}
									</ul>
								</div>
							</div>
						)}
					</div>
				) : (
					<div className="grid-x">
						<div className="large-12 medium-12 small-12 cell">
							<div className="horizontal-container vertical-center-content pt-5 pr-5">
								<span className="font-source-sans font-size-16l-14s font-weight-600 left">{videosMessage}</span>
								<span className="font-source-sans font-size-16l-14s font-weight-600 right">Add Video <img src={arrow_right_90} width="35" alt="note for order" /></span>
							</div>
							<div className="text-center p-20 b1-ccc bg-fafafa mt-20">
								<span className="font-source-sans font-size-16l-14s font-weight-600">Data Storage Provided by AWS S3</span>
							</div>
						</div>
					</div>
				)}

				{isLoading &&
					<div className="grid-x">
						<div className="large-12 medium-12 small-12 cell text-center">
							<LoadingSpinner paddingClass="p-20l-10s" />
						</div>
					</div>
				}

			</div>
		</div >
	);
}

export default Videos;

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
        <div className="font-source-sans font-standard txt-777 pb-5" key={category.id}>{category.title}</div>
      ))}
    </div>
  );
}

function explodeCategories2(categoryIds){
	  const categoryIdArray = categoryIds.split(';').map(Number); // Convert string IDs to numbers
  const selectedCategories = categories.filter(category => categoryIdArray.includes(category.id));

  return (
    <span><u>Categories:</u>&nbsp;
      {selectedCategories.map((category, index) => (
        <span className="txt-777">{category.title}{index + 1 === selectedCategories.length ? '' : ', '}</span>
      ))}
    </span>
  );
}

function convertDateTimeToText(some_date_time) {

	if (!some_date_time || some_date_time === '') {
		return '';
	} else {
		var date = new Date(some_date_time);

		var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
		var month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
		var year = String(date.getFullYear()).slice(-2);

		return month + '/' + day + '/' + year;
	}

}

function shortenSomeString(some_string) {
	return some_string.slice(0, some_string.length / 2) + '...';
}