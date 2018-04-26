/**
 * @author Keven.xi
 */
View.createController('ascBjUsmsOverallDeptOccuDashWholeController', {
	
	siteId:"",
	
	afterViewLoad:function(){
		this.ascBjUsmsOverallDeptOccuDashWholeTeachChtPie.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		this.ascBjUsmsOverallDeptOccuDashWholeMangeChtPie.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_DZGL);
		this.ascBjUsmsOverallDeptOccuDashWhole_teachDvSumGrid.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		this.ascBjUsmsOverallDeptOccuDashWhole_manageDvSumGrid.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_DZGL);
		//restriction : Main Campus
		this.siteId = getMainCampus(); // common function in the asc-bj-usms-overall-common.js
		this.ascBjUsmsOverallDeptOccuDashWhole_siteBasicGrid.addParameter('siteIdRes',this.siteId);
	}
	
});


