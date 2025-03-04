<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Response;
use App\Models\Category;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AppController extends Controller{
    
    public function categories(Request $request){
        
        $json_data = [];
        
        $categories = Category::orderBy('title')->get();
        
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
        
        return response()->json($json_data);
    }//end  categories
}
