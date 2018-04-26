/**
 * 
 * @author Keven.xi
 * @date  2010-07-28
 * 
 */

var abScRptEmDingebyBl = View.createController('abScRptEmDingebyBl', {
	
	blId:"",
	
	abScEmDingeRptPanel_byDinge_afterRefresh: function(){
		var title = String.format(getMessage('byDingeTitle'), this.blId);
		this.abScEmDingeRptPanel_byDinge.setTitle(title);
	
		var restriction = new Ab.view.Restriction();
		restriction.addClause('em.bl_id',this.blId,'=');
		
        this.addStatInfoForDingeReport(restriction);
    },
	
    addStatInfoForDingeReport: function(restriction){
		if (this.abScEmDingeRptPanel_byDinge.rows.length < 2){
			return;
		}
        var totalRecord = View.dataSources.get('ds_ab-sc-rpt-em-dinge-by-bl_total_em').getRecord(restriction);
        
        var totalRow = new Object();
        totalRow['em.dingejibie_id'] = getMessage("total");
        totalRow['em.count_em'] = totalRecord.localizedValues["em.total_count_em"];
		
		this.abScEmDingeRptPanel_byDinge.addRow(totalRow);
        this.abScEmDingeRptPanel_byDinge.build();
        var rows = this.abScEmDingeRptPanel_byDinge.rows;
        Ext.get(rows[rows.length - 1].row.dom).setStyle('color', '#4040f0');
        Ext.get(rows[rows.length - 1].row.dom).setStyle('font-weight', 'bold');
    },
	
	abScEmDingeRptPanel_byGangWei_afterRefresh: function(){
		var title = String.format(getMessage('byGangWeiTitle'), this.blId);
		this.abScEmDingeRptPanel_byGangWei.setTitle(title);
		
	}

});



function onClickBlNode(){
	
    var currentNode = View.panels.get("abScEmDingeRptSite_tree").lastNodeClicked;
	var siteName = currentNode.parent.data['site.name'];
	var title = String.format(getMessage('treeTitle'), siteName);
	setPanelTitle('abScEmDingeRptSite_tree', title);
	
    var blId = currentNode.data['bl.bl_id'];
    var byDingeRptPanel = View.panels.get('abScEmDingeRptPanel_byDinge');
    byDingeRptPanel.addParameter('blIdRes', blId);
	
	var byGangWeiRptPanel = View.panels.get('abScEmDingeRptPanel_byGangWei');
    byGangWeiRptPanel.addParameter('blIdRes', blId);
    
	abScRptEmDingebyBl.blId = blId;
	
    byDingeRptPanel.refresh();
	byGangWeiRptPanel.refresh();
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'abScEmDingeRptSite_tree') {
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