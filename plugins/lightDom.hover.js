// bind hover in and out
(function(){
  lightDom.extend({
    "hover": function(hoverIn, hoverOut){
		        this.each(function bindMouseOverAndMouseOut(){
		            this.addEventListener("mouseover", hoverIn || function(){});
		            this.addEventListener("mouseout", hoverOut || function(){});
		        });
			}
   });	
})();