/**
 * in the chart panel, show the used area stack grouping by division and floor
 * 
 * 
 * @author Keven.xi
 * @date  2010-07-27
 * 
 */
View.createController('ascBjUsmsBlDvChtStackController', {
	
    /**
	 * After the panel is created but before the initial data fetch: add custom
	 * event listener to the panel's afterGetData event.
	 */
    afterViewLoad: function() {
        this.abScShowDvStackCrossPanel.addEventListener('afterGetData', this.abScShowDvStackCrossPanel_afterGetData, this);
    },
    
    /**
	 * Custom afterGetData listener, called by the cross-tab panel after it gets
	 * the data from the server, but before the data is used to build the
	 * cross-table.
	 * 
	 * @param {Object}
	 *            panel The calling cross-table panel.
	 * @param {Object}
	 *            dataSet The data set received from the server - can be
	 *            modified here.
	 */
	
    abScShowDvStackCrossPanel_afterGetData: function(panel, dataSet) {  
		//for fix USMS-33
		 var tempColumnSubtotals = dataSet.columnSubtotals; 
		 dataSet.columnSubtotals = [];
	    for (var c = 0; c < dataSet.columnValues.length; c++) {
            var columnValue = dataSet.columnValues[c].n;
            for (var m = 0; m < tempColumnSubtotals.length; m++) {
	            if(columnValue==tempColumnSubtotals[m].getValue('rm.dv_id')){
	            	dataSet.columnSubtotals.push(tempColumnSubtotals[m]);
	            }
	         }
	        
        }
    }
	
});

function onClickBlNode(){
	
    var currentNode = View.panels.get("abScDvStackSite_tree").lastNodeClicked;
    var siteName = currentNode.parent.data['site.name'];
	var title = String.format(getMessage('treeTitle'), siteName);
	setPanelTitle('abScDvStackSite_tree', title);
	
    var blId = currentNode.data['bl.bl_id'];
	
	// 
	if (hasRmInTheBl(blId)) {
		var dpChart = View.panels.get('abSpShowDpStack_dpChart');
		dpChart.addParameter('blIdRes', blId);
		dpChart.refresh();
		
		title = String.format(getMessage('rptPanelTitle'), blId);
		setPanelTitle('abSpShowDpStack_dpChart', title);
		
		var crossPanel = View.panels.get('abScShowDvStackCrossPanel');
		crossPanel.addParameter('blIdRes', "'" + blId + "'");
		crossPanel.refresh();
	}else{
		View.showMessage("建筑物<"+blId+">没有房间数据,不能生成空间叠堆图");
	}
}
/**
 * check whether the building has room record
 * @param {Object} blId
 */
function hasRmInTheBl(blId){
	var ds = View.dataSources.get("abScDvStack_check_rmDS");
	ds.addParameter('blId',blId);
	var records = ds.getRecords();
	if (records.length == 0){
		return false;
	}else{
		return true;
	}
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'abScDvStackSite_tree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
        var siteCode = treeNode.data['site.site_id'];
        if (!siteCode) {
            labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + getMessage("noSite") + "</span> ";
            treeNode.setUpLabel(labelText1);
        }
    }
    if (treeNode.level.levelIndex == 1) {
        var buildingId = treeNode.data['bl.bl_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + buildingId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}