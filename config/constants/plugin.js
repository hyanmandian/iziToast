import { noop } from "../../src/utils";

export const PLUGIN_NAME = 'iziToast';

export const MOBILE_WIDTH =	568;

export const DEFAULT_OPTIONS = {
	class: '',
	title: '',
	message: '',
	color: '',
	icon: '',
	iconText: '',
	iconColor: '',
	image: '',
	imageWidth: 50,
	layout: 1,
	balloon: false,
	close: true,
	rtl: false,
	position: 'bottomRight',
	target: '',
	timeout: 5000,
	pauseOnHover: true,
	resetOnHover: false,
	progressBar: true,
	progressBarColor: '',
	animateInside: true,
	buttons: {},
	transitionIn: 'fadeInUp',
	transitionOut: 'fadeOut',
	transitionInMobile: 'fadeInUp',
	transitionOutMobile: 'fadeOutDown',
	onOpen: noop,
	onClose: noop,
};

export const COLORS = [
	'red',
	'yellow',
	'blue',
	'green',
	'dark',
];

export const THEMES = {
	info: {
		color: "blue",
		icon: "ico-info"
	},
	success: {
		color: "green",
		icon: "ico-check",
	},
	warning: {
		color: "yellow",
		icon: "ico-warning",
	},
	error: {
		color: "red",
		icon: "ico-error",
	}
};