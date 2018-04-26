var controller = View.createController('Controller',{
	filterPanel_onShow:function(){
		var year = this.filterPanel.getFieldValue("sc_dv_area_log.year");
		var month = this.filterPanel.getFieldValue("sc_dv_area_log.month");
		this.sumGridPanel.addParameter('year',year);
	},
	filterPanel_onClear:function(){
		this.filterPanel.clear();
	},

});