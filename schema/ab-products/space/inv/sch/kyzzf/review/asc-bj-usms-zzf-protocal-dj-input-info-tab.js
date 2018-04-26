var ascBjUsmsZZFProtacalRmDjController = View.createController("ascBjUsmsZZFProtacalRmDjController", {

    tabs: null,
    activityLogId: null,
    record: null,
    protocal_id: null,
    afterInitialDataFetch: function(){
    	
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        var activity_log_id = this.tabs.activityLogId;
        
        $('save').value = "保存";
        $('print').value = "生成协议";
        $('back').value = "返回";
        
        //自动生成登记号
        this.initLogInNo();

        //1.根据 activity_log_id 获取 协议ID protocal_id	
        this.protocal_id = this.getProtocalId(activity_log_id);
        if (this.protocal_id == null) {
            alert("协议带出失败!");
        }
        else {
            //2.初始化协议信息
            this.initialProtoacl();
            
            //3.初始化该协议下的建筑物信息
            this.initialProtoaclRm();
            
			//4初始化缴费单
			this.showFees();
        }
    },
    
    /**
     * 根据 activity_log_id 获取 协议ID protocal_id
     * @Parameter
     * activity_log_id
     * @Return
     * protocal_id
     * */
    getProtocalId: function(activity_log_id){
        var protocal_id = null;
        
        var restriction = new Ab.view.Restriction();
        restriction.addClause('activity_log.activity_log_id', activity_log_id, '=');
        var record = this.activityLogDs.getRecord(restriction);
        protocal_id = record.getValue('activity_log.protocal_id');
        
        return protocal_id;
    },
    /**
     * 显示应付详情
     * 
     * */
    showFees: function(){
    	var Fees = this.cauculateFees();
    	var contactPeople = this.protocolInfo.getFieldValue('bh_zzf_protocal.party_b_contacts');
    	var contactPeopleTel = this.protocolInfo.getFieldValue('bh_zzf_protocal.party_b_con_tel');
    	this.feesInfo.clearGridRows();
    	for(var i=0; i < Fees.length ;i++){
    		var record= new Ab.data.Record();
    		
    		record.setValue("bh_zzf_fees.should_fees_date", Fees[i].payDate);
    		record.setValue("bh_zzf_fees.should_fees_money", Fees[i].payFee);
    		record.setValue("bh_zzf_fees.party_contacts", contactPeople);
    		record.setValue("bh_zzf_fees.party_contacts_tel", contactPeopleTel);
    		
    		this.feesInfo.addGridRow(record);
    	}
    	this.feesInfo.update();
    },
    /**
     * 根据支付周期自动计算应付租金
     * 
     * pay_period:[0;季付;1;半年付;2;年付]
     * 
     * @returns arry{object,object}
     * 
     * */
    cauculateFees: function(){
    	var arry = new Array();
    	
    	var pay_period = this.protocolInfo.getFieldValue('bh_zzf_protocal.pay_period');
    	var tatalFee = this.protocolInfo.getFieldValue('bh_zzf_protocal.price_total_rent');
    	
    	var date_begin = this.leaseTerm.getFieldValue('bh_zzf_protocal.date_begin');
    	var date_end = this.leaseTerm.getFieldValue('bh_zzf_protocal.date_end');
    	var live_time = this.leaseTerm.getFieldValue('bh_zzf_protocal.live_time');
    	
    	var interval = 0;//付款间隔
    	if(pay_period == 0){//季付[每四个月付一次]
    		interval = 4;
    	}else if(pay_period == 1){//半年付
    		interval = 6;
    	}else if(pay_period == 2){//年付
    		interval = 12;
    	}
    	
		var payBegin = date_begin;
		var payEnd = null;
		var activityTime = live_time;
		var i = 0;
		do {
			var arr = payBegin.split("-");
			var yyyy = parseInt(arr[0]);
			var mm = parseInt(arr[1]);
			var dd = parseInt(arr[2]);
			
			if((mm + interval) < 12){
				mm += interval;
			}else{
				mm = mm + interval - 12;
				yyyy += 1;
			}
			
			if(mm < 10){
				mm = "0" + mm;
			}
			
			var payEnd = yyyy + "-" + mm + "-" + dd;
			//根据时间戳计算缴费天数
			payDays = this.getPayDate(payBegin,payEnd);
			
			if((activityTime - payDays) > 0){
				arry[i++] = new feeRecord(payBegin,((tatalFee/live_time) * payDays).toFixed(2));
    			activityTime -= payDays;
    			payBegin = payEnd;
			}else{
    			arry[i++] = new feeRecord(payBegin,((tatalFee/live_time) * activityTime).toFixed(2));
    			break;
			}	
		}while(activityTime > 0);
		
		return arry;
    },
    /**
     * 根据时间戳来计算缴费天数
     * 
     * */
    getPayDate: function(dateBegin,dateEnd){
    	dateBegin = dateBegin.replace(/-/g,"/") + " 00:00:00";
    	dateEnd = dateEnd.replace(/-/g,"/") + " 00:00:00";
    	
    	var begin = new Date(dateBegin);
    	var end = new Date(dateEnd); 
    	
    	return days = (end.getTime() - begin.getTime())/(3600000 * 24) + 1;
    },
    /**
     * 查看负责人下已租赁的房间信息
     * 
     * */
    protocolInfo_onCheckRentedRoom: function(){
    	var party_b_rep = this.protocolInfo.getFieldValue('bh_zzf_protocal.party_b_rep');
    	View.openDialog('asc-bj-usms-zzf-protocal-dj-check-protocal-rm-dialog.axvw', null, true, {
            width: 1024,
            height: 800,
            closeButton: false,
            title: "负责人[" + party_b_rep + "]已租赁的房屋",
            afterInitialDataFetch: function(dialogView){  
            	var dialogController = dialogView.controllers.get('abBjUsmsZZFProtocalDjCheckRmDialogController');
            	dialogController.protocalRm.addParameter("partyBRepId", party_b_rep);
            	dialogController.protocalRm.refresh();
            }    
                
        });
    	
    },
    
    /**
     * 自动生成登记序号
     * */
    initLogInNo: function(){
    	var myDate = new Date();
    	var yyyy = myDate.getFullYear();
    	var mm = myDate.getMonth() + 1;
    	if(mm < 10){
    		mm = '0' + mm;
    	}
    	var prefix = "XYDJ" + yyyy + mm;
    	
    	var restriction = new Ab.view.Restriction();
        restriction.addClause('bh_zzf_protocal.protocal_dj_id', prefix, "like");
        
        var records = this.zzf_protocol_ds.getRecords(restriction);
        if(records.length > 0){
        	var lastSqNum = records[records.length - 1].getValue("bh_zzf_protocal.protocal_dj_id");
        	var lsh = parseInt(lastSqNum.substring(10)) + 1;

        	if(lsh < 10){
        		lsh = '00' + lsh;
        	}else if(lsh < 100){
        		lsh = '0' + lsh;
        	}
        	
        	$('protocal_dj_id').value = prefix + lsh;
        }else{
        	var newSqNum = prefix + '001';
        	$('protocal_dj_id').value = newSqNum;
        }
    },
    /**
     * 初始化协议信息
     * @Parameter
     * protocal_id
     *
     * */
    initialProtoacl: function(){
        var restriction = new Ab.view.Restriction();
        restriction.addClause('bh_zzf_protocal.protocal_id', this.protocal_id, '=');
        this.leaseTerm.refresh(restriction);
        this.protocolInfo.refresh(restriction);
        
    },
    /**
     * 把date 类型的 转换为 "yyyy-mm-dd" 格式
     * */
    dateToString: function(date){
    
        return str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        
    },
    /**
     * 初始化协议建筑物信息
     * @Parameter
     * protocal_id
     * */
    initialProtoaclRm: function(){
        this.protocalRm.addParameter("activityLogId", this.protocal_id);
        this.protocalRm.refresh();
    },
	
    /**
     * 生成协议
     */
    ireportProtocal: function(){
        View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
            width: 470,
            height: 200,
            xmlName: "protocol",
            closeButton: false
        });
    },
    
    /**
     * 保存协议
     * 
     *   1.更新协议内容
	 *   2.保存租金信息
     */
    saveProtocal: function(){
    	if(!this.leaseTerm.canSave()){
    		return;
    	}
    	this.protocolInfo.setFieldValue('bh_zzf_protocal.protocal_dj_id', $('protocal_dj_id').value);
    	this.protocolInfo.setFieldValue('bh_zzf_protocal.time_pre', this.leaseTerm.getFieldValue('bh_zzf_protocal.time_pre'));
    	
        if (this.protocolInfo.canSave()) {
            var controller = this;
            var confirmMessage = "是否保存协议信息？";
            View.confirm(confirmMessage, function(button){
                if (button == 'yes') {
                    try {
                    	//1.更新协议内容
                    	controller.protocolInfo.save();
                    	//2.保存租金信息
                    	controller.feesInfoSave();
                    } 
                    catch (e) {
                        View.showMessage("操作失败,请重新操作！");
                        return;
                    }
                }
            });
        }else{
        	return;
        }
        
    },
    /**
     * 保存缴费信息
     */
    feesInfoSave: function(){
    	var items = this.feesInfo.gridRows.items;
    	for(var i = 0; i < items.length; i++){
    		
    		var record= new Ab.data.Record();
    		
    		record.setValue("bh_zzf_fees.protocal_id", this.protocal_id);
    		record.setValue("bh_zzf_fees.should_fees_date", items[i].getFieldValue('bh_zzf_fees.should_fees_date'));
    		record.setValue("bh_zzf_fees.should_fees_money", items[i].getFieldValue('bh_zzf_fees.should_fees_money'));
    	
    		record.setValue("bh_zzf_fees.party_contacts", items[i].getFieldValue('bh_zzf_fees.party_contacts'));
    		record.setValue("bh_zzf_fees.party_contacts_tel", items[i].getFieldValue('bh_zzf_fees.party_contacts_tel'));
    		
    		this.zzf_fees_ds.saveRecord(record);
    	}	
    },
    
    /**
     * 返回
     */
    onBack: function(){
        View.getWindow('parent').View.setTitle("房屋分配-审批");
        var tabName = 'selectRequestTab';
        var tab = this.tabs.findTab(tabName);
        this.tabs.selectTab(tabName);
    },
    
    
    
    
    
    /**
     * 审批意见
     */
    onShowApproveWindow: function(){
        $("comments").value = '';
        var role = View.user.role;
        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.save();
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.refresh(this.tabs.approveTabrestriction);
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.showInWindow({
            width: 600,
            height: 260
        });
    },
    /**
     * 审批
     */
    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onApprove: function(){
        var record = this.getRecord();
        var comments = $("comments").value;
        if (comments.length < 1) {
            View.showMessage("请输入审核批语!");
            return;
        }
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-approveRequest', record, comments);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        this.closeApproveWindow(false);
        if (result.code == 'executed' && View.user.role == 'UNV DIVISION HEAD') {
            //如果是二级院系领导审批完后则，给个提示
            var father = this;
            View.showMessage('message', "审批通过！", '', '', function(){
                father.onBack();
            });
        }
        
    },
    /**
     * 驳回
     */
    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onReject: function(){
        var record = this.getRecord();
        var comments = $("comments").value;
        
        if (comments.length < 1) {
            View.showMessage("请输入评语-驳回原因！");
            return;
        }
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-rejectRequest', record, comments);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        this.closeApproveWindow(true);
        if (result.code == 'executed' && View.user.role == 'UNV DIVISION HEAD') {
            //如果是二级院系领导审批完后则，给个提示
            var father = this;
            View.showMessage('message', "驳回成功！", '', '', function(){
                father.onBack();
            });
        }
    }
    
  
    
    
 
  
    
});

/**
 * 把缴费记录封装成一个feeRecord对象
 * */
function feeRecord(payDate,payFee)
{
	this.payDate = payDate;
	this.payFee = payFee;
}

/*function reloadHistoryPanel(historyPanel){
    var rows = historyPanel.rows;
    
    var datetime = "";
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var user = "";
        if (row['helpdesk_step_log.user_name']) 
            user = row['helpdesk_step_log.user_name'];
        if (row['em.name']) 
            user = row['em.name'];
        if (row['helpdesk_step_log.vn_id']) 
            user = row['helpdesk_step_log.vn_id'];
        row['helpdesk_step_log.vn_id'] = user;
        
        if (row["helpdesk_step_log.date_response"] == "" && row["helpdesk_step_log.time_response"] == "") {
            datetime = '下一步>>';
        }
        else {
            datetime = row["helpdesk_step_log.date_response"] + " " + row["helpdesk_step_log.time_response"];
        }
        row['helpdesk_step_log.date_response'] = datetime;
        
        if (row['afm_wf_steps.step'] == '基础') {
            if (i == 0) {
                row['afm_wf_steps.step'] = '申请人提交申请';
            }
            else {
                row['afm_wf_steps.step'] = '';
            }
        }
    }
    historyPanel.reloadGrid();
}
*/

