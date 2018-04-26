

var abScSearchRmLayoutByDvController = View.createController("abScSearchRmLayoutByDvController", {
    
	dvId:"",
	
	rmcat:"",
	rmtype:"",
	
	dvFilterPanel_onShow:function(){
		var restriction = new Ab.view.Restriction();
        var dvId = this.dvFilterPanel.getFieldValue("dv.dv_id");
		var buId = this.dvFilterPanel.getFieldValue("dv.bu_id");
        if (dvId) {
            restriction.addClause("dv.dv_id", dvId + '%', "LIKE");
        }
		if (buId) {
            restriction.addClause("dv.bu_id", buId + '%', "LIKE");
        }
        this.abScSearchRmLayoutByDvTreeGrid.refresh(restriction);
	},
	
    abScSearchRmLayoutByDvGrid_afterRefresh: function(){
        this.abScSearchRmLayoutByDvGridRm.show(false);
    },
	
	
    abScSearchRmLayoutByDvGridRm_viewUser_onClick: function(row){
        viewUser(row);
    }
});

function showCatSumOfDv(){
	var dvTreePanel = View.panels.get("abScSearchRmLayoutByDvTreeGrid");
	abScSearchRmLayoutByDvController.dvId = dvTreePanel.rows[dvTreePanel.selectedRowIndex]["dv.dv_id"];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('rm.dv_id', abScSearchRmLayoutByDvController.dvId, '=');
	var detailPanel = View.panels.get('abScSearchRmLayoutByDvGrid');
	detailPanel.refresh(restriction);
    detailPanel.setTitle(getMessage('danweidtitle')+" "+abScSearchRmLayoutByDvController.dvId);
	detailPanel.show(true);
}


function viewUser(row){
    var blId = row.record['rm.bl_id'];
    var flId = row.record['rm.fl_id'];
    var rmId = row.record['rm.rm_id'];
    var restriction = new Ab.view.Restriction();
    
    restriction.addClause('em.bl_id', blId, '=');
    restriction.addClause('em.fl_id', flId, '=');
    restriction.addClause('em.rm_id', rmId, '=');
    
    var detailPanel = View.panels.get('abScSearchRmLayoutByDvGridReportShow');
    detailPanel.refresh(restriction);
    detailPanel.show(true);
    detailPanel.showInWindow({
        width: 400,
        height: 280
    });
}

function showRmByUnit(){
    var grid = View.panels.get('abScSearchRmLayoutByDvGrid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var rmCat = selectedRow["rm.rm_cat"];
    var rmType = selectedRow["rm.rm_type"];
    var rmReport = View.panels.get('abScSearchRmLayoutByDvGridRm');
    var restriction = new Ab.view.Restriction();
    if (rmCat) {
        restriction.addClause('rm.rm_cat', rmCat, '=');
    }
    if (rmType) {
        restriction.addClause('rm.rm_type', rmType, '=');
    }
	if (abScSearchRmLayoutByDvController.dvId) {
        restriction.addClause('rm.dv_id', abScSearchRmLayoutByDvController.dvId, '=');
    }
    rmReport.refresh(restriction);
	rmReport.setTitle(getMessage('fangwuleixing')+" ["+rmCat+"-"+rmType+"]");
    rmReport.show(true);
}
