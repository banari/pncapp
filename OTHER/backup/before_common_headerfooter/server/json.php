<?php
error_reporting( E_ALL );
ini_set( 'display_errors', 'On' );
require_once "class-wc-api-client.php";
$fields = 	$cbck = "";
//$productCat = "";
/*
if (isset($_GET['pcat'])){
	$productCat = $_GET['pcat'];	
}*/
if (isset($_GET['fields'])){
	$fields = $_GET['fields'];
}

if (isset($_GET["callback"])){
	$cbck = $_GET["callback"];
}

//$productCat = 'Uomo';

/*
$consumer_key = 'ck_0aac46aefbd3089ab8d3caee64666606'; // Add your own Consumer Key here
$consumer_secret = 'cs_8479dfa268c562a37fca390bc320499a'; // Add your own Consumer Secret here
$store_url = 'http://localhost:8888/wptest/'; // Add the home URL to the store you want to connect to here

*/

//zoostore
$consumer_key = 'ck_ec1ad84637c3f98a4bf4092ad7be8e4f'; // Add your own Consumer Key here
$consumer_secret = 'cs_ae3cbf3e071ee602800ef427441f1ea8'; // Add your own Consumer Secret here
$store_url = 'http://www.gate1.hu/pnc/'; // Add the home URL to the store you want to connect to here

// Initialize the class
$wc_api = new WC_API_Client( $consumer_key, $consumer_secret, $store_url );


//$result = $wc_api->get_products( $params = array( 'filter[created_at_min]' => '2014-03-10' ) );

//$result = $wc_api->get_products( $params = array( 'filter[limit]'=>-1, 'fields'=>"categories") );

//$result = $wc_api->get_products( $params = array( 'filter[limit]'=>-1, 'fields'=>"categories") );
//$result = $wc_api->get_products( $params = array( 'filter[product_cat]'=>'Donna', 'fields'=>"title,categories", 'page'=>'1') );

//'filter[limit]'=>-1,

$result = $wc_api->get_products( $params = array( 'fields'=>$fields, 'filter[limit]'=>-1));

if ($cbck){
	$result = $cbck . "(" . $result . ")";
}



print_r(  strip_tags($result));


// Get Index
//print_r( $wc_api->get_index() );

// Get all orders
//print_r( $wc_api->get_orders( array( 'status' => 'completed' ) ) );

// Get a single order by id
//print_r( $wc_api->get_order( 166 ) );

// Get orders count
//print_r( $wc_api->get_orders_count() );

// Get order notes for a specific order
//print_r( $wc_api->get_order_notes( 166 ) );

// Update order status
//print_r( $wc_api->update_order( 166, $data = array( 'status' => 'failed' ) ) );

// Get all coupons
//print_r( $wc_api->get_coupons() );

// Get coupon by id
//print_r( $wc_api->get_coupon( 173 ) );

// Get coupon by code
//print_r( $wc_api->get_coupon_by_code( 'test coupon' ) );

// Get coupons count
//print_r( $wc_api->get_coupons_count() );

// Get customers
//print_r( $wc_api->get_customers() );

// Get customer by id
//print_r( $wc_api->get_customer( 2 ) );

// Get customer count
//print_r( $wc_api->get_customers_count() );

// Get customer orders
//print_r( $wc_api->get_customer_orders( 2 ) );

// Get all products
//print_r( strip_tags($wc_api->get_products()) );

// Get a single product by id
//print_r( $wc_api->get_product( 167 ) );

// Get products count
//print_r( $wc_api->get_products_count() );

// Get product reviews
//print_r( $wc_api->get_product_reviews( 167 ) );

// Get reports
//print_r( $wc_api->get_reports() );

// Get sales report
//print_r( $wc_api->get_sales_report() );

// Get top sellers report
// print_r( $wc_api->get_top_sellers_report() );


