/**
 *
 * @author Keven.xi
 * @date  2010-07-28
 *
 */
var abScVwVacantAreabyBl = View.createController('abScVwVacantAreabyBlController', {
    afterViewLoad: function(){
        this.abScRmcatRmRptSite_tree.addParameter('sitetIdSql', "");
        this.abScRmcatRmRptSite_tree.addParameter('blId', "IS NOT NULL");
        this.abScRmcatRmRptSite_tree.createRestrictionForLevel = createRestrictionForLevel;
    },
    sbfFilterPanel_onShow: function(){
        this.refreshTreeview();
        this.abScRmcatRmRptPanel.show(false);
    },
    refreshTreeview: function(){
        var consolePanel = this.sbfFilterPanel;
        var treePanel = View.panels.get("abScRmcatRmRptSite_tree");
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

function onClickRmcatNode(){

    var currentNode = View.panels.get("abScRmcatRmRptSite_tree").lastNodeClicked;
    var siteName = currentNode.parent.parent.parent.data['site.name'];
    var title = String.format(getMessage('treeTitle'), siteName);
    setPanelTitle('abScRmcatRmRptSite_tree', title);
    
    var blId = currentNode.parent.data['bl.bl_id'];
    var blName = currentNode.parent.data['bl.name'];
    
    var rmcatCode = currentNode.data['rmcat.rm_cat'];
    var rmcatName = currentNode.data['rmcat.name'];
    var rptPanel = View.panels.get('abScRmcatRmRptPanel');
    rptPanel.addParameter('blIdRes', blId);
    rptPanel.addParameter('rmcatRes', rmcatCode);
    
    rptPanel.refresh();
    title = blName + "-" + rmcatCode;
    setPanelTitle('abScRmcatRmRptPanel', title);
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'abScRmcatRmRptSite_tree') {
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
        var rmcatName = treeNode.data['rmcat.name'];
        var rmcat = treeNode.data['rmcat.rm_cat'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + rmcat + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (parentNode.data) {
        if (level == 1) {
            var siteId = parentNode.data['site.site_id'];
            if (!siteId) {
                restriction = new Ab.view.Restriction();
                restriction.addClause('property.site_id', '', 'IS NULL', 'AND', true);
            }
        }
        if (level == 2) {
            var propertyId = parentNode.data['property.pr_id'];
            if (!propertyId) {
                restriction = new Ab.view.Restriction();
                restriction.addClause('bl.pr_id', '', 'IS NULL', 'AND', true);
            }
        }
    }
    return restriction;
}
