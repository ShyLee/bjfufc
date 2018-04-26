var ascDaikouBaopanController = View.createController('ascDaikouBaopanController', {
    year: null,
    month: null,
    ff_status: null, //缴费项的发放状态【yhd:已核对;ysc;已生成;wsc;为生成】
    wfrId: 'AbSpaceRoomInventoryBAR-iReportHandler-PmreReport',
	
    
    afterViewLoad: function(){
        jQuery('#selectYear').get(0).options[0].selected = true;
        jQuery('#selectMonth').get(0).options[0].selected = true;
        this.zzf_fee_detail.addParameter("descBefore", "'代缴 ['");
        this.zzf_fee_detail.addParameter("descAfter", "'] 的房租'");
        this.exportPanel.addParameter("descBefore", "'代缴 ['");
        this.exportPanel.addParameter("descAfter", "'] 的房租'");
    },
    exportPanel_afterRefresh: function(){
        this.exportPanel.setTitle(this.year + "年-" + this.month + "月 房租交纳明细表");
        this.exportPanel.show(false);
    },
    
    console_panel_onShow: function(){
        var yearInput = document.getElementById('selectYear').getElementsByTagName('option')[document.getElementById('selectYear').selectedIndex].innerHTML;
        yearInput = yearInput.replace("\n","");
        var monthInput = document.getElementById('selectMonth').getElementsByTagName('option')[document.getElementById('selectMonth').selectedIndex].innerHTML;
        monthInput = monthInput.replace("\n","");
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
            
            this.exportPanel.refresh(restriction);
            this.exportPanel.show(false);
            
            
            var parameters = {
                tableName: 'sc_zzf_fee',
                fieldNames: toJSON(['sc_zzf_fee.fee_id']),
                restriction: "sc_zzf_fee.card_id in (select card_id from sc_zzfcard where payment_to = 'finance') and sc_zzf_fee.pay_actual > 0 and TO_CHAR (sc_zzf_fee.date_pay_begin, 'yyyy') ='" + this.year + "' and TO_CHAR (sc_zzf_fee.date_pay_begin, 'mm')= '"+ this.month + "'"
            };
            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
            if (result.data.records.length > 0) {
            	this.ff_status = 'yhd';
            	this.zzf_fee_detail.appendTitle(this.year +  "年" + this.month  + "月  [已核对]");
            }else{
                    var parameters = {
                        tableName: 'sc_zzf_fee',
                        fieldNames: toJSON(['sc_zzf_fee.fee_id']),
                        restriction: "sc_zzf_fee.card_id in (select card_id from sc_zzfcard where payment_to = 'finance') and TO_CHAR (sc_zzf_fee.date_pay_begin, 'yyyy') ='" + this.year + "' and TO_CHAR (sc_zzf_fee.date_pay_begin, 'mm')= '"+ this.month + "'"
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
            this.exportPanel.refresh('1<>1');
            this.exportPanel.refresh.show(false);
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
    	if(this.ff_status == 'yhd'){
    		View.showMessage("本月缴费记录[已核对],不能重新生成'");
    		return;
    	}else{
    		View.confirm("您确定要生成本月的缴费记录吗?若本月已生成过，继续生成则会覆盖之前的记录.", function(button){
                if (button == 'yes') {
                	try {
                     	var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-CalcZzfEmRentBjfu-createFeesByMonthFinance', controller.year,controller.month);
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
    	
    	
    },
    /**
     * 打印报表
     * */
    zzf_fee_detail_onExport: function(){
         var xmlName= "sczzf_finance";
         var parameters= {
 			'yyyymm': this.year + '-' + this.month,
 			'yyyymmstr': this.year + '年' + this.month + '月'
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
    
    /**
     * 编辑卫生费、水费、其他费用和用水量等信息
     */
    editeFee: function(){
    	var selectedRowIndex=this.zzf_fee_detail.selectedRowIndex;
    	var feeId=this.zzf_fee_detail.gridRows.get(selectedRowIndex).getRecord().getValue("sc_zzf_fee.fee_id");
    	var res=new Ab.view.Restriction();
    	res.addClause("sc_zzf_fee.fee_id",feeId,'=');
    	this.FeeEditeForm.showInWindow({
    		width: 700,
    		height:450,
    		closeButton: false
    	});
    	this.FeeEditeForm.refresh(res,false);
    },
    
    FeeEditeForm_onBtnSave: function(){
    	getTotalValue();
    	var saved=this.FeeEditeForm.save();
    	if(saved){
    		this.console_panel_onShow();
    		this.FeeEditeForm.closeWindow();
    		View.alert("保存成功");
    	}
    },
    FeeEditeForm_onBtnCancel: function(){
    	this.FeeEditeForm.closeWindow();
    },
    
    zzf_fee_detail_onModel : function () {
    	var yearInput = jQuery('#selectYear option:selected').val();
        var monthInput = jQuery('#selectMonth option:selected').val();
        
        var restriction="TO_CHAR(sc_zzf_fee.date_pay_begin, 'yyyy')='"+yearInput+"' and TO_CHAR(sc_zzf_fee.date_pay_begin, 'mm')='"+monthInput+"'";
        
        this.zzfFeeDsT.setRestriction(restriction);
        this.exportPanelT.restriction=restriction;
        	
    	var reportViewName = this.exportPanelT.viewDef.viewName+ '.axvw';
    	var url = 'ab-data-transfer-main.axvw?viewName='+ reportViewName + '&panelId=' + this.exportPanelT.id;
    	url = url + '&isExportDocument=false';
    	url = url + '&isImportDocument=false';
    	View.openDialog(url, null, false);
    },
    
    zzf_fee_detail_onExportAllSchool: function(){
        var xmlName= "sczzf_finance_allschool";
        var parameters= {
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
    
});

function getTotalValue(){
	var panel=View.panels.get("FeeEditeForm");
	var rentFee=panel.getFieldValue("sc_zzf_fee.rm_rent_fee");
	var healthFee=panel.getFieldValue("sc_zzf_fee.health_fee");
	var otherFee=panel.getFieldValue("sc_zzf_fee.other_fee");
	var waterFee=panel.getFieldValue("sc_zzf_fee.water_fee");
	
	if(valueExistsNotEmpty(rentFee)){
		rentFee=rentFee-0;
	}else{
		rentFee=0;
	}
	if(valueExistsNotEmpty(healthFee)){
		healthFee=healthFee-0;
	}else{
		healthFee=0;
	}
	if(valueExistsNotEmpty(otherFee)){
		otherFee=otherFee-0;
	}else{
		otherFee=0;
	}
	if(valueExistsNotEmpty(waterFee)){
		waterFee=waterFee-0;
	}else{
		waterFee=0;
	}
	
	var totalFee=(rentFee+healthFee+otherFee+waterFee).toFixed(2);
	
	panel.setFieldValue("sc_zzf_fee.pay_ought",totalFee);
	
}

