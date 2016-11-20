import {
  MOBILE_WIDTH
} from "../config/constants/plugin";

export const isMobile = () => {
  return (/Mobi/.test(navigator.userAgent)) ? true : false || window.innerWidth <= MOBILE_WIDTH;
}

export function noop() {};

export function createFragElem(htmlStr) {
  const frag = document.createDocumentFragment();
  let temp = document.createElement('div');

  temp.innerHTML = htmlStr;

  while (temp.firstChild) {
    frag.appendChild(temp.firstChild);
  }

  return frag;
}

export function forEach(collection, callback, scope) {
  if (Object.prototype.toString.call(collection) === '[object Object]') {
    for (var prop in collection) {
      if (Object.prototype.hasOwnProperty.call(collection, prop)) {
        callback.call(scope, collection[prop], prop, collection);
      }
    }
  } else if (collection) {
    for (var i = 0, len = collection.length; i < len; i++) {
      callback.call(scope, collection[i], i, collection);
    }
  }
};

export const prefixer = prefix => str => `${prefix}-${str}`;

export const isRGB = color => color.substring(0, 3) == "rgb";

export const isHexadecimal = color => color.substring(0, 1) == "#";

export const isHSL = color => color.substring(0, 3) == "hsl";

export const isColor = color => isRGB(color) || isHexadecimal(color) || isHSL(color);