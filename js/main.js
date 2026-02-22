; (function () {

	'use strict';



	var isMobile = {
		Android: function () {
			return navigator.userAgent.match(/Android/i);
		},
		BlackBerry: function () {
			return navigator.userAgent.match(/BlackBerry/i);
		},
		iOS: function () {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		},
		Opera: function () {
			return navigator.userAgent.match(/Opera Mini/i);
		},
		Windows: function () {
			return navigator.userAgent.match(/IEMobile/i);
		},
		any: function () {
			return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		}
	};

	var fullHeight = function () {

		if (!isMobile.any()) {
			$('.js-fullheight').css('height', $(window).height());
			$(window).resize(function () {
				$('.js-fullheight').css('height', $(window).height());
			});
		}

	};


	var counter = function () {
		$('.js-counter').countTo({
			formatter: function (value, options) {
				return value.toFixed(options.decimals);
			},
		});
	};


	var counterWayPoint = function () {
		if ($('#wonder-counter').length > 0) {
			$('#wonder-counter').waypoint(function (direction) {

				if (direction === 'down' && !$(this.element).hasClass('animated')) {
					setTimeout(counter, 400);
					$(this.element).addClass('animated');
				}
			}, { offset: '90%' });
		}
	};

	// Animations
	var contentWayPoint = function () {
		var i = 0;
		$('.animate-box').waypoint(function (direction) {

			if (direction === 'down' && !$(this.element).hasClass('animated')) {

				i++;

				$(this.element).addClass('item-animate');
				setTimeout(function () {

					$('body .animate-box.item-animate').each(function (k) {
						var el = $(this);
						setTimeout(function () {
							var effect = el.data('animate-effect');
							if (effect === 'fadeIn') {
								el.addClass('fadeIn animated');
							} else if (effect === 'fadeInLeft') {
								el.addClass('fadeInLeft animated');
							} else if (effect === 'fadeInRight') {
								el.addClass('fadeInRight animated');
							} else {
								el.addClass('fadeInUp animated');
							}

							el.removeClass('item-animate');
						}, k * 200, 'easeInOutExpo');
					});

				}, 100);

			}

		}, { offset: '85%' });
	};


	var burgerMenu = function () {

		$('.js-wonder-nav-toggle').on('click', function (event) {
			event.preventDefault();
			var $this = $(this);

			if ($('body').hasClass('offcanvas')) {
				$this.removeClass('active');
				$('body').removeClass('offcanvas');
			} else {
				$this.addClass('active');
				$('body').addClass('offcanvas');
			}
		});



	};

	// Click outside of offcanvass
	var mobileMenuOutsideClick = function () {

		$(document).click(function (e) {
			var container = $("#wonder-aside, .js-wonder-nav-toggle");
			if (!container.is(e.target) && container.has(e.target).length === 0) {

				if ($('body').hasClass('offcanvas')) {

					$('body').removeClass('offcanvas');
					$('.js-wonder-nav-toggle').removeClass('active');

				}

			}
		});

		$(window).scroll(function () {
			if ($('body').hasClass('offcanvas')) {

				$('body').removeClass('offcanvas');
				$('.js-wonder-nav-toggle').removeClass('active');

			}
		});

	};

	var sliderMain = function () {

		$('#wonder-hero .flexslider').flexslider({
			animation: "fade",
			slideshowSpeed: 5000,
			directionNav: true,
			start: function () {
				setTimeout(function () {
					$('.slider-text').removeClass('animated fadeInUp');
					$('.flex-active-slide').find('.slider-text').addClass('animated fadeInUp');
				}, 500);
			},
			before: function () {
				setTimeout(function () {
					$('.slider-text').removeClass('animated fadeInUp');
					$('.flex-active-slide').find('.slider-text').addClass('animated fadeInUp');
				}, 500);
			}

		});

	};

	var stickyFunction = function () {

		var h = $('.image-content').outerHeight();

		if ($(window).width() <= 992) {
			$("#sticky_item").trigger("sticky_kit:detach");
		} else {
			$('.sticky-parent').removeClass('stick-detach');
			$("#sticky_item").trigger("sticky_kit:detach");
			$("#sticky_item").trigger("sticky_kit:unstick");
		}

		$(window).resize(function () {
			var h = $('.image-content').outerHeight();
			$('.sticky-parent').css('height', h);


			if ($(window).width() <= 992) {
				$("#sticky_item").trigger("sticky_kit:detach");
			} else {
				$('.sticky-parent').removeClass('stick-detach');
				$("#sticky_item").trigger("sticky_kit:detach");
				$("#sticky_item").trigger("sticky_kit:unstick");

				$("#sticky_item").stick_in_parent();
			}




		});

		$('.sticky-parent').css('height', h);

		$("#sticky_item").stick_in_parent();

	};

	var owlCrouselFeatureSlide = function () {
		$('.owl-carousel').owlCarousel({
			animateOut: 'fadeOut',
			animateIn: 'fadeIn',
			autoplay: true,
			loop: true,
			margin: 0,
			nav: true,
			dots: false,
			autoHeight: true,
			items: 1,
			navText: [
				"<i class='icon-arrow-left3 owl-direction'></i>",
				"<i class='icon-arrow-right3 owl-direction'></i>"
			]
		})
	};

	// Document on load.
	$(function () {
		// fullHeight();
		counter();
		counterWayPoint();
		contentWayPoint();
		burgerMenu();
		mobileMenuOutsideClick();
		sliderMain();
		stickyFunction();
		owlCrouselFeatureSlide();


		$(".js-wonder-nav-toggle").on("click", function () {
			$(this).next("#wonder-aside").toggleClass("menu-active");
		});

		// Select all anchor links that start with #
		$("a[href^='#']").on("click", function (e) {
			e.preventDefault(); // prevent default jump

			var target = this.hash; // get the section ID
			var $target = $(target);
			var offset = 55;

			$("html, body").animate(
				{
					scrollTop: $target.offset().top- offset
				},
				800, // duration in ms
				"swing" // easing
			);
		});

		
		// Modal toggle
const modal = document.getElementById("enquiryModal");
const closeBtn = document.querySelector(".close");

// Attach to all elements with class 'openEnquiry'
document.querySelectorAll(".openEnquiry").forEach(btn => {
  btn.addEventListener("click", () => {
    modal.style.display = "block";
  });
});

closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

// Form submit to Google Sheets
document.getElementById("enquiryForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const formData = new FormData(this);

  fetch("https://script.google.com/macros/s/AKfycbwU3U7kdDVX5CUn5a62KaIsHcdxQdMWx8y2QRjyKdZ6WlcDiiRGMQkhQ41-Ah7e4xt9JA/exec", {
    method: "POST",
    body: formData
  })
  .then(response => alert("Form submitted successfully!"))
  .catch(error => alert("Error submitting form."));
});


		
	});


}());