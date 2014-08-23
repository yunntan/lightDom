lightDom - Lightweight jQuery like library - for modern browsers only
====

Minified version < 6KB

`lightDom` is a lightweight "jQuery" like dom library which is targeting only modern browsers including __iOS__  and __Android__ devices.


Minified with uglifyjs: `uglifyjs lightDom.js -nmf -o lightDom.min.js`


## Aliases

`lightDom` or `LD`

## Init

Just like jQuery:
 * Selector: `lightDom("selector")` or `lightDom(element)`
 * Creating a new object: `lightDom("<div></div>")`

## Global objects

* `CustomEvent` polyfill

* `lightDom.ajax`: make an Ajax request
* `lightDom.isTouchDevice`: returns a boolean which indicates wether the devices has touch events or not
* `lightDom.extend`: extend the lightDom object.

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
