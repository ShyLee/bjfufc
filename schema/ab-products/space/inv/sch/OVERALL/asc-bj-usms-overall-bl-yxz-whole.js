/**
 * @author Keven.xi
 */
var DvRoomControlller=View.createController('DvRoomControlller',{

    siteId: "",
    blId: "",
     
	accordDate_build_onShow:function(){
        var from_date = this.accordDate_build.getFieldValue('date_from');
        var to_date = this.accordDate_build.getFieldValue('date_to');
        if(Date.parse(from_date.replace(/-/g,"/"))>Date.parse(to_date.replace(/-/g,"/"))){
          View.showMessage("截止时间不能小于起始时间！");
          return false;
        }

    },
	
    ascBjUsmsOverallBlWhole_blGrid_showBlInfo_onClick: function(row){
        this.blId = row.record['sc_bl_xz.bl_id'];
        View.openDialog('asc-bj-usms-bl-info-card.axvw', null, false, {
            width: 800,
            height: 600,
            closeButton: false,
            openBlId: this.blId
        });
    },
    
    ascBjUsmsOverallBlWhole_blGrid_showRmCat_onClick: function(row){
    
        var blId = row.record['sc_bl_xz.bl_id'];
        var panel = View.panels.get('ascBjUsmsOverallBlWhole_grid_scHisRmCatBl');
        panel.addParameter("blIdRes", blId);
        panel.refresh();
        panel.showInWindow({
            width: 750,
            height: 600
        });
    },
    ascBjUsmsOverallBlWhole_blGrid_onDcbbb: function()
    {
    	View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false,
		{
            width: 470,
            height: 200,
            xmlName: "fixedAssetsDispose",
            parameters: {
            	
            },
            closeButton: false
        });
    },
    accordDate_build_onClear:function(){
    	this.ascBjUsmsOverallBlWhole_blGrid.refreshClearAllFilters();
    }
});