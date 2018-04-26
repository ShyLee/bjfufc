/**
 * @author Keven.xi
 */
View.createController('ascBjUsmsOverallOffEmEdInfoController', {
	
	siteId:"",
	
	afterViewLoad:function(){
		//restriction : Main Campus
		this.siteId = getMainCampus(); // common function in the asc-bj-usms-overall-common.js
		this.ascBjUsmsOverallOffEmEdInfo_siteBasicGrid.addParameter('siteIdRes',this.siteId);
	}
	
});
