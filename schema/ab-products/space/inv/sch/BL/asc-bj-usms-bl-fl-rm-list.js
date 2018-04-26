/**
 * @author Keven.xi
 */
var abScRptRmInvByFl =  View.createController('abScRptRmInvByFlController', {
	blId:"",
	flId:"",
	
	abScRptRmInv_SumGrid_afterRefresh:function(){
		var title = this.blId + "-" + this.flId;
	    this.abScRptRmInv_SumGrid.setTitle(title);
		this.editRowsEmUseColumn();
	},
	
	editRowsEmUseColumn:function(){
		var rows = this.abScRptRmInv_SumGrid.rows;
		var ds = View.dataSources.get('ds_ab-sc-rpt-rm-inv-by-fl_grid_em');
		var restriction = new Ab.view.Restriction(); 
		var records; 
		var empName;
		var rowEl;
		
		for(var i=0;i<rows.length;i++){
			var row = rows[i];
			restriction.clauses.length = 0;
			restriction.addClause('rm.bl_id',row['rm.bl_id'],'=');
			restriction.addClause('rm.fl_id',row['rm.fl_id'],'=');
			restriction.addClause('rm.rm_id',row['rm.rm_id'],'=');
			records = ds.getRecords(restriction);
			
			if (records.length <= 1){
				empName = "";
				if (records.length == 1){
					empName = records[0].getValue('em.name');
				}
				rowEl = Ext.get(row.row.dom).dom;
				rowEl.cells[11].innerHTML = empName;
			}else {
				//show button in cell
				rowEl = Ext.get(row.row.dom).dom;
				rowEl.cells[11].className ="button";
		        rowEl.cells[11].innerHTML ='<input id="' + i+ '" type="button" class="perRowButton" value="'+getMessage("btnShow")+'"  onclick="onShowAction(this);"/> ';
			}
		}
	}
    
    
});
/**
	 * show the employees in the selected room 
	 * @param {Object} rowEl
	 */
function  onShowAction(rowEl){
	    var panel = View.panels.get('abScRptRmInv_SumGrid');
	    var row = panel.rows[rowEl.id];
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rm.bl_id", row['rm.bl_id'], "=", true);
        restriction.addClause("rm.fl_id", row['rm.fl_id'], "=", true);
        restriction.addClause("rm.rm_id", row['rm.rm_id'], "=", true);
        
        var empDetailPanel = View.panels.get('abScRptRmInv_EmpGrid');
        empDetailPanel.refresh(restriction);
        empDetailPanel.show(true);
        empDetailPanel.showInWindow({
            width: 300,
            height: 250
        });
		
		var title = String.format(getMessage('empDetailsTitle'), row['rm.bl_id'] + "-" + row['rm.fl_id']+"-"+row['rm.rm_id']);
        empDetailPanel.setTitle(title);
     
		
}
/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var currentNode = View.panels.get('abScRptRmInv_SiteTree').lastNodeClicked;
	var siteName = currentNode.parent.parent.data['site.name'];
	var title = String.format(getMessage('treeTitle'), siteName);
	setPanelTitle('abScRptRmInv_SiteTree', title);
	
    var blId = currentNode.data['fl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
	
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, "=");
    restriction.addClause("rm.fl_id", flId, "=");
    
	abScRptRmInvByFl.blId = blId;
	abScRptRmInvByFl.flId = flId;
    var facultySumGrid = View.panels.get('abScRptRmInv_SumGrid');
    facultySumGrid.refresh(restriction);
}
/**
 * show room list of building 
 */
function onBlTreeClick(){
	var currentNode = View.panels.get('abScRptRmInv_SiteTree').lastNodeClicked;
	var siteName = currentNode.parent.data['site.name'];
	var title = String.format(getMessage('treeTitle'), siteName);
	setPanelTitle('abScRptRmInv_SiteTree', title);
	
    var blId = currentNode.data['bl.bl_id'];
	
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, "=");
    
	abScRptRmInvByFl.blId = blId;
	abScRptRmInvByFl.flId = "";
    var facultySumGrid = View.panels.get('abScRptRmInv_SumGrid');
    facultySumGrid.refresh(restriction);
}


function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'abScRptRmInv_SiteTree') {
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


