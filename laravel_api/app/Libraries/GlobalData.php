<?php
namespace App\Libraries;

class GlobalData{
    
    const APP_DOMAIN = 'http://demo-app.doubleintegration.com';
    const APP_NAME = 'DEMO APP';
    const APP_SLOGAN = 'By C. Romero';
    const INFO_EMAIL = 'info@doubleintegration.com';
    const ADMIN_EMAIL = 'chriscr@gmail.com';
    
    public static function convert_country_to_abbreviation($country_name) {
        switch ($country_name) {
            case "United States of America":
                return "USA";
                break;
            case "US":
                return "USA";
                break;
            default:
                return $country_name;
        }
    }//end convert country to abbreviation
    
    public static function convert_state_to_abbreviation($state_name) {
        switch ($state_name) {
            case "Alabama":
                return "AL";
                break;
            case "Alaska":
                return "AK";
                break;
            case "Arizona":
                return "AZ";
                break;
            case "Arkansas":
                return "AR";
                break;
            case "California":
                return "CA";
                break;
            case "Colorado":
                return "CO";
                break;
            case "Connecticut":
                return "CT";
                break;
            case "Delaware":
                return "DE";
                break;
            case "Florida":
                return "FL";
                break;
            case "Georgia":
                return "GA";
                break;
            case "Hawaii":
                return "HI";
                break;
            case "Idaho":
                return "ID";
                break;
            case "Illinois":
                return "IL";
                break;
            case "Indiana":
                return "IN";
                break;
            case "Iowa":
                return "IA";
                break;
            case "Kansas":
                return "KS";
                break;
            case "Kentucky":
                return "KY";
                break;
            case "Louisana":
                return "LA";
                break;
            case "Maine":
                return "ME";
                break;
            case "Maryland":
                return "MD";
                break;
            case "Massachusetts":
                return "MA";
                break;
            case "Michigan":
                return "MI";
                break;
            case "Minnesota":
                return "MN";
                break;
            case "Mississippi":
                return "MS";
                break;
            case "Missouri":
                return "MO";
                break;
            case "Montana":
                return "MT";
                break;
            case "Nebraska":
                return "NE";
                break;
            case "Nevada":
                return "NV";
                break;
            case "New Hampshire":
                return "NH";
                break;
            case "New Jersey":
                return "NJ";
                break;
            case "New Mexico":
                return "NM";
                break;
            case "New York":
                return "NY";
                break;
            case "North Carolina":
                return "NC";
                break;
            case "North Dakota":
                return "ND";
                break;
            case "Ohio":
                return "OH";
                break;
            case "Oklahoma":
                return "OK";
                break;
            case "Oregon":
                return "OR";
                break;
            case "Pennsylvania":
                return "PA";
                break;
            case "Rhode Island":
                return "RI";
                break;
            case "South Carolina":
                return "SC";
                break;
            case "South Dakota":
                return "SD";
                break;
            case "Tennessee":
                return "TN";
                break;
            case "Texas":
                return "TX";
                break;
            case "Utah":
                return "UT";
                break;
            case "Vermont":
                return "VT";
                break;
            case "Virginia":
                return "VA";
                break;
            case "Washington":
                return "WA";
                break;
            case "Washington D.C.":
                return "DC";
                break;
            case "West Virginia":
                return "WV";
                break;
            case "Wisconsin":
                return "WI";
                break;
            case "Wyoming":
                return "WY";
                break;
            case "Alberta":
                return "AB";
                break;
            case "British Columbia":
                return "BC";
                break;
            case "Manitoba":
                return "MB";
                break;
            case "New Brunswick":
                return "NB";
                break;
            case "Newfoundland & Labrador":
                return "NL";
                break;
            case "Northwest Territories":
                return "NT";
                break;
            case "Nova Scotia":
                return "NS";
                break;
            case "Nunavut":
                return "NU";
                break;
            case "Ontario":
                return "ON";
                break;
            case "Prince Edward Island":
                return "PE";
                break;
            case "Quebec":
                return "QC";
                break;
            case "Saskatchewan":
                return "SK";
                break;
            case "Yukon Territory":
                return "YT";
                break;
            default:
                return $state_name;
                
        }//end convert state to abbreviation
    }
}
?>