/**
 * kevenxi
 */
var byDvVacantRmController = View.createController('byDvVacantRmController', {
	
	c_kongzhifang: "空置房",
	
    afterInitialDataFetch: function(){
		this.abScDefDeAreaGrid.addParameter("rmcatRes",this.c_kongzhifang);
		
        this.abScDefDeAreaGrid.refresh();
    },
	
	abScDefDeAreaGridLevelTwo_afterRefresh: function(){
		commonSetTitle("abScDefDeAreaGrid","abScDefDeAreaGridLevelTwo","dv.name","yuanxi");
    }
	
})

function showRmByDv(){
    var grid = View.panels.get('abScDefDeAreaGrid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var dvId = selectedRow["rm.dv_id"];
    var rmReport = View.panels.get('abScDefDeAreaGridLevelTwo');
	rmReport.addParameter("rmcatRes",byDvVacantRmController.c_kongzhifang);
	rmReport.addParameter("dvIdRes",dvId);
	
    rmReport.refresh();
}
