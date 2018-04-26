var approveController =  View.createController("approveController",{
//	 afterViewLoad:function(){
//		 var tabs = View.panels.get("approveTabs");
//		 var view = tabs.findTab("approveRequestTab");
//         view.enable(false);
//	 	 tabs.addEventListener('afterTabChange',this.onTabsChange);	
//	 },
//	 afterInitialDataFetch: function() {
//		this.inherit();
// 		
//	 },
// 	onTabsChange: function(tabPanel, selectedTabName, newTabName){
// 		var tabs = View.panels.get("approveTabs");
//		if(selectedTabName != 'approveRequestTab'){
//	 		var view = tabs.findTab("approveRequestTab");
//	 		view.enable(false);
//	 		
// 		}else{
// 			var selectRequestTab = tabs.findTab("selectRequestTab");
// 			selectRequestTab.enable(true);
// 		}
//	}
	
	afterInitialDataFetch: function() {
        this.inherit();
        var tabs = View.panels.get("approveTabs");
        var view = tabs.findTab("approveRequestTab");
        view.enable(false);
        tabs.addEventListener('afterTabChange',this.onTabsChange);  
     },
    onTabsChange: function(tabPanel, selectedTabName, newTabName){
        var tabs = View.panels.get("approveTabs");
    
        if(selectedTabName != 'approveRequestTab'){
            var view = tabs.findTab("approveRequestTab");
            view.enable(false);
        }else{
            var selectRequestTab = tabs.findTab("selectRequestTab");
            selectRequestTab.enable(true);
        }
    }
});