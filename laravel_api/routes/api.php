<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\AppController;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\MessagingController;
use App\Http\Controllers\API\CheckListController;
use App\Http\Controllers\API\PortfolioController;
use App\Http\Controllers\API\TrafficController;
use App\Http\Controllers\API\LocationController;
use App\Http\Controllers\API\WeatherController;
use App\Http\Controllers\API\VideoController;
use App\Http\Controllers\API\PaymentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('categories', [AppController::class, 'categories']);

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('forgot_password', [AuthController::class, 'forgot_password']);
Route::put('reset_password', [AuthController::class, 'reset_password']);
Route::put('activate_account/{id}', [AuthController::class, 'activate_account']);

Route::post('search_videos', [VideoController::class, 'search_videos']);
Route::post('update_video_views', [VideoController::class, 'update_video_views']);

Route::post('contact', [MessagingController::class, 'contact']);

Route::group(['middleware' => ['auth:sanctum']], function(){
    Route::get('logout', [AuthController::class, 'logout']);
    Route::put('save_password', [AuthController::class, 'save_password']);
    Route::post('save_settings', [AuthController::class, 'save_settings']);

    Route::get('read_users', [AdminController::class, 'read_users']);
    Route::post('save_category', [AdminController::class, 'save_category']);
    Route::get('read_categories', [AdminController::class, 'read_categories']);
    Route::put('update_category/{id}', [AdminController::class, 'update_category']);
    Route::delete('delete_category/{id}', [AdminController::class, 'delete_category']);

    Route::post('save_check_list', [CheckListController::class, 'save_check_list']);
    Route::get('read_check_lists', [CheckListController::class, 'read_check_lists']);
    Route::delete('delete_check_list/{id}', [CheckListController::class, 'delete_check_list']);
    Route::put('change_default_check_list/{id}', [CheckListController::class, 'change_default_check_list']);
    Route::post('save_check_list_items', [CheckListController::class, 'save_check_list_items']);
    Route::delete('delete_check_list_item/{id}/{checkListId}', [CheckListController::class, 'delete_check_list_item']);
    
    Route::post('save_portfolio', [PortfolioController::class, 'save_portfolio']);
    Route::get('read_portfolios', [PortfolioController::class, 'read_portfolios']);
    Route::delete('delete_portfolio/{id}', [PortfolioController::class, 'delete_portfolio']);
    Route::put('change_default_portfolio/{id}', [PortfolioController::class, 'change_default_portfolio']);
    Route::post('save_portfolio_symbols', [PortfolioController::class, 'save_portfolio_symbols']);
    Route::delete('delete_portfolio_symbol/{id}/{symbolId}', [PortfolioController::class, 'delete_portfolio_symbol']);
    
    Route::post('save_traffic_location', [TrafficController::class, 'save_traffic_location']);
    Route::get('read_traffic_locations', [TrafficController::class, 'read_traffic_locations']);
    Route::delete('delete_traffic_location/{id}', [TrafficController::class, 'delete_traffic_location']);
    Route::put('change_default_traffic_location/{id}', [TrafficController::class, 'change_default_traffic_location']);
    

    Route::get('read_saved_lists', [LocationController::class, 'read_saved_lists']);
    Route::post('save_list', [LocationController::class, 'save_list']);
    Route::delete('delete_saved_list/{id}', [LocationController::class, 'delete_saved_list']);

    Route::get('read_saved_locations', [LocationController::class, 'read_saved_locations']);
    Route::post('save_location', [LocationController::class, 'save_location']);
    Route::delete('delete_saved_location/{id}', [LocationController::class, 'delete_saved_location']);
    
    Route::post('save_weather_location', [WeatherController::class, 'save_weather_location']);
    Route::get('read_weather_locations', [WeatherController::class, 'read_weather_locations']);
    Route::delete('delete_weather_location/{id}', [WeatherController::class, 'delete_weather_location']);
    Route::put('change_default_weather_location/{id}', [WeatherController::class, 'change_default_weather_location']);
    
    Route::get('save_video_category', [VideoController::class, 'save_video_category']);
    Route::get('read_video_categories', [VideoController::class, 'read_video_categories']);
    Route::put('update_video_category/{id}', [VideoController::class, 'update_video_category']);
    Route::delete('delete_video_category/{id}', [VideoController::class, 'delete_video_category']);
    Route::post('save_video', [VideoController::class, 'save_video']);
    Route::get('read_videos', [VideoController::class, 'read_videos']);
    Route::put('update_video', [VideoController::class, 'update_video']);
    Route::delete('delete_video/{id}', [VideoController::class, 'delete_video']);
    
    Route::post('save_payment', [PaymentController::class, 'save_payment']);
    Route::get('read_payments', [PaymentController::class, 'read_payments']);
    Route::post('save_paypal_email', [PaymentController::class, 'save_paypal_email']);
});
