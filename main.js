

//Selectors
var $leftheader = $("#leftheader ");
var $rightheader = $("#rightheader ");
var $pagetitle = $("#header h1 ");
//query all json 
var products = [];

//make the categories
var categories = [];

//save the products 
var cart = [];
var cartCount = 0;
var selectedAttributes = [];
var atrCount = 0;
var total = 0; //total price

var box = {}; // my object


//search
var searchres = [];

var fprod = 0;
var fcat = 0;

var slider;
var mySwiper;

var catswiper;

var saleslider;
var newslider;
var totalslider;
var imgslider;

var activePage;

//Product lists
//var  newProds = [];  //new products  the first 5 product is the newest
var saleProds = [];  // sale products
var featProds = [];  // featured products
var totProds = [];  // total sales products

function init() {
	//getProducts();

	if(localStorage["cart"]){
		cart = JSON.parse(localStorage["cart"]);
		cartCount = cart.length;
		updateBubble();
	}

$(document).on("pagecontainershow", function () {

    var active = $.mobile.pageContainer.pagecontainer("getActivePage");
    activePage = $.mobile.pageContainer.pagecontainer("getActivePage")[0].id;
    if (activePage == "intropage" && $(".featured", active).hasClass("plain")) {
/*
    	var isAndroid = navigator.userAgent.toLowerCase().indexOf('android')>=0;
		if (isAndroid) Swiper.prototype.support.transforms3d = false;
		*/
        mySwiper = $(".featured", active).removeClass("plain").swiper({
            slidesPerView: 'auto',
            centeredSlides: true,
            initialSlide: 1,
            tdFlow: {
                rotate: 30,
                stretch: 10,
                depth: 150
            }
        });

		catswiper = $("#catswiper").swiper({
			slidesPerView:'auto',
			offsetPxBefore:25,
			offsetPxAfter:10
        });

	//Banners
	$('.banners-container').each(function(){
		$(this).swiper({
			slidesPerView:'auto',
			offsetPxBefore:25,
			offsetPxAfter:10
		})	
	})
		getProducts();
        //displayProducts();
    }
});


	$(document).on("pagebeforeshow", "#productpage", function(e) {
		$leftheader.removeClass("hidden");
		$rightheader.addClass("hidden");

		selectedAttributes = [];
		atrCount = 0;		

		imgslider = $("#imgslider").swiper({
			slidesPerView:'auto',
			watchActiveIndex: true,
			centeredSlides: true,
			pagination:'.pagination',
			paginationClickable: true,
			resizeReInit: false,
			keyboardControl: true,
			grabCursor: true,
			onImagesReady: function(){
				changeSize()
			}
        });
		//get the entry id and url based on query string
		var prodId = $(this).data("url").split("=")[1];
		var theProd = products[prodId];

		atrCount = theProd.attributes.length + 1;

		displayImages(theProd.images);

		var commontxt = "<li data-role='list-divider'>Adatok</li>";
			commontxt += "<li>"+theProd.title+"</li>";

			if (theProd.description){
				commontxt += "<li data-role='list-divider'>Leírás</li>";
				commontxt += "<li>"+theProd.description+"</li>";	
			}

		commontxt += "<li data-role='list-divider'>Tulajdonságok</li>";
		if (theProd.type === "variable"){
			var options = [];

			for (var i = 0; i < theProd.attributes.length; ++i){

				commontxt += "<li><div class='ui-field-contain'>";
				commontxt += "<label for='"+theProd.attributes[i].name+"' > "+theProd.attributes[i].name+" </label>";
				commontxt += "<select name='"+theProd.attributes[i].name+"' id='"+theProd.attributes[i].name+"' data-index='"+i+"' class='myselectmenu'>";
				commontxt += "<option value='' disabled selected> - </option>";
					for(var j = 0; j < theProd.attributes[i].options.length; ++j){
						commontxt += "<option value='"+theProd.attributes[i].options[j]+"'>"+theProd.attributes[i].options[j]+" </option>";
					}

				commontxt += "</select>";
				commontxt += "</div></li>";
			}
			
		}
				commontxt += "<li><div class='ui-field-contain'>";
				commontxt += "<label for='darab' > Darabszám </label>";
				commontxt += "<select name='darab' id='darab' data-index='"+(atrCount-1)+"' class='myselectmenu'>";
					commontxt += "<option value='' disabled selected> - </option>";
					for(var i = 1; i <= 20; ++i){
						commontxt += "<option value='qty"+i+"'>"+i+" </option>";
					}

				commontxt += "</select>";
				commontxt += "</div></li>";
			commontxt += "<li data-role='list-divider'>Ár</li>";
			commontxt += "<li>"+displayPrice(theProd.price_html)+"</li>";
			
			commontxt += "<li><a  href='' id='addToCartBtn' data-role='button' data-product='"+prodId+"#"+theProd.id+"' >Kosárba</a></li>";

		$pagetitle.html(theProd.title);
		$("#detList").append(commontxt);
		$("#detList").listview("refresh");
		$(".myselectmenu").selectmenu();


		productFilled();
	});
		
	$(document).on('change', '.myselectmenu', function(e) {
    	//console.log("asdf: " + this.options[e.target.selectedIndex].text + " - id: " + $(this).data("index"));
    	selectedAttributes[$(this).data("index")] = this.options[e.target.selectedIndex].text;
    	productFilled();
	});

	$(document).on("pagebeforeshow", "#prodlist", function(e){
		

		var theCat = $(this).data("url").split("=")[1];
		var s = "";
		var found = 0;
		for(var i=0; i<products.length; i++) {
			found = jQuery.inArray(theCat, products[i].categories);
			if (found >= 0) {
				s+= "<li><a href='product.html?id="+i+"' data-prodindex='"+i+"'><img src='"+ products[i].featured_src +"'><h2 class='ui-li-heading'>" +products[i].title+"</h2><p class='ui-li-desc'>"+displayPrice(products[i].price_html)+" </p></a></li>";				
			};
		}
		$pagetitle.html(theCat);
		$leftheader.removeClass("hidden");
		$rightheader.addClass("hidden");
		$("#prodList").html(s);
		$("#prodList").listview("refresh");
	})

	$(document).on("pagebeforeshow", "#cartpage", function(e){	
		var s = "";
		total = 0;

		if(cart.length>0){
			for(var i=0; i<cart.length; i++) {
				//s+= "<li><a href='product.html?id="+i+"' data-prodindex='"+i+"'><img src='"+ products[i].featured_src +"'><h2 class='ui-li-heading'>" +products[i].title+"</h2><p class='ui-li-desc'>"+displayPrice(products[i].price_html)+" </p></a></li>";				
					s+= "<li><a><img src='"+ cart[i]._product.featured_src +"'><h2 class='ui-li-heading'>"+ cart[i]._product.title +"</h2><p class='ui-li-desc'>"+displayPrice( cart[i]._product.price_html) +", "+cart[i]._attrib+" </p><span class='ui-li-count ui-btn-up-b ui-btn-corner-all qtylabel'> x "+cart[i]._qty+"</span></a>"
					+ "<a id='cartdel' href='' data-rel='button' data-position='"+i+"' >Delete</a></li>";	

					//calculate total	
					total += parseFloat(cart[i]._product.price) * parseInt(cart[i]._qty);
				};
				s+= "<li data-role='list-divider'></li><li><h1>Total: <span id='thetotal'>"+total+"</span> HUF </h1></li>";//data-role="button" data-inline="true" data-transition="pop" data-icon="delete" data-theme="b"
			$("#inCartList").html(s);
			$("#inCartList").listview("refresh");
			$("#inCartList").append("<li data-role='list-divider'></li><li><div class='ui-grid-a'><div class='ui-block-a'><a href='#firstPopup' data-rel='popup' data-transition='pop' data-inline='true' data-role='button' data-theme='a' data-position-to='window' >Kosár ürítése</a></div><div class='ui-block-b'><a href='#orderpage' data-transition='slideup' data-inline='true' data-role='button' data-theme='a'>Rendelés</a></div></div></li>").trigger("create");
		} else {
			$("#inCartList").html("<li>A kosarad jelenleg üres!</li>");
		}

		$pagetitle.html("Kosár");
		$leftheader.addClass("hidden");
		$rightheader.addClass("hidden");
		$("#inCartList").listview("refresh");
	})

	$(document).on("click", "#cartdel", function(){
		var cartpos = parseInt($(this).data("position"));
		//console.log("prod price: " + parseFloat(cart[cartpos]._product.price) + " prod qty: " + parseInt(cart[cartpos]._qty))
		var prodcost = parseFloat(cart[cartpos]._product.price) * parseInt(cart[cartpos]._qty);
		cart.splice(cartpos,1);
		cartCount--;
		updateBubble();
		localStorage["cart"] = JSON.stringify(cart);

		$("#inCartList li").eq(cartpos).remove();
		var newtotal = parseInt($("#thetotal").text()) - prodcost;
		if (newtotal <= 0){
			$("#inCartList").html("<li>A kosarad jelenleg üres!</li>");
			$("#inCartList").listview("refresh");
		} else {
			$("#thetotal").text(newtotal);	
		}
	});
	$(document).on("click", "#orderbtn", function(){
			var currentcart;
			var mincart = [];
			var theCart;

			for (var i = 0; i< cart.length; ++i){
				currentcart = {
					_name : cart[i]._product.title,
					_prodId : cart[i]._prodId,
					_qty : cart[i]._qty,
					_price : cart[i]._product.price,
					_attrib : cart[i]._attrib.replace("#", ",")
				}
				mincart.push(currentcart);
			}
				theCart = JSON.stringify(mincart);

				var inputs = $("#orderForm").find("input, select");
				var serializedData = $("#orderForm").serialize();
//				console.log("seri: " + serializedData+"&cart="+theCart);
				var posttext = serializedData+"&cart="+theCart;

				inputs.prop("disabled", true);
				    request = $.ajax({
				        url: "http://gate1.hu/ios/post.php",
				        crossDomain:true,
				        type: "POST",
				        data: posttext
				    });
	 request.done(function (response, textStatus, jqXHR){
	        // log a message to the console
	        //console.log("Hooray, it worked!");
	    });

	    // callback handler that will be called on failure
	    request.fail(function (jqXHR, textStatus, errorThrown){
	        // log the error to the console
	        console.error(
	            "The following error occured: "+
	            textStatus, errorThrown
	        );
	    });
	    request.always(function () {
	        // reenable the inputs
	        inputs.prop("disabled", false);
	        inputs.val("");
	    });
	    cart = [];
	    cartCount = 0;
	    updateBubble();
		localStorage["cart"] = JSON.stringify(cart);
	    // prevent default posting of form
	    event.preventDefault();
	    $.mobile.pageContainer.pagecontainer("change", "#cartpage", {
	    	transition: 'slidedown',
	    	changeHash: false,
	    	reserve: true
	    });			
	});


	$(document).on("pagebeforeshow", "#searchrespage", function(e){
		
		var s = "";
		for(var i=0; i<searchres.length; i++) {
				s+= "<li><a href='product.html?id="+searchres[i]._id+"' data-prodindex='"+searchres[i]._id+"'><img src='"+ searchres[i]._product.featured_src +"'><h2 class='ui-li-heading'>" +searchres[i]._product.title+"</h2><p class='ui-li-desc'>"+displayPrice(searchres[i]._product.price_html)+" </p></a></li>";				
		}
		$pagetitle.html("Keresés eredménye");
		$leftheader.removeClass("hidden");
		$rightheader.addClass("hidden");
		$("#searchreslist").html(s);
		$("#searchreslist").listview("refresh");
	})
	$(document).on("click", "#addToCartBtn", function(){

		addToCart($(this).data("product"));

		//reset select fields
		$('.myselectmenu option').removeAttr('selected');
		$('.myselectmenu option[value=""]').attr("selected","selected");
		$('span.myselectmenu').text("-");
		selectedAttributes = [];
		productFilled();

		displayNofy("Kosarad frissült!");
	});

	$(document).on("click","#confirmempty", function(){
		cart = [];
		localStorage["cart"] = JSON.stringify(cart);
		cartCount = 0;
		updateBubble();
		$("#inCartList").html("<li>A kosarad jelenleg üres!</li>");
		$("#inCartList").listview("refresh");
	});
	$(document).on("click","#ordercart", function(){
		//displayNofy();
	});

	$(document).on( "pagebeforeshow", "#categorypage", function( event) {
		$leftheader.removeClass("hidden");
		$rightheader.addClass("hidden");
		$pagetitle.html("Kategóriák");

	} );

	$(document).on( "pagebeforeshow", "#orderpage", function( event) {
		$leftheader.removeClass("hidden");
		$rightheader.addClass("hidden");
		$pagetitle.html("Rendelés");

	} );	

	$(document).on( "pagebeforeshow", "#intropage", function( event) {
			$leftheader.addClass("hidden");
			$rightheader.removeClass("hidden");
			$pagetitle.html("<img src='img/logo.png' id='logo'>");
	} );

    	$( "#search input, #search select" ).change(function() {
		  calculateSearchResult();
		});
    	$( "#priceslider" ).on( 'slidestop', function( event ) { 
  			calculateSearchResult();
    	});

	$(document).on( "pagebeforeshow", "#searchpage", function( event) {

		var searchcatlist = "<option value=''>Kategóriák:</option>";
		for(var i=0; i<categories.length; i++) {
			searchcatlist+= "<option value='"+categories[i].Name+"'>"+categories[i].Name+"</option>";
		}
			$("#search #categories").html(searchcatlist);
			$("#search #categories").selectmenu("refresh");

			if (searchres.length>0){
				$("#resultcount").text("("+searchres.length+")");
			} else {
				$("#resultcount").text("("+products.length+")");	
			}
			
			
			$("#search").listview("refresh");
			$leftheader.addClass("hidden");
			$rightheader.addClass("hidden");
			$pagetitle.html("Keresés");
	} );

	$(document).on("pageshow", "#intropage", function () { 
		if (mySwiper){
			mySwiper.reInit();				
			mySwiper.resizeFix(true);
		}
	});



	/*
	 * Fix for footer when the keyboard is displayed
	 */
	$(document).on('focus', 'input, textarea, select', function() 
	{
		$("#footer").addClass("hidden");
	});

	$(document).on('blur', 'input, textarea, select', function() 
	{
		$("#footer").removeClass("hidden");
	});


}
	function calculateSearchResult(){
		searchres = [];
		var $nev = $("#search #name"),
			$cat = $("#search #categories"),
			$armin = $("#search #armin"),
			$armax = $("#search #armax");

			var catok = true,
				nameok = true,
				priceok = true;
	
			for (var i = 0; i < products.length; ++i){
				if ($cat.val()){
					catok = checkInCat(products[i], $cat.val());
				}
				priceok = checkInPrice(products[i], $armin.val(), $armax.val());
				nameok = checkInName(products[i], $nev.val());

				if (catok && priceok && nameok){
					addProdToSRes(products[i], i);
				}
			} // products for
			$("#resultcount").text("("+searchres.length+")");
			$("#search").listview("refresh");
	}
	function checkInCat(product, cats){
		if (cats.length>0){
			for (var j = 0; j<product.categories.length; ++j){
				for (var k = 0; k<cats.length; ++k){
					if (cats[k] == product.categories[j]){
						return true;
					}
				}
			}	
		}
		return false; 
	};

	function checkInPrice(product, min, max){
		if ((min <= parseFloat(product.price)) && (parseFloat(product.price) <= max)){
			return true;
		};
		return false;
	};

	function checkInName(product, name){
		if (product.title.toLowerCase().indexOf(name.toLowerCase()) >= 0 ){
			return true;
		}
		return false;
	}
	function addToCart(sentProduct){
		var detarray = sentProduct.split("#");
		var product = products[detarray.shift()]; // the first element is the position of the product in the products array
		var prodId = detarray.shift();  // the second element is the product id
		var qty = detarray.pop(); //the last element is the quantity
		var attrib = detarray.join("#");

		box = {
			_product : product,
			_prodId : prodId,
			_qty : qty,
			_attrib : attrib
		}

		//Ha van már ugyanazzal a tulajdonságokkal akkor qty increment, else add
		var inCart = checkInCart(prodId, attrib, qty);

		if (!inCart){
			cart.push(box);	
			cartCount++;
			updateBubble();
		}		

		localStorage["cart"] = JSON.stringify(cart);
	}

	function checkInCart(ID, ATTR, QTY){
		for (var i = 0; i < cart.length; ++i){
			if ( (cart[i]._product.id == ID) && (cart[i]._attrib == ATTR) ){
				//benne van
				cart[i]._qty = parseInt(QTY) + parseInt(cart[i]._qty);
				return true;
			}
		}
		//nincs benne
		return false;
	}

function addProdToSRes(product, id){
	var obj = {
		_product : product,
		_id : id
	}
	if(searchres.length == 0){
		searchres.push(obj);
	} else {
		var bennevan = 0;
		for (var i = 0; i < searchres.length; ++i){
			if(searchres[i]._product.id == product.id){
				bennevan = 1;
				break;
			}
		}
		if (bennevan == 0){
			searchres.push(obj);
		}
	}
}
	function updateBubble(){
			if (cartCount>0) {
				$("#cartnumber").text(cartCount).removeClass("hidden");
			} else {
				$("#cartnumber").addClass("hidden");
			}
	}

	function productFilled(){
		//console.log("productFilled? atrCount: " + atrCount + ", selectedAttr: "+ selectedAttributes.length);

		var atcbtn = $( "#addToCartBtn" );
		if (atrCount != selectedAttributes.length){
			//console.log(" - NO");
			if (!atcbtn.prop("disabled"))
				atcbtn.prop( "disabled", true ).toggleClass( "ui-state-disabled", true );
		} else {
			//console.log(" - YES");
			//It is okey
			atcbtn.prop( "disabled", false ).toggleClass( "ui-state-disabled", false );
			
			var product = atcbtn.data("product");
			product += "#" + selectedAttributes.join("#");

			atcbtn.data("product", product);
			atcbtn.attr('data-product', product);
		}
	}


	function changeSize() {
		//Unset Width
		$('#imgslider .swiper-slide').css('width','')
		//Get Size
		var imgWidth = $('#imgslider .swiper-slide img').width();
		if (imgWidth>$(window).width()){ 
			imgWidth = $(window).width(); 
		}
		//Set Width
		$('#imgslider .swiper-slide').css('width', imgWidth);

		 $('#imgslider').css({height:''})
		  //Calc Height
		 $('#imgslider').css({height: $('#imgslider ').find('img').height()})
		  //ReInit Swiper
		imgslider.resizeFix(true)	
		imgslider.reInit();	
	}

/*
//handles checking storage for your feeds
function getProducts() {

	if(localStorage["products"]) {
		fprod = 1;
		products = JSON.parse(localStorage["products"]);
	} else {
		var url = 'http://gate1.hu/pnc/json.php';
	    $.ajax({
	       type: 'GET',
	        url: url,
	        async: false,
	        contentType: "application/json",
	        dataType: 'jsonp',
	        success: function(json) {
	       		console.log("succes! ");
	       		products = json.products;
	       		localStorage["products"] = JSON.stringify(products);
	       		fprod = 1;
		    },
		    error: function(e) {
		       console.log(e.message);
		    }
	    });
	}

	getCategories();
}	*/
function displayImages(imglist){
	for (var i = 0; i<imglist.length; ++i){
		var newSlide = imgslider.createSlide("<div class='inner'><img src='"+ imglist[i].src +"'></div>");
		imgslider.appendSlide(newSlide);
	}
	imgslider.removeSlide(0);
}

function getProducts() {
 
		var url = 'http://gate1.hu/pnc/json.php';
	    $.ajax({
	       type: 'GET',
	        url: url,
	        async: false,
	        contentType: "application/json",
	        dataType: 'jsonp',
	        success: function(json) {
	       		console.log("succes! ");
	       		products = json.products;
	       		localStorage["products"] = JSON.stringify(products);
	       		fprod = 1;
	       		getCategories();
	       		displayProducts();
		    },
		    error: function(e) {
		       console.log("Hiba! Nincs internet vagy nem érhető el a szerver" + e.message);
		    }
	    });
	

	//getCategories();
}	


function getCategories() {
	
		var found = 0;
		var helper = [];
		for(var i=0; i<products.length; i++) {
			
			if (products[i].featured){
				featProds.push(i);
			}

			if (products[i].on_sale){
				saleProds.push(i);
			}
			if (products[i].total_sales > 0){
				//if(totProds.length < 10){}
				totProds.push(i);
			}


			// Subcategory
			for (var j=0; j<products[i].categories.length; j++){
				found = jQuery.inArray(products[i].categories[j], helper);
				if (found >= 0) {
				    categories[found].Count += 1;
				} else {
				    categories.push({
				    	Name : products[i].categories[j],
				    	Count : 1
				    });
				    helper.push(products[i].categories[j]);
				}
			}
		} // end of outer for
		
		localStorage["categories"] = JSON.stringify(categories);
		fcat = 1;
		
		displayCategories();
	
}	

function displayNofy(text){
		$("<div class='noty ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h1>"+ text + "</h1></div>").appendTo( $.mobile.pageContainer ).delay(1000).fadeOut( 800, function(){});
}

function displayPrice(price){
	var thePrice;
	var prices = $.trim(price).split('&nbsp;&#70;&#116;'); // Ft == &nbsp;&#70;&#116;
	if (prices.length == 3){ // sale price
		thePrice = "<span class='saleprice'>"+ prices[0] +" Ft </span>" + prices[1] + " Ft";
	} else {
		thePrice = prices[0] + " Ft";
	}
	return thePrice;
}

function displayProducts() {
	if(products.length == 0) {
		//in case we had one form before...
		$("#feedList").html("");
		//$("#introContentNoproducts").removeClass("hidden");
	} else {
		$("#introContentNoFeeds").fadeOut("normal");

		//featured slider
		for(var i=0; i<featProds.length; i++) {
			addNewFeaturedSlide(featProds[i], mySwiper);
		}
		mySwiper.removeSlide(0);

		//category brand
		if(categories.length > 0){
			addNewSlider("category")
		}

		//sale products
		if (saleProds.length > 0){
			addNewSlider("sale");
		} 

		//newest products
		addNewSlider("new");

		if (totProds.length > 0){
			addNewSlider("total");
		}
	}	
}

//slide down effect, hidden slders
function addNewFeaturedSlide(productid, slider){
	var product = products[productid];
	var newSlide = slider.createSlide("<div class='prodcard' style='background-image:url("+ product.featured_src +")'><a href='product.html?id="+productid+"' data-feed='"+productid+"'>"
		+ "<span class='slititle'>" +product.title+"</span>"
		+ "<span class='sliprice'>"+displayPrice(product.price_html)+"</span>"
	+ "</a></div><div class='swiper-slide-shadow-left'></div><div class='swiper-slide-shadow-right'></div>");
	slider.appendSlide(newSlide);
}

function addNewSlide(productid, slider){
	var product = products[productid];
	var newSlide = slider.createSlide("<a href='product.html?id="+productid+"' data-feed='"+productid+"'> <img src='"+ product.featured_src +"' height='150' width='150'>  "
									+ "<div class='app-title'>" +product.title+"</div></a>"
									+ "<div class='app-category'>"+product.categories+"</div>"
									+ "<div class='app-price'>"+displayPrice(product.price_html)+"</div>");
	slider.appendSlide(newSlide);
}

function addNewSlider(type){
	var list;
	var listtitle = type;
	var theSlider;

	//start of sale slider
	if (type === "sale"){
	     saleslider = $("#saleslider").swiper({
			slidesPerView:'auto',
			offsetPxBefore:25,
			offsetPxAfter:10,
			calculateHeight: true
		});
	
		theSlider = $("#saleslider");
		theSlider.find(".thumbs-title").html("Akciós termékek");

		for(var i=0; i<saleProds.length; i++) {
			addNewSlide(saleProds[i], saleslider);
		}
		saleslider.removeSlide(0);
	}
	//end of sale slider


	//start of new category
	if(type === "category"){
	    for(var i = 0; i<categories.length; i++){
			//console.log("cat: " + categories[i].Name + ", count: " + categories[i].Count);
			var newSlide = catswiper.createSlide("<a href='productlist.html?cat="+categories[i].Name+"'><div class='banner'>"
								+ "<span class='catslidename'>"+categories[i].Name+"</span><span class='catslidecount'>"+categories[i].Count+"</span></div></a>");
			catswiper.appendSlide(newSlide);
			//s+= "<li><a href='productlist.html?cat="+categories[i].Name+"'>" +categories[i].Name+"<span class='ui-li-count'>"+categories[i].Count+"</span></a></li>";
		}
		catswiper.removeSlide(0);
	}
	//end of new category

	//start of new slider
	if(type === "new"){
	     newslider = $("#newslider").swiper({
			slidesPerView:'auto',
			offsetPxBefore:25,
			offsetPxAfter:10,
			calculateHeight: true
		});		

	     theSlider = $("#newslider");
	     theSlider.find(".thumbs-title").html("Legújabb termékek");
	     for(var i=0; i<10; i++) {
			addNewSlide(i, newslider);
		}
		newslider.removeSlide(0);
	}
	//end of new slider

	//start of total slider
	if (type === "total"){
	     totalslider = $("#totalslider").swiper({
			slidesPerView:'auto',
			offsetPxBefore:25,
			offsetPxAfter:10,
			calculateHeight: true
		});
	
		theSlider = $("#totalslider");
		theSlider.find(".thumbs-title").html("Legtöbbet eladott");

		for(var i=0; i<totProds.length; i++) {
			addNewSlide(totProds[i], totalslider);
		}
		totalslider.removeSlide(0);
	}
	//end of total slider
}

/*
//Backup displayProducts()
function displayProducts() {
	if(products.length == 0) {
		//in case we had one form before...
		$("#feedList").html("");
		$("#introContentNoproducts").removeClass("hidden");
	} else {
		for(var i=0; i<products.length; i++) {

				var newSlide = mySwiper.createSlide("<div class='prodcard' style='background-image:url("+ products[i].featured_src +")'><a href='product.html?id="+i+"' data-feed='"+i+"'>"
					+ "<span class='slititle'>" +products[i].title+"</span>"
					+ "<span class='sliprice'>"+products[i].price_html+"</span>"
				+ "</a></div><div class='swiper-slide-shadow-left'></div><div class='swiper-slide-shadow-right'></div>");
				mySwiper.appendSlide(newSlide);

		}
		mySwiper.removeSlide(0);
	}	
}
*/

function displayCategories() {
	var s = "";
	for(var i=0; i<categories.length; i++) {
		s+= "<li><a href='productlist.html?cat="+categories[i].Name+"'>" +categories[i].Name+"<span class='ui-li-count'>"+categories[i].Count+"</span></a></li>";
	}
	$("#catList").html(s);
}

function addFeed(name,url) {
	var feeds = getFeeds();
	feeds.push({name:name,url:url});
	localStorage["feeds"] = JSON.stringify(feeds);
}

function removeFeed(id) {
	var feeds = getFeeds();
	feeds.splice(id, 1);
	localStorage["feeds"] = JSON.stringify(feeds);
	displayFeeds();
}

function handleAddFeed() {
	var feedname = $.trim($("#feedname").val());
	var feedurl = $.trim($("#feedurl").val());
	
	//basic error handling
	var errors = "";
	if(feedname == "") errors += "Feed name is required.\n";
	if(feedurl == "") errors += "Feed url is required.\n";
	
	if(errors != "") {
		//Create a PhoneGap notification for the error
		navigator.notification.alert(errors, function() {});
	} else {
		addFeed(feedname, feedurl);
		$.mobile.changePage("index.html");
	}
}


/*
$(window).on('resize', function ()
{
    if ($(this).width() <= 383 && !fired[0])
    {
        fired[0] = true;
        fired[1] = false;

        mySwiper = $('.swiper-container').swiper({ mode: 'horizontal', loop: false, wrapperClass: 'swiper-wrapper', slideClass: 'swiper-slide' });
    }
    else if ($(this).width() >= 384 && !fired[1])
    {
        fired[0] = false;
        fired[1] = true;

        mySwiper.destroy();

        $('.swiper-wrapper').removeAttr('style');
        $('.swiper-slide').removeAttr('style');
    }
});*/


	$(window).resize(function(){
		if (activePage == "productpage"){
			changeSize();
		}
		if (activePage == "intropage"){
			mySwiper.reInit();	
			mySwiper.resizeFix(true);
		}
	});
	/*$(window).resize(function(){
  //Unset height
  $('.swiper-container').css({height:''})
  //Calc Height
  $('.swiper-container').css({height: $('.swiper-container').find('img').height()})
  //ReInit Swiper
  swiper.reInit()
})*/