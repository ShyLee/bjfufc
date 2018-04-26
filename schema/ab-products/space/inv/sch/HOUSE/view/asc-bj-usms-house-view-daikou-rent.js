var ascDaikouEditController = View.createController('ascDaikouEditController', {
    
	afterViewLoad: function(){
        this.zzf_fee_detail.addParameter("descBefore", "'代缴 ['");
        this.zzf_fee_detail.addParameter("descAfter", "'] 的房租'");
    },
	
    zzf_fee_detail_edit_onClick: function(row){
        var feeId = row.record['sc_zzf_fee.fee_id'];
        var restriction = new Ab.view.Restriction();
        restriction.addClause('sc_zzf_fee.fee_id', feeId);
        this.edit_panel.refresh(restriction);
        this.edit_panel.show(true);
        this.edit_panel.showInWindow({
            x: 350,
            y: 200,
            width: 500,
            height: 400,
            closeButton: false
        });
    },
    
    edit_panel_onSave: function(){
        if (this.edit_panel.save()) {
            this.zzf_fee_detail.refresh();
            this.edit_panel.closeWindow();
        }
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
        var feeId = row.record['sc_zzf_fee.fee_id'];
        var restriction = new Ab.view.Restriction();
        restriction.addClause('sc_zzf_fee.fee_id', feeId);
        View.openDialog('asc-bj-usms-house-assign-card.axvw', restriction, false, {
            width: 700,
            height: 450,
            closeButton: false,
            afterInitialDataFetch: function(dialogView){
                var dialogController = dialogView.controllers.get('ascPaymentDetailController');
                dialogController.openerController = ascDaikouEditController;
            }
        });
    }
});
