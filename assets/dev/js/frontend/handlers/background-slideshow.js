export default class BackgroundSlideshow extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			classes: {
				swiperContainer: 'elementor-background-slideshow swiper-container',
				swiperWrapper: 'swiper-wrapper',
				swiperSlide: 'elementor-background-slideshow__slide swiper-slide',
				swiperSlideInner: 'elementor-background-slideshow__slide__image',
				kenBurns: 'elementor-ken-burns',
				kenBurnsActive: 'elementor-ken-burns--active',
				kenBurnsIn: 'elementor-ken-burns--in',
				kenBurnsOut: 'elementor-ken-burns--out',
			},
		};
	}

	getSwiperOptions() {
		const elementSettings = this.getElementSettings(),
			kenBurnsActiveClass = this.getSettings( 'classes.kenBurnsActive' );

		const swiperOptions = {
			grabCursor: false,
			slidesPerView: 1,
			slidesPerGroup: 1,
			loop: 'yes' === elementSettings.background_slideshow_loop,
			speed: elementSettings.background_slideshow_transition_duration,
			autoplay: {
				delay: elementSettings.background_slideshow_slide_duration,
				stopOnLastSlide: ! elementSettings.background_slideshow_loop,
			},
			on: {
				slideChange: function() {
					if ( this.$activeImage ) {
						this.$activeImage.removeClass( kenBurnsActiveClass );
					}

					this.$activeImage = jQuery( this.slides[ this.activeIndex ] ).children();

					this.$activeImage.addClass( kenBurnsActiveClass );
				},
			},
		};

		if ( 'yes' === elementSettings.background_slideshow_loop ) {
			swiperOptions.loopedSlides = this.getSlidesCount();
		}

		switch ( elementSettings.background_slideshow_slide_transition ) {
			case 'fade':
				swiperOptions.effect = 'fade';
				swiperOptions.fadeEffect = {
					crossFade: true,
				};
				break;
			case 'slide_down':
				swiperOptions.autoplay.reverseDirection = true;
			case 'slide_up':
				swiperOptions.direction = 'vertical';
				break;
		}

		return swiperOptions;
	}

	getSlidesCount() {
		return this.elements.$slides.length;
	}

	buildSwiperElements() {
		const classes = this.getSettings( 'classes' ),
			elementSettings = this.getElementSettings(),
			direction = 'slide_left' === elementSettings.background_slideshow_slide_transition ? 'ltr' : 'rtl',
			$container = jQuery( '<div>', { class: classes.swiperContainer, dir: direction } ),
			$wrapper = jQuery( '<div>', { class: classes.swiperWrapper } ),
			kenBurnsActive = elementSettings.background_slideshow_ken_burns;

		let slideInnerClass = classes.swiperSlideInner;

		if ( kenBurnsActive ) {
			slideInnerClass += ' ' + classes.kenBurns;

			const kenBurnsDirection = 'in' === elementSettings.background_slideshow_ken_burns_zoom_direction ? 'kenBurnsIn' : 'kenBurnsOut';

			slideInnerClass += ' ' + classes[ kenBurnsDirection ];
		}

		this.elements.$slides = jQuery();

		elementSettings.background_slideshow_gallery.forEach( ( slide ) => {
			const $slide = jQuery( '<div>', { class: classes.swiperSlide } ),
				$slidebg = jQuery( '<div>', {
					class: slideInnerClass,
					style: 'background-image: url("' + slide.url + '");',
				} );

			$slide.append( $slidebg );
			$wrapper.append( $slide );

			this.elements.$slides = this.elements.$slides.add( $slide );
		} );

		$container.append( $wrapper );

		this.$element.prepend( $container );

		this.elements.$backgroundSlideShowContainer = $container;
	}

	initSlider() {
		if ( 1 >= this.getSlidesCount() ) {
			return;
		}

		this.swiper = new Swiper( this.elements.$backgroundSlideShowContainer, this.getSwiperOptions() );
	}

	activate() {
		this.buildSwiperElements();

		this.initSlider();
	}

	deactivate() {
		if ( this.swiper ) {
			this.swiper.destroy();

			this.elements.$backgroundSlideShowContainer.remove();
		}
	}

	run() {
		if ( 'slideshow' === this.getElementSettings( 'background_background' ) ) {
			this.activate();
		} else {
			this.deactivate();
		}
	}

	onInit() {
		super.onInit();

		if ( this.getElementSettings( 'background_slideshow_gallery' ) ) {
			this.run();
		}
	}

	onDestroy() {
		super.onDestroy();

		this.deactivate();
	}

	onElementChange( propertyName ) {
		if ( 'background_background' === propertyName ) {
			this.run();
		}
	}
}
