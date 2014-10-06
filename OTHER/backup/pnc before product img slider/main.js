
//used for caching

//http://gate1.hu/pnc/json.php

var feedCache= {};

//query all json 
var products = [];

//make the categories
var categories = [];

//save the products 
var cart = [];

var fprod = 0;
var fcat = 0;

var slider;
var mySwiper;

var saleslider;
var newslider;
var totalslider;
var imgslider;


//Product lists
//var  newProds = [];  //new products  the first 5 product is the newest
var saleProds = [];  // sale products
var featProds = [];  // featured products
var totProds = [];  // total sales products

function init() {
	getProducts();



$(document).on("pagecontainershow", function () {
    var active = $.mobile.pageContainer.pagecontainer("getActivePage");
    var activePage = $.mobile.pageContainer.pagecontainer("getActivePage")[0].id;
    if (activePage == "intropage" && $(".featured", active).hasClass("plain")) {
        console.log("sdfsdf");
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



	//Banners
	$('.banners-container').each(function(){
		$(this).swiper({
			slidesPerView:'auto',
			offsetPxBefore:25,
			offsetPxAfter:10
		})	
	})

        displayProducts();
    }

});

	/*$(document).on("pagebeforeshow", "#categorypage",  function(e) {
		if (fcat == 1) {
			displayCategories();
		} else {
			displayCategories();
		//};
	});*/
/*
	//handle getting and displaying the intro or feeds	
	$(document).on("pagebeforeshow", "#intropage", function(e) {
		if (fprod == 1) {
			displayProducts();
		} else {
			products = getProducts();
		};
		resetSlider();
	});*/


	/*$(document).on("pagebeforeshow", "#page1", function(e) {
		console.log("page1 show")
		if (fprod == 1) {
			displayProducts2();
		} else {
			products = getProducts();
		};
		//resetSlider();
	});*/


	$(document).on("pagebeforeshow", "#productpage", function(e) {

		console.log("pageshow product");
		    imgslider = $("#imgslider").swiper({
			slidesPerView:'auto',
			offsetPxBefore:0,
			offsetPxAfter:0,
			calculateHeight: true
        });
		//get the entry id and url based on query string
		var prodId = $(this).data("url").split("=")[1];
		var theProd = products[prodId];

		displayImages(theProd.images);


		var commontxt = "<li data-role='list-divider'>Details</li>";
			commontxt += "<li><img src='"+ theProd.featured_src +"'></li>";
			commontxt += "<li>"+theProd.title+"</li>";
			commontxt += "<li>"+theProd.description+"</li>";
			commontxt += "<li>"+displayPrice(theProd.price_html)+"</li>";
			
		if (theProd.type === "variable"){
			var options = [];

			commontxt += "<li data-role='list-divider'>Variation</li>";
			for (var i = 0; i < theProd.attributes.length; ++i){

				commontxt += "<li><div data-role='fieldcontain'>";
				commontxt += "<label for='"+theProd.attributes[i].name+"'> "+theProd.attributes[i].name+" </label>";
				commontxt += "<select name='"+theProd.attributes[i].name+"' id='"+theProd.attributes[i].name+"' >";

					for(var j = 0; j < theProd.attributes[i].options.length; ++j){
						commontxt += "<option value='"+theProd.attributes[i].options[j]+"'>"+theProd.attributes[i].options[j]+" </option>";
					}

				commontxt += "</select>";
				commontxt += "</div></li>";
			}
			
		}

		$("#producttitle").html(theProd.title);
		$("#detList").append(commontxt);
		$("#detList").listview("refresh");

	});
		

	$(document).on("pagebeforeshow", "#prodlist", function(e){
		
		var theCat = $(this).data("url").split("=")[1];
		//remove ?id=
		//query = query.replace("?id=","");
		console.log("the Cat: " + theCat);

		var s = "";
		var found = 0;
		for(var i=0; i<products.length; i++) {
			found = jQuery.inArray(theCat, products[i].categories);
			if (found >= 0) {
				s+= "<li><a href='product.html?id="+i+"' data-prodindex='"+i+"'><img src='"+ products[i].featured_src +"'><h2 class='ui-li-heading'>" +products[i].title+"</h2><p class='ui-li-desc'>"+displayPrice(products[i].price_html)+" </p></a></li>";				
			};
		}
		$("#productlisttitle").html(theCat);
		$("#prodList").html(s);
		$("#prodList").listview("refresh");
	})


	//Listen for the addFeedPage so we can support adding feeds
	$(document).on("pageshow", "#addfeedpage", function(e) {
		console.log('dojngpageshow');
		$("#addFeedForm").submit(function(e) {
			console.log('handle submit');
			handleAddFeed();
			return false;
		});
	});

	//Listen for delete operations
	$(document).on("touchend", ".deleteFeed", function(e) {
		var delId = $(this).jqmData("feedid");
		removeFeed(delId);
	});
	
	//Listen for the Feed Page so we can display entries
	$(document).on("pageshow", "#feedpage",  function(e) {
		//get the feed id based on query string
		var query = $(this).data("url").split("=")[1];
		//remove ?id=
		query = query.replace("?id=","");
		//assume it's a valid ID, since this is a mobile app folks won't be messing with the urls, but keep
		//in mind normally this would be a concern
		var feeds = getFeeds();
		var thisFeed = feeds[query];
		$("h1",this).text(thisFeed.name);
		if(!feedCache[thisFeed.url]) {
			$("#feedcontents").html("<p>Fetching data...</p>");
			//now use Google Feeds API
			$.get("https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&q="+encodeURI(thisFeed.url)+"&callback=?", {}, function(res,code) {
				//see if the response was good...
				if(res.responseStatus == 200) {
					feedCache[thisFeed.url] = res.responseData.feed.entries;
					displayFeed( thisFeed.url);
				} else {
					var error = "<p>Sorry, but this feed could not be loaded:</p><p>"+res.responseDetails+"</p>";
					$("#feedcontents").html(error);
				}
			},"json");
		} else {
			displayFeed(thisFeed.url);
		}
		
	});
	
	//Listen for the Entry Page so we can display an entry
	$(document).on("pageshow", "#entrypage", function(e) {
		//get the entry id and url based on query string
		var query = $(this).data("url").split("?")[1];
		//remove ?
		query = query.replace("?","");
		//split by &
		var parts = query.split("&");
		var entryid = parts[0].split("=")[1];
		var url = parts[1].split("=")[1];
		
		var entry = feedCache[url][entryid];
		$("h1",this).text(entry.title);
		$("#entrycontents",this).html(entry.content);
		$("#entrylink",this).attr("href",entry.link);
	});	
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
	console.log("kép slider");
	for (var i = 0; i<imglist.length; ++i){
		console.log("kep"+i+": " +imglist[i].src);


	var newSlide = imgslider.createSlide("<img src='"+ imglist[i].src +"'>");
	imgslider.appendSlide(newSlide);
	}
	imgslider.removeSlide(0);

}

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
	       		getCategories();
	       		displayProducts();
		    },
		    error: function(e) {
		       console.log("Hiba! Nincs internet vagy nem érhető el a szerver" + e.message);
		    }
	    });
	}

	getCategories();
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
		
		console.log("featured: " + featProds.length + " sale: " + saleProds.length);

		displayCategories();
	
}	

function displayPrice(price){
	var thePrice;
	var prices = $.trim(price).split('&nbsp;&#70;&#116;'); // Ft == &nbsp;&#70;&#116;
	if (prices.length == 3){ // sale price
		thePrice = "<span class='saleprice'>"+ prices[0] +" Ft </span>" + prices[1] + " Ft";
	} else {
		thePrice = prices[0] + " Ft";
	}
	//console.log(prices[0] + " - " + prices[1] + " - " + prices[2]);
	//console.log("count: " + prices.length);
	return thePrice;
}

function displayProducts() {
	if(products.length == 0) {
		//in case we had one form before...
		$("#feedList").html("");
		$("#introContentNoproducts").show();
	} else {

		//featured slider
		for(var i=0; i<featProds.length; i++) {
			addNewFeaturedSlide(featProds[i], mySwiper);
		}
		mySwiper.removeSlide(0);


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
		$("#introContentNoproducts").show();
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
	console.log("display category");
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