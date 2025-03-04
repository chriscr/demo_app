<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Response;
use App\Models\User;
use App\Models\UserProfile;
use App\Libraries\EmailTemplate;
use App\Mail\RegisterMail;
use App\Mail\ForgotPasswordMail;
use App\Libraries\RandomGenerator;
use App\Libraries\GlobalData;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller{
    
    public function register(Request $request){
        
        $json_data = [];
        
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|max:191',
            'last_name' => 'required|max:191',
            'email' => 'required|email|max:191|unique:users,email',
            'password' => 'min:8',
            //'password' => 'min:8|required_with:confirmPassword|same:confirmPassword',
            //'confirmPassword' => 'min:8',
            'terms' => 'required|boolean',
            'role' => 'required|max:191',
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
            $suffix = date("mdY").'_usr_'.substr(strtolower(trim($request->first_name)), 0, 1).substr(strtolower(trim($request->last_name)), 0, 1);
            $random_id = $randomGenerator->generate(10,$prefix,$suffix,'_');
            
            $user = User::create([
                'first_name'=>trim($request->first_name),
                'last_name'=>trim($request->last_name),
                'email'=>trim($request->email),
                'password'=>Hash::make(trim($request->password)),
                'terms'=>trim($request->terms),
                'role'=>trim($request->role),
                'random_id'=>$random_id,
            ]);
            
            //token = email + _token
            $token = $user->createToken($user->email.'_token')->plainTextToken;

            //create the user profile
            $user_profile = UserProfile::create([
                'user_id' => $user->id,
                'random_id' => $random_id,
            ]);
            
            //email if on the server
            if(url('') != 'http://localhost' && url('') != 'http://localhost:8000'){

                $asterisk = '';
                for($i=1; $i <= strlen(trim($request->password)); $i++){
                    $asterisk .= '*';
                }

                //TODO: send message by email
                $emailTemplate = new EmailTemplate;
                
                $activation_button = '<a href="'.GlobalData::APP_DOMAIN.'/activate_account/'.$random_id.'" '.
                'style="letter-spacing:1px;font-size:12px;font-weight:600;color:white;background:#c82d1f;padding:15px;text-decoration:none;width:150px;border-radius:5px;">ACTIVATE ACCOUNT</a>';
                
                $email_body = '<tr><td align="left" colspan="3" style="text-align:justify;">'.
                'Thank you for registering with '.GlobalData::APP_NAME.'. Please click the button below to activate your account</td></tr>'.
                '<tr><td align="center" colspan="3"><br></td></tr>'.
                '<tr><td align="left" valign="top">Name:</td><td align="left" valign="top" colspan="2">'.trim($request->first_name).' '.trim($request->last_name).'</td></tr>'.
                '<tr><td align="left" valign="top">Email:</td><td align="left" valign="top" colspan="2">'.trim($request->email).'</td></tr>'.
                '<tr><td align="left" valign="top">Password:</td><td align="left" valign="top" colspan="2">'.$asterisk.'</td></tr>'.
                '<tr><td align="left" valign="top">Role:</td><td align="left" valign="top" colspan="2">Member</td></tr>'.
                '<tr><td align="left" valign="top" colspan="3"><br></td></tr>'.
                '<tr><td align="left" valign="top" colspan="3"><br></td></tr>'.
                '<tr><td align="center" valign="top" colspan="3" style="text-align:center;">'.$activation_button.'</td></tr>'.
                '<tr><td align="left" valign="top" colspan="3"><br></td></tr>';

                $email_message = $emailTemplate->generate($email_body);

                $to_email = $user->email;
                $to_admin_email = GlobalData::ADMIN_EMAIL;
                $from_email = GlobalData::INFO_EMAIL;
                $subject = GlobalData::APP_NAME.' - New Account';

                Log::debug('===================Sending Mail Env PARAMS===================');
                Log::debug('MAIL_HOST: '.env('MAIL_HOST'));
                Log::debug('MAIL_PORT: '.env('MAIL_PORT'));
                Log::debug('MAIL_ENCRYPTION: '.env('MAIL_ENCRYPTION'));
                Log::debug('MAIL_FROM_ADDRESS: '.env('MAIL_FROM_ADDRESS'));
                Log::debug('===================Sending Mail Method #1===================');
                Log::debug('Using Mail send method');
                //email user
                try {
                    Mail::send([], [], function ($message) use ($to_email, $from_email, $subject, $email_message) {
                        $message->to($to_email)
                        ->from($from_email, GlobalData::APP_NAME)
                        ->subject($subject)
                        ->html($email_message);
                    });

                    Log::debug('Email sent successfully to: '.$to_email.' from: '.$from_email);
                } catch (\Exception $e) {
                    Log::debug('Email Exception: '.$e->getMessage());
                    Log::debug('Tried Sending To: '.$to_email);
                }

                //email admin
                try {
                    Mail::send([], [], function ($message) use ($to_admin_email, $from_email, $subject, $email_message) {
                        $message->to($to_admin_email)
                        ->from($from_email, GlobalData::APP_NAME)
                        ->subject($subject)
                        ->html($email_message);
                    });

                    Log::debug('Email sent successfully to: '.$to_admin_email.' from: '.$from_email);
                    Log::debug('    Registered User: '.$to_email);
                } catch (\Exception $e) {
                    Log::debug('Email Exception: '.$e->getMessage());
                    Log::debug('Tried Sending To: '.$to_admin_email);
                    Log::debug('    Registered User: '.$to_email);
                }
                
            }else{
                Log::info('Register: on dev env');
            }
            
            $json_data = [
                'status'=>Response::HTTP_OK,
                'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                'auth_first_name'=>trim($request->first_name),
                'auth_last_name'=>trim($request->last_name),
                'auth_email'=>$user->email,
                'auth_token'=>$token,
                'auth_role'=>$user->role,
                'message'=>'Registration Successful! An account activation link has been sent to '.$user->email.'.',
            ];
        }
        
        return response()->json($json_data);
        
    }//end register
    
    public function activate_account($user_random_id){
        
        $json_data = [];
        
        if($user_random_id){
            $user = User::where('random_id', $user_random_id)->first();
        }
        
        if($user){
            
            $user->status = 'active';
            $user->email_verified_at = date('Y-m-d H:i:s');
            $user->update();
            
            Auth::login($user);
            
            if (Auth::check()) {
                
                //token name = email + _token
                $token = $user->createToken($user->email.'_token')->plainTextToken;
                
                // The user is logged in...
                $auth_id = Auth::id();//not needed, just want to see it
                
                //The session Id
                $session_id = Session::getId();//not needed, just want to see it
                
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'auth_first_name'=>$user->first_name,
                    'auth_last_name'=>$user->last_name,
                    'auth_email'=>$user->email,
                    'auth_token'=>$token,
                    'auth_role'=>$user->role,
                    'auth_paypal_email'=>$user->paypal_email,
                    'auth_id'=>$auth_id, //user DB Id
                    'session_id'=>$session_id,
                    'message'=>'Account Activation Successful!',
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNAUTHORIZED,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNAUTHORIZED],
                    'message'=>'Could not login into account automatically after activation.',
                ];
            }
        }else{
            $json_data = [
                'status'=>Response::HTTP_NOT_FOUND,
                'status_message'=> Response::$statusMessages[Response::HTTP_NOT_FOUND],
                'message'=>'User does not exists with that ID.',
            ];
        }
        
        return response()->json($json_data);
        
    }//end activate_account
    
    public function login(Request $request){
        
        $json_data = [];
        
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:191',
            'password' => 'required|min:8',
            /*'device_name' => 'required',*/
        ]);
        
        if($validator->fails()){
            $json_data = [
                'status'=>Response::HTTP_FORM_VALIDATION_FAILED,
                'status_message'=> Response::$statusMessages[Response::HTTP_FORM_VALIDATION_FAILED],
                'validation_errors'=>$validator->messages(),
            ];
        }else{
            
            $credentials = $request->only('email', 'password');
            $credentials['status'] = 'active';
            
            if (Auth::attempt($credentials)) {
                $user = User::where('email', $request->email)->first();
                //token name = email + _token
                $token = $user->createToken($user->email.'_token')->plainTextToken;
                
                // The user is logged in...
                $auth_id = Auth::id();//not needed, just want to see it
                
                //The session Id
                $session_id = Session::getId();//not needed, just want to see it
                
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'auth_first_name'=>$user->first_name,
                    'auth_last_name'=>$user->last_name,
                    'auth_email'=>$user->email,
                    'auth_token'=>$token,
                    'auth_role'=>$user->role,
                    'auth_paypal_email'=>$user->paypal_email,
                    'auth_id'=>$auth_id, //user DB Id
                    'session_id'=>$session_id,
                    'message'=>'Login Successful!',
                ];
                
                //email if on the server
                if(url('') != 'http://localhost' && url('') != 'http://localhost:8000'){

                    //TODO: send message by email
                    $emailTemplate = new EmailTemplate;
                    
                    $email_body = '<tr><td align="left" colspan="3" style="text-align:justify;">'.
                    $user->email.'<br/>logged in on '.date('m/d/y H:i:s').'</td></tr>'.
                    '<tr><td align="left" valign="top" colspan="3"><br></td></tr>';
                    
                    $email_message = $emailTemplate->generate($email_body);

                    $to_admin_email = GlobalData::ADMIN_EMAIL;
                    $from_email = GlobalData::INFO_EMAIL;
                    $subject = GlobalData::APP_NAME.' - Login';
                    
                    try {
                        Mail::send([], [], function ($message) use ($to_admin_email, $from_email, $subject, $email_message) {
                            $message->to($to_admin_email)
                            ->from($from_email, GlobalData::APP_NAME)
                            ->subject($subject)
                            ->html($email_message);
                        });

                        Log::debug('Email sent successfully to: '.$to_admin_email.' from: '.$from_email);
                    } catch (\Exception $e) {
                        Log::debug('Email Exception: '.$e->getMessage());
                        Log::debug('Tried Sending To: '.$to_admin_email);
                    }
                }
                
            }else{
                $json_data = [
                    'status'=>Response::HTTP_UNAUTHORIZED,
                    'status_message'=> Response::$statusMessages[Response::HTTP_UNAUTHORIZED],
                    'message'=>'Invalid Credentials or the account has not been activatated.',
                ];
            }
        }
        
        return response()->json($json_data);
        
    }//end login
    
    public function logout(Request $request){
        
        
        Log::debug('Auth::id(): '.Auth::id());
        Log::debug('Auth::check(): '.Auth::check());
        
        $json_data = [];
        
        if (Auth::check()) {
        
            // The user is logged in...
            $auth_id = Auth::id();//not needed, just want to see it
            
            //The session Id
            $session_id = Session::getId();//not needed, just want to see it
            
            Session::flush();
            //Auth::logout();
            Auth::guard('web')->logout();

            $json_data = [
                'status'=>Response::HTTP_OK,
                'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                'auth_id'=>$auth_id, //user DB Id
                'session_id'=>$session_id,
                'message'=>'Logged Out Successful!',
            ];

        }else{
            $json_data = [
                'status'=>Response::HTTP_UNAUTHORIZED,
                'status_message'=> Response::$statusMessages[Response::HTTP_UNAUTHORIZED],
                'message'=>'Invalid Credentials.',
            ];
        }
        
        return response()->json($json_data);
        
    }//end logout
    
    public function save_password(Request $request){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            $validator = Validator::make($request->all(), [
                'password' => 'min:8',
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
                    
                    $user->password = Hash::make(trim($request->password));
                    $user->update();
                    
                    if(url('') != 'http://localhost' && url('') != 'http://localhost:8000'){
/*
                        $emailTemplate = new EmailTemplate;
                        
                        $email_body = '<tr><td align="left" colspan="3" style="text-align:justify;">'.
                            'Your '.GlobalData::APP_NAME.' password has been updated</td></tr>'.
                            '<tr><td align="left" valign="top" colspan="3"><br></td></tr>';
                        
                        $email_message = $emailTemplate->generate($email_body);
                        
                        //email user
                        $data = array(
                            'to' => trim($user->email),
                            'from' => GlobalData::INFO_EMAIL,
                            'subject' => 'New '.GlobalData::APP_NAME.' Account',
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
                            'subject' => 'New '.GlobalData::APP_NAME.' Account',
                            'email_message' => $email_message,
                        );
                        Mail::send([], $data, function ($message) use ($data) {
                            $message->to($data['to']);
                            $message->from($data['from']);
                            $message->subject($data['subject']);
                            $message->setBody($data['email_message'], 'text/html');
                        });
*/
                    }else{
                        Log::info('Save Password: on dev env');
                    }
                    
                    $json_data = [
                        'status'=>Response::HTTP_OK,
                        'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                        'message' => 'Changed Password Successful!',
                    ];
                    
                }else{
                    $json_data = [
                        'status'=>Response::HTTP_NOT_FOUND,
                        'status_message'=> Response::$statusMessages[Response::HTTP_NOT_FOUND],
                        'message' => 'Could not find the user to change the password',
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
        
    }//end save password
    
    public function forgot_password(Request $request){
        
        $json_data = [];
        
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:191',
            /*'device_name' => 'required',*/
        ]);
        
        if($validator->fails()){
            $json_data = [
                'status'=>Response::HTTP_FORM_VALIDATION_FAILED,
                'status_message'=> Response::$statusMessages[Response::HTTP_FORM_VALIDATION_FAILED],
                'validation_errors'=>$validator->messages(),
            ];
        }else{
            
            $user = User::where('email', $request->email)->first();
            
            if ($user) {
                
                //email if on the server
                if(url('') != 'http://localhost' && url('') != 'http://localhost:8000'){
/*
                    $emailTemplate = new EmailTemplate;
                    
                    $reset_password_button = '<a href="'.GlobalData::APP_DOMAIN.'/reset_password/'.$user->random_id.'/'.$user->email.'" '.
                        ' style="letter-spacing:1px;font-size:14px;font-weight:600;color:white;background:#0073E6;padding:15px 30px;text-decoration:none;width:160px;border-radius:5px;">RESET PASSWORD</a>';
                    
                    $email_body = '<tr><td align="left" colspan="3" style="text-align:justify;">'.
                        'Please click the button below to reset your '.GlobalData::APP_NAME.' password</td></tr>'.
                        '<tr><td align="center" colspan="3"><br></td></tr>'.
                        '<tr><td align="left" valign="top">Name:</td><td align="left" valign="top" colspan="2">'.$user->first_name.' '.$user->last_name.'</td></tr>'.
                        '<tr><td align="left" valign="top">Email:</td><td align="left" valign="top" colspan="2">'.$user->email.'</td></tr>'.
                        '<tr><td align="left" valign="top">Password:</td><td align="left" valign="top" colspan="2">********</td></tr>'.
                        '<tr><td align="left" valign="top">Role:</td><td align="left" valign="top" colspan="2">Member</td></tr>'.
                        '<tr><td align="left" valign="top" colspan="3"><br></td></tr>'.
                        '<tr><td align="left" valign="top" colspan="3"><br></td></tr>'.
                        '<tr><td align="center" valign="top" colspan="3" style="text-align:center;">'.$reset_password_button.'</td></tr>'.
                        '<tr><td align="left" valign="top" colspan="3"><br></td></tr>';
                    
                    $email_message = $emailTemplate->generate($email_body);
                    
                    //email user
                    $data = array(
                        'to' => trim($request->email),
                        'from' => GlobalData::INFO_EMAIL,
                        'subject' => 'Reset '.GlobalData::APP_NAME.' Password',
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
                        'subject' => 'Reset '.GlobalData::APP_NAME.' Password',
                        'email_message' => $email_message,
                    );
                    Mail::send([], $data, function ($message) use ($data) {
                        $message->to($data['to']);
                        $message->from($data['from']);
                        $message->subject($data['subject']);
                        $message->setBody($data['email_message'], 'text/html');
                    });
*/
                    //email user
                    try {
                        Mail::to($user->email)->send(new ForgotPasswordMail($user));
                        Log::debug('-----------------Mail Success-----------------');
                        Log::debug('Sent Mail To: '.$user->email);
                        Log::debug('------------------------------------------------');
                    } catch (\Exception $e) {
                        // Log or handle the exception
                        Log::debug('-----------------Mail Exception-----------------');
                        Log::debug('Mail Exception: '.$e->getMessage());
                        Log::debug('Tried Sending To: '.$user->email);
                        Log::debug('------------------------------------------------');
                    }
                    //email admin
                    try {
                        Mail::to(GlobalData::ADMIN_EMAIL)->send(new ForgotPasswordMail($user));
                        Log::debug('-----------------Mail Success-----------------');
                        Log::debug('Sent Mail To: '.GlobalData::ADMIN_EMAIL);
                        Log::debug('Forgot Password User: '.$user->email);
                        Log::debug('------------------------------------------------');
                    } catch (\Exception $e) {
                        // Log or handle the exception
                        Log::debug('-----------------Mail Exception-----------------');
                        Log::debug('Mail Exception: '.$e->getMessage());
                        Log::debug('Tried Sending To: '.GlobalData::ADMIN_EMAIL);
                        Log::debug('Forgot Password User: '.$user->email);
                        Log::debug('------------------------------------------------');
                    }
                }else{
                    Log::info('Forgot Password: on dev env');
                }
                
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'auth_users_name'=>$user->name,
                    'auth_email'=>$user->email,
                    'auth_role'=>$user->role,
                    'message'=>'An email has been sent to '.$user->email.' to reset the password.',
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_NOT_FOUND,
                    'status_message'=> Response::$statusMessages[Response::HTTP_NOT_FOUND],
                    'message'=>'Email does not exists.',
                ];
            }
        }
        
        return response()->json($json_data);
        
    }//end forgot password
    
    public function reset_password(Request $request){
        
        $json_data = [];
        
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:191',
            'password' => 'min:8',
            'random_id' => 'required|max:191',
        ]);
        
        if($validator->fails()){
            $json_data = [
                'status'=>Response::HTTP_FORM_VALIDATION_FAILED,
                'status_message'=> Response::$statusMessages[Response::HTTP_FORM_VALIDATION_FAILED],
                'validation_errors'=>$validator->messages(),
            ];
        }else{
            
            $user = User::where('email', $request->email)->where('random_id', $request->random_id)->first();
            
            if($user){
                
                $user->password = Hash::make(trim($request->password));
                $user->update();
                
                $json_data = [
                    'status'=>Response::HTTP_OK,
                    'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                    'message' => 'Reset Password Successful!',
                ];
            }else{
                $json_data = [
                    'status'=>Response::HTTP_NOT_FOUND,
                    'status_message'=> Response::$statusMessages[Response::HTTP_NOT_FOUND],
                    'message'=>'User does not exists with that ID or email.',
                ];
            }
        }
        
        return response()->json($json_data);
        
    }//end reset password
    
    public function save_settings(Request $request){
        
        $json_data = [];
        
        if (Auth::check()) {
            
            $validator = Validator::make($request->all(), [
                'api' => 'required',
                'setting2' => 'required',
                'setting3' => 'required',
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
            
                    $user->api = trim($request->api);
                    $user->update();
                    
                    $json_data = [
                        'status'=>Response::HTTP_OK,
                        'status_message'=> Response::$statusMessages[Response::HTTP_OK],
                        'message' => 'Changed Settings Successful!',
                        'api' => $request->api,
                        'setting2' => $request->setting2,
                        'setting3' => $request->setting3,
                    ];
                    
                }else{
                    $json_data = [
                        'status'=>Response::HTTP_NOT_FOUND,
                        'status_message'=> Response::$statusMessages[Response::HTTP_NOT_FOUND],
                        'message' => 'Could not find the user to change the settings',
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
        
    }//end save settings
}
