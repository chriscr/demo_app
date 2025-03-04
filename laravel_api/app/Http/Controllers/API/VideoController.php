<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Response;
use App\Models\Video;
use App\Models\User;
use App\Libraries\RandomGenerator;
use App\Libraries\GlobalData;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Aws\S3\S3Client;

use Illuminate\Support\Facades\Log;

class VideoController extends Controller{
    
    private $s3;
    
    public function __construct(){
        
        $this->s3 = new S3Client([
            'version' => 'latest',
            'region' => env('AWS_DEFAULT_REGION'),
            'credentials' => [
                'key'    => env('AWS_ACCESS_KEY_ID'),
                'secret' => env('AWS_SECRET_ACCESS_KEY'),
            ],
        ]);
        
    }
    
    public function read_categories(Request $request){
        
        $json_data = [];
        
        $categories = [
            ['id' => 1, 'title' => 'Category 1'],
            ['id' => 2, 'title' => 'Category 2'],
            ['id' => 3, 'title' => 'Category 3'],
            ['id' => 4, 'title' => 'Category 4'],
            ['id' => 5, 'title' => 'Category 5'],
            // Add more categories as needed
        ];
        
        if($categories && sizeof($categories) > 0){
            
            $json_data = [
                'status'=>Response::HTTP_OK,
                'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                'message' => 'Retrieved categories',
                'categories' => $categories,
            ];
        }else{
            $json_data = [
                'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                'message' => 'Could not retrieve categories',
                'categories' => $categories,
            ];
        }
        
        return response()->json($json_data);
    }//end read categories
    
    public function search_videos(Request $request){
        
        $json_data = [];

        $validator = Validator::make($request->all(), [
            'search_terms' => 'required_without_all:category_id|max:191',
            'category_id' => 'required_without_all:search_terms|numeric|between:0,10',
        ]);
        
        if($validator->fails()){
            $json_data = [
                'status'=>Response::HTTP_FORM_VALIDATION_FAILED,
                'status_message'=> Response::$statusMessages[Response::HTTP_FORM_VALIDATION_FAILED],
                'validation_errors'=>$validator->messages(),
            ];
        }else{
            // Remove small words from search_terms
            $searchTerms = preg_replace('/\b(?:a|an|the|is|as)\b/i', '', $request->input('search_terms'));
            
            // Build a query to get a list of videos
            $categoryId = intval($request->input('category_id'));
            if($categoryId > 0 && $categoryId <= 10){

                $categoryCondition = function ($query) use ($categoryId) {
                    $query->where(function ($subquery) use ($categoryId) {
                        $subquery->where('categories', 'like', "$categoryId;%")
                        ->orWhere('categories', 'like', "%;$categoryId;%")
                        ->orWhere('categories', 'like', "%;$categoryId")
                        ->orWhere('categories', '=', "$categoryId");
                    });
                };
                
                $videos = Video::select('*')
                ->where(function ($query) use ($searchTerms) {
                    $query->where('title', 'like', "%$searchTerms%")
                    ->orWhere('description', 'like', "%$searchTerms%");
                })
                ->where($categoryCondition)
                ->distinct()
                ->get();
            }else{
                
                $videos = Video::select('*')
                ->where(function ($query) use ($searchTerms) {
                    $query->where('title', 'like', "%$searchTerms%")
                    ->orWhere('description', 'like', "%$searchTerms%");
                })
                ->distinct()
                ->get();
            }
            
            if($videos && sizeof($videos) > 0){
                // Attach owner's email to each video
                $videoIds = $videos->pluck('id')->toArray();
                $owners = User::select('*')
                ->join('videos', 'users.id', '=', 'videos.user_id')
                ->whereIn('videos.id', $videoIds)
                ->pluck('paypal_email', 'videos.id');
                
                foreach ($videos as $video) {
                    $video->paypal_email = $owners[$video->id] ?? null;
                }
                
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Retrieved videos',
                    'videos' => $videos,
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Could not retrieve videos',
                    'videos' => $videos,
                ];
            }
        }
        
        return response()->json($json_data);
    }//end search videos
    
    public function save_video(Request $request){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            $validator = Validator::make($request->all(), [
                'title' => 'required|max:191',
                'description' => 'required|max:250',
                'categories' => 'required|array',
                //'categories.*' => 'exists:categories,random_id', // Assumes you have a "categories" table with an "random_id" field
                'privacy' => 'required|in:public,unlisted,private',
                'audience' => 'required|in:all,adult,children',
                'videoFile' => 'required|file|mimes:mp4|max:100000',
                'thumbnailFile' => 'required|file|mimes:jpg,jpeg,gif,png|max:100000',
            ]);
            
            if($validator->fails()){
                $json_data = [
                    'status'=>Response::HTTP_FORM_VALIDATION_FAILED,
                    'status_message'=> Response::$statusMessages[Response::HTTP_FORM_VALIDATION_FAILED],
                    'validation_errors'=>$validator->messages(),
                ];
            }else{
                // Assuming you have an array of category IDs in the request named 'category_ids'
                $categoryIds = $request->input('categories', []);
                
                // Implode the array with ';'
                $implodedCategories = implode(';', $categoryIds);
                
                //unique random ID
                $randomGenerator = new RandomGenerator;
                $prefix = '';
                $suffix = 'mem_vid_'.date("mdY").'_'.substr(strtolower(trim($request->title)), 0, 2);
                $random_id = $randomGenerator->generate(10,$prefix,$suffix,'_');
                
                //save video
                $video_file = $request->file('videoFile');
                $video_extension = $video_file->getClientOriginalExtension();
                //$video_file_path = 'videos/' . $video_file->getClientOriginalName();
                $video_file_path = 'videos/' . $random_id . '.' . $video_extension;
                
                
                // Upload the video to S3
                $this->s3->putObject([
                    'Bucket' => env('AWS_BUCKET'),
                    'Key' => $video_file_path,
                    'Body' => file_get_contents($video_file),
                ]);
                
                //save thumbnail
                $thumbnail_file = $request->file('thumbnailFile');
                $thumbnail_extension = $thumbnail_file->getClientOriginalExtension();
                //$thumbnail_file_path = 'thumbnails/' . $thumbnail_file->getClientOriginalName();
                $thumbnail_file_path = 'thumbnails/' . $random_id . '.' . $thumbnail_extension;
                
                // Upload the video to S3
                $this->s3->putObject([
                    'Bucket' => env('AWS_BUCKET'),
                    'Key' => $thumbnail_file_path,
                    'Body' => file_get_contents($thumbnail_file),
                ]);
                
                $video = Video::create([
                    'user_id'=>Auth::id(),
                    'title'=>trim($request->title),
                    'description'=>trim($request->description),
                    'categories'=>$implodedCategories,
                    'privacy'=>trim($request->privacy),
                    'audience'=>trim($request->audience),
                    'video_url'=>$video_file_path,
                    'thumbnail_url'=>$thumbnail_file_path,
                    'status'=>'active',
                    'random_id'=>$random_id,
                ]);
                
                if($video){
                    $json_data = [
                        'status'=>Response::HTTP_OK,
                        'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                        'message' => 'Created Video',
                        'video' => $video,
                    ];
                }else{
                    $json_data = [
                        'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                        'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                        'message' => 'Could not create video',
                        'video' => $video,
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
        
    }//end save video
    
    public function read_videos(Request $request){
        
        
        Log::debug('Auth::id(): '.Auth::id());
        Log::debug('Auth::check(): '.Auth::check());
        
        $json_data = [];
        
        if (Auth::check()) {
            
            //$videos = Video::select('*')->where('user_id', Auth::id())->orderBy('created_at', 'asc')->get();
            
            $perPage = $request->get('per_page', 10); // Set your preferred number of items per page
        
            $videos_with_pagination = Video::select('*')->where('user_id', Auth::id())->orderBy('created_at', 'asc')->paginate($perPage);
            
            $videos = null;
            
            if($videos_with_pagination && sizeof($videos_with_pagination) > 0){
                
                if($videos_with_pagination->items() && sizeof($videos_with_pagination->items()) > 0){
                    
                    $videos = $videos_with_pagination->items();
                
                    // Modify pagination data
                    $pagination_data = [
                        'current_page' => $videos_with_pagination->currentPage(),
                        'last_page' => $videos_with_pagination->lastPage(),
                        'per_page' => $videos_with_pagination->perPage(),
                        'total' => $videos_with_pagination->total(),
                    ];
                    
                    // Convert next_page_url and prev_page_url to page numbers
                    $pagination_data['next_page'] = null;
                    if ($videos_with_pagination->hasMorePages()) {
                        $pagination_data['next_page'] = $videos_with_pagination->currentPage() + 1;
                    }
                    
                    $pagination_data['prev_page'] = null;
                    if ($videos_with_pagination->previousPageUrl()) {
                        $pagination_data['prev_page'] = $videos_with_pagination->currentPage() - 1;
                    }
                    
                    // Remove unwanted keys
                    unset($pagination_data['path'], $pagination_data['from'], $pagination_data['to'], $pagination_data['data']);
                    
                }else{
                    $pagination_data = null;
                }
            
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Retrieved videos',
                    'videos' => $videos,
                    'pagination_data' => $pagination_data
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Could not retrieve videos',
                    'videos' => $videos,
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
    }//end read videos
    
    public function delete_video($video_random_id){
        
        Log::debug('=========delete_video============');
        Log::debug('Auth::check(): '.Auth::check());
        Log::debug('video_random_id: '.$video_random_id);
        Log::debug('=========delete_video============');
        
        $json_data = [];
        
        if (Auth::check()) {
            
            $delete_result = null;
            if($video_random_id){
                $delete_result = Video::where('random_id', $video_random_id)->delete();
                
                //TODO: delete from S3
            }
            
            $videos = null;
            
            if($delete_result > 0){
                $videos = Video::select('*')->where('user_id', Auth::id())->orderBy('created_at', 'asc')->get();
                
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Deleted video',
                    'video_random_id' => $video_random_id,
                    'videos' => $videos,
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Could not delete video',
                    'video_random_id' => $video_random_id,
                    'videos' => $videos,
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
    }//end delete video
    
    public function update_video_views(Request $request){
        
        $json_data = [];
            
        $video = null;
        $video_random_id = null;
        if($request->video_random_id){
            $video_random_id = $request->video_random_id;
            $video = Video::where('random_id', $video_random_id)->first();
        }
        
        if($video){
            $video->views = $video->views + 1;
            $video->update();
            
            $json_data = [
                'status'=>Response::HTTP_OK,
                'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                'message' => 'Updated video viewws',
                'video_random_id' => $video_random_id,
                'video' => $video,
            ];
        }else{
            $json_data = [
                'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                'message' => 'Could not delete video',
                'video_random_id' => $video_random_id,
                'video' => $video,
            ];
        }
        
        return response()->json($json_data);
    }//end delete video
    
}
