lightDom - Lightweight Dom library - for modern browsers only
====

Minified version < 6KB


`lightDom` is a lightweight "jQuery" like dom library which is targeting only modern browsers including __iOS__  and __Android__ devices.


`lightDom` brings a complete set of DOM manipulating functions, while remaining light. It finds its place in the projects for which jQuery may be considered too heavy but a DOM library is also needed.


## Build

Build using Grunt or uglifyjs. By default the alias to `$` is not included.
  * `grunt default`: build core + plugins
  * `grunt noPlugin`: includes only core
  * Add `--with_dollar_alias` to include `$` alias.


## Aliases

`lightDom`,`LD` or optionnal `$`.

## Init

Usage is similar to jQuery:
 * Selector: `LD("selector")` or `LD(element)`
 * Creating a new object: `LD("<div></div>")`

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
