var ascBjUsmsProcAsgnApproveReqApproveTabController = View.createController("ascBjUsmsProcAsgnApproveReqApproveTabController", {
    tabs: null,
    restriction: null,
	role:null,
	em:null,
	step:"",
	activityType:null,//驳回流程添加wgw
    afterViewLoad: function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
		this.activityType = this.tabs.activityType;
		this.step=this.tabs.step;
		
	    var sczzfcardIdRes = new Ab.view.Restriction();
	    sczzfcardIdRes.addClause('sc_zzfcard.card_id', this.tabs.cardId, '=');
        
	    this.requestorInfoFrom.refresh(sczzfcardIdRes);
        this.destricptionForm.refresh(sczzfcardIdRes);
   },
   afterInitialDataFetch:function(){
	   var restriction = new Ab.view.Restriction();
       restriction.addClause("helpdesk_step_log.pkey_value", this.tabs.activityLogId, "=");
       this.historyPanel.refresh(restriction);
       this.historyPanel.show(true);
	   
   },
   historyPanel_afterRefresh: function(){
       reloadHistoryPanel(this.historyPanel);
   },
    
	
    onBack: function(){
        var tabName = 'selectRequestTab';
        var tab = this.tabs.findTab(tabName);
        this.tabs.selectTab(tabName);
        tab.loadView();
        tab.show(true);
    },
	
    onShowApproveWindow: function(){
    	var res = new Ab.view.Restriction();
 	    res.addClause('activity_log.activity_log_id', this.tabs.activityLogId, '=');
 	    
    	this.approveForm.refresh(res);
		$("comments").value="同意";
        this.approveForm.showInWindow({
            width: 800,
            height: 300,
            closeButton: false})
    },
    /*
	 * 确认审批通过按钮
	 */
    approveForm_onApprove: function(){
        var record = this.getRecord();
        var comments = $("comments").value;
        if(comments.length<1){
        	View.showMessage("请输入审核批语!");
        	return ;
        }
        try {
        	
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-approveRequest',record, comments);
            
            this.closeApproveWindow(false);
            if (result.code == 'executed') {
            	
            	if(this.step == slaConstantController.STEP_HOUSE_REQUEST_ZS){
                   	this.updateCardStatus(true);
                 }
            	
            	var father=this;
    			View.showMessage('message', "审批通过！", '', '',
    				    function() {
    						father.onBack();
    				    }
    				); 
    		 }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    },
    /**
     *  驳回
     * */
    approveForm_onReject: function(){
        var record = this.getRecord();
        var comments = $("comments").value;
       
        if(comments.length<1){
        	View.showMessage("请输入评语-驳回原因！");
        	return ;
        }
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-backtoRequest', record, comments);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        this.closeApproveWindow(true);
        if (result.code == 'executed') {
        	this.updateCardStatus(false);
        	var father=this;
			View.showMessage('message', "驳回成功！", '', '',
				    function() {
						father.onBack();
						    }
				); 
		 }
    },
    /**
     * 如果审批步骤是 主管领导审批 ，则更新card状态为已审批
     * 
     * 如果驳回，则更新card状态为已驳回
     * 
     * */
    updateCardStatus:function(isAgreed){
    	var card = this.requestorInfoFrom.getFieldValue('sc_zzfcard.card_id');
    	var res = new Ab.view.Restriction();
		res.addClause('sc_zzfcard.card_id',card,'=');
		var record = this.sc_zzfcardDataSource.getRecord(res);
		if(isAgreed){
			record.setValue('sc_zzfcard.card_status','ysp');
		}else{
			record.setValue('sc_zzfcard.card_status','ybh');
		}
		
		this.sc_zzfcardDataSource.saveRecord(record);
    },
    getRecord: function(){
        var record = {};
        record['activity_log.activity_log_id'] = this.approveForm.getFieldValue('activity_log.activity_log_id');
        record['activity_log.approved_by'] = this.em;
        record['activity_log_step_waiting.step_log_id'] = this.approveForm.getFieldValue('activity_log_step_waiting.step_log_id');
        
        //驳回流程添加wgw
        record['activity_log.activity_type'] = this.activityType;
        return record;
    },
    
   closeApproveWindow: function(isReject){
	   this.approveForm.closeWindow();
	   var restriction = new Ab.view.Restriction();
       restriction.addClause("helpdesk_step_log.pkey_value", this.tabs.activityLogId, "=");
       this.historyPanel.refresh(restriction);
       this.requestorInfoFrom.actions.get('approve').enable(false);
	   
//        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.closeWindow();
//        if (isReject) {
//            this.showHistoryPanel('hactivity_log');
//        }
//        else {
//            this.showHistoryPanel('activity_log');
//        }
//        this.ascBjUsmsProcCheckinApproveReqApproveTeacherForm.actions.get('approve').enable(false);
    }
    
});

function reloadHistoryPanel(historyPanel){
    var rows = historyPanel.rows;
    
    var datetime = "";
    var stepNum = 0;
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row['em.name']) {
            row['helpdesk_step_log.user_name'] = row['em.name'];
        }
         
        if (row["helpdesk_step_log.date_response"] == "" && row["helpdesk_step_log.time_response"] == "") {
            datetime = '待审批...';
        }
        else {
            datetime = row["helpdesk_step_log.date_response"] + " " + row["helpdesk_step_log.time_response"];
        }
        row['helpdesk_step_log.date_response'] = datetime;
        
        row['helpdesk_step_log.date_created'] =  row["helpdesk_step_log.date_created"] + " " + row["helpdesk_step_log.time_created"];
        
        if (row['afm_wf_steps.step'] == 'Basic') {
            if (i == 0) {
                row['afm_wf_steps.step'] = '教职工--申请';
            }
            else {
                row['afm_wf_steps.step'] = '完成审批';
            }
        }
        if(i > 1){
	        if(rows[i]['afm_wf_steps.step'] == rows[i-1]['afm_wf_steps.step']){
	        	row['helpdesk_step_log.step_log_id'] = stepNum + "";
	        }else{
	        	row['helpdesk_step_log.step_log_id'] = ++stepNum + "";
	        }
        }else{
        	row['helpdesk_step_log.step_log_id'] = ++stepNum + "";
        }
    }
    historyPanel.reloadGrid();
}
