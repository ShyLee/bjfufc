var approveOrRejectController = View.createController("approveOrRejectController", {
    tabs: null,
	record: null,
    afterInitialDataFetch: function(){
		this.onStart();
    },
	onStart:function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
		this.selectBasicFormByRequestType();
        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.setRecord(this.record);
        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.show(true);
        this.ascBjUsmsProcAsgnApproveReqApproveTabAttachmentForm.refresh(this.tabs.approveTabrestriction);
        this.showHistoryPanel('activity_log');
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldElement('activity_log.approved_by').disabled = true;
        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm_afterRefresh();
	},

	selectBasicFormByRequestType: function(){
        if (this.tabs.requestType != '房屋分配-办公用房申请') {
            this.ascBjUsmsProcAsgnApproveReqApproveTabForm2.show(false);
            this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.refresh(this.tabs.approveTabrestriction);
            this.record = this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.getRecord();
        }
        else {
            this.ascBjUsmsProcAsgnApproveReqApproveTabForm2.refresh(this.tabs.approveTabrestriction);
            this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.show(false);
            this.record = this.ascBjUsmsProcAsgnApproveReqApproveTabForm2.getRecord();
        }
    },
    ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm_afterRefresh: function(){

    },
    ascBjUsmsProcAsgnApproveReqApproveTabForm1_afterRefresh: function(){
        USMS_showBaseInfoOfUserOrProject(this.ascBjUsmsProcAsgnApproveReqApproveTabForm1,false);
    },
	
	ascBjUsmsProcAsgnApproveReqApproveTabForm2_afterRefresh: function(){
        USMS_showBaseInfoOfUserOrProject(this.ascBjUsmsProcAsgnApproveReqApproveTabForm2,true);
    },
    
    ascBjUsmsProcAsgnApproveReqApproveTabHistoryPanel_afterRefresh: function(){
    
        reloadHistoryPanel(this.ascBjUsmsProcAsgnApproveReqApproveTabHistoryPanel);
    },
	
    onBack: function(){
        View.getWindow('parent').View.setTitle("房屋分配-审批");
        //select next tab and reload the tab view
        var tabName = 'selectRequestTab';
        var tab = this.tabs.findTab(tabName);
        //tab.loadView();
        this.tabs.selectTab(tabName);
    },
	
    onShowApproveWindow: function(){
        $("comments").value = '';
        var role=View.user.role;
        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.save();

        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.refresh(this.tabs.approveTabrestriction);
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.showInWindow({
            width: 600,
            height: 260
        });
	},
    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onApprove: function(){
        var record = this.getRecord();
        var comments = $("comments").value;
        if(comments.length<1){
        	View.showMessage("请输入审核批语!");
        	return ;
        }
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-approveRequest', record, comments);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        this.closeApproveWindow(false);
        if (result.code == 'executed' && View.user.role=='UNV DIVISION HEAD') {
    		//如果是二级院系领导审批完后则，给个提示
        	var father=this;
    			View.showMessage('message', "审批通过！", '', '',
    				    function() {
    				father.onBack();
    				    }
    				); 
		 }
      
    },
    
    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onReject: function(){
        var record = this.getRecord();
        var comments = $("comments").value;
       
        if(comments.length<1){
        	View.showMessage("请输入评语-驳回原因！");
        	return ;
        }
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-rejectRequest', record, comments);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        this.closeApproveWindow(true);
        if (result.code == 'executed' && View.user.role=='UNV DIVISION HEAD') {
    		//如果是二级院系领导审批完后则，给个提示
        	var father=this;
    			View.showMessage('message', "驳回成功！", '', '',
    				    function() {
    				father.onBack();
    				    }
    				); 
		 }
    },
    
    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onForward: function(){
        var forwardTo = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue("activity_log.approved_by");
        if (!forwardTo) {
            View.alert(getMessage("请在 [审批转发给] 输入框后选择要转发的目标用户。"))
            return;
        }
        
        var record = this.getRecord();
        var comments = $("comments").value;
        
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-forwardApproval', record, comments, forwardTo);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        this.closeApproveWindow(false);
        if (result.code == 'executed' && View.user.role=='UNV DIVISION HEAD') {
    		//如果是二级院系领导审批完后则，给个提示
        	var father=this;
    			View.showMessage('message', "审批转发成功！", '', '',
    				    function() {
    				father.onBack();
    				    }
    				); 
		 }
    },
    
    getRecord: function(){
        var record = {};
        record['activity_log.activity_log_id'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log.activity_log_id');
        record['activity_log.approved_by'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log.approved_by');
        record['activity_log_step_waiting.step_log_id'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log_step_waiting.step_log_id');
        return record;
    },
    
    closeApproveWindow: function(isReject){
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.closeWindow();
        if (isReject) {
            this.showHistoryPanel('hactivity_log');
        }
        else {
            this.showHistoryPanel('activity_log');
        }
        this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.actions.get('approve').enable(false);
		this.ascBjUsmsProcAsgnApproveReqApproveTabForm2.actions.get('approve').enable(false);
		
	
    }
    
});


