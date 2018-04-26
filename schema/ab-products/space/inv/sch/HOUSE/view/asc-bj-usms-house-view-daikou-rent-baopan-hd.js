var ascDaikouBaopanController = View.createController('ascDaikouBaopanController', {
    afterViewLoad: function(){
        jQuery('#selectYear').get(0).options[0].selected = true;
        jQuery('#selectMonth').get(0).options[0].selected = true;
        this.zzf_fee_detail.addParameter("descBefore", "'代缴 ['");
        this.zzf_fee_detail.addParameter("descAfter", "'] 的房租'");
        this.zzf_fee_detail_yhd.addParameter("descBefore", "'代缴 ['");
        this.zzf_fee_detail_yhd.addParameter("descAfter", "'] 的房租'");
    },
    
    console_panel_onShow: function(){
        var yearInput = jQuery('#selectYear option:selected').val();
        var monthInput = jQuery('#selectMonth option:selected').val();
        var restriction = new Ab.view.Restriction();
        if(trim(yearInput) == '' || trim(monthInput) == ''){
        	View.showMessage("请输入年、月");
        	return;
        }
        if (trim(yearInput) != '' && trim(monthInput) != '') {
            restriction.addClause('sc_zzf_fee.year', yearInput);
            if (monthInput < 10) {
                monthInput = '0' + monthInput;
            }
            restriction.addClause('sc_zzf_fee.month', monthInput);
            
            this.zzf_fee_detail.refresh(restriction);
            this.zzf_fee_detail_yhd.refresh(restriction);
        }
        else {
            this.zzf_fee_detail.refresh('1<>1');
            this.zzf_fee_detail_yhd.refresh('1<>1');
        }
        this.zzf_fee_detail.appendTitle(yearInput + "-" + monthInput + "-未核对");
        this.zzf_fee_detail_yhd.appendTitle(yearInput + "-" + monthInput + "-已核对");
    },
    
    console_panel_onClear: function(){
        jQuery('#selectYear').get(0).options[0].selected = true;
        jQuery('#selectMonth').get(0).options[0].selected = true;
        
        this.zzf_fee_detail.show(false);
        this.zzf_fee_detail_yhd.show(false);
    },
    zzf_fee_detail_onCheck: function(){
    	var grid = this.zzf_fee_detail;
		var selectedRecordList = grid.getSelectedRecords();
		if(selectedRecordList.length == 0){
			View.alert('请选择要核对的数据');
			return;
		}
		var controller = this;
		View.confirm("您确定您所选的记录都缴费完全了吗?", function(button){
			if (button == 'yes') {
				for(var i = 0;i < selectedRecordList.length;i++){
					var record = selectedRecordList[i];
					var fee_id = record.getValue('sc_zzf_fee.fee_id');
					controller.updateFees(fee_id);
				}
				controller.zzf_fee_detail.refresh();
				controller.panelRefresh();
			}
		});
    },
    updateFees:function(fee_id){
		var ds= View.dataSources.get("scZZFFeesDs")
	
		var restriction={"sc_zzf_fee.fee_id":fee_id};
		var record=ds.getRecord(restriction);
		try{
			record.setValue("sc_zzf_fee.pay_actual",record.getValue("sc_zzf_fee.pay_ought"));
			ds.saveRecord(record);
		}catch(e){}
	},
	zzf_fee_detail_yhd_pay_onClick: function(row){
        var feeId = row.record['sc_zzf_fee.fee_id'];
        var restriction = new Ab.view.Restriction();
        restriction.addClause('sc_zzf_fee.fee_id', feeId);
        View.openDialog('asc-bj-usms-house-assign-card.axvw', restriction, false, {
            width: 700,
            height: 450,
            closeButton: false,
            afterInitialDataFetch: function(dialogView){
                var dialogController = dialogView.controllers.get('ascPaymentDetailController');
                dialogController.openerController = ascDaikouBaopanController;
            }
        });
    },
    panelRefresh: function(){
    	this.console_panel_onShow();
    }
});

