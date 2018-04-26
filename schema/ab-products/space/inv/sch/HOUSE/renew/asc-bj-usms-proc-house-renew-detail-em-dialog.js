var renewDetailEmController = View.createController("renewDetailEmController", {
	cardId: null,
	
	afterInitialDataFetch: function(){
		if (this.view.parameters){
        	this.cardId = this.view.parameters['cardId'];
		}
		
		var restriction = new Ab.view.Restriction();
        restriction.addClause("sc_zzfcard.card_id", this.cardId, "=");
        this.applicant_info.refresh(restriction,false);
        this.rm_detail.refresh(restriction,false);
        
        var restriction2 = new Ab.view.Restriction();
        restriction2.addClause("sc_zzf_renew.card_id", this.cardId, "=");
        this.renewPanel.refresh(restriction2);
	}

});
