View.createController("ascBjUsmsDingeUseKeYanDvCht", {
	
    afterInitialDataFetch: function(){
        var detailPanel = this.ascBjUsmsSearchAreaDingeJiaoXueKeYanGrid;
        detailPanel.addParameter('buClass', ascBjUsmsConstantControl.BU_CLASS_JXKY);
        detailPanel.refresh();
		
        var chart = this.ascBjUsmsSearchAreaChaoeChart;
		chart.addParameter('buClass', ascBjUsmsConstantControl.BU_CLASS_JXKY);
        chart.refresh();
    },
    
    ascBjUsmsSearchAreaDingeJiaoXueKeYanGrid_afterRefresh: function(){
        addPercentageTag(this.ascBjUsmsSearchAreaDingeJiaoXueKeYanGrid, "dv.rate_over_lack", 11);
    }
    
});
