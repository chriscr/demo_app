<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Response;
use App\Models\SavedList;
use App\Models\SavedLocation;
use App\Libraries\RandomGenerator;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class LocationController extends Controller{
    
    public function read_saved_lists(Request $request){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            $saved_lists = SavedList::select('*')->where('user_id', Auth::id())
            ->with(['savedLocations' => function($query) {
                $query->orderBy('name', 'asc');
            }])
            ->orderBy('created_at', 'asc')->get();
            
            if($saved_lists){
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Saved Lists Retrieved',
                    'saved_lists' => $saved_lists
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_NOT_FOUND,
                    'status_message'=> Response::$statusMessages[Response::HTTP_NOT_FOUND],
                    'message' => 'Saved List Error',
                    'saved_lists' => $saved_lists
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
    }//end read saved lists
    
    public function save_list(Request $request){
        
        $json_data = [];
        
        if (Auth::check()) {
        
            $validator = Validator::make($request->all(), [
                'saved_list_name' => 'required|max:191',
            ]);
            
            if($validator->fails()){
                $json_data = [
                    'status'=>Response::HTTP_FORM_VALIDATION_FAILED,
                    'status_message'=> Response::$statusMessages[Response::HTTP_FORM_VALIDATION_FAILED],
                    'validation_errors'=>$validator->messages(),
                ];
            }else{
            
                $saved_list_name = null;
                if($request->saved_list_name){
                    $saved_list_name = $request->saved_list_name;
                }
            
                //unique random ID
                $randomGenerator = new RandomGenerator;
                $prefix = '';
                $suffix = date("mdY").'_mem_slis_'.substr(strtolower(trim($saved_list_name)), 0, 2);
                $random_id = $randomGenerator->generate(10,$prefix,$suffix,'_');

                $saved_list_data = array(
                    'user_id'=>Auth::id(),
                    'name'=>trim($saved_list_name),
                    'status'=>"active",
                    'random_id'=>$random_id
                );
                
                $saved_list_db = SavedList::create($saved_list_data);
            
                $saved_lists = SavedList::select('*')->where('user_id', Auth::id())
                ->with(['savedLocations' => function($query) {
                    $query->orderBy('name', 'asc');
                }])
                ->orderBy('created_at', 'asc')->get();
                
                if($saved_list_db){
                    $json_data = [
                        'status'=>Response::HTTP_OK,
                        'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                        'message' => 'Saved List Successful',
                        'saved_list_name' => $saved_list_name,
                        'saved_lists' => $saved_lists
                    ];
                }else{
                    $json_data = [
                        'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                        'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                        'message' => 'Saved List Not Found',
                        'saved_list_name' => $saved_list_name,
                        'saved_lists' => $saved_lists
                    ];
                }
            
            }
        }else{
            $json_data = [
                'status'=>Response::HTTP_UNAUTHORIZED,
                'status_message'=> Response::$statusMessages[Response::HTTP_UNAUTHORIZED],
                'message'=>'Invalid Credentials.',
            ];
        }
        
        return response()->json($json_data);
    }//end save list
    
    public function delete_saved_list($saved_list_random_id){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            Log::debug('saved_list_random_id: '.$saved_list_random_id);
            
            $saved_list_to_delete = null;
            $delete_result = null;
            
            if($saved_list_random_id){
                $delete_result = SavedList::where('random_id', $saved_list_random_id)->delete();
            }
            
            $saved_lists = null;
            
            if($delete_result > 0){
            
                $saved_lists = SavedList::select('*')->where('user_id', Auth::id())
                ->with(['savedLocations' => function($query) {
                    $query->orderBy('name', 'asc');
                }])
                ->orderBy('created_at', 'asc')->get();
                
                if($saved_lists){
                    $json_data = [
                        'status'=>Response::HTTP_OK,
                        'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                        'message' => 'Saved List Delete Successful',
                        'saved_list_random_id' => $saved_list_random_id,
                        'saved_lists' => $saved_lists,
                    ];
                }else{
                    $json_data = [
                        'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                        'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                        'message' => 'Saved List Not Found',
                        'saved_list_random_id' => $saved_list_random_id,
                    ];
                }
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Saved List Delete Failed',
                    'saved_list_random_id' => $saved_list_random_id,
                    'saved_lists' => $saved_lists,
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
    }//end delete saved list
    
    public function save_location(Request $request){
        
        $json_data = [];
        
        if (Auth::check()) {
        
            $validator = Validator::make($request->all(), [
                'saved_location_name' => 'required|max:191',
                'google_place_id' => 'required|max:191',
                'address' => 'required|max:191',
                'saved_list_random_id' => 'required|max:191',
            ]);

            if($validator->fails()){
                $json_data = [
                    'status'=>Response::HTTP_FORM_VALIDATION_FAILED,
                    'status_message'=> Response::$statusMessages[Response::HTTP_FORM_VALIDATION_FAILED],
                    'validation_errors'=>$validator->messages(),
                ];
            }else{

                $address = trim($request->address);
                $address = str_replace(', United States', '', $address) ;
                $address = str_replace(', USA', '', $address) ;

                $saved_location_name = null;
                if($request->saved_location_name){
                    $saved_location_name = $request->saved_location_name;
                }

                $saved_list_random_id = null;
                if($request->saved_list_random_id){
                    $saved_list_random_id = $request->saved_list_random_id;
                }
                
                $saved_list = SavedList::where('random_id', $saved_list_random_id)->first();
                Log::debug('saved_list: '.$saved_list);
            
                if($saved_list){
                
                    //unique random ID
                    $randomGenerator = new RandomGenerator;
                    $prefix = '';
                    $suffix = date("mdY").'_mem_sloc_'.substr(strtolower(trim($saved_location_name)), 0, 2);
                    $random_id = $randomGenerator->generate(10,$prefix,$suffix,'_');

                    $save_location_data = array(
                        'user_id'=>Auth::id(),
                        'saved_list_id'=>$saved_list->id,
                        'name'=>trim($saved_location_name),
                        'google_place_id'=>trim($request->google_place_id),
                        'address'=>$address,
                        'phone'=>trim($request->phone),
                        'wifi_speed'=>trim($request->wifi_speed),
                        'noise_level'=>trim($request->noise_level),
                        'free_internet'=>trim($request->free_internet),
                        'details'=>trim($request->details),
                        'status'=>"active",
                        'random_id'=>$random_id
                    );
                    
                    $saved_location_db = SavedLocation::create($save_location_data);
                    
                    if($saved_location_db){
                        $json_data = [
                            'status'=>Response::HTTP_OK,
                            'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                            'message' => 'Saved List Successful',
                            'save_location' => $saved_location_db,
                        ];
                    }else{
                        $json_data = [
                            'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                            'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                            'message' => 'Saved Location Error',
                            'saved_location_name' => $saved_location_name,
                            'saved_list_random_id' => $saved_list_random_id,
                        ];
                    }

                }else{
                    $json_data = [
                        'status'=>Response::HTTP_NOT_FOUND,
                        'status_message'=> Response::$statusMessages[Response::HTTP_NOT_FOUND],
                        'message' => 'Saved Lists Not Found',
                        'saved_list_random_id' => $saved_list_random_id,
                    ];
                }
            }
        }else{
            $json_data = [
                'status'=>Response::HTTP_UNAUTHORIZED,
                'status_message'=> Response::$statusMessages[Response::HTTP_UNAUTHORIZED],
                'message'=>'Invalid Credentials.',
            ];
        }
        
        return response()->json($json_data);
    }//end save list
    
    public function delete_saved_location($saved_location_random_id){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            Log::debug('saved_location_random_id: '.$saved_location_random_id);
            
            $saved_location_to_delete = null;
            $delete_result = null;
            
            if($saved_location_random_id){
                $delete_result = SavedLocation::where('random_id', $saved_location_random_id)->delete();
            }
            
            if($delete_result > 0){
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Saved Location Delete Successful',
                    'saved_location_random_id' => $saved_location_random_id,
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Saved Location Delete Failed',
                    'saved_location_random_id' => $saved_location_random_id,
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
    }//end delete saved list
}
