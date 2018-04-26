

var abScSearchRmLayoutByBuController = View.createController("abScSearchRmLayoutByBuController", {
	
	afterViewLoad:function(){
		this.abScSearchRmLayoutByBuGrid.buildPostFooterRows = addTotalRowForBu;
		this.abScSearchRmLayoutByBuGrid.sortEnabled = false;
	},
	
    abScSearchRmLayoutByBuGridDv_afterRefresh: function(){
        this.abScSearchRmLayoutByBuGridReport.show(false);
        commonSetTitle("abScSearchRmLayoutByBuGrid", "abScSearchRmLayoutByBuGridDv", "bu.bu_id", "buArea");
    },
    abScSearchRmLayoutByBuGridReport_viewUser_onClick: function(row){
        viewUser(row);
    },
    abScSearchRmLayoutByBuGridDv_viewBl_onClick: function(row){
        viewBuilding(row);
    },
    abScSearchRmLayoutByBuGridReport_afterRefresh: function(){
        commonSetTitle("abScSearchRmLayoutByBuGridDv", "abScSearchRmLayoutByBuGridReport", "dv.dv_id", "buRoom");
    }
});

function showDvByBu(row){
	var buPanel = View.panels.get('abScSearchRmLayoutByBuGrid');
    var selectRow = buPanel.rows[buPanel.selectedRowIndex];
    var buId = selectRow['bu.bu_id'];
    var restriction = new Ab.view.Restriction();
    if (valueExistsNotEmpty(buId)) {
        restriction.addClause('dv.bu_id', buId, '=');
    }
    
    var dvPanel = View.panels.get('abScSearchRmLayoutByBuGridDv');
	dvPanel.addParameter("wuDvRes", "无");
    dvPanel.refresh(restriction);
}

function showRmByDv(row){
    var detailPanel = View.panels.get('abScSearchRmLayoutByBuGridDv');
    var selectRow = detailPanel.rows[detailPanel.selectedRowIndex];
    var buId = selectRow['dv.bu_id'];
    var dvId = selectRow['dv.dv_id'];
    var restriction = new Ab.view.Restriction();
    if (valueExistsNotEmpty(buId)) {
        restriction.addClause('dv.bu_id', buId, '=');
    }
    if (valueExistsNotEmpty(dvId)) {
        restriction.addClause('rm.dv_id', dvId, '=');
    }
    var rmPanel = View.panels.get('abScSearchRmLayoutByBuGridReport');
    rmPanel.refresh(restriction);
}

function viewUser(row){
    var blId = row.record['rm.bl_id'];
    var flId = row.record['rm.fl_id'];
    var rmId = row.record['rm.rm_id'];
    var restriction = new Ab.view.Restriction();
    restriction.addClause('em.bl_id', blId, '=');
    restriction.addClause('em.fl_id', flId, '=');
    restriction.addClause('em.rm_id', rmId, '=');
    
    var detailPanel = View.panels.get('abScSearchRmLayoutByBuGridReportShow');
    detailPanel.refresh(restriction);
    detailPanel.show(true);
    detailPanel.showInWindow({
        width: 800,
        height: 600
    });
}


function viewBuilding(row){
    var buId = row.record['dv.bu_id'];
    var dvId = row.record['dv.dv_id'];
    
    View.openDialog('asc-bj-usms-hl-rm-by-dp.axvw', null, false, {
        width: 800,
        height: 600,
        closeButton: false,
        dvId: dvId
    });
    
    
}
/**
* add total row if there are more lines
* @param {Object} parentElement
*/
function addTotalRowForBu(parentElement){
   if (this.rows.length < 2) {
       return;
   }
	
	var totalAreaShiyong = 0.0;
	var totalAreaJianZhu = 0.0;
	var totalProportion = 0.0;
	var totalCountTeacher = 0;
   for (var i = 0; i < this.rows.length; i++) {
       var row = this.rows[i];
       
		var areaShiyong = row['bu.area_rm'];
		if(row['bu.area_rm.raw']){
			areaShiyong = row['bu.area_rm.raw'];
		}
		if (!isNaN(parseFloat(areaShiyong))) {
			totalAreaShiyong += parseFloat(areaShiyong);
		}
		
		var areaJianzhu = row['bu.area_jianzhu'];	
		if(row['bu.area_jianzhu.raw']){
			areaJianzhu = row['bu.area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(areaJianzhu))) {
			totalAreaJianZhu += parseFloat(areaJianzhu);
		}
		
		var countTeacher = row['bu.count_em'];
		if (!isNaN(parseInt(countTeacher))){
			totalCountTeacher += parseInt(countTeacher);
		}
   }
	totalAreaShiyong = totalAreaShiyong.toFixed(2);
	totalAreaJianZhu = totalAreaJianZhu.toFixed(2);
	
	totalProportion = calPercentAreaJianzhu(this,totalAreaJianZhu);
	totalProportion = totalProportion.toFixed(2)+'%';
	
	var ds = this.getDataSource();
	
	
   // create new grid row and cells containing statistics
   var gridRow = document.createElement('tr');
   parentElement.appendChild(gridRow);
   // column 1: 'Total' title
   addColumn(gridRow, 1, getMessage('total'));
	// column 2: total area
   addColumn(gridRow, 1, ds.formatValue('bu.area_rm', totalAreaShiyong, false));
   // column 3: total area of Structure
   addColumn(gridRow, 1, ds.formatValue('bu.area_jianzhu', totalAreaJianZhu, false));
   // column 4: 'Total' title
   addColumn(gridRow, 1,ds.formatValue('bu.count_em', totalCountTeacher+"", false));
	// column 5: total proportion
   addColumn(gridRow, 1, ds.formatValue('bu.mianjibi', totalProportion, false));
}

/**
* Calculate the percent of the jianzhu area of per rmcat
* @param {Object} panel
* @param {Object} totleArea
*/
function calPercentAreaJianzhu(panel,totleArea){
	
	var totalProportion = 0.0;
	
	for (var i = 0; i < panel.rows.length; i++) {
       var row = panel.rows[i];
       var rmcatProportion = 0.0;
		
		var rmcatAreaJianzhuValue = row['bu.area_jianzhu'];	
		if(row['bu.area_jianzhu.raw']){
			rmcatAreaJianzhuValue = row['bu.area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(rmcatAreaJianzhuValue)) && (!isNaN(parseFloat(totleArea)))) {
			if (parseFloat(totleArea) != 0){
				rmcatProportion = parseFloat(rmcatAreaJianzhuValue)*100.0/parseFloat(totleArea);
			}
		}
		var rowEl = Ext.get(row.row.dom).dom;
		rowEl.cells[4].innerHTML = rmcatProportion.toFixed(2)+'%';
		
		
		totalProportion += parseFloat(rmcatProportion);
   }
	
	return totalProportion;
}
