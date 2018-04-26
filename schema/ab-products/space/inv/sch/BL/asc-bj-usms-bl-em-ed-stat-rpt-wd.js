/**
 * 
 * @author Keven.xi
 * @date  2010-07-28
 * 
 */

var abScRptEmDingebyBl = View.createController('abScRptEmDingebyBl', {
	
	blId:"",
	
	afterViewLoad: function(){
	    this.abScEmDingeRptSite_tree.addParameter('sitetIdSql', "");
        this.abScEmDingeRptSite_tree.addParameter('blId', "IS NOT NULL");
        this.abScEmDingeRptSite_tree.createRestrictionForLevel = createRestrictionForLevel;
},
	
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
		
	},
	 sbfFilterPanel_onShow: function(){
	        this.refreshTreeview();
	        this.abScEmDingeRptPanel_byDinge.show(false);
	        this.abScEmDingeRptPanel_byGangWei.show(false);
	    },
	    refreshTreeview: function(){
	        var consolePanel = this.sbfFilterPanel;
	        var treePanel = View.panels.get("abScEmDingeRptSite_tree");
	        var siteId = consolePanel.getFieldValue('property.site_id');
	        if (siteId) {
	            treePanel.addParameter('siteId', " site.site_id like'" + siteId + "%'");
				treePanel.addParameter('siteOfNullPr', " site.site_id like'" + siteId + "%'");
	            treePanel.addParameter('siteOfNullBl', " site.site_id like'" + siteId + "%'");
	        }
	        else {
	            treePanel.addParameter('siteId', " 1=1 ");
				treePanel.addParameter('siteOfNullPr', " 1=1 ");
	            treePanel.addParameter('siteOfNullBl', " 1=1 ");
	        }
	        
	        var propertyId = consolePanel.getFieldValue('bl.pr_id');
	        if (propertyId) {
	            treePanel.addParameter('prId', " like'" + propertyId + "%'");
	            treePanel.addParameter('prOfNullBl', " property.pr_id like'" + propertyId + "%'");
	            treePanel.addParameter('siteOfNullPr', " 1=0 ");
	        }
	        else {
	            treePanel.addParameter('prId', " IS NOT NULL ");
	            treePanel.addParameter('prOfNullBl', " 1=1 ");
	        }
			
	        var buildingId = consolePanel.getFieldValue('bl.bl_id');
	        if (buildingId) {
	            treePanel.addParameter('blId', " like '" + buildingId + "%'");
				treePanel.addParameter('siteOfNullPr', " 1=0 ");
	            treePanel.addParameter('prOfNullBl', "1=0");
	        }
	        else {
	            treePanel.addParameter('blId', "IS NOT NULL");
	        }
	        treePanel.refresh();
	        this.curTreeNode = null;
	    }

});



function onClickBlNode(){
	
    var currentNode = View.panels.get("abScEmDingeRptSite_tree").lastNodeClicked;
	var siteName = currentNode.parent.parent.data['site.name'];
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
        var prId = treeNode.data['property.pr_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + prId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 2) {
        var buildingId = treeNode.data['bl.bl_id'];
		var buildingName = treeNode.data['bl.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + buildingName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
	
}

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (parentNode.data) {
        var siteId = parentNode.data['site.site_id'];
        if (!siteId && level == 1) {
            restriction = new Ab.view.Restriction();
            restriction.addClause('property.site_id', '', 'IS NULL', 'AND', true);
        }
		var prId = parentNode.data['property.pr_id'];
		if (level == 2) {
            restriction = new Ab.view.Restriction();
            restriction.addClause('bl.pr_id', prId, '=', 'AND', true);
        }
    }
    return restriction;
}