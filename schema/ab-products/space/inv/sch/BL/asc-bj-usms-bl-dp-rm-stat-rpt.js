/**
 * @author Keven.xi
 * @date  2010-07-28
 * 
 */

function onClickDvNode(ob){
	
    var currentNode = View.panels.get("abScDvRmRptSite_tree").lastNodeClicked;
	var siteName = currentNode.parent.parent.data['site.name'];
	var title = String.format(getMessage('treeTitle'), siteName);
	setPanelTitle('abScDvRmRptSite_tree', title);
	
    var blId = currentNode.parent.data['bl.bl_id'];
    var dvId = currentNode.data['dv.dv_id'];
    var rptPanel = View.panels.get('abScDvRmRptPanel');
    rptPanel.addParameter('blIdRes', blId);
	rptPanel.addParameter('dvIdRes', dvId);
    rptPanel.refresh();
	
	title = blId+"-"+dvId;
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
        var buildingId = treeNode.data['bl.bl_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + buildingId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
	
	 if (treeNode.level.levelIndex == 2) {
        var divisionId = treeNode.data['dv.dv_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + divisionId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}
