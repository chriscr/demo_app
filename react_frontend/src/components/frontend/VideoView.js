import React from 'react';

const VideoView = ({ video, onClose }) => {
	
	const aws_s3_url = `https://video-app-s3-bucket.s3.us-west-1.amazonaws.com`;
	
	return (
		<div className="video-view-modal z-index-2200">
			<div className="panel large mt-70">
			
				<div className="grid-x float-center">
					<div className="clearfix">
						<div className="font-source-sans font-size-18 font-weight-600 txt-fff pb-10 left">{video.title}</div>
						<div className="right"><button onClick={onClose} className="button tiny">Close</button></div>
						<div className="video-container">
							<video controls>
							<source src={aws_s3_url + '/' + video.video_url} type="video/mp4" />
							Your browser does not support the video tag.
							</video>
						</div>
					</div>
				</div>
			</div>
		</div>
	);

};

export default VideoView;
