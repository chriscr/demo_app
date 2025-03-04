<?php

namespace App\Libraries;


use Illuminate\Support\Facades\Log;

class TrafficAPI{
    
    private $api_key;

    public $location;
    public $radius;

    public function __construct($location= '', $radius= '') {
        $this->api_key = 'mdVqKTmfL45o5CoxGK2jfMMSsCsWHfag'; //MapQuest
            
	    if($location)
	        $this->_setParam('location', $location);
	        
        if($radius)
            $this->_setParam('radius', $radius);
    }
    
    public function getTrafficLocation($location){
        
        if($location)
            $this->_setParam('location', $location);
                
        $traffic_location_data = $this->_request_traffic_location();
                
        return $traffic_location_data;
    }
    
    public function getTrafficIncidentData($location, $radius){
		
		if($location)
		    $this->_setParam('location', $location);
		
	    if($radius)
	        $this->_setParam('radius', $radius);
		    
        $traffic_incident_data = $this->_request_traffic_incident();
		
        return $traffic_incident_data;
	}
	
	private function _request_traffic_location() {
	    
	    Log::debug('_request_traffic_location');
	    
	    // Use the Geocoding API to get the latitude and longitude of the location
	    $geocoding_url = "https://maps.googleapis.com/maps/api/geocode/json";
	    $geocoding_url = "https://www.mapquestapi.com/geocoding/v1/address?key=".$this->api_key;
	    
	    // Initialize a new cURL session for the Geocoding API request
	    $curl = curl_init();
	    curl_setopt($curl, CURLOPT_URL, $geocoding_url);
		$curl_post_data = json_encode(['location' => $this->location]);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $curl_post_data);
	    
	    // Execute the Geocoding API request
		$geocoding_response = curl_exec($curl);
	    $geocoding_data = json_decode($geocoding_response, true);
	    
	    return $geocoding_data;
	}

	private function _request_traffic_incident() {
	    
	    Log::debug('_request_traffic_incident');

	    $traffic_incident_data = null;
	    
	    $geocoding_data = $this->_request_traffic_location();
	    Log::debug('geocoding_data: ', print_r($geocoding_data, true));
	    
	    if($geocoding_data['info']['statuscode'] == 0
	        && $geocoding_data['results'][0]['locations'][0]['adminArea5'] != ''
	        && $geocoding_data['results'][0]['locations'][0]['adminArea4'] != ''
	        && $geocoding_data['results'][0]['locations'][0]['adminArea3'] != ''){//OK
	            
	            $traffic_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
	            $traffic_url = "https://www.mapquestapi.com/traffic/v2/incidents?key=".$this->api_key."&inFormat=json&outFormat=json";
	            
	            // Get latitude and longitude bbox from the Geocoding API response
	            $latitude = $geocoding_data['results'][0]['locations'][0]['latLng']['lat'];
	            $longitude = $geocoding_data['results'][0]['locations'][0]['latLng']['lng'];
	            $bbox = $this->_getBoundingBox($latitude, $longitude, $this->radius);
	            
	            Log::debug('bbox');
	            Log::debug(print_r($bbox, true));
	            
	            $boundingBox = [
	                'ul' => [
	                    'lat'=> (float)$bbox[2],
	                    'lng'=> (float)$bbox[3]
	                ],
	                'lr' => [
	                    'lat'=> (float)$bbox[0],
	                    'lng'=> (float)$bbox[1]
	                ]
	            ];
	            
	            $filters = [
	                'construction',
	                'incidents',
	                'event',
	                'congestion'
	            ];
	            
	            $curl_post_data = json_encode([
	                'boundingBox' => $boundingBox,
	                'filters' => $filters
	            ]);
	            
	            Log::debug('curl_post_data');
	            Log::debug(print_r($curl_post_data, true));
	            
	            $boundingBox = (float)$bbox[2].','.(float)$bbox[3].','.(float)$bbox[0].','.(float)$bbox[1];
	            
	            
	            $traffic_url = "https://www.mapquestapi.com/traffic/v2/incidents?key=".$this->api_key."&boundingBox=".$boundingBox."&filters=construction,incidents";
	            
	            // Initialize a new cURL session for the Incident API request
	            $curl = curl_init();
	            curl_setopt($curl, CURLOPT_URL, $traffic_url);
	            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	            
	            // Execute the Traffic API GET request
	            $traffic_incident_response = curl_exec($curl);
	            $traffic_incident_data = json_decode($traffic_incident_response, true);
	            
	            curl_close($curl);
	            
	            $traffic_incident_data['location']['city'] = $geocoding_data['results'][0]['locations'][0]['adminArea5'];
	            $traffic_incident_data['location']['state'] = $geocoding_data['results'][0]['locations'][0]['adminArea3'];
	            $traffic_incident_data['location']['country'] = $geocoding_data['results'][0]['locations'][0]['adminArea1'];
	            $traffic_incident_data['location']['lat'] = $geocoding_data['results'][0]['locations'][0]['latLng']['lat'];
	            $traffic_incident_data['location']['lng'] = $geocoding_data['results'][0]['locations'][0]['latLng']['lng'];
	            
	    }else{
	        $traffic_incident_data = $geocoding_data;
	    }
	    
		return $traffic_incident_data;
	}

	private function _setParam($param, $val) {

		switch($param) {
			case 'location':
			    $this->location= $val;
			    break;
			case 'radius':
			    $this->radius= $val;
				break;
		}
	}
	
	private function _getBoundingBox($latitude, $longitude, $distance) {
	    $earthRadius = 6371000; // in meters
	    $distance = $distance / $earthRadius; // convert distance from meters to radians
	    $lat = deg2rad($latitude);
	    $lon = deg2rad($longitude);
	    
	    $minLat = $lat - $distance;
	    $maxLat = $lat + $distance;
	    
	    $deltaLon = asin(sin($distance) / cos($lat));
	    $minLon = $lon - $deltaLon;
	    $maxLon = $lon + $deltaLon;
	    
	    $minLat = rad2deg($minLat);
	    $maxLat = rad2deg($maxLat);
	    $minLon = rad2deg($minLon);
	    $maxLon = rad2deg($maxLon);
	    
	    return array($minLat, $minLon, $maxLat, $maxLon);
	}
	
	
}
?>
