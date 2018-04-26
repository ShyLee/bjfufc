var ActualAreaControlller=View.createController('ActualAreaControlller',{
	sc_ts_dv_dinge_console_onXianshi:function(){
		var dv_id = this.sc_ts_dv_dinge_console.getFieldValue('sc_ts_dv_dinge.dv_name');
		var year = $("year").value;
		var restriction = new Ab.view.Restriction();
		if(dv_id=="" &&  year==""){
			View.showMessage("请输入至少一个查询条件！");
	        return;
		}
		if(dv_id!=""){
			restriction.addClause("sc_ts_dv_dinge.dv_name",dv_id+"%","like");
		}
		if(year !=""){
			restriction.addClause("sc_ts_dv_dinge.year_dinge",year,"=");
		}
	    this.sc_ts_dv_dinge_grid.refresh(restriction);
	},
	sc_ts_dv_dinge_console_onQingchu:function(){
		this.sc_ts_dv_dinge_console.setFieldValue('sc_ts_dv_dinge.dv_name',"");
		$("year").value="";
	}
});