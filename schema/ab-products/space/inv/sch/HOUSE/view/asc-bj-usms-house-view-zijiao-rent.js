var ascPaymentController = View.createController('ascPaymentController', {

    afterInitialDataFetch: function(){
        this.calcPassDays();
    },
    
    calcPassDays: function(){
        var today = new Date();
        var grid = this.zzf_fee_detail;
        for (var i = 0; i < grid.rows.length; i++) {
            var dateEnd = grid.rows[i]['sc_zzf_fee.date_pay_end'];
            dateEnd = dateEnd.replace("-", "/").replace("-", "/");
            dateEnd = new Date(dateEnd);
            var days = (today.getTime() - dateEnd.getTime()) / 1000 / 60 / 60 / 24;
            grid.rows[i].row.setFieldValue('sc_zzf_fee.pass_days', days);
        }
    },
    
    panelRefresh: function(){
        this.zzf_fee_detail.refresh();
    },
    
    zzf_fee_detail_afterRefresh: function(){
        this.calcPassDays();
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
                dialogController.openerController = ascPaymentController;
            }
        });
    }
});
