<?php
header("Access-Control-Allow-Origin: *");
require("connect.php");
ini_set('default_charset', 'UTF-8');

function test_input($data)
{
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
}

/**
GET  -- Test site
*/

if (isset($_POST["cart"])){


	$date = date_create();

	$fullname = test_input($_POST["fullname"]);
	$email = test_input($_POST["email"]);
	$tel = test_input($_POST["telefon"]);
	$country = test_input($_POST["country"]);
	$town = test_input($_POST["city"]);
	$zip = test_input($_POST["zip"]);
	$street = test_input($_POST["street"]);
	$payment = test_input($_POST["paymethod"]);
	$prods = json_decode($_POST["cart"], true);
	
//print_r($_GET);

//echo $prods;


//Start


	$subtotal = 0;
	$time = date_format($date, 'Y-m-d H:i:s');

	$tableinside = "";

	for ($i=0; $i < count($prods); $i++) { 
			$price = $prods[$i]["_price"];
			$qty = $prods[$i]["_qty"];
			$subtotal += $price * $qty;
		}

			$vat = 0;
			$szallitas = 0;
			$total = $vat + $subtotal + $szallitas;

echo "1";
	$query = "INSERT INTO checkout VALUES ('', '$fullname', '$email', '$tel', '$country', '$town', '$zip', '$street', '$payment','$total', '$time')";
	mysqli_query($MySqliLink, $query) or die(mysqli_error("error"));

	$insertString = "";
	$attributes = "";

	$currentOrderID = mysqli_insert_id($MySqliLink);

		$productTable = '<h2 style="color:#505050; display:block; font-family:Arial;
	font-size:30px; font-weight:bold; margin-top:10px; margin-right:0;
	margin-bottom:10px; margin-left:0; text-align:left;
	line-height:150%">Ordine: #'. $currentOrderID .'</h2>
	<table cellspacing="0" cellpadding="6" style="width: 100%; border: 1px solid #eee;" border="1" bordercolor="#eee">
		<thead><tr><th scope="col" style="text-align:left; border: 1px solid #eee;">Prodotto</th><th scope="col" style="text-align:left; border: 1px solid
	#eee;">Quantità</th><th scope="col" style="text-align:left; border: 1px solid #eee;">Prezzo</th>
			</tr></thead><tbody>';

	$userDetails = "";


	$tableinside = "";

	for ($i=0; $i < count($prods); $i++) { 

		$tableinside .= '<tr><td style="text-align:left;vertical-align:middle; border: 1px solid #eee; word-wrap:break-word;">';
					$title = $prods[$i]["_name"];
					$price = $prods[$i]["_price"];
					$prodID = $prods[$i]["_prodId"];
					$qty = $prods[$i]["_qty"];
					$attributes .= $prods[$i]["_attrib"];

			$tableinside .= $title . '<br><small>' . $attributes . '</small></td><td style="text-align:left; vertical-align:middle; border: 1px solid
	#eee;">' . $qty . '</td><td style="text-align:left; vertical-align:middle; border: 1px solid #eee;"><span class="amount">' . $price . '</span></td>';

			$insertString .= "('' , '$currentOrderID', '$prodID', '$title', '$qty', '$price', '$attributes' ),";
			$attributes = "";

			$tableinside .= '</tr>';
		}
	$productTable .= $tableinside;

	$query = "INSERT INTO ordermeta VALUES ". substr($insertString, 0, -1);

	if (!mysqli_query($MySqliLink,$query)) {
	  die("MySqli hiba (" .mysqli_errno($MySqliLink). "): " . mysqli_error($MySqliLink));
	}


		$productTable .= '</tbody><tfoot><tr><th scope="row" colspan="2" style="text-align:left; border: 1px solid #eee; border-top-width:
	4px;">Subtotale carrello:</th><td style="text-align:left; border: 1px solid #eee; border-top-width: 4px;"><span class="amount">' .$subtotal.'</span></td></tr>
	<tr><th scope="row" colspan="2" style="text-align:left; border: 1px solid #eee; ">Spedizione:</th><td style="text-align:left; border: 1px solid #eee; "><span
	class="amount"> '.$szallitas.'</span></td>
						</tr>
	<tr><th scope="row" colspan="2" style="text-align:left; border: 1px solid #eee; ">VAT:</th><td style="text-align:left; border: 1px solid #eee; "><span
	class="amount"> '. $vat .'</span></td>
						</tr>
						<tr><th scope="row" colspan="2" style="text-align:left;
	border: 1px solid #eee; ">Totale Ordine:</th>
							<td style="text-align:left; border: 1px solid #eee; "><span
	class="amount"> '. $total .'</span></td>
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
	echo $productTable . $userDetails;
} else {
	echo "What are you doing here?";
}
mysqli_close();
?>
