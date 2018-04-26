var approveController = View.createController("approveController", {
    tabs: null,
    activityLogId: null,
    record: null,
    updateTypeValue:null,
    afterViewLoad:function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.activityLogId = this.tabs.activityLogId;
        this.updateTypeValue=this.tabs.step;
        this.initComments();
      	jQuery('#applyForm textarea').attr("disabled","disabled");
  
    },
    initComments:function(){
    	var restriction = "step_status_result='approved' and pkey_value="+this.activityLogId;
   	    var records = this.helpdeskStepLogDs.getRecords(restriction);
   	    for(var i=0;i<records.length;i++){
   	    	var record=records[i];
   	    	var comments=record.getValue("helpdesk_step_log.comments");
   	    	var user=record.getValue("helpdesk_step_log.user_name");
   	    	var date=record.getValue("helpdesk_step_log.date_response");
   	    	var stepType=record.getValue("helpdesk_step_log.step")
   	    	var today = new Date(date);
   	    	var step=stepType.substring(stepType.length - 2);
   	    	var uiValue = today.format(View.dateFormat);
   	    	var $comment = jQuery("<textarea></textarea>");
   	    	var $user = jQuery("<input></input>").val(user).attr("readOnly","readOnly").css("border","none").css("background-color"," #F3F7FB");
   	    	var $date = jQuery("<input></input>").val(uiValue).attr("readOnly","readOnly").css("border","none").css("background-color"," #F3F7FB");
   	    	
   	    	$comment.text(comments).attr("disabled","disabled");
   	    	var userLabel=jQuery("<Lable></Lable>").text(step+"人   ");
   	    	var dateLabel=jQuery("<Lable></Lable>").text(step+"日期  ").css("margin-left","120px");
   	    	jQuery("#historyComments").append("<br/>").append("<b>"+step+"意见</b>").append("<br/>").append($comment).append("<br/>").append(userLabel).append($user).append(dateLabel).append($date);
   	 
   	    }
    	
    },
    init:function(){
        var restriction = new Ab.view.Restriction();
        restriction.addClause('activity_log.activity_log_id', this.activityLogId, '=');
        this.approveForm.refresh(restriction);
        
        var restriction2 = new Ab.view.Restriction();
        restriction2.addClause('bh_zzf_apply.zzf_sq_id',this.tabs.applyNumber, '=');
        restriction2.addClause('bh_zzf_apply.activity_log_id', this.activityLogId, '=');
        this.applyForm.refresh(restriction2);
    },
    afterInitialDataFetch: function(){
        this.init();
    	jQuery("#comments").text("");
      	jQuery("#comments").focus();
    }
    ,
    getRecord: function(){
        var record = {};
        record['activity_log.activity_log_id'] = this.approveForm.getFieldValue('activity_log.activity_log_id');
        record['activity_log.approved_by'] = this.approveForm.getFieldValue('activity_log.approved_by');
        record['activity_log_step_waiting.step_log_id'] = this.approveForm.getFieldValue('activity_log_step_waiting.step_log_id');
        return record;
    },
    //sq;申请;fh;复核;py;评议;sp;审批;bh;驳回
    updateStatus:function(stepValue){
    	var record = this.applyForm.getRecord();
    	var status="bh";
    	if(stepValue=="复核"){
    		status="fh";
    	}else if(stepValue=="评议"){
    		status="py";
    	}else if(stepValue=="审批"){
    		status="sp";
    	}
    	record.setValue("bh_zzf_apply.status",status);	
    	this.applyTableDs.saveRecord(record);
    },
    approveForm_onReject:function(){
    	var record = this.getRecord();
		
        var comments = jQuery("#comments").val().trim();
        if (comments.length < 1) {
            View.showMessage("请输入驳回批语!");
            return;
        }
		
		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-rejectRequest', record,comments);
		}catch(e){
			Workflow.handleError(e);
		}
		
		if (result.code == 'executed'){
			var father=this;
			 this.updateStatus("驳回");
			  View.getControlsByType(parent, 'tabs')[0].selectRequestPanel.refresh();
            View.showMessage('message', "驳回成功！", '', '', function(){
                father.onBack();
            });
		} else {
			Workflow.handleError(result);
		}
    },
    approveForm_onApprove: function(){
    	var record = this.getRecord();
       
        var comments = jQuery("#comments").val().trim();
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
        if (result.code == 'executed') {

            var father = this;
            //更新状态
         
            this.updateStatus(this.updateTypeValue);
            View.getControlsByType(parent, 'tabs')[0].selectRequestPanel.refresh();
            View.showMessage('message', "审批通过！", '', '', function(){
                father.onBack();
            });
          
        }
        
    },
    approveForm_onBack:function(){
    	this.onBack();
    },
    onBack: function(){
        var tabName = 'selectRequestTab';
        var tab = this.tabs.findTab(tabName);
        this.tabs.selectTab(tabName);
    }
});

