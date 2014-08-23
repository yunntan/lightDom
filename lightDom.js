/*
    Light weight jQuery like dom lib

    Global Object: lightDom
 */
 (function(window,document){
    // CustomEvent polyfill
    (function () {
        function CustomEvent ( event, params ) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent( 'CustomEvent' );
            evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
            return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    })();


    // Only needed for the console css
    var is_chrome = typeof window.chrome == "undefined";
    // Display color if available
    function customLog(text, css){
        if( is_chrome )
            console.log('%c'+text, css || '');
        else
            console.log(text);
    }

    // Just usefull for bindings :)
    var emptyFct = function(){};

    // Global object
    var lightDom = window["LD"] = window["lightDom"] = function(selector) {
        return new domManipulator(selector);
    };


    // Let extend the LightDom object
    lightDom.extend = function(extendingObjs){
        for( var i in  extendingObjs ){
            domManipulator.prototype[i] = extendingObjs[i];
        }        
    };


    // Ajax request
    lightDom.ajax = function(params){
        var request = params.crossDomain ? createCORSRequest() : new XMLHttpRequest() ;

        request.open(params.type, params.url, params.async || true);

        var needJSONParsing = false;
        try {   // ResponseType is fairly new, so does not work everywhere
            request.responseType = params.dataType || "";
        }
        catch(e){
            customLog("Could not set responseType", 'color:red');
            needJSONParsing = (params.dataType || "") == "json";
        }

        request.onreadystatechange=function() {
            if( request ) {
                if (request.readyState == 4 && request.status == 200) {
                    params.success(  needJSONParsing || (params.dataType == "json" && typeof request.response != 'object') ? JSON.parse(request.response) : request.response);
                }
                else if (request.status >= 400 && request.readyState == 4) {
                    params.error(request, request.status, request.statusText);
                }
            }
        };

        request.timeout = params.timeout || null;
        request.onprogress = params.progress || null;
        request.onerror = request.ontimeout =  params.error || null;

        request.send();


        function createCORSRequest(){
            var xhr = new XMLHttpRequest();
            if ("withCredentials" in xhr){
            } else if (typeof XDomainRequest != "undefined"){
                xhr = new XDomainRequest();
            } else {
                xhr = null;
            }
            return xhr;
        }
    };

    // Figure out if we're on a touch device or not -> TODO: improve to fix problem with devices having both click & touch
    lightDom.isTouchDevice =  ('ontouchstart' in document.documentElement )
  


    // Selector / constuctor
    function domManipulator(selector){
        this.init(selector);
    }

    // pass a parameter than can be wether a String, a domManipulator or DOM node
    function getDOMFromParameter(selector)
    {
        if( selector instanceof domManipulator) {
            return selector.dom;
        }
        // String == selector || HTML string
        if( typeof selector == "string") {
            var tmp = document.createElement("div");
            tmp.className = "mziDiv";
            tmp.innerHTML = selector;
            var findMe = tmp.querySelectorAll('.mziDiv > *');
            if( findMe.length == 0 )                                // If no child created by innerHTML -> We assume we're selecting in the document
                return document.querySelectorAll(selector);
            else                                                    // Else the string has created nodes, so we return this new object
                return findMe;
        }
        else
            return [selector];  // This is a DOM node passed in parameter
    }



    // Init
    domManipulator.prototype.init =  function (selector) {  // Todo, does not create a node -> only select
        if( selector )
            this.dom = getDOMFromParameter(selector);
        else
            this.dom = getDOMFromParameter('body');
    };

    // Browse each dom
    domManipulator.prototype.each =  function (cb) {
        for (var i = 0; i < this.dom.length; i++) {
            cb.apply(this.dom[i]);
        }
    };

    // Find nodes into the first one of the elment
    domManipulator.prototype.find = function(selector){
        return lightDom(this.dom[0].querySelector(selector));
    };

    // Return parent of the first node of the element
    domManipulator.prototype.parent = function(){
        return lightDom(this.dom[0].parentNode);
    };

    // Add a class
    domManipulator.prototype.addClass =  function (newClassName) {
        this.each(function addClassToNode(){
            this.className +=  " "+newClassName;
        });
    };

    // Remove a class
    domManipulator.prototype.removeClass =  function (removeClassName) {
        this.each(function removeClassOnNode(){
            this.className =  this.className.replace(removeClassName, "" );
        });
    };

    // Check if first dom has a class
    domManipulator.prototype.hasClass = function(className){
        return this.dom[0].className.indexOf(className) != -1;
    };

    // Return or set an attribute
    domManipulator.prototype.attr = function(name, value){
         if( value )
             this.each(function(){
                 this.setAttribute(name, value);
             });
         else
             return this.dom[0].getAttribute(name);
    };

    // Remove an attribute
    domManipulator.prototype.removeAttr = function(name) {
        this.each(function removeAttributeFromNode(){
            this.removeAttribute(name);
        });
    };


    // add css properties
    domManipulator.prototype.css = function(css, val){
        if( typeof val == "string") // Single prop
            this.each(function setStye(){
                this.style[css] = val;
            });
        else if( typeof css == "object")    // prop dictionnary passed
            this.each(function setStyle(){
                for(var i in css )
                    this.style[i] = css[i];
            });
    };

    // bind event(s) on each node
    domManipulator.prototype.bind = function(event, cb){
        var splited = event.split(" ");
        this.each(function bindEvent(){
            for(var i = 0 ; i < splited.length ; i++ )
                this.addEventListener(splited[i], cb);
        });
    };

    // unbind event(s) on each node
    domManipulator.prototype.unbind = function(event, cb){
        var splited = event.split(" ");
        this.each(function unbindEvent(){
            for(var i = 0 ; i < splited.length ; i++ )
                this.removeEventListener(splited[i], cb);
        });
    };

    // append to THE FIRST DOM of this object
    // Accept multiple args
    domManipulator.prototype.append = function(stuffToAppend){
        for(var j=0; j < arguments.length ; j++) {
            var doms = getDOMFromParameter(arguments[j]);
            for (var i = 0; i < doms.length; i++)
                this.dom[0].appendChild(doms[i]);
        }
    };

    // prepend to THE FIRST DOM of this object
    // Accept multiple args
    domManipulator.prototype.prepend = function(stuffToPrepend)
    {
        for(var j=0; j < arguments.length ; j++) {
            var doms = getDOMFromParameter(arguments[j]);
            for (var i = 0; i < doms.length; i++)
                this.dom[0].insertBefore(doms[i], null);
        }
    };

    // Replace html content + parse args to see if html
    domManipulator.prototype.html =  function(stuffToPut){
        this.dom[0].innerHTML = "";
        var doms = getDOMFromParameter(stuffToPut);
        for(var i=0; i < doms.length ; i++ )
            this.dom[0].appendChild(doms[i]);
    };

    // replace html content by a string
    domManipulator.prototype.text = function(textToPut){
        this.each(function fillTextIntoNode(){
            this.innerHTML = textToPut;
        });
    };

    // Return one NODE width or set all of the nodes WIDTH
    domManipulator.prototype.width = function(val)
    {
        if( val )
            this.each(function setWith(){
                this.style.width = parseFloat(val).toString().length < val.toString().length ? val : val+"px";
            });
        else {
            var width = this.dom[0].clientWidth;

            function getWidthFromPecentage(el, val)
            {
                var parentWidth = lightDom(el.parentNode).width();
                if( parentWidth != 0 )
                {
                    return parseFloat(el.style.width) / 100 * parentWidth;
                }
                return 0;
            }

            if( this.dom[0].clientWidth == 0)
                if(document.defaultView) {
                    if( this.dom[0].style.width.indexOf("%") != -1 )
                        width = getWidthFromPecentage(this.dom[0], document.defaultView.getComputedStyle(this.dom[0], "").getPropertyValue("width"))
                    else
                        width = parseInt(document.defaultView.getComputedStyle(this.dom[0], "").getPropertyValue("width"));
                }

                else if(this.dom[0].currentStyle) {
                    if( this.dom[0].currentStyle["width"].indexOf("%") != -1 )
                        width = getWidthFromPecentage(this.dom[0], this.dom[0].currentStyle["width"] );
                    else
                        width = parseInt(this.dom[0].currentStyle["width"]);
                }

           // console.log("Here with  =  "+width+" "+typeof width)
            return width;
        }
    };

    domManipulator.prototype.outerWidth = function(){
        return this.dom[0].offsetWidth;
    };

    // Return ONE node HEIGHT or set all of the NODES height
    domManipulator.prototype.height = function(val){
        if( val )
            this.each(function setHeight(){
                this.style.height =  parseFloat(val).toString().length < val.toString().length ? val : val+"px";
            });
        else
        {
            var height = this.dom[0].clientHeight;

            function getHeightFromPecentage(el, val)
            {
                var parentHeight = lightDom(el.parentNode).height();
                if( parentHeight != 0 )
                {
                    return parseFloat(el.style.height) / 100 * parentHeight;
                }
                return 0;
            }

            if( this.dom[0].clientHeight == 0)
                if(document.defaultView) {
                    if( this.dom[0].style.height.indexOf("%") != -1 )
                        height = getHeightFromPecentage(this.dom[0], document.defaultView.getComputedStyle(this.dom[0], "").getPropertyValue("height"));
                    else
                        height = parseInt(document.defaultView.getComputedStyle(this.dom[0], "").getPropertyValue("height"));
                }

                else if(this.dom[0].currentStyle) {
                    if( this.dom[0].currentStyle["height"].indexOf("%") != -1 )
                        height = getHeightFromPecentage(this.dom[0], this.dom[0].currentStyle["height"] );
                    else
                        height = parseInt(this.dom[0].currentStyle["height"]);
                }

            return height;
        }
    };

    domManipulator.prototype.outerHeight = function(){
        return this.dom[0].offsetHeight;
    };

    // Return top / left position of an element : TODO: works only for absolute / fixed elements
    domManipulator.prototype.position = function(){
        var left = parseFloat(this.dom[0].style.left) ||0 ;
        var top = parseFloat(this.dom[0].style.top) || 0 ;
        return{
            left:left,
            top: top
        }
    };

    // Bind hover in / hover out of an element
    domManipulator.prototype.hover = function(hoverIn, hoverOut){
        this.each(function bindMouseOverAndMouseOut(){
            this.addEventListener("mouseover", hoverIn || emptyFct);
            this.addEventListener("mouseout", hoverOut || emptyFct);
        });
    };
})(window,document);