
var blcostByTimeController = View.createController('blcostByTimeController', {
	otherRes:null,
	groupOption:' bl.bl_id ',
	tabGroup:1,
	/**
	 * Search by console
	 */
    afterViewLoad: function(){
		//Register current controller to top-level view's controller
		var parentDashController = getDashMainController("dashCostAnalysisMainController");
		if(!parentDashController){
			this.costByTimeChart.show(false);			
		}
		else if (!parentDashController.getSubControllerById(this.id)){
			parentDashController.registerSubViewController(this);
			this.costByTimeChart.show(false);
		}
		else{
			this.refreshChartPanel();
		}
    },
	
	refreshChart: function(res){
		this.setLocalSqlParameters(res); 
		this.refreshChartPanel(); 
	},

	refreshChartPanel: function(){
		var panel=this.costByTimeChart;
		var c = this;

		if(!this.otherRes){
			c = getDashMainController("dashCostAnalysisMainController").getSubControllerById(this.id);
		}
        panel.addParameter('wrhwrRes', c.otherRes);
        panel.addParameter('groupOptionParam', c.groupOption);
        panel.addParameter('bParam', c.groupOption.replace(/bl./, "b."));
		panel.refresh();
		panel.show(true);
	},
	
	setLocalSqlParameters: function(res){
		var topLevelController = getDashMainController("dashCostAnalysisMainController");
		var restriction=topLevelController.treeRes.replace(/rm./g, "wrhwr.");
		if(res){
			restriction = restriction + res;
		}

		restriction += " AND wrhwr.date_completed &gt;=${sql.date('"+topLevelController.dateStart+"')} ";
		restriction += " AND wrhwr.date_completed  &lt;=${sql.date('"+topLevelController.dateEnd+"')} ";
		
		if(topLevelController.probType){
			restriction +=" AND wrhwr.prob_type like '%"+ topLevelController.probType +"%' ";
		}
		
		this.otherRes = restriction;
		this.groupOption = topLevelController.groupLevel;
	}
})

/**
 * Show detailed work request grid
 */
function onCostByTimeChartClick(obj){
	var controller = View.controllers.get("blcostByTimeController");
	if(!controller.otherRes){
		controller = getDashMainController("dashCostAnalysisMainController").getSubControllerById(controller.id);
	}

	var detailsPanel = View.panels.get("detailsReport1");
	var restriction = 	controller.otherRes;

	var locationId = obj.selectedChartData["wrhwr.groupOption"];
	var month = obj.selectedChartData['wrhwr.month'];
	if(locationId && month){
		restriction = restriction + " AND " + controller.groupOption +"='" + locationId +"' ";
		detailsPanel.addParameter("month", "='"+month+"'");
		detailsPanel.refresh(restriction);
	}
	else{
		detailsPanel.addParameter("month", " is not null ");
		detailsPanel.refresh(restriction);
	}
	detailsPanel.showInWindow({
		width: 800,
		height: 600
	});
}