var TsingHouseDealExpireControlller = View.createController('TsingHouseDealExpireControlller',
{
	afterInitialDataFetch: function()
	{
		
	},
	
	valueConsoleGrid_onShow: function(){
		var param_name=this.valueConsoleGrid.getFieldValue('sc_value_interval.param_name');
		var restriction = new Ab.view.Restriction();
		if(param_name!='')
		{
			restriction.addClause('sc_value_interval.param_name',param_name,'=');
		}
		this.sc_value_interval_grid.refresh(restriction);
	},
	sc_value_interval_grid_onNew: function(){
		 this.sc_value_interval_form.show(true);
		 this.sc_value_interval_form.refresh(null,true);
	},
	sc_value_interval_form_onDelete: function(){
		var controller=this;
		var confirmMessage="你确定删除该记录?";
		 View.confirm(confirmMessage, function(button){
			 if (button == 'yes') {
					try {	
						var record=controller.sc_value_interval_form.getRecord();
						controller.sc_value_interval_form.deleteRecord(record);
						controller.sc_value_interval_form.show(false);
						controller.sc_value_interval_grid.refresh();
					}catch(e){
	                	 return;
	                 }
			   }
		   });
	 },
	 sc_value_interval_form_onSave: function(){
		 var param_name=this.sc_value_interval_form.getFieldValue('sc_value_interval.param_name');
		 if(param_name==''){
	    		View.showMessage("请填写参数名！");
	    		return;
	    	}
		 this.sc_value_interval_form.save();
		 this.sc_value_interval_grid.refresh();
	 }
});
