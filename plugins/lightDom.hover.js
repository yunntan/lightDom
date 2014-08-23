// bind hover in and out
(function(){
  lightDom.extend({
    "hover": function(hoverIn, hoverOut){
		        this.each(function bindMouseOverAndMouseOut(){
		            this.addEventListener("mouseover", hoverIn || emptyFct);
		            this.addEventListener("mouseout", hoverOut || emptyFct);
		        });
			}
   });	
})();