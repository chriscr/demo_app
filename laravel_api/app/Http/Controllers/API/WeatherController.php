<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Response;
use App\Models\Location;
use App\Libraries\RandomGenerator;
use App\Libraries\WeatherAPI;
use App\Libraries\GlobalData;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

use Exception;
use Exception as BaseException;

class WeatherController extends Controller{
    
    public function save_weather_location(Request $request){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            $new_location = null;
            if($request->new_location){
                $new_location = $request->new_location;
            }

            $days = 3;
            
            $user_locations = Location::where('user_id', Auth::id())->where('component', 'weather')->orderBy('order', 'asc')->get();
            
            $weatherAPI = new WeatherAPI;
            
            $weather_forecast_data = null;
            $weather_location_data = null;
            $weather_api_message = null;
            if(empty($user_locations) || sizeof($user_locations) == 0){//first location to save, get all data
                
                try {
                    $weather_forecast_data = $weatherAPI->getWeatherForecastData($new_location, $days);
                    
                    if ($weather_forecast_data === false) {
                        throw new BaseException('Error: API call failed.');
                    }
                    
                    if (!$weather_forecast_data || empty($weather_forecast_data)) {
                        throw new BaseException('Error: Empty response from API.');
                    }
                } catch (Exception $e) {
                    
                    // Handle API errors
                    $weather_api_message = $e->getMessage();
                    $weather_forecast_data = null;
                }
                
                $this->convert_formats($weather_forecast_data);
            }else{//just check location from api to save to app DB
                
                try {
                    $weather_location_data = $weatherAPI->getWeatherLocation($new_location);
                    
                    if ($weather_location_data === false) {
                        throw new BaseException('Error: API call failed.');
                    }
                    
                    if (!$weather_location_data || empty($weather_location_data)) {
                        throw new BaseException('Error: Empty response from API.');
                    }
                } catch (Exception $e) {
                    
                    // Handle API errors
                    $weather_api_message = $e->getMessage();
                    $weather_location_data = null;
                }
            }
            
            $weather_locations = null;
            
            if($new_location &&
            (($weather_forecast_data && property_exists($weather_forecast_data,'current')) || $weather_location_data)){
                
                //unique random ID
                $randomGenerator = new RandomGenerator;
                $prefix = '';
                $suffix = date("mdY").'_mem_wl_'.substr(strtolower(trim($new_location)), 0, 2);
                $random_id = $randomGenerator->generate(10,$prefix,$suffix,'_');
                
                if($weather_forecast_data){
                    $location_name = $weather_forecast_data->location->name.', '.GlobalData::convert_state_to_abbreviation($weather_forecast_data->location->region);
                }else if($weather_location_data){
                    $location_name = $weather_location_data[0]->name.', '.GlobalData::convert_state_to_abbreviation($weather_location_data[0]->region);
                }
                
                $location_data = null;
                if(!$user_locations || sizeof($user_locations) == 0){//first location to save, set to defaul
                    $location_data = array(
                        'user_id'=>Auth::id(),
                        'name'=>$location_name,
                        'component'=>'weather',
                        'default'=>true,
                        'order'=>1,
                        'random_id'=>$random_id
                    );
                }else{
                    $location_data = array(
                        'user_id'=>Auth::id(),
                        'name'=>$location_name,
                        'component'=>'weather',
                        'default'=>false,
                        'order'=>1,
                        'random_id'=>$random_id
                    );
                }
                
                $location_db = Location::create($location_data);
                
                $weather_locations = Location::where('user_id', Auth::id())->where('component', 'weather')->orderBy('order', 'asc')->get();
            
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Created location',
                    'locations' => $weather_locations,
                    'new_location' => $new_location,
                    'weather_forecast_data' => $weather_forecast_data
                ];
                
            }else{
                
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => $weather_api_message,
                    'locations' => $weather_locations,
                    'new_location' => $new_location,
                    'weather_forecast_data' => $weather_forecast_data
                ];
            }
        }else{
            $json_data = [
                'status'=>Response::HTTP_UNAUTHORIZED,
                'status_message'=> Response::$statusMessages[Response::HTTP_UNAUTHORIZED],
                'message'=>'Invalid Credentials.',
            ];
        }
        
        return response()->json($json_data);
    }//end save weather location
    
    public function read_weather_locations(Request $request){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            $weather_locations = Location::where('user_id', Auth::id())->where('component', 'weather')->orderBy('order', 'asc')->get();
            $weather_forecast_data = null;
            
            if($weather_locations && sizeof($weather_locations) > 0){
                
                $default_location_name = null;
                foreach($weather_locations as $location){
                    if($location->default){
                        $default_location_name = $location->name;
                        break;
                    }
                }
                
                if($default_location_name){
                    
                    $weatherAPI = new WeatherAPI;
                    $weather_forecast_data = $weatherAPI->getWeatherForecastData($default_location_name, 3);
                    
                    if($weather_forecast_data->current){
                        $weather_forecast_data = $this->convert_formats($weather_forecast_data);
                    }else{
                        $weather_forecast_data = null;
                    }
                }
                
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Retrieved locations',
                    'locations' => $weather_locations,
                    'weather_forecast_data' => $weather_forecast_data
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Could not retrieve locations',
                    'locations' => $weather_locations,
                    'weather_forecast_data' => $weather_forecast_data
                ];
            }
        }else{
            $json_data = [
                'status'=>Response::HTTP_UNAUTHORIZED,
                'status_message'=> Response::$statusMessages[Response::HTTP_UNAUTHORIZED],
                'message'=>'Invalid Credentials.',
            ];
        }
        
        return response()->json($json_data);
    }//end read weather locations
    
    public function delete_weather_location($location_random_id){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            Log::debug('location_random_id: '.$location_random_id);
            
            $weather_location_to_delete = null;
            $delete_result = null;
            if($location_random_id){
                $weather_location_to_delete = Location::where('random_id', $location_random_id)->get()->first();
                Log::debug('weather_location_to_delete random_id: '.$weather_location_to_delete->random_id);
                $delete_result = Location::where('random_id', $location_random_id)->delete();
            }
            
            $weather_locations = null;
            $weather_forecast_data = null;
            
            if($delete_result > 0){
                
                //find new default if default was deleted
                if($weather_location_to_delete->default == true){
                    
                    $location_name = null;
                    $location_forecast_days = null;
                    
                    $weather_locations = Location::where('user_id', Auth::id())->where('component', 'weather')->orderBy('order', 'asc')->get();
                    
                    if(sizeof($weather_locations) > 0){
                        foreach($weather_locations as $location){
                            $location->default = true;
                            $location->save();
                            $location_name = $location->name;
                            $location_forecast_days = 3;
                            break;
                        }
                        
                        if($location_name){
                            $weatherAPI = new WeatherAPI;
                            $weather_forecast_data = $weatherAPI->getWeatherForecastData($location_name, $location_forecast_days);
                            
                            if(property_exists($weather_forecast_data,'current')){
                                $weather_forecast_data = $this->convert_formats($weather_forecast_data);
                            }
                        }
                    }
                }
                
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Deleted location',
                    'locations' => $weather_locations,
                    'location_random_id' => $location_random_id,
                    'weather_forecast_data' => $weather_forecast_data
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Could not delete location',
                    'locations' => $weather_locations,
                    'location_random_id' => $location_random_id,
                    'weather_forecast_data' => $weather_forecast_data
                ];
            }
        }else{
            $json_data = [
                'status'=>Response::HTTP_UNAUTHORIZED,
                'status_message'=> Response::$statusMessages[Response::HTTP_UNAUTHORIZED],
                'message'=>'Invalid Credentials.',
            ];
        }
        
        return response()->json($json_data);
    }//end delete weather location
    
    public function change_default_weather_location($location_random_id){
            
        /*
        Log::debug('location_random_id: '.$location_random_id);
        Log::debug('Auth::check(): '.Auth::check());
        Log::debug('Auth::id(): '.Auth::id());
        */
        
        $json_data = [];
        
        if (Auth::check()) {
            
            $weather_locations = Location::where('user_id', Auth::id())->where('component', 'weather')->orderBy('order', 'asc')->get();
            
            $default_location_name = null;
            $default_location_forecast_days = null;
            $weather_forecast_data = null;
            
            foreach($weather_locations as $location){
                if($location->random_id == $location_random_id){
                    $location->default = true;
                    $default_location_name = $location->name;
                    $default_location_forecast_days = 3;
                }else{
                    $location->default = false;
                }
                $location->save();
            }
                
            Log::debug('default_location_name: '.$default_location_name);
            
            if($default_location_name){

                $weatherAPI = new WeatherAPI;
                try {
                    $weather_forecast_data = $weatherAPI->getWeatherForecastData($default_location_name, $default_location_forecast_days);
                
                    Log::debug('weather_forecast_data: successful');
                }catch (Exception $e) {
                
                    Log::debug('weather_forecast_data: '.$e->getMessage());
                }
                
                if(property_exists($weather_forecast_data,'current')){
                    $weather_forecast_data = $this->convert_formats($weather_forecast_data);
                }
            
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Changed default location',
                    'locations' => $weather_locations,
                    'default_location_random_id' => $location_random_id,
                    'weather_forecast_data' => $weather_forecast_data
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Could not change default location',
                    'locations' => $weather_locations,
                    'default_location_random_id' => $location_random_id,
                    'weather_forecast_data' => $weather_forecast_data
                ];
            }
        }else{
            $json_data = [
                'status'=>Response::HTTP_UNAUTHORIZED,
                'status_message'=> Response::$statusMessages[Response::HTTP_UNAUTHORIZED],
                'message'=>'Invalid Credentials.',
            ];
        }
        
        return response()->json($json_data);
    }//end change default weather location
    
    private function convert_formats($weather_forecast_data){
        
        if(property_exists($weather_forecast_data,'location')){
            $weather_forecast_data->location->country = GlobalData::convert_country_to_abbreviation($weather_forecast_data->location->country);
            $weather_forecast_data->location->region = GlobalData::convert_state_to_abbreviation($weather_forecast_data->location->region);
            
            $weather_forecast_data_location_localtime = date('D M d, Y g:ia', strtotime($weather_forecast_data->location->localtime));
            $local_date_time = explode(' ' , $weather_forecast_data_location_localtime);
            $weather_forecast_data->location->date = $local_date_time[0].' '.$local_date_time[1].' '.$local_date_time[2].' '.$local_date_time[3];
            $weather_forecast_data->location->localtime = $local_date_time[4];
        }
        
        if($weather_forecast_data->forecast && $weather_forecast_data->forecast->forecastday && sizeof($weather_forecast_data->forecast->forecastday) > 0){
                
            for ($i = 0; $i < sizeof($weather_forecast_data->forecast->forecastday); $i++){
                
                $forecast_day = $weather_forecast_data->forecast->forecastday[$i];
                
                $forecast_day->date = date('D M d, Y', strtotime($forecast_day->date));
                $forecast_day_date = explode(' ' , $forecast_day->date);
                $forecast_day->day_of_week = $forecast_day_date[0];
                
                if($forecast_day->hour && sizeof($forecast_day->hour) > 0){
                    for ($j = 0; $j < sizeof($forecast_day->hour); $j++){
                        
                        $forecast_day_hour = $forecast_day->hour[$j];
                        
                        //$forecast_day_hour_time = explode(' ' , $forecast_day_hour->time);
                        //$date = strtotime($local_date_time[0]);
                        
                        $forecast_day_hour->date = date('D M d, Y g:ia', strtotime($forecast_day_hour->time));
                        $forecast_day_hour_date = explode(' ' , $forecast_day_hour->date);
                        $forecast_day_hour->day_of_week = $forecast_day_hour_date[0];
                        $forecast_day_hour->time = $forecast_day_hour_date[4];
                    }
                }
            }
            
        }
        
        return $weather_forecast_data;
    }//end convert formats
}