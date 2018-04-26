/**
 * @author Keven.xi
 * @date  2010-07-28
 * 
 */

var abScRptDvRmcatbyBlControll = View.createController('abScRptDvRmcatbyBl', {
	
	afterViewLoad: function(){
		this.abScDvRmcatRptPanel.buildPostFooterRows = addTotalRow;
	}
	
	
});



function onClickBlNode(){
	
    var currentNode = View.panels.get("abScDvRmcatStackSite_tree").lastNodeClicked;
    var siteName = currentNode.parent.data['site.name'];
    var blId = currentNode.data['bl.bl_id'];
	setPanelTitle('abScDvRmcatStackSite_tree', getMessage("treeTitle")+" "+siteName);
    var dvRptPanel = View.panels.get('abScDvRmcatRptPanel');
    dvRptPanel.addParameter('blIdRes', blId);
    dvRptPanel.refresh();
	
	setPanelTitle('abScDvRmcatRptPanel', getMessage("reportTitle")+" "+blId);
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'abScDvRmcatStackSite_tree') {
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


/**
 * add total row if there are more lines
 * @param {Object} parentElement
 */
function addTotalRow(parentElement){
    if (this.rows.length < 2) {
        return;
    }
	var totalAreaShiyong = 0.0;
	var totalCount = 0;
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        
		var fntstdCountValue = row['dv.dv_bl_area_shiyong'];
		if(row['dv.dv_bl_area_shiyong.raw']){
			fntstdCountValue = row['dv.dv_bl_area_shiyong.raw'];
		}
		if (!isNaN(parseInt(fntstdCountValue))) {
			totalAreaShiyong += parseFloat(fntstdCountValue);
		}
		
		var fntstdPriceValue = row['dv.count_rm'];	
		if(row['dv.count_rm.raw']){
			fntstdPriceValue = row['dv.count_rm.raw'];
		}
		if (!isNaN(parseFloat(fntstdPriceValue))) {
			totalCount += parseFloat(fntstdPriceValue);
		}
    }
	totalAreaShiyong = totalAreaShiyong.toFixed(2);
	totalCount = totalCount.toFixed(0);
	
	var ds = this.getDataSource();
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: 'Total' title
    addColumn(gridRow, 1, getMessage('total'));
	// column 2: empty	
    addColumn(gridRow, 1);
	// column 3: total room count 
    addColumn(gridRow, 1, ds.formatValue('dv.count_rm', totalCount, true));
    // column 4: total area
    addColumn(gridRow, 1, ds.formatValue('dv.dv_bl_area_shiyong', totalAreaShiyong, true));
    
}

/**
 * add column
 * @param {Object} gridRow
 * @param {int} count
 * @param {String} text
 */
function addColumn(gridRow, count, text){
    for (var i = 0; i < count; i++) {
        var gridCell = document.createElement('th');
        if (text) {
            gridCell.innerHTML = text;
            gridCell.style.textAlign = 'right';
            gridCell.style.color = 'blue';
        }
        gridRow.appendChild(gridCell);
    }
}
