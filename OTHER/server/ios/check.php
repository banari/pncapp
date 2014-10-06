<?php
ini_set('default_charset', 'UTF-8');
require("connect.php");
?>
<!DOCTYPE html>

<html>
<head>

<title>Mobile application</title>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1">

<style type="text/css">
table tr {
	border-top: 1px solid #000;
	border-bottom: 1px solid #000;
}
table tr td{
	padding: 10px 20px;
}
table tr:nth-child(2n){
	background-color: #eee;
}
table tr.headline{
	background-color: #ddd;
	font-weight: bold;
}
table tr:hover{
	background-color: rgba(101,112,150,.3);
}
table tr td:hover{
	background-color: rgba(101,112,150,.3);	
}
table tr td.red{
	color: #f33;
	font-weight: bold;
}
</style>
</head>
<body>

<h1>ORDERS</h1>
<h1>User details</h1>
<table>
<tr class="headline"><td>ID</td> <td>Full Name</td> <td>Email</td> <td>Telephone</td> <td>Country</td> <td>Town/City</td> <td>ZIP code</td> <td>Street</td> <td>Payment Method</td> <td style="color: red">Total Price</td> <td>Order Time</td></tr>
<?php 

$query = "SELECT * FROM checkout";
$result = mysqli_query($MySqliLink,$query);
if (!$result) {
  die("MySqli hiba (" .mysqli_errno($MySqliLink). "): " . mysqli_error($MySqliLink));
} else {
	while($row = mysqli_fetch_array($result)){
?>
	<tr>
		<td class="red"><?php echo $row['id']; ?></td>
		<td><?php echo $row['fullname']; ?></td>
		<td><?php echo $row['email']; ?></td>
		<td><?php echo $row['tel']; ?></td>
		<td><?php echo $row['country']; ?></td>
		<td><?php echo $row['town']; ?></td>
		<td><?php echo $row['zip']; ?></td>
		<td><?php echo $row['street']; ?></td>
		<td><?php echo $row['payment']; ?></td>
		<td><?php echo $row['total']; ?></td>
		<td><?php echo $row['time']; ?></td>
	</tr>
<?php
	}
}
?>

</table>






<h1>Ordered Products</h1>
<table>
	<tr class="headline"><td>ID</td> <td>OrderID</td> <td>ProductID</td> <td>Title</td> <td>Quantity</td> <td>Price €</td> <td>Attributes</td> </tr>
<?php 
$query = "SELECT * FROM ordermeta";
$result = mysqli_query($MySqliLink,$query);
if (!$result) {
  die("MySqli hiba (" .mysqli_errno($MySqliLink). "): " . mysqli_error($MySqliLink));
} else {
	while($row = mysqli_fetch_array($result)){
		?>
	<tr>
		<td><?php echo $row['id']; ?></td>
		<td class="red"><?php echo $row['orderid']; ?></td>
		<td><?php echo $row['productID']; ?></td>
		<td><?php echo $row['title']; ?></td>
		<td><?php echo $row['qty']; ?></td>
		<td><?php echo $row['price']; ?></td>
		<td><?php echo $row['attributes']; ?></td>
	</tr>
<?php
	}
}
?>

</table>

</body>
</html>


<?php
mysqli_close();
?>