View.createController('ascBjUsmsDpRmtypeAreaController',{
	 
	 afterInitialDataFetch:function(){
		 this.crossTableJiaoXuePanel.addParameter('dvId', "教学机构");
		 this.crossTableXingZhengPanel.addParameter('dvId', "行政部门");
		 this.crossTableJiaoXuePanel.refresh();
		 this.crossTableXingZhengPanel.refresh();
	 }

});