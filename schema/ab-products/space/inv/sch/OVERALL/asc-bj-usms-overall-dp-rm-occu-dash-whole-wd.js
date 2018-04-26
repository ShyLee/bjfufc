/**
 * @author Keven.xi
 */
View.createController('ascBjUsmsOverallDeptOccuDashWholeController', {
	
	afterViewLoad:function(){
		
		this.ascBjUsmsOverallDeptOccuDashWholeTeachChtPie.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		this.ascBjUsmsOverallDeptOccuDashWholeMangeChtPie.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_DZGL);
		this.ascBjUsmsOverallDeptOccuDashWhole_teachDvSumGrid.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		this.ascBjUsmsOverallDeptOccuDashWhole_manageDvSumGrid.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_DZGL);
	}
	
});


