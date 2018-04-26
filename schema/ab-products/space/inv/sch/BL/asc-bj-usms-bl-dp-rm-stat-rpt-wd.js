/**
 * @author Keven.xi
 * @date  2010-07-28
 * 
 */


var abAscBjUsmsBlDpRmStatRpt =  View.createController('abAscBjUsmsBlDpRmStatRptController', {
	
	afterViewLoad: function(){
	    this.abScDvRmRptSite_tree.addParameter('sitetIdSql', "");
        this.abScDvRmRptSite_tree.addParameter('blId', "IS NOT NULL");
        this.abScDvRmRptSite_tree.createRestrictionForLevel = createRestrictionForLevel;
    },
	sbfFilterPanel_onShow: function(){
        this.refreshTreeview();
        this.abScDvRmRptPanel.show(false);
    },
    refreshTreeview: function(){
        var consolePanel = this.sbfFilterPanel;
        var treePanel = View.panels.get("abScDvRmRptSite_tree");
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
        var bl_use = consolePanel.getFieldValue('bl.use1');
		if (bl_use) {
			treePanel.addParameter('blUseFor',
					"bl.use1 = '" + bl_use + "'");
			treePanel.addParameter('siteOfNullPr', " 1=0 ");
			treePanel.addParameter('prOfNullBl', "1=0");
			
		} else {
			treePanel.addParameter('blUseFor', "1=1");
		}
		
        treePanel.refresh();
        this.curTreeNode = null;
    }
});
function onClickDvNode(ob){
	
    var currentNode = View.panels.get("abScDvRmRptSite_tree").lastNodeClicked;
	var siteName = currentNode.parent.parent.parent.data['site.name'];
	var title = String.format(getMessage('treeTitle'), siteName);
	setPanelTitle('abScDvRmRptSite_tree', title);
	
    var blId = currentNode.parent.data['bl.bl_id'];
    var blName = currentNode.parent.data['bl.name'];
    var dvId = currentNode.data['dv.dv_id'];
    var rptPanel = View.panels.get('abScDvRmRptPanel');
    rptPanel.addParameter('blIdRes', blId);
	rptPanel.addParameter('dvIdRes', dvId);
    rptPanel.refresh();
	
	title = blName+"-"+dvId;
	setPanelTitle('abScDvRmRptPanel', title );
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'abScDvRmRptSite_tree') {
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
	
	 if (treeNode.level.levelIndex == 3) {
        var divisionId = treeNode.data['dv.dv_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + divisionId + "</span> ";
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
