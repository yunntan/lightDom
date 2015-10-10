// bind hover in and out
(function(){
  lightDom.extend({
    "hover": function(hoverIn, hoverOut){
		        this.each(function bindMouseOverAndMouseOut(){
		        	if( hoverIn )
		            	this.addEventListener("mouseover", hoverIn);
		            if( hoverOut)
		            	this.addEventListener("mouseout", hoverOut);
		        });
			}
   });	
})();