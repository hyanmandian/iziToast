import "assets/stylesheets/index.css";
import { 
	PLUGIN_NAME,
	DEFAULT_OPTIONS,
	THEMES,
	COLORS,
} from "../config/constants/plugin";
import { 
	isMobile,
	createFragElem,
	forEach,
	prefixer,
	isColor,
} from "./utils";

const toastPrefixer = prefixer(PLUGIN_NAME);

export default function iziToast(options = {}) {
	let iziToastOptions = Object.assign(DEFAULT_OPTIONS, options);

	const methods = {};

	forEach(THEMES, (name, theme) => {
		methods[name] = (options) => {
			methods.show(Object.assign(iziToastOptions, theme, options));
		}
	});

	methods.destroy = () => {
		forEach(document.querySelectorAll(`.${toastPrefixer("wrapper")}`), element => element.remove());
		forEach(document.querySelectorAll(`.${PLUGIN_NAME}`), element => element.remove());

		document.removeEventListener(toastPrefixer("open"));
		document.removeEventListener(toastPrefixer("close"));

		iziToastOptions = DEFAULT_OPTIONS;
	}

	function createCapsule() {
		const element = document.createElement("div");
		element.classList.add(`.${toastPrefixer("capsule")}`);
	
		return element;
	}

	function createToast() {
		const element = document.createElement("div");
		element.classList.add(PLUGIN_NAME);
	
		return element;
	}

	function createCover(img) {
		const element = document.createElement("div");
		element.classList.add(toastPrefixer("cover"));
		element.style.width = `${options.imageWidth}px`;
		element.style.backgroundImage = `url(${options.image})`;
		
		return element;
	}

	function createCloseButton() {
		const element = document.createElement("button");
		element.classList.add(toastPrefixer("close"));

		return element;
	}

	function createProgressBar(color) {
		const elementWrapper = document.createElement("div");
		elementWrapper.classList.add(toastPrefixer("progressbar"));

		const element = document.createElement("div");
		element.style.background = color;

		elementWrapper.appendChild(element);

		return elementWrapper;
	}

	function createBody() {
		const element = document.createElement("div");
		element.classList.add(toastPrefixer("body"));

		return element;
	}

	function createIcon(icon, text, color) {
		const element = document.createElement("i");
		element.classList.add(`${toastPrefixer("icon")} ${icon}`);
		
		if (text){
			element.appendChild(document.createTextNode(text));
		}

		if (color){
			element.style.color = color;
		}

		return element;
	}

	function moveProgress(toast, options, callback){
		const element = toast.querySelector(`.${toastPrefixer("progressbar")} div`);
		
		let isPaused = false;
		let isReseted = false;
		let isClosed = false;
		let timerTimeout = null;

		const progressBar = {
			hideEta: null,
			maxHideTime: null,
			currentTime: new Date().getTime(),
			updateProgress() {
				isPaused = toast.classList.contains(toastPrefixer("paused")) ? true : false;
				isReseted = toast.classList.contains(toastPrefixer("reseted")) ? true : false;
				isClosed = toast.classList.contains(toastPrefixer("closed")) ? true : false;

				if(isReseted){
					clearTimeout(timerTimeout);
					element.style.width = '100%';
					moveProgress(toast, options, callback);
					toast.classList.remove(toastPrefixer("reseted"));
				}

				if(isClosed){
					clearTimeout(timerTimeout);
					toast.classList.remove(toastPrefixer("closed"));
				}

				if(!isPaused && !isReseted && !isClosed){
					progressBar.currentTime+= 10;
					const percentage = ((progressBar.hideEta - (progressBar.currentTime)) / progressBar.maxHideTime) * 100;
					
					element.style.width = `${percentage}%`;

					if(Math.round(percentage) < 0 || typeof toast != 'object'){
						clearTimeout(timerTimeout);
						callback.apply();
					}
				}
			}
		};

		if (options.timeout > 0) {
			progressBar.maxHideTime = parseFloat(options.timeout);
			progressBar.hideEta = new Date().getTime() + progressBar.maxHideTime;
			timerTimeout = setInterval(progressBar.updateProgress, 10);
		}
	}

	methods.show = (options = {}) => {
		options = Object.assing(this.options, options);

		const $toast = createToast();
		const $toastCapsule = createCapsule();

		if(isMobile() && options.transitionInMobile.length){
			$toast.classList.add(options.transitionInMobile);
		} else if(options.transitionIn.length) {
			$toast.classList.add(options.transitionIn);
		}

		if(options.rtl){
			$toast.classList.add(`.${toastPrefixer("rtl")}`);
		}

		if (options.color.length) {
			if(isColor(options.color)){
				$toast.style.background = options.color;
			} else if(COLORS.indexOf(options.color)) {
				$toast.classList.add(toastPrefixer(`color-${options.color}`));
			}
		}

		if (options.class){
			$toast.classList.add(options.class);
		}

		const $toastBody = createBody();

		if (options.image) {
			const $cover = createCover(options.image);
			$cover.appendChild($cover);

			$toastBody.style[options.rtl ? "marginRight" : "marginLeft"] = `${options.imageWidth + 10}px`;
		}

		if(options.close){
			const $buttonClose = createCloseButton();
			$toast.appendChild($buttonClose);

			$buttonClose.addEventListener('click', event => methods.hide(options, $toast));
		} else {
			$toast.style[options.rtl ? "paddingLeft" : "paddingRight"] = "30px";
		}

		if (options.progressBar) {
			const $progressBar = createProgressBar(options.progressBarColor);
			$toast.appendChild($progressBar);
			
			setTimeout(() => moveProgress($toast, options, () => methods.hide(options, $toast)), 300);
		} else if( options.progressBar === false && options.timeout > 0){
			setTimeout(() => methods.hide(options, $toast), options.timeout);
		}

		if (options.icon) {
			const $icon = createIcon()
			$toastBody.appendChild($icon);
		}

		var $strong = document.createElement("strong");
			$strong.appendChild(document.createTextNode(options.title));

		var $p = document.createElement("p");
			$p.appendChild(document.createTextNode(options.message));

		
		if(options.layout > 1){
			$p.style.width = "100%";
			$toast.classList.add(PLUGIN_NAME+"-layout"+options.layout);
		}

		if(options.balloon){
			$toast.classList.add(PLUGIN_NAME+"-balloon");
		}

		$toastBody.appendChild($strong);
		$toastBody.appendChild($p);

		var $buttons;
		if (options.buttons.length > 0) {

			$buttons = document.createElement("div");
			$buttons.classList.add(PLUGIN_NAME + '-buttons');

			$p.style.marginRight = '15px';

			var i = 0;
			forEach(options.buttons, function (value, index) {
				$buttons.appendChild(createFragElem(value[0]));

				var $btns = $buttons.childNodes;

				$btns[i].addEventListener('click', function (event) {
					event.preventDefault();
					var ts = value[1];
					return new ts(that, $toast); 
				});

				i++;
			});

			$toastBody.appendChild($buttons);
		}

		$toast.appendChild($toastBody);
		$toastCapsule.style.visibility = 'hidden';
		$toastCapsule.style.height = '0px';
		$toastCapsule.appendChild($toast);

		setTimeout(function() {
			var H = $toast.offsetHeight;
			var style = $toast.currentStyle || window.getComputedStyle($toast);
			var marginTop = style.marginTop;
				marginTop = marginTop.split("px");
				marginTop = parseInt(marginTop[0]);
			var marginBottom = style.marginBottom;
				marginBottom = marginBottom.split("px");
				marginBottom = parseInt(marginBottom[0]);
				
			$toastCapsule.style.visibility = '';
			$toastCapsule.style.height = (H+marginBottom+marginTop)+'px';
			setTimeout(function() {
				$toastCapsule.style.height = 'auto';
			},1000);
		}, 100);

		var position = options.position,
			$wrapper;

			

		if(options.target){

			$wrapper = document.querySelector(options.target);
			$wrapper.classList.add(PLUGIN_NAME + '-target');
			$wrapper.appendChild($toastCapsule);

		} else {
			if(isMobile()){
				if(options.position == "bottomLeft" || options.position == "bottomRight" || options.position == "bottomCenter"){
					position = PLUGIN_NAME+'-wrapper-bottomCenter';
				}
				else if(options.position == "topLeft" || options.position == "topRight" || options.position == "topCenter"){
					position = PLUGIN_NAME+'-wrapper-topCenter';
				}
				else{
					position = PLUGIN_NAME+'-wrapper-center';
				}
			} else {
				position = PLUGIN_NAME+'-wrapper-'+position;
			}
			$wrapper = document.querySelector('.' + PLUGIN_NAME + '-wrapper.'+position);

			if (!$wrapper) {
				$wrapper = document.createElement("div");
				$wrapper.classList.add(PLUGIN_NAME + '-wrapper');
				$wrapper.classList.add(position);
				document.body.appendChild($wrapper);
			}
			if(options.position == "topLeft" || options.position == "topCenter" || options.position == "topRight"){
				$wrapper.insertBefore($toastCapsule, $wrapper.firstChild);
			} else {
				$wrapper.appendChild($toastCapsule);
			}
		}

		options.onOpen.apply();

		try {
			var event;
			if (window.CustomEvent) {
				event = new CustomEvent('iziToast-open', {detail: {class: options.class}});
			} else {
				event = document.createEvent('CustomEvent');
				event.initCustomEvent('iziToast-open', true, true, {class: options.class});
			}
			document.dispatchEvent(event);
		} catch(ex){
			console.warn(ex);
		}

		if(options.animateInside){
			$toast.classList.add(PLUGIN_NAME+'-animateInside');
		
			var timeAnimation1 = 200;
			var timeAnimation2 = 100;
			var timeAnimation3 = 300;
			if(options.transitionIn == "bounceInLeft"){
				timeAnimation1 = 400;
				timeAnimation2 = 200;
				timeAnimation3 = 400;
			}

			window.setTimeout(function(){
				$strong.classList.add('slideIn');
			},timeAnimation1);

			window.setTimeout(function(){
				$p.classList.add('slideIn');
			},timeAnimation2);

			if (options.icon) {
				window.setTimeout(function(){
					$icon.classList.add('revealIn');
				},timeAnimation3);
			}

			if (options.buttons.length > 0 && $buttons) {
				var counter = 150;
				forEach($buttons.childNodes, function(element, index) {

					window.setTimeout(function(){
						element.classList.add('revealIn');
					},counter);
					counter = counter + counter;
				});
			}
		}

		if(options.pauseOnHover){
			
			$toast.addEventListener('mouseenter', function (event) {
				this.classList.add(PLUGIN_NAME+'-paused');
			});
			$toast.addEventListener('mouseleave', function (event) {
				this.classList.remove(PLUGIN_NAME+'-paused');
			});
		}
		if(options.resetOnHover){

			$toast.addEventListener('mouseenter', function (event) {
				this.classList.add(PLUGIN_NAME+'-reseted');
			});
			$toast.addEventListener('mouseleave', function (event) {
				this.classList.remove(PLUGIN_NAME+'-reseted');
			});
		}
	};

	methods.hide = (options, $toast) => {
		options = Object.assing(this.options, options);

		if(typeof $toast != 'object'){
			$toast = document.querySelector($toast);
		}

		$toast.classList.add(PLUGIN_NAME+'-closed');

		if(options.transitionIn || options.transitionInMobile){
			$toast.classList.remove(options.transitionIn, options.transitionInMobile);
		}
		if(options.transitionOut || options.transitionOutMobile){

			if(isMobile()){
				if(options.transitionOutMobile.length>0)
					$toast.classList.add(options.transitionOutMobile);
			} else{
				if(options.transitionOut.length>0)
					$toast.classList.add(options.transitionOut);
			}
			var H = $toast.parentNode.offsetHeight;
					$toast.parentNode.style.height = H+'px';
					$toast.style.pointerEvents = 'none';
			if(isMobile()){

			} else {
				$toast.parentNode.style.transitionDelay = '0.2s';
			}

			setTimeout(function() {
				$toast.parentNode.style.height = '0px';
				window.setTimeout(function(){
					$toast.parentNode.remove();
				},1000);
			},200);

		} else {
			$toast.parentNode.remove();
		}

		if (options.class){
			try {
				var event;
				if (window.CustomEvent) {
					event = new CustomEvent('iziToast-close', {detail: {class: options.class}});
				} else {
					event = document.createEvent('CustomEvent');
					event.initCustomEvent('iziToast-close', true, true, {class: options.class});
				}
				document.dispatchEvent(event);
			} catch(ex){
				console.warn(ex);
			}
		}

		if(typeof options.onClose !== "undefined")
			options.onClose.apply();
	};

	return methods;
}