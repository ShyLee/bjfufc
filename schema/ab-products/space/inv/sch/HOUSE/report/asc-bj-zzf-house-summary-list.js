var controller = View.createController('controller', {
	showDetail: function() {
		var panel = this.zzfByBuildPanel;
		var selectedIndex = panel.selectedRowIndex;
		var blId = panel.rows[selectedIndex]["bl.bl_id"];
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rm.bl_id",blId);
		this.zzfRmQD.refresh(restriction);
    	this.zzfRmQD.showInWindow({
    		x:300,
    		y:300,
    		width: 800,
    		height: 300
    	})
	}
	
});