var ascBjUsmsHouseCompBenefitTab = View.createController('ascBjUsmsHouseCompBenefitTab', {

	codeConsole_onShow : function(){
		var emId = this.codeConsole.getFieldValue("em.em_id");
		var emName = this.codeConsole.getFieldValue("em.name");
		var restriction= new Ab.view.Restriction();
		restriction.addClause("1=1");
		if(emId!=""){
			restriction.addClause("sc_zzfcard.em_id",emId, "=");
		}
		
		
		if(emName!=""){
			restriction.addClause("sc_zzfcard.name",emName, "=");
		}
		
		this.unlikeGrid.refresh(restriction);
		this.sameGrid.refresh(restriction);
		this.allGrid.refresh(restriction);
	},
	codeConsole_onShowAll : function(){
		this.unlikeGrid.refresh("1=1");
		this.sameGrid.refresh("1=1");
		this.allGrid.refresh("1=1");
	}
});
