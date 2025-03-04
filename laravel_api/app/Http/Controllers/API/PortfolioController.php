<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Response;
use App\Models\Portfolio;
use App\Models\PortfolioSymbol;
use App\Libraries\RandomGenerator;
use App\Libraries\AlphaVantageAPI;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

use Exception;
use Exception as BaseException;

class PortfolioController extends Controller{
    
    public function save_portfolio(Request $request){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            $new_portfolio_name = null;
            if($request->new_portfolio_name){
                $new_portfolio_name = $request->new_portfolio_name;
            }
            
            $user_portfolios = Portfolio::where('user_id', Auth::id())->orderBy('order', 'asc')->get();
            
            //unique random ID
            $randomGenerator = new RandomGenerator;
            $prefix = '';
            $suffix = date("mdY").'_mem_por_'.substr(strtolower(trim($new_portfolio_name)), 0, 2);
            $random_id = $randomGenerator->generate(10,$prefix,$suffix,'_');
            
            if(!$user_portfolios || sizeof($user_portfolios) == 0){//first portfolio to save, set to default
                
                $portfolio_data = array(
                    'user_id'=>Auth::id(),
                    'name'=>trim($new_portfolio_name),
                    'default'=>true,
                    'order'=>1,
                    'random_id'=>$random_id
                );
                
            }else{
                
                $portfolio_data = array(
                    'user_id'=>Auth::id(),
                    'name'=>trim($new_portfolio_name),
                    'default'=>false,
                    'order'=>1,
                    'random_id'=>$random_id
                );
            }
            
            $portfolio_db = Portfolio::create($portfolio_data);
            
            $portfolios = Portfolio::where('user_id', Auth::id())->orderBy('order', 'asc')->get();
            
            $default_portfolio = null;
            foreach($portfolios as $portfolio){
                if($portfolio->default){
                    $default_portfolio = $portfolio;
                    break;
                }
            }
            
            if($portfolio_db){
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Created portfolio',
                    'new_portfolio_name' => $new_portfolio_name,
                    'portfolios' => $portfolios,
                    'default_portfolio' => $default_portfolio,
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Could not create potfolio',
                    'new_portfolio_name' => $new_portfolio_name,
                    'portfolios' => $portfolios,
                    'default_portfolio' => $default_portfolio,
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
    }//end save portfolio
    
    public function read_portfolios(Request $request){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            $portfolios = Portfolio::select('*')->where('user_id', Auth::id())->orderBy('order', 'asc')->get();
            
            $default_portfolio = null;
            $portfolio_symbols_data = null;
            
            if($portfolios && sizeof($portfolios) > 0){
                
                foreach($portfolios as $portfolio){
                    if($portfolio->default){
                        $default_portfolio = $portfolio;
                        $portfolio_symbols_data = PortfolioSymbol::where('user_id', Auth::id())->where('portfolio_id', $default_portfolio->id)->orderBy('order', 'asc')->get();
                        break;
                    }
                }
                
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Retrieved portfolios',
                    'portfolios' => $portfolios,
                    'default_portfolio' => $default_portfolio,
                    'default_portfolio_data' => $portfolio_symbols_data
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Could not retrieve portfolios',
                    'portfolios' => $portfolios,
                    'default_portfolio' => $default_portfolio,
                    'default_portfolio_data' => $portfolio_symbols_data
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
    }//end read portfolios
    
    public function delete_portfolio($portfolio_random_id){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            Log::debug('portfolio_random_id: '.$portfolio_random_id);
            
            $portfolio_to_delete = null;
            $portfolio_to_delete_is_default = false;
            $delete_result = null;
            
            if($portfolio_random_id){
                $portfolio_to_delete = Portfolio::where('random_id', $portfolio_random_id)->get()->first();
                if($portfolio_to_delete->default == true){
                    $portfolio_to_delete_is_default = true;
                }
                $delete_result = PortfolioSymbol::where('user_id', Auth::id())->where('portfolio_id', $portfolio_to_delete->id)->delete();
                $delete_result = Portfolio::where('random_id', $portfolio_random_id)->delete();
            }
            
            $portfolios = null;
            $default_portfolio = null;
            $portfolio_symbols_data = null;
            
            if($delete_result > 0){
                
                //find new default if default was deleted
                if($portfolio_to_delete_is_default){
            
                    $portfolios = Portfolio::select('*')->where('user_id', Auth::id())->orderBy('order', 'asc')->get();
                    
                    if(sizeof($portfolios) > 0){
                        //set first one to default
                        foreach($portfolios as $portfolio){
                            $portfolio->default = true;
                            $portfolio->save();
                            $default_portfolio = $portfolio;
                            $portfolio_symbols_data = PortfolioSymbol::where('user_id', Auth::id())->where('portfolio_id', $portfolio->id)->orderBy('order', 'asc')->get();
                            break;
                        }
                    }
                }
                
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Deleted portfolio',
                    'portfolio_random_id' => $portfolio_random_id,
                    'portfolios' => $portfolios,
                    'default_portfolio' => $default_portfolio,
                    'default_portfolio_data' => $portfolio_symbols_data
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Could not delete portfolio',
                    'portfolio_random_id' => $portfolio_random_id,
                    'portfolios' => $portfolios,
                    'default_portfolio' => $default_portfolio,
                    'default_portfolio_data' => $portfolio_symbols_data
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
    }//end delete portfolio
    
    public function change_default_portfolio($portfolio_random_id){
            
        Log::debug('------------change_default_portfolio------------');
        Log::debug('portfolio_random_id: '.$portfolio_random_id);
        Log::debug('Auth::check(): '.Auth::check());
        
        $json_data = [];
        
        if (Auth::check()) {
            
            Log::debug('portfolio_random_id: '.$portfolio_random_id);
            
            $portfolios = Portfolio::select('*')->where('user_id', Auth::id())->orderBy('order', 'asc')->get();
            
            $default_portfolio = null;
            $portfolio_symbols_data = null;
            
            foreach($portfolios as $portfolio){
                if($portfolio->random_id == $portfolio_random_id){
                    $portfolio->default = true;
                    $default_portfolio = $portfolio;
                }else{
                    $portfolio->default = false;
                }
                $portfolio->save();
            }
            
            if($default_portfolio){
                $portfolio_symbols_data = PortfolioSymbol::where('user_id', Auth::id())->where('portfolio_id', $default_portfolio->id)->orderBy('order', 'asc')->get();
                
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Changed default portfolio',
                    'portfolio_random_id' => $portfolio_random_id,
                    'portfolios' => $portfolios,
                    'default_portfolio' => $default_portfolio,
                    'default_portfolio_data' => $portfolio_symbols_data
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Could not change default portfolio',
                    'portfolio_random_id' => $portfolio_random_id,
                    'portfolios' => $portfolios,
                    'default_portfolio' => $default_portfolio,
                    'default_portfolio_data' => $portfolio_symbols_data
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
    }//end change default portfolio
    
    public function save_portfolio_symbols(Request $request){
        
        $json_data = [];
        
        if (Auth::check()) {
            Log::debug('------------save_portfolio_symbols-------------------');
            
            $portfolio_random_id = null;
            if($request->portfolio_random_id){
                $portfolio_random_id = trim($request->portfolio_random_id);
            }
            
            $portfolio_symbols_data = null;
            if($request->portfolio_symbols_json_string){
                $portfolio_symbols_data = json_decode(trim($request->portfolio_symbols_json_string));
            }
            
            $portfolio = null;
            $alpha_vantage_api_data = null;
            $exception_message = null;
            
            if($portfolio_symbols_data && sizeof($portfolio_symbols_data) > 0){
                
                $portfolio = Portfolio::select('*')->where('user_id', Auth::id())->where('random_id', $portfolio_random_id)->first();
                
                $alphaVantageAPI = new AlphaVantageAPI;
                
                $new_symbol_count = 0;
                $new_symbols_saved = 0;
                $new_symbol_errors = 0;
                
                foreach ($portfolio_symbols_data as $portfolio_symbol) {
                    
                    if(!property_exists($portfolio_symbol, 'random_id')){
                        
                        //check if symbol already exists in DB
                        $portfolio_symbol_in_db = PortfolioSymbol::where('user_id', Auth::id())->where('portfolio_id', $portfolio->id)->where('symbol', $portfolio_symbol->symbol)->first();
                            
                        $alpha_vantage_api_data = null;
                        
                        if(!isset($portfolio_symbol_in_db)){
                            $new_symbol_count++;
                            
                            if(isset($portfolio_symbol->symbol) && $portfolio_symbol->symbol != ''){
                                try {
                                    //json decoded already
                                    $alpha_vantage_api_data = $alphaVantageAPI->getQuoteData($portfolio_symbol->symbol);
                                    Log::debug('alpha_vantage_api_data: ', $alpha_vantage_api_data);
                                    
                                    Log::debug('check 1');
                                    // Check if the Geocoding API returned an error
                                    if ($alpha_vantage_api_data === false) {
                                        $exception_message = 'Error: API call failed.';
                                        throw new BaseException($exception_message);
                                    }
                                    
                                    Log::debug('check 2');
                                    if (!$alpha_vantage_api_data || empty($alpha_vantage_api_data)) {
                                        $exception_message = 'Error: Empty response from API.';
                                        throw new BaseException($exception_message);
                                    }
                                    /*
                                     if(isset($alpha_vantage_api_data['Error Message'])){//emtpy symbol
                                     throw new BaseException('Error: '.$alpha_vantage_api_data['Error Message']);
                                     }
                                     
                                     if(isset($alpha_vantage_api_data['Note'])){//emtpy symbol
                                     throw new BaseException('Error: '.$alpha_vantage_api_data['Note']);
                                     }
                                     */
                                    
                                    Log::debug('check 3');
                                   if(!isset($alpha_vantage_api_data['Global Quote']['01. symbol'])){
                                        Log::debug('check 4');
                                        if(isset($alpha_vantage_api_data['Information'])){//past daily quota
                                            Log::debug('check 5');
                                            $exception_message = $alpha_vantage_api_data['Information'];
                                            $alpha_vantage_api_data = null;
                                            //throw new BaseException($exception_message);
                                        }else{//symbol does not exists
                                            Log::debug('check 6');
                                            $exception_message = 'Does Not Exists.';
                                            $portfolio_symbol->error = $exception_message;
                                            $alpha_vantage_api_data = null;
                                            //throw new BaseException($exception_message);
                                        }
                                   }
                                } catch (Exception $e) {
                                    Log::debug('alpha_vantage_api_data exception: ', $e->getMessage());
                                    $exception_message = $e->getMessage();
                                    
                                    // Handle API errors
                                    $portfolio_symbol->error = $exception_message;
                                    
                                    $new_symbol_errors++;
                                }
                            }else{
                                
                                // Handle API errors
                                $portfolio_symbol->error = 'Empty Symbol Removed.';
                                $alpha_vantage_api_data = null;

                                $new_symbol_errors++;

                                Log::debug($portfolio_symbol->error);
                            }
                            
                            if($alpha_vantage_api_data){
                                
                                if($portfolio){
                                    Log::debug('start saving symbol: '.$portfolio_symbol->symbol);
                                    
                                    //unique random ID
                                    $randomGenerator = new RandomGenerator;
                                    $prefix = '';
                                    $suffix = date("mdY").'_mem_sym_'.substr(strtolower(trim($portfolio_symbol->symbol)), 0, 2);
                                    $random_id = $randomGenerator->generate(10,$prefix,$suffix,'_');
                                    
                                    $portfolio_symbol_data = array(
                                        'user_id'=>Auth::id(),
                                        'portfolio_id'=>$portfolio->id,
                                        'symbol'=>strtoupper(trim($portfolio_symbol->symbol)),
                                        'order'=>1,
                                        'random_id'=>$random_id
                                    );
                                    
                                    $portfolio_symbol_db = PortfolioSymbol::create($portfolio_symbol_data);
                                    
                                    $portfolio_symbol->api_response = $alpha_vantage_api_data;
                                    $portfolio_symbol->success = 'Saved Symbol';
                                    $portfolio_symbol->id = $portfolio_symbol_db->id;
                                    $portfolio_symbol->user_id = $portfolio_symbol_db->user_id;
                                    $portfolio_symbol->portfolio_id = $portfolio_symbol_db->portfolio_id;
                                    $portfolio_symbol->random_id = $portfolio_symbol_db->random_id;
                                    $portfolio_symbol->open = number_format((float)$alpha_vantage_api_data['Global Quote']['02. open'], 2, '.', '');
                                    $portfolio_symbol->high = number_format((float)$alpha_vantage_api_data['Global Quote']['03. high'], 2, '.', '');
                                    $portfolio_symbol->low = number_format((float)$alpha_vantage_api_data['Global Quote']['04. low'], 2, '.', '');
                                    $portfolio_symbol->price = number_format((float)$alpha_vantage_api_data['Global Quote']['05. price'], 2, '.', '');
                                    $portfolio_symbol->volume = intval($alpha_vantage_api_data['Global Quote']['06. volume']);
                                    $portfolio_symbol->previous_close = number_format((float)$alpha_vantage_api_data['Global Quote']['08. previous close'], 2, '.', '');
                                    $portfolio_symbol->change = number_format((float)$alpha_vantage_api_data['Global Quote']['09. change'], 2, '.', '');
                                    $portfolio_symbol->change_percent = number_format((float)str_replace('%','',$alpha_vantage_api_data['Global Quote']['10. change percent']), 2, '.', '');
                                    
                                    $new_symbols_saved++;

                                    Log::debug('finished saving symbol: '.$portfolio_symbol->symbol);
                                }
                            }
                        }else{
                            $portfolio_symbol->error = 'Already In Portfolio.';
                            $new_symbol_errors++;
                        }
                    }
                }
            }
            
            if($new_symbols_saved > 0){
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Saved portfolio symbol(s)',
                    'alpha_vantage_api_data' => $alpha_vantage_api_data,
                    'portfolio' => $portfolio,
                    'portfolio_data' => $portfolio_symbols_data,
                    'exception_message' => $exception_message
                ];
            }else if($new_symbol_errors > 0 && $new_symbol_errors < $new_symbol_count){
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Saved portfolio symbol(s)',
                    'alpha_vantage_api_data' => $alpha_vantage_api_data,
                    'portfolio' => $portfolio,
                    'portfolio_data' => $portfolio_symbols_data,
                    'exception_message' => $exception_message
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Could not create the portfolio symbol',
                    'alpha_vantage_api_data' => $alpha_vantage_api_data,
                    'portfolio' => $portfolio,
                    'portfolio_data' => $portfolio_symbols_data,
                    'exception_message' => $exception_message
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
    }//end save portfolio symbols
    
    public function delete_portfolio_symbol($portfolio_random_id, $portfolio_symbol_random_id){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            Log::debug('portfolio_random_id: '.$portfolio_random_id);
            Log::debug('portfolio_symbol_random_id: '.$portfolio_symbol_random_id);
            
            $delete_result = null;
            
            if($portfolio_symbol_random_id && $portfolio_symbol_random_id != 'none'){
                $delete_result = PortfolioSymbol::where('user_id', Auth::id())->where('random_id', $portfolio_symbol_random_id)->delete();
            }else if($portfolio_random_id && $portfolio_symbol_random_id == 'none'){
                $portfolio_to_delete_symbols = Portfolio::where('random_id', $portfolio_random_id)->get()->first();
                $delete_result = PortfolioSymbol::where('user_id', Auth::id())->where('portfolio_id', $portfolio_to_delete_symbols->id)->delete();
            }
            
            Log::debug('delete_result: '.$delete_result);
            
            $portfolio_data = null;
            
            if($delete_result > 0){
                
                $portfolio = Portfolio::where('random_id', $portfolio_random_id)->get()->first();
                $portfolio_data = PortfolioSymbol::where('user_id', Auth::id())->where('portfolio_id', $portfolio->id)->orderBy('order', 'asc')->get();

                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Deleted portfolio symbol(s)',
                    'portfolio_random_id' => $portfolio_random_id,
                    'portfolio_symbol_random_id' => $portfolio_symbol_random_id,
                    'portfolio_data' => $portfolio_data,
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Could not delete portfolio symbol(s)',
                    'portfolio_random_id' => $portfolio_random_id,
                    'portfolio_symbol_random_id' => $portfolio_symbol_random_id,
                    'portfolio_data' => $portfolio_data,
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
    }//end delete portfolio symbols
}