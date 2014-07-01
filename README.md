$_li - Lightweight jQuery like library - for modern browsers only
====

Minified version < 9KB

`$_li` is a lightweight "jQuery" like dom library which is targeting only modern browsers including __iOS__  and __Android__ devices.

Minified with uglifyjs: `uglifyjs $_li.js -o $_li.min.js`


## Init

Just like jQuery:
 * Selector: $_li("selector") or $_li(element)
 * Creating a new object: $_li("HTML String")

## Global objects

* $_li.Ajax
* $_li.isTouchDevice

## Member functions

* each
* find
* parent
* addClass
* removeClass
* hasClass
* attr
* css
* bind
* unbind
* append
* prepend
* html
* text
* width
* outerWidth
* height
* outerHeight
* position
* hover
* draggable