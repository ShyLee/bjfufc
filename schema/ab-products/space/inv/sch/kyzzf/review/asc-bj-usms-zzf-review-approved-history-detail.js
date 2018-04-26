var approvedController = View.createController("approvedController", {
    requestNumber:null,
    tabs:null,
    afterViewLoad:function(){
    	this.setEditable();
    	this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.requestNumber = this.tabs.requestNumber;
        var restriction = new Ab.view.Restriction();
        restriction.addClause('bh_zzf_apply.zzf_sq_id', this.requestNumber, '=');
        this.applyForm.refresh(restriction);
    	this.historyPanel.show(true);
      

    },
    historyPanel_afterRefresh:function(){
    	reloadHistoryPanel(this.historyPanel);
    },
    afterInitialDataFetch: function(){
    	  ABHDC_getStepInformation("activity_log_hactivity_log","activity_log_id",this.tabs.activityLogId,this.historyPanel,"history",true);
    },
    setEditable:function(){
    	jQuery('#applyForm input').attr("disabled","disabled");
    	jQuery('#applyForm textarea').attr("disabled","disabled");
    	jQuery('#applyForm select').attr("disabled","disabled");
    },
    showHistoryPanel: function(tableName, activityLogId){
        var historyPanel = this.ascBjUsmsProcAsgnReviewReqDetailsTabHistoryPanel;
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

