/**
 * kevenxi
 */
var byDvVacantRmController = View.createController('byDvVacantRmController', {
	
    afterInitialDataFetch: function(){
		this.abScDefDeAreaGrid.addParameter("bgsRes",'办公室');
		this.abScDefDeAreaGrid.addParameter("jsbgsRes",'教师办公室');
		this.abScDefDeAreaGrid.addParameter("weidingyiRes",'未定义');
		
        this.abScDefDeAreaGrid.refresh();
    },
	
	abScDefDeAreaGridLevelTwo_afterRefresh: function(){
		commonSetTitle("abScDefDeAreaGrid","abScDefDeAreaGridLevelTwo","rm.dv_id","yuanxi");
    }
	
})

function showRmByDv(){
    var grid = View.panels.get('abScDefDeAreaGrid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var dvId = selectedRow["rm.dv_id"];
    var rmReport = View.panels.get('abScDefDeAreaGridLevelTwo');
	rmReport.addParameter("bgsRes",'办公室');
	rmReport.addParameter("jsbgsRes",'教师办公室');
	rmReport.addParameter("weidingyiRes",'未定义');
	rmReport.addParameter("dvIdRes",dvId);
	
    rmReport.refresh();
}
