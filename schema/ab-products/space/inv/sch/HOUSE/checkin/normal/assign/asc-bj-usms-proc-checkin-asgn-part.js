var ascBjUsmsProcCheckinAsgnPartController = View.createController("ascBjUsmsProcCheckinAsgnPartController", {

  onShow:function(){
  		var emId = this.console_show_sc_zzfcard.getFieldValue("sc_zzfcard.em_id");
		var emName = this.console_show_sc_zzfcard.getFieldValue("sc_zzfcard.em_name");
		
		var restriction = new Ab.view.Restriction()
		
		if(emId != ""){
			restriction.addClause("sc_zzfcard.em_id" , emId , "=");
		}
		if(emName != ""){
			restriction.addClause("sc_zzfcard.em_name" , emName , "=");
		}
		this.show_sc_zzfcard_grid.refresh(restriction);
  }
});

