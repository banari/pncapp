
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

function init() {
	products = getProducts();




	$(document).on("pagebeforeshow", "#categorypage",  function(e) {
		if (fcat == 1) {
			displayCategories();
		} else {
			categories = getCategories();
		};
	});

	//handle getting and displaying the intro or feeds	
	$(document).on("pagebeforeshow", "#intropage", function(e) {
		if (fprod == 1) {
			displayProducts();
		} else {
			products = getProducts();
		};
		resetSlider();
	});


	$(document).on("pagebeforeshow", "#productpage", function(e) {
		//get the entry id and url based on query string
		var prodId = $(this).data("url").split("=")[1];
		var theProd = products[prodId];

		var commontxt = "<li data-role='list-divider'>Details</li>";
			commontxt += "<li><img src='"+ theProd.featured_src +"'></li>";
			commontxt += "<li>"+theProd.title+"</li>";
			commontxt += "<li>"+theProd.description+"</li>";
			commontxt += "<li>"+theProd.price_html+"</li>";
			
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
		$("#detList").html(commontxt);
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
				s+= "<li><a href='product.html?id="+i+"' data-prodindex='"+i+"'><img src='"+ products[i].featured_src +"'><h2 class='ui-li-heading'>" +products[i].title+"</h2><p class='ui-li-desc'>"+products[i].price_html+" </p></a></li>";				
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

//handles checking storage for your feeds
function getProducts() {
	if(localStorage["products"]) {
		fprod = 1;
		categories = getCategories();
		return JSON.parse(localStorage["products"]);
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
	       		categories = getCategories();
	       		displayProducts();
		    },
		    error: function(e) {
		       console.log(e.message);
		    }
	    });
	}
}	
function getCategories() {
	if(localStorage["categories"]) {
		fcat = 1;
		return JSON.parse(localStorage["categories"]);
	} else {
		var found = 0;
		var helper = [];
		for(var i=0; i<products.length; i++) {
			for (var j=0; j<products[i].categories.length; j++){

				found = jQuery.inArray(products[i].categories[j], helper);
				if (found >= 0) {
				    categories[found].Count += 1;
				} else {
				    // Element was not found, add it.
				    categories.push({
				    	Name : products[i].categories[j],
				    	Count : 1
				    });
				    helper.push(products[i].categories[j]);
				}
			}
		} // end of outer for
		localStorage["categories"] = JSON.stringify(categories);;
		fcat = 1;
		displayCategories();
	}
}	

function displayProducts() {
	if(products.length == 0) {
		//in case we had one form before...
		$("#feedList").html("");
		$("#introContentNoproducts").show();
	} else {
		$("#introContentNoproducts").hide();
		var s = "";
		for(var i=0; i<products.length; i++) {
			// s+= "<li><a href='product.html?id="+i+"' data-feed='"+i+"'><img src='"+ products[i].featured_src +"'><h2 class='ui-li-heading'>" +products[i].title+"</h2><p class='ui-li-desc'>"+products[i].price_html+" </p></a></li>";
			s += "<div class='swiper-slide' style='background-image:url("+ products[i].featured_src +")'>"
				+ "<a href='product.html?id="+i+"' data-feed='"+i+"'>"
					+ "<span class='slititle'>" +products[i].title+"</span>"
					+ "<span class='sliprice'>"+products[i].price_html+"</span>"
				+ "</a>"
				//+ "<div class='swiper-slide-shadow-left'></div><div class='swiper-slide-shadow-right'></div>"
			+"</div>";
		}

		$("#featuredproducts").html(s);	

		makeSlider();
		//window.slider.reInit();
		//$("#feedList").listview("refresh");
	}	
}
function displayCategories() {
			var s = "";
			for(var i=0; i<categories.length; i++) {
				s+= "<li><a href='productlist.html?cat="+categories[i].Name+"'>" +categories[i].Name+"<span class='ui-li-count'>"+categories[i].Count+"</span></a></li>";
			}
			$("#catList").html(s);
			$("#catList").listview("refresh");
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


function makeSlider(){
	window.onload = function() {
	/*	    slider = $('#slider').swiper({
			slidesPerView:'auto',
			centeredSlides: true,
			initialSlide:1,
			tdFlow: {
				rotate : 30,
				stretch :10,
				depth: 150,
				shadows: true
			}
		});
		*/
		//Thumbs
		/*
		$('.thumbs-cotnainer').each(function(){
			$(this).swiper({
				slidesPerView:'auto',
				offsetPxBefore:25,
				offsetPxAfter:10,
				calculateHeight: true
			})
		})

		//Banners
		$('.banners-container').each(function(){
			$(this).swiper({
				slidesPerView:'auto',
				offsetPxBefore:25,
				offsetPxAfter:10
			})	
		})*/
	}
}

function resetSlider(){
	if (slider){

		console.log("van slider");
		/*window.onload = function(){
			slider.reInit();	
		}*/
	} else {
		console.log("nincs slider");
	}
	
}

//***------------------------

/*
var images = ["http://lorempixel.com/400/200/sports/image%201/", "http://lorempixel.com/400/200/nature/image%202/", "http://lorempixel.com/400/200/business/image%203/", "http://lorempixel.com/400/200/food/image%204/", "http://lorempixel.com/400/200/abstract/image%205/", "http://lorempixel.com/400/200/fashion/image%206/"];

var total = images.length - 1,
    current = 0,
    startX = '',
    startY = '',
    endX = '',
    endY = '',
    start = '',
    end = '',
    
    swipeDuration = 1000,
    swipeDistanceX = 50,
    swipeDistanceY = 50,
    thresholdX = 30,
    thresholdY = 30;


$(document).on("pageinit", "#productpage", function () {
    $.each(images, function (i, src) {
        $("<div class='holder hidden'><img src=" + src + " /></div>").appendTo(".inner");
    });
    $(".inner .holder:first-child").toggleClass("visible hidden");
});



function showImg(index, type) {
    if (type == "left") {
        current = index;
        if (current >= 0 && current < total) {
            current++;
            var distance = $(".visible").width();
            $(".inner .holder").eq(current).css({
                left: distance
            }).toggleClass("in hidden");
            $(".visible").animate({
                left: "-" + distance + "px",
                opacity: 0
            }, 600, function () {
                $(this).toggleClass("visible hidden").css({
                    top: "auto",
                    left: "auto"
                });
            });
            $(".in").animate({
                left: 0,
                opacity: 1
            }, 500, function () {
                $(this).toggleClass("in visible");
            });
        }
    }
    if (type == "up") {
        current = index;
        if (current >= 0 && current < total) {
            current++;
            var distance = $(".visible").height();
            $(".inner .holder").eq(current).css({
                top: distance + "px"
            }).toggleClass("in hidden");

            $(".visible").animate({
                top: "-" + distance + "px",
                opacity: 0
            }, 600, function () {
                $(this).toggleClass("visible hidden").css({
                    top: "auto",
                    left: "auto"
                });
            });

            $(".in").animate({
                top: 0,
                opacity: 1
            }, 500, function () {
                $(this).toggleClass("in visible");
            });
        }
    }
    if (type == "right") {
        current = index;
        if (current > 0 && current <= total) {
            current--;
            var distance = $(".visible").width();
            $(".inner .holder").eq(current).css({
                left: "-" + distance + "px"
            }).toggleClass("in hidden");
            $(".visible").animate({
                left: distance + "px",
                opacity: 0
            }, 600, function () {
                $(this).toggleClass("visible hidden").css({
                    top: "auto",
                    left: "auto"
                });
            });

            $(".in").animate({
                left: 0,
                opacity: 1
            }, 500, function () {
                $(this).toggleClass("in visible");
            });
        }
    }
    if (type == "down") {
        current = index;
        if (current > 0 && current <= total) {
            current--;
            var distance = $(".holder").height();
            $(".inner .holder").eq(current).css({
                top: "-" + distance + "px"
            }).toggleClass("in hidden");

            $(".visible").animate({
                top: distance + "px",
                opacity: 0
            }, 600, function () {
                $(this).toggleClass("visible hidden").css({
                    top: "auto",
                    left: "auto"
                });
            });

            $(".in").animate({
                top: 0,
                opacity: 1
            }, 500, function () {
                $(this).toggleClass("in visible");
            });
        }
    }
}

$(document).on("touchstart", ".inner", function (e, ui) {
    startX = e.originalEvent.touches[0].pageX;
    startY = e.originalEvent.touches[0].pageY;
    start = new Date().getTime();
}).on("touchmove", ".inner", function (e, ui) {
    e.preventDefault();
}).on("touchend", ".inner", function (e, ui) {
    endX = e.originalEvent.changedTouches[0].pageX;
    endY = e.originalEvent.changedTouches[0].pageY;
    end = new Date().getTime();
    if ((end - start) < swipeDuration) {
        if (startX > endX && Math.abs(startY - endY) <= thresholdY && Math.abs(startX - endX) >= swipeDistanceX) {
            showImg(current, "left");
        } else if (startX < endX && Math.abs(startY - endY) <= thresholdY && Math.abs(startX - endX) >= swipeDistanceX) {
            showImg(current, "right");
        } else if (startY > endY && Math.abs(startX - endX) <= thresholdX && Math.abs(startY - endY) >= swipeDistanceY) {
            showImg(current, "up");
        } else if (startY < endY && Math.abs(startX - endX) <= thresholdX && Math.abs(startY - endY) >= swipeDistanceY) {
            showImg(current, "down");
        }
    }
});*/