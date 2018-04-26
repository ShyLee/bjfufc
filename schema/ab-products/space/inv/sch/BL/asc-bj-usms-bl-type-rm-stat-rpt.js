/**
 * 
 * @author Keven.xi
 * @date  2010-07-28
 * 
 */

function onClickRmcatNode(){
	
    var currentNode = View.panels.get("abScRmcatRmRptSite_tree").lastNodeClicked;
	var siteName = currentNode.parent.parent.data['site.name'];
	var title = String.format(getMessage('treeTitle'), siteName);
	setPanelTitle('abScRmcatRmRptSite_tree', title);
	
    var blId = currentNode.parent.data['bl.bl_id'];
    var rmcatCode = currentNode.data['rmcat.rm_cat'];
    var rmcatName = currentNode.data['rmcat.name'];
    var rptPanel = View.panels.get('abScRmcatRmRptPanel');
    rptPanel.addParameter('blIdRes', blId);
	rptPanel.addParameter('rmcatRes', rmcatCode);
	
    rptPanel.refresh();
	title = blId+"-"+rmcatCode;
	setPanelTitle('abScRmcatRmRptPanel', title );
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
        var buildingId = treeNode.data['bl.bl_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + buildingId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
	
	 if (treeNode.level.levelIndex == 2) {
        var rmcatName = treeNode.data['rmcat.name'];
        var rmcat = treeNode.data['rmcat.rm_cat'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + rmcat + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}