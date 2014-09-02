// Extenstion demo
// Implement X draggable 

(function(){
	var emptyFct = function(){};

	// Store the draggable elements
	var  draggableElements = [];


	// return an elemnt position
	function getPosition( el ) {
	    var _x = 0;
	    var _y = 0;
	      
        if( el.style.position == "absolute" ){
		    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
		        _x += el.offsetLeft - el.scrollLeft;
		        _y += el.offsetTop - el.scrollTop;
		        el = el.offsetParent;
		    }
		}
		else{
			var boundingRect = el.getBoundingClientRect();
			_y = boundingRect.top;
			_x = boundingRect.left;
		}   
	   
	    return { y: _y, x: _x };
	}


    lightDom.extend({
        "draggableX": function(params){
        	if( typeof params == "undefined")
    			params = {};

            this.each(function bindDraggableEvents(){
	            var parent  = this.parentNode;   // Needed for relative dragging into the parent
	            var element = this;
	            element.onStart = params.start || emptyFct;
	            element.onDrag  = params.drag  || emptyFct;
	            element.onStop  = params.stop  || emptyFct;

	          //  this.style.position = "absolute";
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
	                	e.preventDefault();	// prevent from selecting text when dragging
	                    var parentPos = getPosition(parent); 
	                    var x = lightDom.isTouchDevice ? e.touches[0].clientX : ( e.x || e.clientX );
	                    var pos = (x-parentPos.x - _startPositon.x);  // Post of the dragged element : mouse pos - parent post - drag start position

	                    if( pos <= element.containment[0] )    // prevent dragging too far to the left
	                        pos = element.containment[0];
	                    if ( pos >= (element.containment[2] - lightDom(element).width()))    // prevent dragging too far to the right
	                        pos = (element.containment[2] - lightDom(element).width());

	                 	element.style.transform  = "translateX("+pos+"px)";
	                 	element.style.webkitTransform  = "translateX("+pos+"px)"
	                    element.onDrag(e, ui());
	                }
	            }

	            // return datas
	            function ui()
	            {
	                return {
	                    position: getPosition(element)
	                }
	            }

	            if( draggableElements.indexOf(this) != -1 ){
	                customLog("Just changing values of draggable, not binding ", 'color: yellow');
	            } else {
	                draggableElements.push(this);
	                document.addEventListener(lightDom.isTouchDevice ? 'touchstart' : 'mousedown', dragStart);
	                document.addEventListener(lightDom.isTouchDevice ? 'touchend'   : 'mouseup',   dragEnd);
	                document.addEventListener(lightDom.isTouchDevice ? 'touchmove'  : 'mousemove', drag);
	            }
        	});
        }
    });

})();		