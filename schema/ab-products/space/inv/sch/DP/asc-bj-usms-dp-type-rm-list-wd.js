

var abScSearchRmLayoutByDvController = View.createController("abScSearchRmLayoutByDvController", {
    
	dvId:"",
	
	rmcat:"",
	rmtype:"",
	afterViewLoad: function(){
		this.abScSearchRmLayoutByDvGrid.buildPostFooterRows = addTotalRow;
		this.abScSearchRmLayoutByDvGrid.sortEnabled = false;
	},
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
/**
 * add total row if there are more lines
 * @param {Object} parentElement
 */
function addTotalRow(parentElement){
    if (this.rows.length < 2) {
        return;
    }
	var totalAreaShiyong = 0.0;
	var totalRoom = 0;
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        
		var fntstdCountValue = row['rm.area_shiyong'];
		if(row['rm.area_shiyong.raw']){
			fntstdCountValue = row['rm.area_shiyong.raw'];
		}
		if (!isNaN(parseFloat(fntstdCountValue))) {
			totalAreaShiyong += parseFloat(fntstdCountValue);
		}
		
		var fntstdPriceValue = row['rm.count_rm'];	
		if(row['rm.count_rm.raw']){
			fntstdPriceValue = row['rm.count_rm.raw'];
		}
		if (!isNaN(parseInt(fntstdPriceValue))) {
			totalRoom += parseInt(fntstdPriceValue);
		}
    }
	totalAreaShiyong = totalAreaShiyong.toFixed(2);
	
	
	
	var ds = this.getDataSource();
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: empty	
    addColumn(gridRow, 1);
    // column 2: empty	
    addColumn(gridRow, 1);
    // column 3: 'Total' title
    addColumn(gridRow, 1, getMessage('total'));
    // column 4: total room
    addColumn(gridRow, 1, ds.formatValue('rm.count_rm',totalRoom, true));
    // column 5: total area of Structure
    addColumn(gridRow, 1, ds.formatValue('rm.area_shiyong',totalAreaShiyong, true));
}