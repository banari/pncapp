<?php
$username = "gateoneh_zstore";
$pwd = "wXK04@i8";
$database = "gateoneh_zstore";
$host = "localhost";

$MySqliLink = mysqli_connect($host,$username,$pwd,$database);

if(!$MySqliLink){
	die("Kapcsolódási hiba (" . mysqli_connect_errno() . ")" . mysqli_connect_error());
} 