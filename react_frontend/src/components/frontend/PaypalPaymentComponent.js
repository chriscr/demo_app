import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PaypalPaymentComponent = ({ video, amount }) => {
	
	var amount1 =  0.90*amount;
	var amount2 =  0.10*amount;
	var business_email = "sb-dnvdq9108819@business.example.com";
	
  return (
	<div className="grid-x p10">
		<div className="large-6 medium-6 small-6 cell pb-10 text-left">
			<div className="font-source-sans font-large font-weight-600 txt-000">{video.title}</div>
		</div>
		<div className="large-6 medium-6 small-6 cell pb-10 text-right">
			<div className="font-source-sans font-large font-weight-600 txt-000">Donation: ${amount}</div>
		</div>
		<div className="large-12 medium-12 small-12 cell p10">
			<div className="width-auto text-center">
		    <PayPalScriptProvider
		    	options={{
					'client-id': 'AdHJSPSOhhYoDbTr7CQbHijUOZLDPafwGjjgqvvQ1_F1QzxZPgrD2-QMECh9UYyBjgQYBUi3sfMWlcGE',
				}}
			>
		      <PayPalButtons
		        style={{ layout: 'vertical' }}
		        createOrder={(data, actions) => {
		          return actions.order.create({
		            purchase_units: [
		              {
		                amount: {
		                  value: amount1,
		                  currency_code: 'USD',
		                },
		                payee: {
		                  email_address: video.paypal_email,
		                },
		                reference_id: 'video creator',
		              },
		              {
		                amount: {
		                  value: amount2,
		                  currency_code: 'USD',
		                },
		                payee: {
		                  email_address: business_email,
		                },
		                reference_id: 'video app',
		              },
		            ],
		          });
		        }}
		        onApprove={(data, actions) => {
		          return actions.order.capture().then((details) => {
		            // Handle successful split payment
		            console.log('Split payment successful:', details);
		          });
		        }}
		      />
		    </PayPalScriptProvider>
			</div>
		</div>
	</div>
  );
};

export default PaypalPaymentComponent;
