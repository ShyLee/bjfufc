var ascDaikouBaopanController = View.createController('ascDaikouBaopanController', {
    year: null,
    month: null,
    ff_status: null, //缴费项的发放状态【yjf:已缴费;ysc;已生成;wsc;为生成】
    afterViewLoad: function(){
        jQuery('#selectYear').get(0).options[0].selected = true;
        jQuery('#selectMonth').get(0).options[0].selected = true;
        this.zzf_fee_detail.addParameter("descBefore", "'代缴 ['");
        this.zzf_fee_detail.addParameter("descAfter", "'] 的房租'");
    },
    console_panel_onShow: function(){
        var yearInput = jQuery('#selectYear option:selected').val();
        var monthInput = jQuery('#selectMonth option:selected').val();
        if (yearInput == "" || monthInput == "") {
            View.showMessage("请输入查询年月");
            return;
        }
        if (monthInput < 10) {
            monthInput = '0' + monthInput;
        }
        this.year = yearInput;
        this.month = monthInput;
        var restriction = new Ab.view.Restriction();
        if (trim(yearInput) != '' && trim(monthInput) != '') {
            restriction.addClause('sc_zzf_fee.year', yearInput);
            restriction.addClause('sc_zzf_fee.month', monthInput);
            this.zzf_fee_detail.refresh(restriction);
            
            var parameters = {
                tableName: 'sc_zzf_fee',
                fieldNames: toJSON(['sc_zzf_fee.fee_id']),
                restriction: "sc_zzf_fee.card_id in (select card_id from sc_zzfcard where payment_to = 'house') and sc_zzf_fee.pay_actual > 0 and TO_CHAR (sc_zzf_fee.date_pay_begin, 'yyyy') ='" + this.year + "' and TO_CHAR (sc_zzf_fee.date_pay_begin, 'mm')= '"+ this.month + "'"
            };
            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
            if (result.data.records.length > 0) {
            	this.ff_status = 'yjf';
            	this.zzf_fee_detail.appendTitle(this.year +  "年" + this.month  + "月  [已缴费]");
            }else{
                    var parameters = {
                        tableName: 'sc_zzf_fee',
                        fieldNames: toJSON(['sc_zzf_fee.fee_id']),
                        restriction: "sc_zzf_fee.card_id in (select card_id from sc_zzfcard where payment_to = 'house') and TO_CHAR (sc_zzf_fee.date_pay_begin, 'yyyy') ='" + this.year + "' and TO_CHAR (sc_zzf_fee.date_pay_begin, 'mm')= '"+ this.month + "'"
                    };
                    var result2 = Workflow.call('AbCommonResources-getDataRecords', parameters);
                    if(result2.data.records.length > 0){
                    	this.ff_status = 'ysc';
                    	this.zzf_fee_detail.appendTitle(this.year +  "年" + this.month  + "月 [已生成]");
                    }else{
                    	this.ff_status = 'wsc';
                    	this.zzf_fee_detail.appendTitle(this.year +  "年" + this.month  + "月 [未生成]");
                    }
            }
        }
        else {
            this.zzf_fee_detail.refresh('1<>1');
        }
    },
    console_panel_onClear: function(){
        jQuery('#selectYear').get(0).options[0].selected = true;
        jQuery('#selectMonth').get(0).options[0].selected = true;
        this.zzf_fee_detail.refresh('1<>1');
        this.zzf_fee_detail.show(false);
    },
    /***
     * 生成缴费项目
     * */
    zzf_fee_detail_onCreateFee: function(){
    	var controller = this;
    	if(this.ff_status == 'yjf'){
    		View.showMessage("本月缴费记录[已缴费],不能重新生成'");
    		return;
    	}else{
    		View.confirm("您确定要生成本月的缴费记录吗?若本月已生成过，继续生成则会覆盖之前的记录.", function(button){
                if (button == 'yes') {
                	try {
                     	var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-CalcZzfEmRentBjfu-createFeesForHouse', controller.year,controller.month);
                    } 
                    catch (e) {
                        Workflow.handleError(e);
                    }
                    View.showMessage("生成成功!");
                    //只需刷新按月发放tab页
                    controller.console_panel_onShow();
                }
            });
    	}
    	
    	
    }
});

