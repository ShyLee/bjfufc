/**
 * @author Keven.xi
 */


View.createController('ascBjUsmsOverallRmMainController', {
	
	siteId:"",
	mainTabs : null,
	
	afterViewLoad:function(){
		this.mainTabs = View.getControl('', 'campusTabs');
		this.siteId = this.mainTabs.currentSiteId ;		
		//var currentTab = View.getOpenerView().panels.get("campusTabs").finaTab(this.mainTabs.curSelectedTabName);
		//this.siteId = currentTab.siteId;
		
		//restriction : Main Campus
		this.ascBjUsmsOverallRmMain_siteBasicGrid.addParameter('siteIdRes',this.siteId);
		this.ascBjUsmsOverallRmMain_rmcat1SumGrid.addParameter('siteIdRes',this.siteId);
		this.ascBjUsmsOverallRmMain_rmcat2SumGrid.addParameter('siteIdRes',this.siteId);
		
		this.ascBjUsmsOverallRmMain_rmcat1SumGrid.sortEnabled = false;
		this.ascBjUsmsOverallRmMain_rmcat2SumGrid.sortEnabled = false;
	},
	
	afterTabChange:function(tabPanel,selectedTabName,  newTabName){
		this.schMainRmCatSumTabs.curSelectedTabName = selectedTabName;
		
		if(selectedTabName == 'yiFenTan'){
			calTotalJianzhuArea(this.ascBjUsmsOverallRmMain_rmcat2SumGrid);
	 	} else
		{
			calTotalJianzhuArea(this.ascBjUsmsOverallRmMain_rmcat1SumGrid);
	 	}
	
		
	},
	
	afterInitialDataFetch: function(){
		this.schMainRmCatSumTabs.addEventListener('afterTabChange',this.afterTabChange.createDelegate(this));
		calTotalJianzhuArea(this.ascBjUsmsOverallRmMain_rmcat1SumGrid);
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
		
		var fntstdPriceValue = row['rm.total_area_jianzhu'];	
		if(row['rm.total_area_jianzhu.raw']){
			fntstdPriceValue = row['rm.total_area_jianzhu.raw'];
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
	
	
	for (var i = 0; i < panel.rows.length; i++) {
        var row = panel.rows[i];
        var rmcatProportion = 0.0;
		
		var rmcatAreaJianzhuValue = row['rm.total_area_jianzhu'];	
		if(row['rm.total_area_jianzhu.raw']){
			rmcatAreaJianzhuValue = row['rm.total_area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(rmcatAreaJianzhuValue)) && (!isNaN(parseFloat(totleArea)))) {
			if (parseFloat(totleArea) != 0){
				rmcatProportion = parseFloat(rmcatAreaJianzhuValue)*100.0/parseFloat(totleArea);
			}
		}
		var rowEl = Ext.get(row.row.dom).dom;
		rowEl.cells[5].innerHTML = rmcatProportion.toFixed(2)+'%';
		
    }
	
}

