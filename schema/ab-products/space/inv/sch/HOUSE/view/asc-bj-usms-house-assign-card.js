var ascPaymentDetailController = View.createController('ascPaymentDetailController', {
    afterInitialDataFetch: function(){
        var today = new Date();
        var strYear = today.getFullYear();
        var strDay = today.getDate();
        var strMonth = today.getMonth() + 1;
        datestr = strYear + "-" + strMonth + "-" + strDay;
        this.assign_detail.setFieldValue('sc_zzf_fee.date_payment', datestr);
    },
    
    assign_detail_onSave: function(){
        if (this.assign_detail.save()) {
            View.getOpenerView().controllers.get('ascZijiaoAssignController').zzf_fee_detail.refresh();
            View.getOpenerView().controllers.get('ascDaikouBaopanController').zzf_fee_detail.refresh();
            View.getOpenerView().controllers.get('ascDaikouBaopanController').zzf_fee_detail_yhd.refresh();
            View.closeThisDialog();
        }
    }
});
