<?php

ini_set('default_charset', 'UTF-8');
require("connect.php");
require("mailbody.php");

require_once($_SERVER['DOCUMENT_ROOT'].'/ios/phpmailer/class.phpmailer.php');
//require_once('./phpmailer/class.phpmailer.php');



function test_input($data)
{
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
}
/*

test: 
fullname=Justin%20Justin&email=gb@p-drive.de&tel=234234111&country=Hungary&town=Budapest&zip=1020&street=Str&payment=Direct%20Bank%20Transfer&total=52.269997&prods[]=Libro%20%22Non%20mollare%20mai!%22%2315.90%232733%231%23&prods[]=Cappellino%2314.90%232737%232%23Camouflage&

*/

/**
POST  -- Live site
*/


if (isset($_POST["total"])) {
	$date = date_create();

	$fullname = test_input($_POST["fullname"]);
	$email = test_input($_POST["email"]);
	$tel = test_input($_POST["tel"]);
	$country = test_input($_POST["country"]);
	$town = test_input($_POST["town"]);
	$zip = test_input($_POST["zip"]);
	$street = test_input($_POST["street"]);
	$payment = test_input($_POST["payment"]);
	$prods = $_POST["prods"];
	$total = round($_POST["total"], 2);


/**
GET  -- Test site
*/
/*
if (isset($_GET["total"])) {
	$date = date_create();

	$fullname = test_input($_GET["fullname"]);
	$email = test_input($_GET["email"]);
	$tel = test_input($_GET["tel"]);
	$country = test_input($_GET["country"]);
	$town = test_input($_GET["town"]);
	$zip = test_input($_GET["zip"]);
	$street = test_input($_GET["street"]);
	$payment = test_input($_GET["payment"]);
	$prods = $_GET["prods"];
	$total = round($_GET["total"], 2);
*/


//Start


	$subtotal = 0;
	$time = date_format($date, 'Y-m-d H:i:s');

	$toTheShop = "<p>Hai ricevuto un ordine da Stefano Cipolla. L'ordine è il seguente:</p>";

	$toTheUser = "<p>Il suo ordine è stato ricevuto ed è in elaborazione. Il dettaglio
dell'ordine è mostrato di seguito perché possa consultarlo:</p>";


if ($payment != "PayPal") {
	$toTheUser .= '<p>Effettua il pagamento tramite bonifico bancario. Per favore usa
l’ID dell’ordine come causale. Il tuo ordine non verrà spedito
finché i fondi non risulteranno trasferiti nel nostro conto
corrente.</p>
<h2 style="color:#505050; display:block; font-family:Arial;
font-size:30px; font-weight:bold; margin-top:10px; margin-right:0;
margin-bottom:10px; margin-left:0; text-align:left;
line-height:150%">I nostri riferimenti bancari</h2><ul
class="order_details bacs_details">
<h3 style="color:#505050;
display:block; font-family:Arial; font-size:26px; font-weight:bold;
margin-top:10px; margin-right:0; margin-bottom:10px; margin-left:0;
text-align:left; line-height:150%">Ecutech Germany Kft. - RAIFFEISEN
BANK ZRT.</h3>
<li class="account_number">Numero account:<strong>12011021-01417691-00200001</strong></li>
<li class="iban">IBAN: <strong>HU47120110210141769100200001</strong></li>
<li class="bic">BIC: <strong>UBRTHUHB</strong></li></ul>';
}





	//echo "name: $fullname,  tel: $tel,   $total,   country: $country,  payment: $payment";

	//insert order
	$query = "INSERT INTO checkout VALUES ('', '$fullname', '$email', '$tel', '$country', '$town', '$zip', '$street', '$payment','$total', '$time')";
	mysqli_query($MySqliLink, $query) or die(mysqli_error("error"));


	//insert ordered products

	//echo "username: $username, time: $time, total: $total  <br>";
	//echo "prod: $prods[0]";

	//print_r($prods);

	//Order Meta: id, orderid, title, qty, price, attributes
	$insertString = "";
	$attributes = "";

	$currentOrderID = mysqli_insert_id($MySqliLink);
	//echo "<br> CURRENTID: $currentOrderID";



	$productTable = '<h2 style="color:#505050; display:block; font-family:Arial;
font-size:30px; font-weight:bold; margin-top:10px; margin-right:0;
margin-bottom:10px; margin-left:0; text-align:left;
line-height:150%">Ordine: #'. $currentOrderID .'</h2>
<table cellspacing="0" cellpadding="6" style="width: 100%; border: 1px solid #eee;" border="1" bordercolor="#eee">
	<thead><tr><th scope="col" style="text-align:left; border: 1px solid #eee;">Prodotto</th><th scope="col" style="text-align:left; border: 1px solid
#eee;">Quantità</th><th scope="col" style="text-align:left; border: 1px solid #eee;">Prezzo</th>
		</tr></thead><tbody>';

	$userDetails = "";



	for ($i=0; $i < count($prods); $i++) { 

		$productTable .= '<tr><td style="text-align:left;vertical-align:middle; border: 1px solid #eee; word-wrap:break-word;">';

		$pieces = explode("#", $prods[$i]);
		$pcount = count($pieces);
		//echo "pcount: $pcount";

		for ($j=0; $j < $pcount; $j++) { 
			
			switch ($j) {
				case 0:
					$title = $pieces[0];
					break;
				
				case 1:
					$price = $pieces[1];
					break;

				case 2:
					$prodID = $pieces[2];

				case 3:
					$qty = $pieces[3];
					break;

				default:
					$attributes .= $pieces[$j] . ", ";
					break;
			}

		}
		$subtotal += $price * $qty;
		$attributes = substr($attributes, 0, -2);

		$productTable .= $title . '<br><small>' . $attributes . '</small></td><td style="text-align:left; vertical-align:middle; border: 1px solid
#eee;">' . $qty . '</td><td style="text-align:left; vertical-align:middle; border: 1px solid #eee;"><span class="amount">' . $price . '</span></td>';

		$insertString .= "('' , '$currentOrderID', '$prodID', '$title', '$qty', '$price', '$attributes' ),";
		$attributes = "";

		$productTable .= '</tr>';
	}


	$productTable .= '</tbody><tfoot><tr><th scope="row" colspan="2" style="text-align:left; border: 1px solid #eee; border-top-width:
4px;">Subtotale carrello:</th><td style="text-align:left; border: 1px solid #eee; border-top-width: 4px;"><span class="amount">€' .$subtotal.'</span></td></tr>
<tr><th scope="row" colspan="2" style="text-align:left; border: 1px solid #eee; ">Spedizione:</th><td style="text-align:left; border: 1px solid #eee; "><span
class="amount">€ 2</span> <small>tramite Tariffa Unica</small></td>
					</tr>
<tr><th scope="row" colspan="2" style="text-align:left; border: 1px solid #eee; ">VAT:</th><td style="text-align:left; border: 1px solid #eee; "><span
class="amount">€ '. ($total - $subtotal - 2) .'</span></td>
					</tr>
					<tr><th scope="row" colspan="2" style="text-align:left;
border: 1px solid #eee; ">Totale Ordine:</th>
						<td style="text-align:left; border: 1px solid #eee; "><span
class="amount">€ '. $total .'</span></td>
					</tr></tfoot></table>';



	/* USER details*/
	$userDetails .= '<p><strong>Payment Type:</strong> '.$payment.'</p>
<h2 style="color:#505050; display:block; font-family:Arial;
font-size:30px; font-weight:bold; margin-top:10px; margin-right:0;
margin-bottom:10px; margin-left:0; text-align:left;
line-height:150%">Dettagli cliente</h2>

	<p><strong>Full name:</strong> '. $fullname .'</p>
	<p><strong>Email:</strong> '. $email .'</p>
	<p><strong>Country:</strong> '. $country.'</p>
	<p><strong>Town:</strong> '. $town.'</p>
	<p><strong>Zip code:</strong> '. $zip.'</p>
	<p><strong>Street:</strong> '. $street.'</p>		
</div>
														</td>
                                                    </tr></table>';					

	//echo $insertString;


	$query = "INSERT INTO ordermeta VALUES ". substr($insertString, 0, -1);

	if (!mysqli_query($MySqliLink,$query)) {
	  die("MySqli hiba (" .mysqli_errno($MySqliLink). "): " . mysqli_error($MySqliLink));
	}

/**
Message sending
*/
	$mail = new PHPMailer;
	$mail->isSMTP();                                      // Set mailer to use SMTP
	$mail->Host = 'mail.gateone.hu';  // Specify main and backup server
	$mail->SMTPAuth = true;                               // Enable SMTP authentication
	$mail->Username = 'lab@gateone.hu';                            // SMTP username
	$mail->Password = 'lab_2014_one?';                           // SMTP password
	//$mail->SMTPSecure = 'tls';                            // Enable encryption, 'ssl' also accepted

/**  
To the User
*/
	$mail->From = "order@theshop.com";
	$mail->FromName = "The Webshop";
	$mail->addAddress($email, '');  // Add a recipient

	$mail->WordWrap = 50;                                 // Set word wrap to 50 characters
	$mail->isHTML(true);                                  // Set email format to HTML
	$mail->CharSet = 'utf-8';

	$mail->Subject = '[webShop] New order (#'.$currentOrderID.') - ' . $time;
	$mail->Body    = $mailHead . $toTheUser . $productTable . $userDetails . $mailFooter;

//echo $mail->Body;
	if(!$mail->send()) {
	   echo 'Message could not be sent.';
	   echo 'Mailer Error: ' . $mail->ErrorInfo;
	   exit;
	}

/**  
To the Shop
*/
	$mail->From = $email;
	$mail->FromName = $fullname;
	$mail->addAddress('gb@p-drive.de', '');  // Add a recipient

	$mail->WordWrap = 50;                                 // Set word wrap to 50 characters
	$mail->isHTML(true);                                  // Set email format to HTML
	$mail->CharSet = 'utf-8';

	$mail->Subject = 'GateOne application order';
	$mail->Body    = $mailHead . $toTheShop .$productTable . $userDetails . $mailFooter;

//echo $mail->Body;
	if(!$mail->send()) {
	   echo 'Message could not be sent.';
	   echo 'Mailer Error: ' . $mail->ErrorInfo;
	   exit;
	}

} else { //if isset total
	echo "What do you want here?";
}
mysqli_close();
?>
