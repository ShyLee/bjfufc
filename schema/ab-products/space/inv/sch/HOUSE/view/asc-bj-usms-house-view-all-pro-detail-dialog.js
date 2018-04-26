var renewDetailEmController = View.createController("renewDetailEmController", {
	cardId: null,
	wfrId: 'AbSpaceRoomInventoryBAR-iReportHandler-PmreReport',
	
	afterInitialDataFetch: function(){
		if (this.view.parameters){
        	this.cardId = this.view.parameters['cardId'];
		}
		var restriction = new Ab.view.Restriction();
        restriction.addClause("sc_zzfcard.card_id", this.cardId, "=");
        this.Personnel_info.refresh(restriction,false);
        this.po_info.refresh(restriction,false);
        this.rm_detail.refresh(restriction,false);
        this.protocol_info.refresh(restriction,false);
        
        var restriction2 = new Ab.view.Restriction();
        restriction2.addClause("sc_zzf_renew.card_id", this.cardId, "=");
        this.renewPanel.refresh(restriction2);
        
        var restriction3 = new Ab.view.Restriction();
        restriction3.addClause("sc_zzf_fee.card_id", this.cardId, "=");
        this.fee_info.refresh(restriction3);
	},
	Personnel_info_onPrintDj: function(){
        var card_id = this.Personnel_info.getFieldValue("sc_zzfcard.card_id");
		
        var xmlName= "sczzf_dj";
        var parameters= {
			'cardId': card_id
        };
		try {
            var result = Workflow.callMethod(this.wfrId, xmlName, 0, parameters);
            if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
                result.data = eval('(' + result.jsonExpression + ')');
                this.jobId = result.data.jobId;
                var url = 'ab-ireport-example.axvw?jobId=' + this.jobId;
                window.open(url);
            }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    },
    Personnel_info_onPrintTf: function(){
        var card_id = this.Personnel_info.getFieldValue("sc_zzfcard.card_id");
		
        var xmlName= "sczzf_tf";
        var parameters= {
			'cardId': card_id
        };
		try {
            var result = Workflow.callMethod(this.wfrId, xmlName, 0, parameters);
            if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
                result.data = eval('(' + result.jsonExpression + ')');
                this.jobId = result.data.jobId;
                var url = 'ab-ireport-example.axvw?jobId=' + this.jobId;
                window.open(url);
            }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    }
	

});
