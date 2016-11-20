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

  const $private = {};
  const $public = {};

  $private.iziToastOptions = Object.assign(DEFAULT_OPTIONS, options);

  $private.createCapsule = () => {
    const element = document.createElement("div");
    element.classList.add(`.${toastPrefixer("capsule")}`);

    return element;
  }

  $private.createToast = () => {
    const element = document.createElement("div");
    element.classList.add(PLUGIN_NAME);

    return element;
  }

  $private.createCover = (img, width) => {
    const element = document.createElement("div");
    element.classList.add(toastPrefixer("cover"));
    element.style.width = `${width}px`;
    element.style.backgroundImage = `url(${image})`;

    return element;
  }

  $private.createCloseButton = () => {
    const element = document.createElement("button");
    element.classList.add(toastPrefixer("close"));

    return element;
  }

  $private.createProgressBar = (color) => {
    const elementWrapper = document.createElement("div");
    elementWrapper.classList.add(toastPrefixer("progressbar"));

    const element = document.createElement("div");
    element.style.background = color;

    elementWrapper.appendChild(element);

    return elementWrapper;
  }

  $private.createBody = () => {
    const element = document.createElement("div");
    element.classList.add(toastPrefixer("body"));

    return element;
  }

  $private.createIcon = (icon, text, color) => {
    const element = document.createElement("i");
    element.classList.add(`${toastPrefixer("icon")} ${icon}`);

    if (text) {
      element.appendChild(document.createTextNode(text));
    }

    if (color) {
      element.style.color = color;
    }

    return element;
  }

  $private.createTitle = (title) => {
    const element = document.createElement("strong");
    element.appendChild(document.createTextNode(title));

    return element;
  }

  $private.createMessage = (message) => {
    const element = document.createElement("p");
    element.appendChild(document.createTextNode(message));

    return element;
  }

  $private.createButtons = (buttons, $toast) => {
    const element = document.createElement("div");
    element.classList.add(toastPrefixer("buttons"));

    forEach(buttons, ([html, callback], index) => {
      element.appendChild(createFragElem(html));

      const elements = element.childNodes;

      elements[index].addEventListener('click', (event) => {
        event.preventDefault();

        return callback(this, $toast);
      });
    });
  }

  $private.createWrapper = (position) => {
    $wrapper = document.createElement("div");
    $wrapper.classList.add(toastPrefixer("wrapper"));
    $wrapper.classList.add(position);
  };

  $private.moveProgress = (toast, options, callback) => {
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

        if (isReseted) {
          clearTimeout(timerTimeout);
          element.style.width = '100%';
          $private.moveProgress(toast, options, callback);
          toast.classList.remove(toastPrefixer("reseted"));
        }

        if (isClosed) {
          clearTimeout(timerTimeout);
          toast.classList.remove(toastPrefixer("closed"));
        }

        if (!isPaused && !isReseted && !isClosed) {
          progressBar.currentTime += 10;
          const percentage = ((progressBar.hideEta - (progressBar.currentTime)) / progressBar.maxHideTime) * 100;

          element.style.width = `${percentage}%`;

          if (Math.round(percentage) < 0 || typeof toast != 'object') {
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

  forEach(THEMES, (name, theme) => {
    $public[name] = (options) => {
      $public.show(Object.assign(iziToastOptions, theme, options));
    }
  });

  $public.destroy = () => {
    forEach(document.querySelectorAll(`.${toastPrefixer("wrapper")}`), element => element.remove());
    forEach(document.querySelectorAll(`.${PLUGIN_NAME}`), element => element.remove());

    document.removeEventListener(toastPrefixer("open"));
    document.removeEventListener(toastPrefixer("close"));

    $private.iziToastOptions = DEFAULT_OPTIONS;
  }

  $public.show = (options = {}) => {
      options = Object.assing($private.iziToastOptions, options);

      const $toast = $private.createToast();
      const $toastCapsule = $private.createCapsule();

      if (isMobile() && options.transitionInMobile.length) {
        $toast.classList.add(options.transitionInMobile);
      } else if (options.transitionIn.length) {
        $toast.classList.add(options.transitionIn);
      }

      if (options.rtl) {
        $toast.classList.add(`.${toastPrefixer("rtl")}`);
      }

      if (options.color.length) {
        if (isColor(options.color)) {
          $toast.style.background = options.color;
        } else if (COLORS.indexOf(options.color)) {
          $toast.classList.add(toastPrefixer(`color-${options.color}`));
        }
      }

      if (options.class) {
        $toast.classList.add(options.class);
      }

      const $toastBody = $private.createBody();

      if (options.image) {
        const $cover = $private.createCover(options.image, options.imageWidth);
        $cover.appendChild($cover);

        $toastBody.style[options.rtl ? "marginRight" : "marginLeft"] = `${options.imageWidth + 10}px`;
      }

      if (options.close) {
        const $buttonClose = $private.createCloseButton();
        $toast.appendChild($buttonClose);

        $buttonClose.addEventListener('click', event => $public.hide(options, $toast));
      } else {
        $toast.style[options.rtl ? "paddingLeft" : "paddingRight"] = "30px";
      }

      if (options.progressBar) {
        const $progressBar = $private.createProgressBar(options.progressBarColor);
        $toast.appendChild($progressBar);

        setTimeout(() => $private.moveProgress($toast, options, () => $public.hide(options, $toast)), 300);
      } else if (options.progressBar === false && options.timeout > 0) {
        setTimeout(() => $public.hide(options, $toast), options.timeout);
      }

      if (options.icon) {
        const $icon = $private.createIcon(options.icon, options.iconText, options.iconColor);
        $toastBody.appendChild($icon);
      }

      const $strong = $private.createTitle(options.title);

      const $p = $private.createMessage(options.message);

      if (options.layout > 1) {
        $p.style.width = "100%";
        $toast.classList.add(toastPrefixer(`layout${options.layout}`));
      }

      if (options.balloon) {
        $toast.classList.add(toastPrefixer("balloon"));
      }

      $toastBody.appendChild($strong);
      $toastBody.appendChild($p);

      let $buttons;

      if (options.buttons.length) {
        $buttons = $private.createButtons(options.buttons, $toast);
        $p.style.marginRight = '15px';
        $toastBody.appendChild($buttons);
      }

      $toast.appendChild($toastBody);
      $toastCapsule.style.visibility = 'hidden';
      $toastCapsule.style.height = '0px';
      $toastCapsule.appendChild($toast);

      setTimeout(() => {
        const height = $toast.offsetHeight;
        const style = $toast.currentStyle || window.getComputedStyle($toast);
        const marginTop = parseInt(style.marginTop.split("px")[0]);
        const marginBottom = parseInt(style.marginBottom.split("px")[0]);

        $toastCapsule.style.visibility = '';
        $toastCapsule.style.height = `${height + marginBottom+marginTop}px`;

        setTimeout(() => $toastCapsule.style.height = 'auto', 1000);
      }, 100);

      let position = toastPrefixer(`wrapper-${options.position}`);
      let $wrapper;

      if (options.target) {
        $wrapper = document.querySelector(options.target);
        $wrapper.classList.add(toastPrefixer("target"));
        $wrapper.appendChild($toastCapsule);
      } else {
        if (isMobile()) {
          position = toastPrefixer("wrapper-center");

          if (options.position == "bottomLeft" || options.position == "bottomRight" || options.position == "bottomCenter") {
            position = toastPrefixer("wrapper-bottomCenter");
          } else if (options.position == "topLeft" || options.position == "topRight" || options.position == "topCenter") {
            position = toastPrefixer("wrapper-topCenter");
          }
        }

        $wrapper = document.querySelector(`.${toastPrefixer(`wrapper.${position}`)}`);

			if (!$wrapper) {
				$wrapper = $private.createWrapper(position);
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
			$toast.classList.add(toastPrefixer("animateInside"));
		
			const timeAnimation1 = options.transitionIn === "bounceInLeft" ? 400 : 200;
			const timeAnimation2 = options.transitionIn === "bounceInLeft" ? 200 : 100;
			const timeAnimation3 = options.transitionIn === "bounceInLeft" ? 400 : 300;

			setTimeout(() => $strong.classList.add('slideIn'), timeAnimation1);

			setTimeout(() => $p.classList.add('slideIn'), timeAnimation2);

			if (options.icon) {
				setTimeout(() => $icon.classList.add('revealIn'), timeAnimation3);
			}

			if (options.buttons.length > 0 && $buttons) {
				let counter = 150;

				forEach($buttons.childNodes, (element) => {
					setTimeout(() => element.classList.add('revealIn'), counter);
					counter = counter + counter;
				});
			}
		}

		if(options.pauseOnHover){
			$toast.addEventListener('mouseenter', function (event) {
				this.classList.add(toastPrefixer("paused"));
			});
			$toast.addEventListener('mouseleave', function (event) {
				this.classList.remove(toastPrefixer("paused"));
			});
		}

		if(options.resetOnHover){
			$toast.addEventListener('mouseenter', function (event) {
				this.classList.add(toastPrefixer("reseted"));
			});
			$toast.addEventListener('mouseleave', function (event) {
				this.classList.remove(toastPrefixer("reseted"));
			});
		}
	};

	$public.hide = (options, $toast) => {
		options = Object.assing($private.iziToastOptions, options);

		if(typeof $toast != 'object'){
			$toast = document.querySelector($toast);
		}

		$toast.classList.add(toastPrefixer("closed"));

		if (options.transitionIn || options.transitionInMobile){
			$toast.classList.remove(options.transitionIn, options.transitionInMobile);
		}

		if (options.transitionOut || options.transitionOutMobile) {
			if(isMobile()){
				if(options.transitionOutMobile.length)
					$toast.classList.add(options.transitionOutMobile);
			} else if(options.transitionOut.length) {
				$toast.classList.add(options.transitionOut);
			}

			const height = $toast.parentNode.offsetHeight;
			$toast.parentNode.style.height = `${height}px`;
			$toast.style.pointerEvents = 'none';

			if(!isMobile()){
				$toast.parentNode.style.transitionDelay = '0.2s';
			}

			setTimeout(() => {
				$toast.parentNode.style.height = '0px';
				setTimeout(() => $toast.parentNode.remove(), 1000);
			}, 200);
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

	return $public;
}