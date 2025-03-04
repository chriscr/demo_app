<?php

namespace App\Libraries;

use stdClass;

class AlphaVantageAPI{

	public $function;
	public $interval;
	public $symbol;

	private $int_to_month_map = array(
		0	=> 'Jan',
		1	=> 'Feb',
		2	=> 'Mar',
		3	=> 'Apr',
		4	=> 'May',
		5	=> 'Jun',
		6	=> 'Jul',
		7	=> 'Aug',
		8	=> 'Sep',
		9	=> 'Oct',
		10	=> 'Nov',
		11	=> 'Dec',
	);

	public $month_to_int_map = array(
		'Jan' => 1,
		'Feb' => 2,
		'Mar' => 3,
		'Apr' => 4,
		'May' => 5,
		'Jun' => 6,
		'Jul' => 7,
		'Aug' => 8,
		'Sep' => 9,
		'Oct' => 10,
		'Nov' => 11,
		'Dec' => 12
	);

	public function __construct($function= '', $interval= '', $symbol = '') {
		if($function)
			$this->_setParam('function', $function);
			
		if($interval)
			$this->_setParam('interval', $interval);
		
		if($symbol)
			$this->_setParam('symbol', $symbol);

	}//end constructor

	public function getHistoricalData($function, $symbol) {
		if($function)
			$this->_setParam('function', $function);
		else
			$this->_setParam('function', 'TIME_SERIES_DAILY');
			
		$this->_setParam('interval', null);
			
		if($symbol)
			$this->_setParam('symbol', $symbol);

		$historical_data = $this->_request_stock();
		
		$historical_data = json_decode(json_encode($historical_data), true);
		
		$return_data = null;
		if(isset($historical_data["Time Series (Daily)"])
		&& is_array($historical_data["Time Series (Daily)"])
		&& sizeof($historical_data["Time Series (Daily)"]) > 0){
			
			$return_data = array();
			foreach ($historical_data["Time Series (Daily)"] as $key => $value) {
				$day_data = new stdClass();
				$day_data->date = $key;
				$day_data->open = (float)$value["1. open"];
				$day_data->high = (float)$value["2. high"];
				$day_data->low = (float)$value["3. low"];
				$day_data->close = (float)$value["4. close"];
				$day_data->volume = (float)$value["5. volume"];
				
				array_unshift($return_data, $day_data);
			}
		}
		
		return $return_data;
	}//end getHistoricalData
	
	public function getIntradayData($symbol, $interval){
		$this->_setParam('function', 'TIME_SERIES_INTRADAY');
		
		if($interval)
			$this->_setParam('interval', $interval);
		else
			$this->_setParam('interval', '15min');
		
		if($symbol)
			$this->_setParam('symbol', $symbol);

		$intraday_data = $this->_request_stock();

		return $intraday_data;
	}//end getIntradayData
	
	public function getQuoteData($symbol){
		$this->_setParam('function', 'GLOBAL_QUOTE');
		
		$this->_setParam('interval', null);
		
		if($symbol)
			$this->_setParam('symbol', $symbol);

		$quote_data = $this->_request_stock();
		
		/*
		$return_data = null;
		if(isset($latest_data)){
			
			$latest_data= json_decode(json_encode($latest_data), true);

			if(isset($latest_data["Global Quote"])){
				$return_data = new stdClass();
				$return_data->symbol = $symbol;
				$return_data->open = (float)$latest_data["Global Quote"]["02. open"];
				$return_data->high = (float)$latest_data["Global Quote"]["03. high"];
				$return_data->low = (float)$latest_data["Global Quote"]["04. low"];
				$return_data->price = (float)$latest_data["Global Quote"]["05. price"];
				$return_data->volume = (float)$latest_data["Global Quote"]["06. volume"];
			}
		}
		*/
		
		return $quote_data;
	}//end getQuoteData

	private function _request_stock() {

		$alpha_vantage_data = null;

		$api_url = 'https://www.alphavantage.co';
		$api_key = '&apikey=YN3NA1LG2J91KYH0';
		
		$function = 'function='.$this->function;
		
		$interval = '';
		if(isset($this->interval)){
			$interval= '&interval='.$this->interval;
		}
		
		$symbol = '&symbol='.$this->symbol;
		
		$output_size = '';
		if(isset($this->function) && $this->function == 'TIME_SERIES_DAILY'){
			$output_size = '&outputsize=compact';
		}else if(isset($this->function) && $this->function == 'TIME_SERIES_INTRADAY'){
			$output_size = '&outputsize=compact';
		}
		
		$api_request = $api_url.'/query?'.$function.$interval.$symbol.$output_size.$api_key;
		//var_dump($api_request);
		
		//api call
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, $api_request);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		
		$alpha_vantage_response = curl_exec($curl);
		$alpha_vantage_response = str_replace('//','',$alpha_vantage_response);
		$alpha_vantage_data = json_decode($alpha_vantage_response, true);
/*
		if(!isset($alpha_vantage_data)){
			$alpha_vantage_data = null;
		}
*/
		//return $alpha_vantage_data;
		return $alpha_vantage_data;
	}//end request stock

	private function _setParam($param, $val) {

		switch($param) {
			case 'function':
				$this->function= $val;
				break;
			case 'interval':
				$this->interval= $val;
				break;
			case 'symbol':
				$this->symbol = $val;
				break;
/*
			case 'start_date':
				$this->start_date = $val;
				break;
			case 'end_date':
				$this->end_date = $val;
				break;
*/
		}
	}//end set parameters

}
?>
