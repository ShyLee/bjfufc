var ascBjUsmsProcReviewDetailController = View.createController("ascBjUsmsProcReviewDetailController", {
    //main tab object , used here for store some globle varible
    tabs: null,
  
    afterInitialDataFetch: function(){
    	this.tabs = View.getControlsByType(parent, 'tabs')[0];
    	
    	var restriction = new Ab.view.Restriction();
        restriction.addClause("helpdesk_step_log.pkey_value", this.tabs.activityLogId, "=");
        this.historyPanel.refresh(restriction);
        this.historyPanel.show(true);
        
        var restriction2 = new Ab.view.Restriction();
        restriction2.addClause("sc_zzfcard.card_id", this.tabs.cardId, "=");
        this.teacherInfoForm.refresh(restriction2,false);
        this.descForm.refresh(restriction2,false);
        
        jQuery('#teacherInfoForm input').attr("disabled","disabled");
    	jQuery('#teacherInfoForm textarea').attr("disabled","disabled");
    	jQuery('#teacherInfoForm select').attr("disabled","disabled");
        
        jQuery('#descForm input').attr("disabled","disabled");
    	jQuery('#descForm textarea').attr("disabled","disabled");
    	jQuery('#descForm select').attr("disabled","disabled");
    },
    
    historyPanel_afterRefresh: function(){
        reloadHistoryPanel(this.historyPanel);
    },
    
    onBack: function(){
        var tabName = 'selectTab';
        this.tabs.findTab(tabName).loadView();
        this.tabs.selectTab(tabName);
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