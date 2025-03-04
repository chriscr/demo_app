<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Response;
use App\Libraries\EmailTemplate;
use App\Libraries\GlobalData;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;

class MessagingController extends Controller{
    
    public function contact(Request $request){
        $validator = Validator::make($request->all(), [
            'firstName' => 'required|max:191',
            'lastName' => 'required|max:191',
            'email' => 'required|email|max:191',
            //'phone' => 'required|regex:/^([0-9\s\-\+\(\)]*)$/|min:10',
            'message' => 'required',
        ]);
        
        if($validator->fails()){
            return response()->json([
                'status'=>Response::HTTP_FORM_VALIDATION_FAILED,
                'status_message'=> Response::$statusMessages[Response::HTTP_FORM_VALIDATION_FAILED],
                'validation_errors'=>$validator->messages(),
            ]);
        }else{
            
            $email_message = null;
            
            //email if on the server
            if(url('') != 'http://localhost' && url('') != 'http://localhost:8000'){
                
                //TODO: send message by email
                $emailTemplate = new EmailTemplate;
                
                $email_body = '<tr><td align="left" colspan="3" style="text-align:justify;">'.
                    'Thank you for contacting  '.GlobalData::APP_NAME.'. We received your information below and we will respond shortly'.
                    '<tr><td align="center" colspan="3"><br></td></tr>'.
                    '<tr><td align="left" valign="top">Name:</td><td align="left" valign="top" colspan="2">'.trim($request->firstName).' '.trim($request->lastName).'</td></tr>'.
                    '<tr><td align="left" valign="top">Email:</td><td align="left" valign="top" colspan="2">'.trim($request->email).'</td></tr>'.
                    '<tr><td align="left" valign="top">Phone:</td><td align="left" valign="top" colspan="2">'.trim($request->phone).'</td></tr>'.
                    '<tr><td align="left" valign="top">Message:</td><td align="left" valign="top" colspan="2"></tr>'.
                    '<tr><td align="left" valign="top" colspan="3" style="text-align:justify;">'.trim($request->message).'</td></tr>';
                
                $email_message = $emailTemplate->generate($email_body);
                
                //email user
                $data = array(
                    'to' => trim($request->email),
                    'from' => GlobalData::INFO_EMAIL,
                    'subject' => GlobalData::APP_NAME.' Contact Message',
                    'email_message' => $email_message,
                );
                Mail::send([], $data, function ($message) use ($data) {
                    $message->to($data['to']);
                    $message->from($data['from']);
                    $message->subject($data['subject']);
                    $message->setBody($data['email_message'], 'text/html');
                });
                    
                    //email admin
                    $data = array(
                        'to' => GlobalData::ADMIN_EMAIL,
                        'from' => GlobalData::INFO_EMAIL,
                        'subject' => GlobalData::APP_NAME.' Contact Message',
                        'email_message' => $email_message,
                    );
                    Mail::send([], $data, function ($message) use ($data) {
                        $message->to($data['to']);
                        $message->from($data['from']);
                        $message->subject($data['subject']);
                        $message->setBody($data['email_message'], 'text/html');
                    });
            }else{
                $email_message = trim($request->message);
            }
            
            return response()->json([
                'status'=>Response::HTTP_OK,
                'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                'auth_users_name'=>trim($request->firstName).' '.trim($request->lastName),
                'auth_email'=>trim($request->email),
                'email_message'=>$email_message,
                'message'=>'Contact Successful! We will respond shortly.',
            ]);
        }
    }//end contact
}
