var ascBjUsmsProcChagneApproveReqApproveTabController = View.createController("ascBjUsmsProcChagneApproveReqApproveTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
    
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        
        this.ascBjUsmsProcChagneApproveReqApproveTabForm.refresh(this.tabs.approveTabrestriction);
        var record = this.ascBjUsmsProcChagneApproveReqApproveTabForm.getRecord();
        this.ascBjUsmsProcChagneApproveReqApproveTabDestricptionForm.setRecord(record);
        this.ascBjUsmsProcChagneApproveReqApproveTabDestricptionForm.show(true);
        this.ascBjUsmsProcChagneApproveReqApproveTabAttachmentForm.refresh(this.tabs.approveTabrestriction);
        this.showHistoryPanel('activity_log', this.ascBjUsmsProcChagneApproveReqApproveTabForm.getFieldValue('activity_log.activity_log_id'));
    },
    
    ascBjUsmsProcChagneApproveReqApproveTabHistoryPanel_afterRefresh: function(){
    
        reloadHistoryPanel(this.ascBjUsmsProcChagneApproveReqApproveTabHistoryPanel);
    },
    
    showHistoryPanel: function(tableName, activityLogId){
        var historyPanel = this.ascBjUsmsProcChagneApproveReqApproveTabHistoryPanel;
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation', tableName, 'activity_log_id', activityLogId);
            
            var apps = eval('(' + result.jsonExpression + ')');
            if (apps.length == 0) {
                historyPanel.show(false);
            }
            else {
                historyPanel.show(true);
                var restriction = new Ab.view.Restriction();
                if (apps.length == 1) {
                    restriction.addClause('helpdesk_step_log.step_log_id', apps[0].step_log_id, "=");
                }
                else {
                    restriction.addClause('helpdesk_step_log.step_log_id', apps[0].step_log_id, "=", ")AND(");
                    for (var i = 1, app; app = apps[i]; i++) {
                        restriction.addClause('helpdesk_step_log.step_log_id', app.step_log_id, "=", "OR");
                    }
                }
                historyPanel.refresh(restriction);
            }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
    },
    
    ascBjUsmsProcChagneApproveReqApproveTabForm_onApprove: function(){
        $("comments").value = '';
        this.ascBjUsmsProcChagneApproveReqApproveTabApproveForm.refresh(this.tabs.approveTabrestriction);
        this.ascBjUsmsProcChagneApproveReqApproveTabApproveForm.showInWindow({
            width: 800,
            height: 300
        })
    },
    
    ascBjUsmsProcChagneApproveReqApproveTabApproveForm_onApprove: function(){
        var record = this.getRecord();
        var comments = $("comments").value;
        
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-approveRequest', record, comments);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        this.closeApproveWindow(false);
    },
    
    ascBjUsmsProcChagneApproveReqApproveTabApproveForm_onReject: function(){
        var record = this.getRecord();
        var comments = $("comments").value;
        
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-rejectRequest', record, comments);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        this.closeApproveWindow(true);
    },
    
    ascBjUsmsProcChagneApproveReqApproveTabApproveForm_onForward: function(){
        var forwardTo = this.ascBjUsmsProcChagneApproveReqApproveTabApproveForm.getFieldValue("activity_log.approved_by");
        if (!forwardTo) {
            View.alert(getMessage('forwardToMissing'))
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
    },
    
    getRecord: function(){
        var record = {};
        record['activity_log.activity_log_id'] = this.ascBjUsmsProcChagneApproveReqApproveTabApproveForm.getFieldValue('activity_log.activity_log_id');
        record['activity_log.approved_by'] = this.ascBjUsmsProcChagneApproveReqApproveTabApproveForm.getFieldValue('activity_log.approved_by');
        record['activity_log_step_waiting.step_log_id'] = this.ascBjUsmsProcChagneApproveReqApproveTabApproveForm.getFieldValue('activity_log_step_waiting.step_log_id');
        return record;
    },
    
    closeApproveWindow: function(isReject){
        this.ascBjUsmsProcChagneApproveReqApproveTabApproveForm.closeWindow();
        if (isReject) {
            this.showHistoryPanel('hactivity_log', this.ascBjUsmsProcChagneApproveReqApproveTabForm.getFieldValue('activity_log.activity_log_id'));
        }
        else {
            this.showHistoryPanel('activity_log', this.ascBjUsmsProcChagneApproveReqApproveTabForm.getFieldValue('activity_log.activity_log_id'));
        }
        this.ascBjUsmsProcChagneApproveReqApproveTabForm.actions.get('approve').enable(false);
    },
    
    ascBjUsmsProcChagneApproveReqApproveTabForm_onBack: function(){
        View.getWindow('parent').View.setTitle("房屋用途变更-审批");
        //select next tab and reload the tab view
        var tabName = 'selectRequestTab';
        var tab = this.tabs.findTab(tabName);
        tab.loadView();
        this.tabs.selectTab(tabName);
    }
});

function reloadHistoryPanel(historyPanel){
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

		if(row['afm_wf_steps.step'] == '基础'){
			if(i==0){
				row['afm_wf_steps.step'] = '申请人提交申请';
			}else{
				row['afm_wf_steps.step'] = '';
			}
		}
    }
    historyPanel.reloadGrid();
}
