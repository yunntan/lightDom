(function (window, document, undefined) {
    // CustomEvent polyfill
    (function () {
        /**
         * Custom Event Polyfill
         * @function CustomEvent
         * @param {string} event - Event name
         * @param {object} params - parameters to pass to the event callback
         * @returns CustomEvent
         */
        function CustomEvent(event, params) {
            params = params || {bubbles: false, cancelable: false, detail: undefined};
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }

        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    })();


    // Only needed for the console css
    var is_chrome = typeof window.chrome == "undefined";
    // Display color if available
    function customLog(data, css) {
        if (is_chrome)
            console.log('%c' + data, css || '');
        else
            console.log(data);
    }


    ///**
    // * Creates an instance of a Cube animation
    // * @class
    // * @name LD
    // */
    /**
     * @type {LD}
     */
    var lightDom  = function (selector){
        return new DomHelper(selector);
    };

    /**
     * Extends the LD prototype
     * @function extend
     * @memberof LD
     * @param {Object} extendingObj
     */
    lightDom.extend = function (extendingObj) {
        for (var i in  extendingObj) {
            DomHelper.prototype[i] = extendingObj[i];
        }
    };


    /**
     * Sends an ajax request
     * @method ajax
     * @memberof LD
     * @param {Object} params
     */
    lightDom.ajax = function (params) {
        var request = params.crossDomain ? createCORSRequest() : new XMLHttpRequest(),
            async = params.hasOwnProperty('async') ? params.async : true;

        request.open(
            params.type || 'GET',
            params.url,
            async
        );

        var needJSONParsing = false;
        try {   // ResponseType is fairly new, so does not work everywhere
            request.responseType = params.dataType || "";
        }
        catch (e) {
            customLog("Could not set responseType", 'color:red');
            needJSONParsing = (params.dataType || "") == "json";
        }

        request.onreadystatechange = function () {
            if (request) {
                if (request.readyState == 4 && request.status == 200) {
                    params.success(needJSONParsing || (params.dataType == "json" && typeof request.response != 'object') ? JSON.parse(request.response) : request.response);
                }
                else if (request.status >= 400 && request.readyState == 4) {
                    params.error(request, request.status, request.statusText);
                }
            }
        };

        request.onprogress = params.progress || null;
        request.onerror = request.ontimeout = params.error || null;

        if (async)
            request.timeout = params.timeout || null;

        // Send request
        request.send();


        function createCORSRequest() {
            var xhr = new XMLHttpRequest();
            if ("withCredentials" in xhr) {
            } else if (typeof XDomainRequest != "undefined") {
                xhr = new XDomainRequest();
            } else {
                xhr = null;
            }
            return xhr;
        }
    };

    /**
     * Wether the device support touch or not
     * @name isTouchDevice
     * @memberof LD
     */
    lightDom.isTouchDevice = ('ontouchstart' in document.documentElement );


    /**
     * @constructs LD
     * @param {Object} selector
     */
    function DomHelper(selector) {
        this.init(selector);
    }

    // Pass a parameter that can be wether a String, a DomHelper or DOM node
    function getElementsFromParameter(selector) {
        if (selector instanceof DomHelper)
            return selector.node;

        // String == selector || HTML string
        if (typeof selector == "string") {
            var tmp = document.createElement("div");
            tmp.className = "ldDiv";
            tmp.innerHTML = selector;
            var findMe = tmp.querySelectorAll('.ldDiv > *');

            if (findMe.length == 0)                                // If no child created by innerHTML -> We assume we're selecting in the document
                return document.querySelectorAll(selector);
            else                                                    // Else the string has created nodes, so we return this new object
                return findMe;
        }
        else if (selector.length)   // DOM nodes array passed in param TODO: find a better way to check: typeof Array does not work, and Object.prototype.toString.call(o) === '[object Array]' neither
            return selector;
        else
            return [selector];  // Single dom node passed in param
    }


    /**
     * Init LD Object
     * @method init
     * @memberof LD
     * @instance
     */
    DomHelper.prototype.init = function (selector) {
        if (selector)
            this.node = getElementsFromParameter(selector);
        else
            this.node = getElementsFromParameter('body');

        this.length = this.node.length;
    };


    /**
     * Return a node at a given index
     * @method get
     * @memberof LD
     * @instance
     * @param {number} index
     * @return {NodeList} node - DOM node at given index
     */
    DomHelper.prototype.get = function (index) {
        return this.node[index] || null;
    };


    /**
     * Execute a function for each of the nodes
     * @method each
     * @memberof LD
     * @instance
     * @param {function} callback
     */
    DomHelper.prototype.each = function (callback) {
        for (var i = 0; i < this.length; i++) {
            callback.apply(this.node[i]);
        }
    };

    /**
     * Search the each node elements given selector
     * @method find
     * @memberof LD
     * @instance
     * @param {string} selector
     * @return {LD} foundNode
     */
    DomHelper.prototype.find = function (selector) {
        var nodes = [];
        this.each(function findSelected() {
            var children = this.querySelectorAll(selector);
            for (var i = 0; i < children.length; i++)
                nodes.push(children[i])
        });
        return lightDom(nodes);
    };


    /**
     * Return parent of the first node of the object
     * @method parent
     * @memberof LD
     * @instance
     * @return {LD} parent node
     */
    DomHelper.prototype.parent = function () {
        return lightDom(this.node[0].parentNode);
    };


    /**
     * Add classes passed as parameter
     * @method addClass
     * @memberof LD
     * @instance
     * @param {string} newClassName
     */
    DomHelper.prototype.addClass = function (newClassName) {
        this.each(function addClassToNode() {
            this.classList.add(newClassName);
           // this.className = (this.className + " " + newClassName).replace(/^\s\s*/, '').replace(/\s\s*$/, ''); // Avoid spaces at beginning and end
        });
    };


    /**
     * Remove ONE class
     * @method removeClass
     * @memberof LD
     * @instance
     * @param {string} removeClassName
     */
    DomHelper.prototype.removeClass = function (removeClassName) {
        this.each(function removeClassOnNode() {
            this.classList.remove(removeClassName);
            //var classes = " " + this.className + " ";
            //if (classes.indexOf(removeClassName + " ") != -1) // Secure in order to avoid replacing class that would have similar names
            //    this.className = classes.replace(removeClassName + " ", "").replace(/^\s\s*/, '').replace(/\s\s*$/, '');
            //if (classes.indexOf(" " + removeClassName) != -1)
            //    this.className = classes.replace(" " + removeClassName, "").replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        });
    };


    /**
     * Check if first dom has a class
     * @method hasClass
     * @memberof LD
     * @instance
     * @param {string} selector
     * @return {boolean} hasClass
     */
    DomHelper.prototype.hasClass = function (selector) {
        return this.node[0].classList.contains(selector);
        // return (" " + this.node[0].className + " ").replace(/[\t\r\n\f]/g, " ").indexOf(" " + selector + " ") >= 0;
    };


    /**
     * Return or set an attribute
     * @method attr
     * @memberof LD
     * @instance
     * @param  {string} name
     * @param  {string} value
     * @return {string} attributeValue
     */
    DomHelper.prototype.attr = function (name, value) {
        if (value)
            this.each(function () {
                this.setAttribute(name, value);
            });
        else
            return this.node[0].getAttribute(name);
    };


    /**
     * Remove an attribute
     * @method removeAttr
     * @memberof LD
     * @instance
     * @param  {string} name
     */
    DomHelper.prototype.removeAttr = function (name) {
        this.each(function removeAttributeFromNode() {
            this.removeAttribute(name);
        });
    };


    /**
     * Add css properties || return the computed value of a css property
     * @method css
     * @memberof LD
     * @instance
     * @param  {(string|object)} css - Name of the css property if dictionnary of property-value
     * @param  {string} val
     */
    DomHelper.prototype.css = function (css, val) {
        if (typeof css == "string" && val)        // Single prop
            this.each(function setStye() {
                this.style[css] = val.toString();
            });
        else if (typeof css == "object")    // prop dictionary passed
            this.each(function setStyle() {
                for (var i in css)
                    this.style[i] = css[i].toString();
            });
        else if (typeof css == "string" && typeof val == "undefined") { // asking for a value, return the value of the first element
            return getComputedStyle(this.node[0]).getPropertyValue(css)
        }
    };


    /**
     * Bind event(s) on each node
     * @method bind
     * @memberof LD
     * @instance
     * @param  {string}   eventsString
     * @param  {function} callback
     */
    DomHelper.prototype.bind = function (eventsString, callback) {
        var splited = eventsString.split(" ");
        this.each(function bindEvent() {
            for (var i = 0; i < splited.length; i++)
                this.addEventListener(splited[i], callback);
        });
    };


    /**
     * Unbind event(s) on each node
     * @method unbind
     * @memberof LD
     * @instance
     * @param  {string}   eventsString
     * @param  {function} callback
     */
    DomHelper.prototype.unbind = function (eventsString, callback) {
        var splited = eventsString.split(" ");
        this.each(function unbindEvent() {
            for (var i = 0; i < splited.length; i++)
                this.removeEventListener(splited[i], callback);
        });
    };



    /**
     * Append to THE FIRST node of this object.
     * Accept multiple args
     * @method append
     * @memberof LD
     * @instance
     * @param  {(string|LD|NodeList|NodeList[])}   contentToAppend
     */
    DomHelper.prototype.append = function (contentToAppend) {
        for (var j = 0; j < arguments.length; j++) {
            var doms = getElementsFromParameter(arguments[j]);
            for (var i = 0; i < doms.length; i++)
                this.node[0].appendChild(doms[i]);
        }
    };


    /**
     * Prepend to THE FIRST node of this object
     * Accept multiple args
     * @method prepend
     * @memberof LD
     * @instance
     * @param  {(string|LD|NodeList|NodeList[])}  contentToPrepend
     */
    DomHelper.prototype.prepend = function (contentToPrepend) {
        for (var j = 0; j < arguments.length; j++) {
            var doms = getElementsFromParameter(arguments[j]);
            for (var i = 0; i < doms.length; i++)
                this.node[0].insertBefore(doms[i], null);
        }
    };


    /**
     * Replace html content + parse args to see if html
     * @method html
     * @memberof LD
     * @instance
     * @param  {(string|LD|NodeList|NodeList[])}   contentToInsert
     */
    DomHelper.prototype.html = function (contentToInsert) {
        this.node[0].innerHTML = "";
        var doms = getElementsFromParameter(contentToInsert);
        for (var i = 0; i < doms.length; i++)
            this.node[0].appendChild(doms[i]);
    };


    /**
     *  Replace html content by a string
     * @method text
     * @memberof LD
     * @instance
     * @param  {string}   textToInsert
     */
    DomHelper.prototype.text = function (textToInsert) {
        this.each(function fillTextIntoNode() {
            this.innerText = this.textContent = textToInsert;
        });
    };


    /**
     * Return one NODE width or set all of the nodes WIDTH
     * @method width
     * @memberof LD
     * @instance
     * @param  {number}   val
     */
    DomHelper.prototype.width = function (val) {
        if (val)
            this.each(function setWith() {
                this.style.width = parseFloat(val).toString().length < val.toString().length ? val : val + "px";
            });
        else {
            var width = this.node[0].clientWidth;

            function getWidthFromPecentage(el, val) {
                var parentWidth = lightDom(el.parentNode).width();
                return parentWidth != 0 ? parseFloat(el.style.width) / 100 * parentWidth : 0;
            }

            if (this.node[0].clientWidth == 0)
                if (document.defaultView) {
                    if (this.node[0].style.width.indexOf("%") != -1)
                        width = getWidthFromPecentage(this.node[0], document.defaultView.getComputedStyle(this.node[0], "").getPropertyValue("width"))
                    else
                        width = parseInt(document.defaultView.getComputedStyle(this.node[0], "").getPropertyValue("width"));
                }

                else if (this.node[0].currentStyle) {
                    if (this.node[0].currentStyle["width"].indexOf("%") != -1)
                        width = getWidthFromPecentage(this.node[0], this.node[0].currentStyle["width"]);
                    else
                        width = parseInt(this.node[0].currentStyle["width"]);
                }

            return width;
        }
    };


    /**
     * Return outerWidth: width + padding + border
     * @method outerWidth
     * @memberof LD
     * @instance
     * @return {number} outerWidth
     */
    DomHelper.prototype.outerWidth = function () {
        return this.node[0].offsetWidth;
    };


    /**
     * Return ONE node HEIGHT or set all of the NODES height
     * @method height
     * @memberof LD
     * @instance
     * @return {number} height
     */
    DomHelper.prototype.height = function (val) {
        if (val)
            this.each(function setHeight() {
                this.style.height = parseFloat(val).toString().length < val.toString().length ? val : val + "px";
            });
        else {
            var height = this.node[0].clientHeight;

            function getHeightFromPecentage(el, val) {
                var parentHeight = lightDom(el.parentNode).height();
                if (parentHeight != 0) {
                    return parseFloat(el.style.height) / 100 * parentHeight;
                }
                return 0;
            }

            if (this.node[0].clientHeight == 0)
                if (document.defaultView) {
                    if (this.node[0].style.height.indexOf("%") != -1)
                        height = getHeightFromPecentage(this.node[0], document.defaultView.getComputedStyle(this.node[0], "").getPropertyValue("height"));
                    else
                        height = parseInt(document.defaultView.getComputedStyle(this.node[0], "").getPropertyValue("height"));
                }

                else if (this.node[0].currentStyle) {
                    if (this.node[0].currentStyle["height"].indexOf("%") != -1)
                        height = getHeightFromPecentage(this.node[0], this.node[0].currentStyle["height"]);
                    else
                        height = parseInt(this.node[0].currentStyle["height"]);
                }

            return height;
        }
    };


    /**
     * Return first node outer height
     * @method height
     * @memberof LD
     * @instance
     * @return {number} outerHeight
     */
    DomHelper.prototype.outerHeight = function () {
        return this.node[0].offsetHeight;
    };


    /**
     * Return top / left position of an element
     * @todo this ignore positioning using the css transform
     * @method position
     * @memberof LD
     * @instance
     * @return {{left: Number, top: Number}}  element position
     */
    DomHelper.prototype.position = function () {
        var top = 0,
            left = 0,
            el = this.node[0];

        while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
            left += el.offsetLeft - el.scrollLeft;
            top += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }

        return {
            left: left,
            top: top
        }
    };

    window['lightDom'] = window['LD'] = lightDom;

})(window, document);