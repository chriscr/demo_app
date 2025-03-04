<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Response;
use App\Models\User;
use App\Models\Category;
use App\Libraries\RandomGenerator;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller{
    
    public function read_users(Request $request){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            $users_list = User::orderBy('role')->orderBy('name')->get();
            
            if(sizeof($users_list) > 0){
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Retrieved Users',
                    'users_list_data' => $users_list,
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Could not retrieve users',
                    'users_list_data' => $users_list,
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
    }//end read users
    
    public function save_category(Request $request){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            $validator = Validator::make($request->all(), [
                'title' => 'required|max:191',
                'status' => 'required|in:active,suspended,deleted',
            ]);
            
            if($validator->fails()){
                $json_data = [
                    'status'=>Response::HTTP_FORM_VALIDATION_FAILED,
                    'status_message'=> Response::$statusMessages[Response::HTTP_FORM_VALIDATION_FAILED],
                    'validation_errors'=>$validator->messages(),
                ];
            }else{
                
                //unique random ID
                $randomGenerator = new RandomGenerator;
                $prefix = '';
                $suffix = 'admin_cat_'.date("mdY").'_'.substr(strtolower(trim($request->title)), 0, 2);
                $random_id = $randomGenerator->generate(10,$prefix,$suffix,'_');
                
                $category = Category::create([
                    'title'=>trim($request->title),
                    'status'=>trim($request->status),
                    'random_id'=>$random_id,
                ]);
                
                if($category){
                    $json_data = [
                        'status'=>Response::HTTP_OK,
                        'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                        'message' => 'Created Category',
                        'category' => $category,
                    ];
                }else{
                    $json_data = [
                        'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                        'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                        'message' => 'Could not create Category',
                        'category' => $category,
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
        
    }//end save category
    
    public function read_categories(Request $request){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            $categories = Category::orderBy('created_at')->get();
            
            if($categories && sizeof($categories) > 0){
                
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Retrieved Categories',
                    'categories' => $categories,
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Could not retrieve Categories',
                    'categories' => $categories,
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
    }//end read categories
    
    public function delete_category(Request $request){
        
        Log::debug('delete_category');
        
        Log::debug('request category_random_id: ' . $request->category_random_id);
        
        $json_data = [];
        
        if (Auth::check()) {
            
            $category_random_id = null;
            $delete_result = null;
            if($request->category_random_id){
                $category_random_id = $request->category_random_id;
                
                Log::info('category_random_id: ' . $category_random_id);
                
                $delete_result = Category::where('random_id', $category_random_id)->delete();
                
                Log::debug('delete_result: ' . $delete_result);
            }
            
            $categories = null;
            
            if($delete_result > 0){
                
                //$categories = Category::select('*')->orderBy('order', 'asc')->get();
                
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Deleted category',
                    'category_random_id' => $category_random_id,
                    'categories' => $categories,
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Could not delete category',
                    'category_random_id' => $category_random_id,
                    'categories' => $categories,
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
    }//end delete category
}
