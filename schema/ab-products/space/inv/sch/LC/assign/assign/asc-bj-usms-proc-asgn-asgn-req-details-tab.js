var ascBjUsmsProcAsgnAsgnReqDetailsTabController = View.createController("ascBjUsmsProcAsgnAsgnReqDetailsTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
	record: null,
	
    afterInitialDataFetch: function(){
    
        this.onStart();
    },
    
	onStart:function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
		
		this.selectBasicFormByRequestType();
		
		this.tabs.activityLogRecord = this.record;
		
        this.ascBjUsmsProcAsgnAsgnReqDetailsTabDestricptionForm1.setRecord(this.record);
        this.ascBjUsmsProcAsgnAsgnReqDetailsTabDestricptionForm1.show(true);
        this.ascBjUsmsProcAsgnAsgnReqDetailsTabAttachmentForm1.refresh(this.tabs.restriction);
		
        this.showHistoryPanel();
	},

	afterSelect:function(){
       this.onStart();
	},

	selectBasicFormByRequestType: function(){
        if (this.tabs.requestType != '房屋分配-项目用房') {
            this.ascBjUsmsProcAsgnAsgnReqDetailsTabForm2.show(false);
            this.ascBjUsmsProcAsgnAsgnReqDetailsTabForm1.refresh(this.tabs.restriction);
            this.record = this.ascBjUsmsProcAsgnAsgnReqDetailsTabForm1.getRecord();
        }
        else {
            this.ascBjUsmsProcAsgnAsgnReqDetailsTabForm2.refresh(this.tabs.restriction);
            this.ascBjUsmsProcAsgnAsgnReqDetailsTabForm1.show(false);
            this.record = this.ascBjUsmsProcAsgnAsgnReqDetailsTabForm2.getRecord();
        }
    },
	
    ascBjUsmsProcAsgnAsgnReqDetailsTabForm1_afterRefresh: function(){
        USMS_showBaseInfoOfUserOrProject(this.ascBjUsmsProcAsgnAsgnReqDetailsTabForm1,false);
    },
    
	ascBjUsmsProcAsgnAsgnReqDetailsTabForm2_afterRefresh: function(){
        USMS_showBaseInfoOfUserOrProject(this.ascBjUsmsProcAsgnAsgnReqDetailsTabForm2,true);
    },
	
    ascBjUsmsProcAsgnAsgnReqDetailsTabHistoryPanel_afterRefresh: function(){
    
        reloadHistoryPanel(this.ascBjUsmsProcAsgnAsgnReqDetailsTabHistoryPanel);
    },
    
    showHistoryPanel: function(){
		var panel = View.panels.get("ascBjUsmsProcAsgnAsgnReqDetailsTabForm1");
        if (!panel.visible) {
            panel = View.panels.get("ascBjUsmsProcAsgnAsgnReqDetailsTabForm2");
        }
		
        var historyPanel = this.ascBjUsmsProcAsgnAsgnReqDetailsTabHistoryPanel;
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation', 'activity_log', 'activity_log_id', panel.getFieldValue('activity_log.activity_log_id'));
            
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
    
    onSelectAssignTab: function(){
        //select next tab and reload the tab view
        var nextTabName = 'assignTab';
        var nextTab = this.tabs.findTab(nextTabName);
        nextTab.loadView();
        this.tabs.selectTab(nextTabName);
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
