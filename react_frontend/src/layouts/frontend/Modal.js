// Modal.js
import React, {useState, useEffect} from 'react';

import $ from 'jquery'; // Import jQuery

const Modal = ({ isOpen, onClose, htmlContent }) => {
    const [isMounted, setIsMounted] = useState(false);
	
	// Initialize Foundation after the component mounts
	useEffect(() => {
		if (isMounted) {

		}else {
			
			if($('.reveal-overlay')[0]){
				$('.reveal-overlay').remove();
			}
			setIsMounted(true);
	    }
		
	}, [isMounted]);

	return (
	    <div id="generic_modal" className="reveal large" data-reveal>
	      <section>
	      {htmlContent}
	      </section>
	    </div>
    )
};

export default Modal;
