/**
 * @author Keven.xi
 */
View.createController('ascBjUsmsOverallBlWholeController', {
	
	siteId:"",
	blId:"",
	
	afterViewLoad:function(){
		//restriction : Main Campus
		this.siteId = getMainCampus(); // common function in the asc-bj-usms-overall-common.js
		this.ascBjUsmsOverallBlWhole_siteBasicGrid.addParameter('siteIdRes',this.siteId);
	},
	
	ascBjUsmsOverallBlWhole_siteBasicGrid_onFixedReport:function(){
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200,xmlName:"blAreaReport", closeButton:false});
	},
	
	ascBjUsmsOverallBlWhole_blGrid_showBlInfo_onClick: function(row){
		this.blId = row.record['bl.bl_id'];
		View.openDialog('asc-bj-usms-bl-summary-info.axvw', null, false, {
            width: 1024,
            height: 768,
            closeButton: false,
			openBlId:this.blId
        });
    }
	
});


