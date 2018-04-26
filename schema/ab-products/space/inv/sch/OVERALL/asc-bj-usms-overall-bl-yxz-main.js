/**
 * @author Keven.xi
 */

View.createController('ascBjUsmsOverallBlMainYxzController', { 
	
	siteId:"",
	blId:"",
	mainTabs : null,
	
	afterViewLoad:function(){
		//restriction : Main Campus
		this.mainTabs = View.getControl('', 'campusTabs');
		this.siteId = this.mainTabs.currentSiteId ;
		this.ascBjUsmsOverallBlMain_blGrid.addParameter('siteIdRes',this.siteId);
	},
	
	accordDate_build_onShow:function(){
        var from_date = this.accordDate_build.getFieldValue('date_from');
        var to_date = this.accordDate_build.getFieldValue('date_to');
        if(Date.parse(from_date.replace(/-/g,"/"))>Date.parse(to_date.replace(/-/g,"/"))){
          View.showMessage("截止时间不能小于起始时间！");
          return false;
        }

    },
	
	ascBjUsmsOverallBlMain_blGrid_showBlInfo_onClick: function(row){
		this.blId = row.record['sc_bl_xz.bl_id'];
		View.openDialog('asc-bj-usms-bl-info-card.axvw', null, false, {
            width: 1024,
            height: 768,
            closeButton: false,
			openBlId:this.blId
        });
    },
	ascBjUsmsOverallBlMain_blGrid_showRmCat_onClick: function(row){
		  
		var blId = row.record['sc_bl_xz.bl_id'];
		var panel = View.panels.get('ascBjUsmsOverallBlWhole_grid_scHisRmCatBl');
            panel.addParameter("blIdRes",blId);
            panel.refresh();
        panel.showInWindow({
	        width: 750,
	        height: 600
	    });
    }
	
	
});

