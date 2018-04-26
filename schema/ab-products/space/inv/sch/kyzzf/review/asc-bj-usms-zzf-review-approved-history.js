var ReviewController =  View.createController("ReviewController",{
	 afterInitialDataFetch: function() {
		this.inherit();
 		var tabs = View.panels.get("reviewTabs");
		var view = tabs.findTab("view");
        view.enable(false);
 	 	tabs.addEventListener('afterTabChange',this.onTabsChange);	
	 },
 	onTabsChange: function(tabPanel, selectedTabName, newTabName){
		var tabs = View.panels.get("reviewTabs");
	
		if(selectedTabName != 'view'){
	 		var view = tabs.findTab("view");
	 		view.enable(false);
 		}else{
 			var selectRequestTab = tabs.findTab("selectRequestTab");
 			selectRequestTab.enable(true);
 		}
	}
});