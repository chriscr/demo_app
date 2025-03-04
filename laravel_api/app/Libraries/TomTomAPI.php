<?php

namespace App\Libraries;

//use \stdClass;
use Illuminate\Support\Facades\Log;

class TomTomAPI{
    
    private $api_key;

    public $location;
    public $limit;

    public function __construct($location= '', $limit= '') {
        $this->api_key = 'YM66yqFg4AgC8WQCkJJXasrWCKfZ9dIN';
            
	    if($location)
		    $this->_setParam('location', $location);
		    
        if($limit)
            $this->_setParam('limit', $limit);
    }//end constructor
    
    public function requestGeoLocation($location, $limit){
        
        if($location)
            $this->_setParam('location', $location);
        
		if($limit)
            $this->_setParam('limit', $limit);

        $geo_location_data = $this->_request_geo_location();
                
        return $geo_location_data;
    }//end getGeoLocation

	private function _request_geo_location() {
	    
	    $geo_location_data = null;
	    
	    $api_url = 'https://api.tomtom.com/search/2/geocode/'.$this->location.'.json?key='.$this->api_key.'&limit='.$this->limit;
		$api_url = 'https://api.tomtom.com/search/2/geocode/' . urlencode($this->location) . '.json?key=' . $this->api_key . '&limit=' . $this->limit;

	    
		Log::debug('check a');

		$curl = curl_init();
		curl_setopt_array($curl, [
			CURLOPT_URL => $api_url,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_HTTPAUTH => CURLAUTH_BASIC,
			CURLOPT_POST => false, // Not a POST request
		]);

		Log::debug('check b');
	
		$curl_response = curl_exec($curl);

		Log::debug('check c');
		Log::debug('curl_response: '.$curl_response);
	
		if ($curl_response === false) {
			$info = curl_getinfo($curl);
			curl_close($curl);
			die('Error occurred during curl exec. Additional info: ' . var_export($info, true));
		}

		Log::debug('check d');
	
		curl_close($curl);

		Log::debug('check e');
	
		return json_decode($curl_response, true); // Decode JSON response into associative array
	
	}//end getWeatherForecastData

	private function _setParam($param, $val) {

		switch($param) {
			case 'location':
				$this->location= $val;
				break;
			case 'limit':
			    $this->limit= $val;
				break;
		}
	}//end set parameters

}
?>
