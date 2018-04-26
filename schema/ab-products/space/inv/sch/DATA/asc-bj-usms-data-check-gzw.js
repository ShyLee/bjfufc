var gzwController =  View.createController('gzwController', {
	afterViewLoad:function(){
	},
	gzwConsole_onClear:function(){
		 this.gzwGrid.refreshClearAllFilters();
	 }
});