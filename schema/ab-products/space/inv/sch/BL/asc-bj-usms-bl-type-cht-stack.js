/**
 * 
 * in the chart panel, show the used area stack grouping by room category and
 * floor
 * 
 * 
 * @author Keven.xi
 * @date 2010-07-27
 * 
 */
View.createController('ascBjUsmsBlTypeChtStackController', {
	
    /**
	 * After the panel is created but before the initial data fetch: add custom
	 * event listener to the panel's afterGetData event.
	 */
    afterViewLoad: function() {
        this.abScShowRmcatStackCrossPanel.addEventListener('afterGetData', this.abScShowRmcatStackCrossPanel_afterGetData, this);
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
	
    abScShowRmcatStackCrossPanel_afterGetData: function(panel, dataSet) {
        // replace default column sub-total values with those found in the data
		// set
        for (var c = 0; c < dataSet.columnValues.length; c++) {
            var columnValue = dataSet.columnValues[c].n;
            var columnSubtotal = dataSet.columnSubtotals[c];
            if (columnValue == 'SERV'){
				// dataSet.columnValues[c].n = getMessage("noUnit");
				dataSet.columnValues[c].l = getMessage("serv");
				break;
			}
        }
		
		for (var r = 0; r < dataSet.records.length; r++) {
			var record = dataSet.records[r];
			var rm_cat = record.getValue("rm.rm_cat");
			if (rm_cat == "SERV"){
				var index = record.getValue("rm.fl_id") + ".SERV";
				dataSet.recordIndex[index] = r;
			}
        }
		
		 var tempColumnSubtotals = dataSet.columnSubtotals; 
		 dataSet.columnSubtotals = [];
	    for (var c = 0; c < dataSet.columnValues.length; c++) {
            var columnValue = dataSet.columnValues[c].n;
            for (var m = 0; m < tempColumnSubtotals.length; m++) {
	            if(columnValue==tempColumnSubtotals[m].getValue('rm.rm_cat')){
	            	dataSet.columnSubtotals.push(tempColumnSubtotals[m]);
	            }
	         }
	        
        }
    }
    
	/*
	 * abSpShowDpStack_dpChart_afterRefresh:function(){ var data1 =
	 * this.abSpShowDpStack_dpChart.data.toString();
	 * data1.replace(/N\/A/g,getMessage("noUnit"));
	 * this.abSpShowDpStack_dpChart.data = eval("("+data1+")"); }
	 */
	
});
function onClickBlNode(){
	
    var currentNode = View.panels.get("abScRmcatStackSite_tree").lastNodeClicked;
    var siteName = currentNode.parent.data['site.name'];
	var title = String.format(getMessage('treeTitle'), siteName);
	setPanelTitle('abScRmcatStackSite_tree', title);
	
    var blId = currentNode.data['bl.bl_id'];
	
	if (hasRmInTheBl(blId)) {
		var rmcatChart = View.panels.get('abSpShowRmcatStack_Chart');
		rmcatChart.addParameter('blIdRes', blId);
		rmcatChart.refresh();
		title = String.format(getMessage('rptPanelTitle'), blId);
		setPanelTitle('abSpShowRmcatStack_Chart', title);
		
		var crossPanel = View.panels.get('abScShowRmcatStackCrossPanel');
		crossPanel.addParameter('blIdRes', blId);
		crossPanel.refresh();
	}else{
		View.showMessage("建筑物<"+blId+">没有房间数据,不能生成空间叠堆图");
	}
}

/**
 * check whether the building has room record
 * 
 * @param {Object}
 *            blId
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
    if (treeNode.tree.id != 'abScRmcatStackSite_tree') {
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