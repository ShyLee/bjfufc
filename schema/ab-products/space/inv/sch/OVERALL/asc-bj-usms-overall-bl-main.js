/**
 * @author Keven.xi
 */



View.createController('ascBjUsmsOverallBlMainController', {
	
	siteId:"",
	blId:"",
	mainTabs : null,
	
	afterViewLoad:function(){
		//restriction : Main Campus
		this.mainTabs = View.getControl('', 'campusTabs');
		this.siteId = this.mainTabs.currentSiteId ;
		this.ascBjUsmsOverallBlMain_siteBasicGrid.addParameter('siteIdRes',this.siteId);
		this.ascBjUsmsOverallBlMain_blGrid.addParameter('siteIdRes',this.siteId);
	},
	
	ascBjUsmsOverallBlMain_blGrid_showBlInfo_onClick: function(row){
		this.blId = row.record['bl.bl_id'];
		View.openDialog('asc-bj-usms-bl-summary-info.axvw', null, false, {
            width: 1024,
            height: 768,
            closeButton: false,
			openBlId:this.blId
        });
    }
	
	
});

