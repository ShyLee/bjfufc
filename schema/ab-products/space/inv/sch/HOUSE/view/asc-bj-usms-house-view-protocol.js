var ascProtocolWarnController = View.createController('ascProtocolWarnController', {

    afterViewLoad: function(){
    	try {
    		var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-updateZZFColorTwo-protocolWarn');
            } catch (e) {
        	Workflow.handleError(e);
         	}	
            if (result.code == 'executed') {
            }
        $('idd1').innerHTML = "<font size='2'>60天内到期</font>";
        $('idd2').innerHTML = "<font size='2'>30天内到期</font>";
        $('idd3').innerHTML = "<font size='2'>已到(逾)期</font>";
        jQuery("#color2 a[class*='changeColor']").bind('click', function(e, value){
            var val = jQuery(this).attr('value');
            ascProtocolWarnController.zzf_fee_detail.addParameter('colorRes', "sc_zzfcard.color ='" + val + "'");
            ascProtocolWarnController.zzf_fee_detail.refresh();
        });
    },
    
    color2_onShowAll: function(){
        this.zzf_fee_detail.clearParameters();
		this.zzf_fee_detail.refresh();
    },
    
    zzf_fee_detail_quit_onClick: function(row){
        var card_id = row.record['sc_zzfcard.card_id'];
        var card_type = row.record['sc_zzfcard.card_type'];
        View.openDialog("asc-bj-usms-proc-house-check-out-dialog.axvw", null, false, {
            title: '房屋租赁-退住卡片',
            width: 1000,
            height: 800,
            cardId: card_id,
            cardType: card_type,
            parentController: ascProtocolWarnController,
            closeButton: false
        });
    },
    
    zzf_fee_detail_renew_onClick: function(row){
        var card_id = row.record['sc_zzfcard.card_id'];
        var card_type = row.record['sc_zzfcard.card_type'];
        var em_id = row.record['sc_zzfcard.em_id'];
        var cardRecord = this.getZZFCardInfoById(card_id);
        if (card_type == '周转房(在校职工)') {//0;周转房(在校职工)
            var inMonths = this.getInDaysByEmId(em_id);//此员工历史有效入住周转房月数
            View.openDialog("asc-bj-usms-proc-house-renew-em-dialog.axvw", null, false, {
                title: '房屋租赁-续签卡片',
                width: 1200,
                height: 400,
                cardId: card_id,
                inMonths: inMonths,
                cardRecord: cardRecord,
                parentController: ascProtocolWarnController,
                closeButton: false
            });
        }
        else 
            if (card_type == '周转房(外来人员)') {//1;周转房(外来人员)
                View.openDialog("asc-bj-usms-proc-house-renew-outside-dialog.axvw", null, false, {
                    title: '房屋租赁-续签卡片',
                    width: 1200,
                    height: 400,
                    cardId: card_id,
                    cardRecord: cardRecord,
                    parentController: ascProtocolWarnController,
                    closeButton: false
                });
            }
            else 
                if (card_type == '博士后公寓') {//2;博士后公寓
                    View.openDialog("asc-bj-usms-proc-house-renew-boshi-dialog.axvw", null, false, {
                        title: '房屋租赁-续签卡片',
                        width: 1200,
                        height: 400,
                        cardId: card_id,
                        cardRecord: cardRecord,
                        parentController: ascProtocolWarnController,
                        closeButton: false
                    });
                }
    },
    
    /**
     * 返回 教职工的累积住宿月数
     *
     * */
    getInDaysByEmId: function(em_id){
        var months = 0;
        var restriction = "sc_zzfcard.em_id='" + em_id + "'";
        var parameters = {
            tableName: 'sc_zzfcard',
            fieldNames: toJSON(['sc_zzfcard.total_rent']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        for (var i = 0; i < result.data.records.length; i++) {
            months += parseInt(result.data.records[i]['sc_zzfcard.total_rent']);
        }
        return months;
    },
    
    getZZFCardInfoById: function(card_id){
        var restriction = "sc_zzfcard.card_id='" + card_id + "'";
        var parameters = {
            tableName: 'sc_zzfcard',
            fieldNames: toJSON(['sc_zzfcard.card_id', 'sc_zzfcard.htqx', 'sc_zzfcard.date_checkin', 'sc_zzfcard.date_checkout_ought', 'sc_zzfcard.payment_to', 'sc_zzfcard.rent_period']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        return result;
    }
});
