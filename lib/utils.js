"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addInputMode = addInputMode;
exports.applyThousandSeparator = applyThousandSeparator;
exports.charIsNumber = charIsNumber;
exports.clamp = clamp;
exports.escapeRegExp = escapeRegExp;
exports.findChangedIndex = findChangedIndex;
exports.fixLeadingZero = fixLeadingZero;
exports.fixMinimumDecimalScale = fixMinimumDecimalScale;
exports.fixTrailingZeros = fixTrailingZeros;
exports.getCurrentCaretPosition = getCurrentCaretPosition;
exports.getThousandsGroupRegex = getThousandsGroupRegex;
exports.limitToScale = limitToScale;
exports.noop = noop;
exports.omit = omit;
exports.returnTrue = returnTrue;
exports.roundToPrecision = roundToPrecision;
exports.setCaretPosition = setCaretPosition;
exports.splitDecimal = splitDecimal;
// basic noop function
function noop() {}
function returnTrue() {
  return true;
}
function charIsNumber(_char) {
  return !!(_char || '').match(/\d/);
}
function escapeRegExp(str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}
function getThousandsGroupRegex(thousandsGroupStyle) {
  switch (thousandsGroupStyle) {
    case 'lakh':
      return /(\d+?)(?=(\d\d)+(\d)(?!\d))(\.\d+)?/g;
    case 'wan':
      return /(\d)(?=(\d{4})+(?!\d))/g;
    case 'thousand':
    default:
      return /(\d)(?=(\d{3})+(?!\d))/g;
  }
}
function applyThousandSeparator(str, thousandSeparator, thousandsGroupStyle) {
  var thousandsGroupRegex = getThousandsGroupRegex(thousandsGroupStyle);
  var index = str.search(/[1-9]/);
  index = index === -1 ? str.length : index;
  return str.substring(0, index) + str.substring(index, str.length).replace(thousandsGroupRegex, '$1' + thousandSeparator);
}

//spilt a float number into different parts beforeDecimal, afterDecimal, and negation
function splitDecimal(numStr) {
  var allowNegative = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var hasNagation = numStr[0] === '-';
  var addNegation = hasNagation && allowNegative;
  numStr = numStr.replace('-', '');
  var parts = numStr.split('.');
  var beforeDecimal = parts[0];
  var afterDecimal = parts[1] || '';
  return {
    beforeDecimal: beforeDecimal,
    afterDecimal: afterDecimal,
    hasNagation: hasNagation,
    addNegation: addNegation
  };
}
function fixLeadingZero(numStr) {
  if (!numStr) return numStr;
  var isNegative = numStr[0] === '-';
  if (isNegative) numStr = numStr.substring(1, numStr.length);
  var parts = numStr.split('.');
  var beforeDecimal = parts[0].replace(/^0+/, '') || '0';
  var afterDecimal = parts[1] || '';
  return "".concat(isNegative ? '-' : '').concat(beforeDecimal).concat(afterDecimal ? ".".concat(afterDecimal) : '');
}
function fixTrailingZeros(numStr) {
  if (!numStr) return numStr;
  var isNegative = numStr[0] === '-';
  if (isNegative) numStr = numStr.substring(1, numStr.length);
  var parts = numStr.split('.');
  var beforeDecimal = parts[0] || '0';
  var afterDecimal = parts[1] ? parts[1].replace(/0+$/, '') : '';
  return "".concat(isNegative ? '-' : '').concat(beforeDecimal).concat(afterDecimal ? ".".concat(afterDecimal) : '');
}
function fixMinimumDecimalScale(numStr, minimumDecimalScale) {
  if (!numStr || minimumDecimalScale < 0) return numStr;
  var isNegative = numStr[0] === '-';
  if (isNegative) numStr = numStr.substring(1, numStr.length);
  var parts = numStr.split('.');
  var beforeDecimal = parts[0] || '0';
  var afterDecimal = '';
  if (parts[1]) {
    afterDecimal = parts[1].length < minimumDecimalScale ? parts[1].concat(new Array(minimumDecimalScale - parts[1].length).fill('0').join('')) : parts[1];
  } else {
    afterDecimal = new Array(minimumDecimalScale).fill('0').join('');
  }
  return "".concat(isNegative ? '-' : '').concat(beforeDecimal).concat(afterDecimal ? ".".concat(afterDecimal) : '');
}

/**
 * limit decimal numbers to given scale
 * Not used .fixedTo because that will break with big numbers
 */
function limitToScale(numStr, scale, fixedDecimalScale) {
  var str = '';
  var filler = fixedDecimalScale ? '0' : '';
  for (var i = 0; i <= scale - 1; i++) {
    str += numStr[i] || filler;
  }
  return str;
}

/**
 * This method is required to round prop value to given scale.
 * Not used .round or .fixedTo because that will break with big numbers
 */
function roundToPrecision(numStr, scale, fixedDecimalScale) {
  //if number is empty don't do anything return empty string
  if (['', '-'].indexOf(numStr) !== -1) return numStr;
  var shoudHaveDecimalSeparator = numStr.indexOf('.') !== -1 && scale;
  var _splitDecimal = splitDecimal(numStr),
    beforeDecimal = _splitDecimal.beforeDecimal,
    afterDecimal = _splitDecimal.afterDecimal,
    hasNagation = _splitDecimal.hasNagation;
  var roundedDecimalParts = parseFloat("0.".concat(afterDecimal || '0')).toFixed(scale).split('.');
  var intPart = beforeDecimal.split('').reverse().reduce(function (roundedStr, current, idx) {
    if (roundedStr.length > idx) {
      return (Number(roundedStr[0]) + Number(current)).toString() + roundedStr.substring(1, roundedStr.length);
    }
    return current + roundedStr;
  }, roundedDecimalParts[0]);
  var decimalPart = limitToScale(roundedDecimalParts[1] || '', Math.min(scale, afterDecimal.length), fixedDecimalScale);
  var negation = hasNagation ? '-' : '';
  var decimalSeparator = shoudHaveDecimalSeparator ? '.' : '';
  return "".concat(negation).concat(intPart).concat(decimalSeparator).concat(decimalPart);
}
function omit(obj, keyMaps) {
  var filteredObj = {};
  Object.keys(obj).forEach(function (key) {
    if (!keyMaps[key]) filteredObj[key] = obj[key];
  });
  return filteredObj;
}

/** set the caret positon in an input field **/
function setCaretPosition(el, caretPos) {
  el.value = el.value;
  // ^ this is used to not only get "focus", but
  // to make sure we don't have it everything -selected-
  // (it causes an issue in chrome, and having it doesn't hurt any other browser)
  if (el !== null) {
    if (el.createTextRange) {
      var range = el.createTextRange();
      range.move('character', caretPos);
      range.select();
      return true;
    }
    // (el.selectionStart === 0 added for Firefox bug)
    if (el.selectionStart || el.selectionStart === 0) {
      el.focus();
      el.setSelectionRange(caretPos, caretPos);
      return true;
    }

    // fail city, fortunately this never happens (as far as I've tested) :)
    el.focus();
    return false;
  }
}

/**
  Given previous value and newValue it returns the index
  start - end to which values have changed.
  This function makes assumption about only consecutive
  characters are changed which is correct assumption for caret input.
*/
function findChangedIndex(prevValue, newValue) {
  var i = 0,
    j = 0;
  var prevLength = prevValue.length;
  var newLength = newValue.length;
  while (prevValue[i] === newValue[i] && i < prevLength) i++;

  //check what has been changed from last
  while (prevValue[prevLength - 1 - j] === newValue[newLength - 1 - j] && newLength - j > i && prevLength - j > i) {
    j++;
  }
  return {
    start: i,
    end: prevLength - j
  };
}

/*
  Returns a number whose value is limited to the given range
*/
function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}
function getCurrentCaretPosition(el) {
  /*Max of selectionStart and selectionEnd is taken for the patch of pixel and other mobile device caret bug*/
  return Math.max(el.selectionStart, el.selectionEnd);
}
function addInputMode(format) {
  return format || !(navigator.platform && /iPhone|iPod/.test(navigator.platform));
}