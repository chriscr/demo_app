<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Response;
use App\Models\User;
use App\Models\Payment;
use App\Libraries\RandomGenerator;
use App\Libraries\GlobalData;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller{
    
    public function read_payments(Request $request){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            $perPage = $request->get('per_page', 10); // Set your preferred number of items per page
        
            //$payments_with_pagination = Payment::select('*')->where('user_id', Auth::id())->orderBy('created_at', 'asc')->paginate($perPage);
            $payments_with_pagination = Payment::select('*')->orderBy('created_at', 'asc')->paginate($perPage);
            
            $payments = null;
            
            if($payments_with_pagination && sizeof($payments_with_pagination) > 0){
                
                if($payments_with_pagination->items() && sizeof($payments_with_pagination->items()) > 0){
                    
                    $payments = $payments_with_pagination->items();
                
                    // Modify pagination data
                    $pagination_data = [
                        'current_page' => $payments_with_pagination->currentPage(),
                        'last_page' => $payments_with_pagination->lastPage(),
                        'per_page' => $payments_with_pagination->perPage(),
                        'total' => $payments_with_pagination->total(),
                    ];
                    
                    // Convert next_page_url and prev_page_url to page numbers
                    $pagination_data['next_page'] = null;
                    if ($payments_with_pagination->hasMorePages()) {
                        $pagination_data['next_page'] = $payments_with_pagination->currentPage() + 1;
                    }
                    
                    $pagination_data['prev_page'] = null;
                    if ($payments_with_pagination->previousPageUrl()) {
                        $pagination_data['prev_page'] = $payments_with_pagination->currentPage() - 1;
                    }
                    
                    // Remove unwanted keys
                    unset($pagination_data['path'], $pagination_data['from'], $pagination_data['to'], $pagination_data['data']);
                    
                }else{
                    $pagination_data = null;
                }
            
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Retrieved payments',
                    'payments' => $payments,
                    'pagination_data' => $pagination_data
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Could not retrieve payments',
                    'payments' => $payments,
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
    }//end read payments

    public function save_payment(Request $request){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            $validator = Validator::make($request->all(), [
                'title' => 'required|max:191',
                'amount' => 'required|regex:/^\d+(\.\d{1,2})?$/|max:250',
                'paypal_transaction_id' => 'required|max:250',
                'paypal_transaction_intent' => 'required|max:250',
                'paypal_transaction_status' => 'required|max:250',
                'paypal_transaction_payer_email' => 'required|max:250',
                'paypal_transaction_payer_name' => 'required|max:250',
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
                $suffix = 'mem_pay_'.date("mdY").'_'.substr(strtolower(trim($request->title)), 0, 2);
                $random_id = $randomGenerator->generate(10,$prefix,$suffix,'_');
                
                $payment = Payment::create([
                    'user_id'=>Auth::id(),
                    'title'=>trim($request->title),
                    'amount'=>trim($request->amount),
                    'gateway'=>'paypal',
                    'trx_id'=>trim($request->paypal_transaction_id),
                    'trx_intent'=>trim($request->paypal_transaction_intent),
                    'trx_status'=>trim($request->paypal_transaction_status),
                    'trx_payer_email'=>trim($request->paypal_transaction_payer_email),
                    'trx_payer_name'=>trim($request->paypal_transaction_payer_name),
                    'random_id'=>$random_id,
                ]);
                
                if($payment){
                    $json_data = [
                        'status'=>Response::HTTP_OK,
                        'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                        'message' => 'Created Payment',
                        'payment' => $payment,
                    ];
                }else{
                    $json_data = [
                        'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                        'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                        'message' => 'Could not create payment',
                        'payment' => $payment,
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
        
    }//end save payment
    
    public function delete_check_list_item($check_list_random_id, $check_list_item_random_id){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            Log::debug('check_list_random_id: '.$check_list_random_id);
            Log::debug('check_list_item_random_id: '.$check_list_item_random_id);
            
            $delete_result = false;
            
            if($check_list_item_random_id && $check_list_item_random_id != 'none'){
                $delete_result = CheckListItem::where('user_id', Auth::id())->where('random_id', $check_list_item_random_id)->delete();
            }else if($check_list_random_id && $check_list_item_random_id == 'none'){
                $check_list_to_delete_items = CheckList::where('random_id', $check_list_random_id)->get()->first();
                $delete_result = CheckListItem::where('user_id', Auth::id())->where('check_list_id', $check_list_to_delete_items->id)->delete();
            }
            
            Log::debug('delete_result: '.$delete_result);
            
            $check_list_data = null;
            
            if($delete_result){
                
                $check_list = CheckList::where('random_id', $check_list_random_id)->get()->first();
                $check_list_data = CheckListItem::where('user_id', Auth::id())->where('check_list_id', $check_list->id)->orderBy('order', 'asc')->get();
                
                if($check_list_data && sizeof($check_list_data) > 0){
                    $check_list_data = $this->reorder_check_list_items($check_list_data);
                    
                    foreach ($check_list_data as $check_list_item) {
                        $check_list_item->save();
                    }
                }
                
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Deleted check list item(s)',
                    'check_list_random_id' => $check_list_random_id,
                    'check_list_item_random_id' => $check_list_item_random_id,
                    'check_list_data' => $check_list_data
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNPROCESSABLE_ENTITY],
                    'message' => 'Could not delete check list item(s)',
                    'check_list_random_id' => $check_list_random_id,
                    'check_list_item_random_id' => $check_list_item_random_id,
                    'check_list_data' => $check_list_data
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
    }//end delete payment
    
    public function save_paypal_email(Request $request){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            $validator = Validator::make($request->all(), [
                'paypal_email' => 'required|email|max:191',
                'paypal_password' => 'required',
            ]);
            
            if($validator->fails()){
                $json_data = [
                    'status'=>Response::HTTP_FORM_VALIDATION_FAILED,
                    'status_message'=> Response::$statusMessages[Response::HTTP_FORM_VALIDATION_FAILED],
                    'validation_errors'=>$validator->messages(),
                ];
            }else{
                
                $user = User::where('id', Auth::id())->firstOrFail();
                
                if($user){
                    
                    //TODO: save to paypal
                    $saved_paypal = true;
                
                    if($saved_paypal){
                        
                        $user->paypal_email = trim($request->paypal_email);
                        $user->update();
                        
                        $json_data = [
                            'status'=>Response::HTTP_OK,
                            'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                            'message' => 'Saved Paypal Successful!',
                        ];
                        
                    }else{
                        $json_data = [
                            'status'=>Response::HTTP_NOT_FOUND,
                            'status_message'=> Response::$statusMessages[Response::HTTP_NOT_FOUND],
                            'message' => 'Could not save paypal',
                        ];
                    }
                }else{
                    $json_data = [
                        'status'=>Response::HTTP_NOT_FOUND,
                        'status_message'=> Response::$statusMessages[Response::HTTP_NOT_FOUND],
                        'message' => 'Could not find user',
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
        
    }//end save
}
