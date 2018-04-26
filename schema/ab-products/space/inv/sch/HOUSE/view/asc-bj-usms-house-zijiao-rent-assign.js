var ascZijiaoAssignController = View.createController('ascZijiaoAssignController', {
    zzf_user_detail_histroy_onClick: function(row){
        var cardId = row.record['sc_zzfcard.card_id'];
        var restriction = new Ab.view.Restriction();
        restriction.addClause('sc_zzf_fee.card_id', cardId);
		this.zzf_fee_detail.show(true);
        this.zzf_fee_detail.refresh(restriction);
    },
    
    panelRefresh: function(){
        var grid = this.zzf_fee_detail;
        if (grid.rows.length > 0) {
            var cardId = grid.rows[0]['sc_zzf_fee.card_id'];
			var restriction = new Ab.view.Restriction();
			restriction.addClause('sc_zzf_fee.card_id',cardId);
			this.zzf_fee_detail.show(true);
            this.zzf_fee_detail.refresh(restriction);
        }
    },
    
    zzf_fee_detail_pay_onClick: function(row){
    	var cardId = row.record['sc_zzf_fee.card_id'];
    	var datePayBegin = row.record['sc_zzf_fee.date_pay_begin'];
    	var datePayEnd = row.record['sc_zzf_fee.date_pay_end'];
        var restriction = new Ab.view.Restriction();
        restriction.addClause('sc_zzf_fee.card_id', cardId);
        restriction.addClause('sc_zzf_fee.date_pay_begin', datePayBegin);
        restriction.addClause('sc_zzf_fee.date_pay_end', datePayEnd);
        View.openDialog('asc-bj-usms-house-assign-card.axvw', restriction, false, {
            width: 700,
            height: 450,
            closeButton: false,
            afterInitialDataFetch: function(dialogView){
                var dialogController = dialogView.controllers.get('ascPaymentDetailController');
                dialogController.openerController = ascZijiaoAssignController;
            }
        });
    }
    
});
