/**
 * @author Keven.xi
 */

function onBlTreeClick(ob){
	var currentNode = View.panels.get('abScRptEmInv_SiteTree').lastNodeClicked;
	var siteName = currentNode.parent.data['site.name'];
	var title = String.format(getMessage('treeTitle'), siteName);
	setPanelTitle('abScRptEmInv_SiteTree', title);
	
    var blId = currentNode.data['bl.bl_id'];
	var blName = currentNode.data['bl.name'];
	
    var restriction = new Ab.view.Restriction();
    restriction.addClause("em.bl_id", blId, "=");
	
	title = String.format(getMessage('rptPanelTitle'), blId);
    
    var facultySumGrid = View.panels.get('abScRptEmInv_SumGrid');
    facultySumGrid.refresh(restriction);
	facultySumGrid.setTitle(title);
}
/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var currentNode = View.panels.get('abScRptEmInv_SiteTree').lastNodeClicked;
	var  siteId = currentNode.parent.parent.data['site.site_id'];
	var title = String.format(getMessage('treeTitle'), siteId);
	setPanelTitle('abScRptEmInv_SiteTree', title);
	
    var blId = currentNode.data['fl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
	
    var restriction = new Ab.view.Restriction();
    restriction.addClause("em.bl_id", blId, "=");
    restriction.addClause("em.fl_id", flId, "=");
	
	title = blId + "-" + flId;
    
    var facultySumGrid = View.panels.get('abScRptEmInv_SumGrid');
    facultySumGrid.refresh(restriction);
	facultySumGrid.setTitle(title);
}


function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'abScRptEmInv_SiteTree') {
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
        var floorId = treeNode.data['fl.fl_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + floorId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}


