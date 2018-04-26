
View.createController("ascBjUsmsDingeUseMgrDvCht", {

    afterInitialDataFetch: function(){
        var detailPanel = this.ascBjUsmsSearchAreaDingeJiaoXueKeYanGrid;
        var detailPanelDangZ = this.ascBjUsmsSearchAreaDingeDangZhengGuanliGrid;
        detailPanelDangZ.addParameter('buClassRes', ascBjUsmsConstantControl.BU_CLASS_DZGL);
        detailPanelDangZ.refresh();
        var chart = this.ascBjUsmsSearchAreaChaoeChart;
        chart.addParameter('buClassRes', ascBjUsmsConstantControl.BU_CLASS_DZGL);
        chart.refresh();
    },
    
    ascBjUsmsSearchAreaDingeDangZhengGuanliGrid_afterRefresh: function(){
        addPercentageTag(this.ascBjUsmsSearchAreaDingeDangZhengGuanliGrid, "dv.rate_over_lack", 7);
    }
});
