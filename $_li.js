/*
    Light weight jQuery like dom lib

    Global Object: $_li
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
    var is_chrome = typeof window.chrome == "undefined" ? false : true;
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
    window["$_li"] = function(selector) {
        return new domManipulator(selector)
    };

    // Ajax request
    $_li.ajax = function(params){
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

    // Figure out if we're on a touch device or not -> TODO: improve problem width devices having both click & touch
    $_li.isTouchDevice =  ('ontouchstart' in document.documentElement )
  


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
        return $_li(this.dom[0].querySelector(selector));
    };

    // Return parent of the first node of the element
    domManipulator.prototype.parent = function(){
        return $_li(this.dom[0].parentNode);
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
                var parentWidth = $_li(el.parentNode).width();
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
                var parentHeight = $_li(el.parentNode).height();
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


    domManipulator.draggableElements = [];
    // Draggable object --> Only on the X axis
    domManipulator.prototype.draggable = function(params){
        this.each(function bindDraggableEvents(){
            var parent  = this.parentNode;   // Needed for relative dragging into the parent
            var element = this;
            element.onStart = params.start || emptyFct;
            element.onDrag = params.drag ||  emptyFct;
            element.onStop = params.stop || emptyFct;

            this.style.position = "absolute";
            var _dragging  = false;
            var _startPositon = {};

            element.containment = params.containment || [Number.NEGATIVE_INFINITY,0,Number.POSITIVE_INFINITY,0];    // Unlimited move on X

            // return x,y position of the mouse in the element
            function getPositionInClickedElement(e)
            {
                var x =0,y=0;
                if ( typeof e.pageX != "undefined"  || typeof e.pageY != "undefined") {
                    x = e.pageX;
                    y = e.pageY;
                }
                else {
                    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }
                var pos = getPosition(element);

                x -= pos.x; x = x < 0 ? 0  : x; // on some android e.pageX == 0 so we get a < 0 value
                y -= pos.y; y = y < 0 ? 0  : y;
                return  {   x:x, y:y  };
            }

            // Start dragging
            function dragStart(e){
                // For firefox
                e.srcElement = e.srcElement || e.target;

                if( e.srcElement == element ) { // Check if we actually selected the draggable element
                    _startPositon = getPositionInClickedElement(e);
                    _dragging = true;
                    element.onStart(e, ui());
                }
            }

            // End dragging
            function dragEnd(e){
                if( _dragging == true) {
                    _dragging = false;
                    element.onStop(e, ui());
                }
            }

            // Dragging
            function drag(e)
            {
                if( _dragging == true) {
                    var parentPos = getPosition(parent);
                    var x = $_li.isTouchDevice ? e.touches[0].clientX : ( e.x || e.clientX );
                    var pos = (x-parentPos.x - _startPositon.x);  // Post of the dragged element : mouse pos - parent post - drag start position

                    if( pos <= element.containment[0] )    // prevent dragging too far to the left
                        pos = element.containment[0];
                    if ( pos >= (element.containment[2] - $_li(element).width()))    // prevent dragging too far to the right
                        pos = (element.containment[2] - $_li(element).width());

                    element.style.left = pos+"px";  // Set the pos
                    element.onDrag(e, ui());
                }
            }

            // return datas
            function ui()
            {
                return {
                    position: {
                        left: parseFloat(element.style.left) || 0,
                        top: parseFloat(element.style.top) || 0
                    }
                }
            }

            if( domManipulator.draggableElements.indexOf(this) != -1 ){
                customLog("Just changing values of draggable, not binding ", 'color: yellow');
            } else {
                domManipulator.draggableElements.push(this);
                document.addEventListener($_li.isTouchDevice ? 'touchstart' : 'mousedown', dragStart);
                document.addEventListener($_li.isTouchDevice ? 'touchend'   : 'mouseup',   dragEnd);
                document.addEventListener($_li.isTouchDevice ? 'touchmove'  : 'mousemove', drag);
            }
        });
    };
})(window,document);