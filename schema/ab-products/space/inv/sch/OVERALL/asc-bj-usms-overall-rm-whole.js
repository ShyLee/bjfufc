/**
 * @author Keven.xi
 */
View.createController('ascBjUsmsOverallRmWholeController', {
	
	siteId:"",
	
	afterViewLoad:function(){
		//restriction : Main Campus
		this.siteId = getMainCampus(); // common function in the asc-bj-usms-overall-common.js
		this.ascBjUsmsOverallRmWhole_siteBasicGrid.addParameter('siteIdRes',this.siteId);
		this.ascBjUsmsOverallRmWhole_rmcat1SumGrid.sortEnabled = false;
		this.ascBjUsmsOverallRmWhole_rmcat2SumGrid.sortEnabled = false;
	},
	
	afterInitialDataFetch: function(){
		this.schWholeRmCatSumTabs.addEventListener('afterTabChange',this.afterTabChange.createDelegate(this));
		calTotalJianzhuArea(this.ascBjUsmsOverallRmWhole_rmcat1SumGrid);
		
	},
	
	afterTabChange:function(tabPanel,selectedTabName,  newTabName){
		this.schWholeRmCatSumTabs.curSelectedTabName = selectedTabName;
		
		if(selectedTabName == 'yiFenTan'){
			calTotalJianzhuArea(this.ascBjUsmsOverallRmWhole_rmcat2SumGrid);
		}else
		{
			calTotalJianzhuArea(this.ascBjUsmsOverallRmWhole_rmcat1SumGrid);
	 	}
		
	},
	
	ascBjUsmsOverallRmWhole_siteBasicGrid_onFixedReport:function(){
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200,xmlName:"rmAreaReport", closeButton:false});
	}
	
});

/**
 * add total row if there are more lines
 * @param {Object} parentElement
 */
function calTotalJianzhuArea(panel){
	
	var totalAreaJianZhu = 0.0;
	var totalProportion = 0.0;
    for (var i = 0; i < panel.rows.length; i++) {
        var row = panel.rows[i];
		
		var fntstdPriceValue = row['rmcat.total_area_jianzhu'];	
		if(row['rmcat.total_area_jianzhu.raw']){
			fntstdPriceValue = row['rmcat.total_area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(fntstdPriceValue))) {
			totalAreaJianZhu += parseFloat(fntstdPriceValue);
		}
		
    }
	totalAreaJianZhu = totalAreaJianZhu.toFixed(2);
	
	calPercentAreaJianzhu(panel,totalAreaJianZhu);
}

/**
 * Calculate the percent of the jianzhu area of per rmcat
 * @param {Object} panel
 * @param {Object} totleArea
 */
function calPercentAreaJianzhu(panel,totleArea){
	
	var headerRow =  panel.headerRows[0];
	if (!headerRow.cells[6]) {
		var new_th = document.createElement('th');
		headerRow.appendChild(new_th);
	}
	for (var i = 0; i < panel.rows.length; i++) {
        var row = panel.rows[i];
        var rmcatProportion = 0.0;
		
		var rmcatAreaJianzhuValue = row['rmcat.total_area_jianzhu'];	
		if(row['rmcat.total_area_jianzhu.raw']){
			rmcatAreaJianzhuValue = row['rmcat.total_area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(rmcatAreaJianzhuValue)) && (!isNaN(parseFloat(totleArea)))) {
			if (parseFloat(totleArea) != 0){
				rmcatProportion = parseFloat(rmcatAreaJianzhuValue)*100.0/parseFloat(totleArea);
			}
		}
		var rowEl = Ext.get(row.row.dom).dom;
		addColumn(rowEl,1);
		
		headerRow.cells[6].innerHTML='占比';
		rowEl.cells[6].innerHTML = rmcatProportion.toFixed(2) + '%';
		
    }
	
}

