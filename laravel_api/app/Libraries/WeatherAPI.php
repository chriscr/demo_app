<?php

namespace App\Libraries;

//use \stdClass;

class WeatherAPI{
    
    private $api_key;

    public $location;
    public $days;

    public function __construct($location= '', $days= '') {
        $this->api_key = '24b1de122bd442dc88e150856231801';
            
	    if($location)
		    $this->_setParam('location', $location);
		    
        if($days)
            $this->_setParam('days', $days);
    }//end constructor
    
    public function getWeatherLocation($location){
        
        if($location)
            $this->_setParam('location', $location);
                
        $weather_location_data = $this->_request_weather_location();
                
        return $weather_location_data;
    }//end getWeatherLocation
    
	public function getWeatherForecastData($location, $days){
		
		if($location)
		    $this->_setParam('location', $location);
		    
        if($days)
            $this->_setParam('days', $days);

        $weather_forecast_data = $this->_request_weather_forecast();
		
        return $weather_forecast_data;
	}
	
	private function _request_weather_location() {
	    
	    $weather_location_data = null;
	    
	    $api_url = 'http://api.weatherapi.com/v1/search.json';
	    
	    //api call
	    $curl = curl_init();
	    curl_setopt($curl, CURLOPT_URL, $api_url);
	    $curl_post_data = array(
	        'key' => $this->api_key,
	        'q' => $this->location,
	    );
	    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
	    curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
	    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	    curl_setopt($curl, CURLOPT_POST, true);
	    curl_setopt($curl, CURLOPT_POSTFIELDS, $curl_post_data);
	    $curl_response = curl_exec($curl);
	    if ($curl_response === false) {
	        $info = curl_getinfo($curl);
	        curl_close($curl);
	        die('error occured during curl exec. Additioanl info: ' . var_export($info));
	    }
	    curl_close($curl);
	    
	    $weather_location_data = json_decode($curl_response);
	    if (isset($weather_location_data->response->status) && $weather_location_data->response->status == 'ERROR') {
	        //die('error occured: ' . $weather_location_data->response->errormessage);
	        //return array();
	    }
	    
	    return $weather_location_data;
	}//end getWeatherForecastData

	private function _request_weather_forecast() {

	    $weather_forecast_data = null;

		$api_url = 'http://api.weatherapi.com/v1/forecast.json';

		//api call
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, $api_url);
		$curl_post_data = array(
		    'key' => $this->api_key,
		    'q' => $this->location,
		    'days' => $this->days,
		    'aqi' => 'no',
		    'alerts' => 'no'
		);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $curl_post_data);
		$curl_response = curl_exec($curl);
		if ($curl_response === false) {
		    $info = curl_getinfo($curl);
		    curl_close($curl);
		    die('error occured during curl exec. Additioanl info: ' . var_export($info));
		}
		curl_close($curl);
		
		$weather_forecast_data = json_decode($curl_response);
		if (isset($weather_forecast_data->response->status) && $weather_forecast_data->response->status == 'ERROR') {
		    //die('error occured: ' . $weather_forecast_data->response->errormessage);
		    //return array();
		}

		return $weather_forecast_data;
	}//end request weather forecast

	private function _setParam($param, $val) {

		switch($param) {
			case 'location':
				$this->location= $val;
				break;
			case 'days':
			    $this->days= $val;
				break;
		}
	}//end set parameters

}
?>
