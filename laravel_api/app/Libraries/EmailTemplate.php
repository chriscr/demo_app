<?php

namespace App\Libraries;

class EmailTemplate{
    
    function generate($email_body){
        $email_top = $this->template_top();
        $email_bottom = $this->template_bottom();
        
        return $email_top.$email_body.$email_bottom;
    }//end generate
    
    private function template_top(){
        //new user
        $template_top =
        '<!DOCTYPE html>'.
		'<html>'.
		'<head>'.
		    '<title>Video App</title>'.
		'</head>'.
		'<body>'.
        '<table style="font-family:Source Sans Pro,Arial,Helvetica;font-size:16px;font-weight:400;padding:10px;border:1px solid #ccc;background:#fafafa;min-width:380px;width:auto;max-width:800px;">'.
        '<tr>'.
        '<td align="left" valign="top" width="55"><img src="'.url('').'/public/images/logo.png" width="50">&nbsp;</td>'.
        '<td align="left" valign="top">'.
        '<div style="font-size:20px;font-weight:700;color:#344a61;;width:auto;">'.GlobalData::APP_NAME.'</div>'.
        '<div style="font-size:15px;font-weight:500;color:#344a61;letter-spacing:1px;">'.GlobalData::APP_SLOGAN.'</div>'.
        '</td>'.
        '<tr><td align="center" colspan="2"><br></td></tr>';
        
        return $template_top;
    }//end template top
    
    private function template_bottom(){
        //new user
        $template_bottom =
        '<tr><td align="center" colspan="2"><br></td></tr>'.
        '<tr><td align="left" valign="top" colspan="2">Thank you,<br>'.GlobalData::APP_NAME.' TEAM'.
        '</td></tr>'.
        '<tr><td align="right"colspan="2">'.
        '<a href="'.GlobalData::APP_DOMAIN.'/help" style="letter-spacing:1px;font-size:12px;font-weight:600;color:white;background:#c82d1f;padding:10px;text-decoration:none;width:70px;border-radius:5px;">Help</a></td>'.
        '</tr>'.
        '</table>'.
        '</body>'.
		'</html>';
        
        return $template_bottom;
    }//end template bottom
}
?>