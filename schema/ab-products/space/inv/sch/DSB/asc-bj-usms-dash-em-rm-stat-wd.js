/**
 * @author Keven.xi
 */


View.createController('ascBjUsmsDashStatController', {
	
	
	afterViewLoad:function(){
		this.ascBjUsmsEmRmStat_emSumGrid.addParameter('jiaoshouRes',"教授");
		this.ascBjUsmsEmRmStat_emSumGrid.addParameter('fujiaoshouRes',"副教授");
		this.ascBjUsmsEmRmStat_emSumGrid.addParameter('jiangshiRes',"讲师");
		this.ascBjUsmsEmRmStat_emSumGrid.addParameter('zhujiaoRes',"助教");
		this.ascBjUsmsEmRmStat_emSumGrid.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		
		this.ascBjUsmsDashEmRmStatCht_Hign6.addParameter('jiaoshouRes',"教授");
		this.ascBjUsmsDashEmRmStatCht_Hign6.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		
		this.ascBjUsmsDsshEmRmStatGrid_High6.addParameter('jiaoshouRes',"教授");
		this.ascBjUsmsDsshEmRmStatGrid_High6.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		
		this.ascBjUsmsDashEmRmStatCht_Lower6.addParameter('jiaoshouRes',"教授");
		this.ascBjUsmsDashEmRmStatCht_Lower6.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		
		this.ascBjUsmsDashEmRmStatGrid_Lower6.addParameter('jiaoshouRes',"教授");
		this.ascBjUsmsDashEmRmStatGrid_Lower6.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		
		this.ascBjUsmsDashEmRmStatJiaoShouCht.addParameter('jiaoshouRes',"教授");
		this.ascBjUsmsDashEmRmStatJiaoShouCht.addParameter('danrenjianRes',"单人间");
		this.ascBjUsmsDashEmRmStatJiaoShouCht.addParameter('shuangrenjianRes',"双人间");
		this.ascBjUsmsDashEmRmStatJiaoShouCht.addParameter('sanrenjianRes',"三人间");
		this.ascBjUsmsDashEmRmStatJiaoShouCht.addParameter('duorenjianRes',"多人间");
		this.ascBjUsmsDashEmRmStatJiaoShouCht.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
				
	},
	
	ascBjUsmsDashEmRmStatCrossRpt_afterGetData:function(){
		//this.ascBjUsmsDashEmRmStatCrossRpt.calculatedFields[0].showTotals = false;
		//this.ascBjUsmsDashEmRmStatCrossRpt.calculatedFields[1].showTotals = false;
		//this.ascBjUsmsDashEmRmStatCrossRpt.calculatedFields[2].showTotals = false;
	}
	
	
	
});



