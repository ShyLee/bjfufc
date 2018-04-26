
var ascBjUsmsProcChangeChangeReqDetailsTabController = View.createController("ascBjUsmsProcChangeChangeReqDetailsTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.ascBjUsmsProcChangeChangeReqDetailsTabForm1.refresh(this.tabs.restriction);
        var record = this.ascBjUsmsProcChangeChangeReqDetailsTabForm1.getRecord();
        this.tabs.activityLogRecord = record;
        this.ascBjUsmsProcChangeChangeReqDetailsTabDestricptionForm1.setRecord(record);
        this.ascBjUsmsProcChangeChangeReqDetailsTabDestricptionForm1.show(true);
        this.ascBjUsmsProcChangeChangeReqDetailsTabAttachmentForm1.refresh(this.tabs.restriction);
        this.showHistoryPanel('activity_log', this.ascBjUsmsProcChangeChangeReqDetailsTabForm1.getFieldValue('activity_log.activity_log_id'));
    },
    
    ascBjUsmsProcChangeChangeReqDetailsTabHistoryPanel_afterRefresh: function(){
    
        reloadHistoryPanel(this.ascBjUsmsProcChangeChangeReqDetailsTabHistoryPanel);
    },
    
    showHistoryPanel: function(tableName, activityLogId){
        var historyPanel = this.ascBjUsmsProcChangeChangeReqDetailsTabHistoryPanel;
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
    
    ascBjUsmsProcChangeChangeReqDetailsTabForm1_onChange: function(){
        var activityLogRecord = this.tabs.activityLogRecord;
        var blId = activityLogRecord.getValue('activity_log.bl_id');
        var flId = activityLogRecord.getValue('activity_log.fl_id');
        var rmId = activityLogRecord.getValue('activity_log.rm_id');
        var rmCat = activityLogRecord.getValue('activity_log.rm_cat');
        var newRmCat = activityLogRecord.getValue('activity_log.rm_cat_after');
        var rmType = activityLogRecord.getValue('activity_log.rm_type');
        var newRmType = activityLogRecord.getValue('activity_log.rm_type_after');
		var newRmName = activityLogRecord.getValue('activity_log.rm_name_after');
		var rmName = activityLogRecord.getValue('activity_log.rm_name');
        
        var rmRecord = new Ab.data.Record();
        rmRecord.isNew = false;
        rmRecord.setValue("rm.bl_id", blId);
        rmRecord.setValue("rm.fl_id", flId);
        rmRecord.setValue("rm.rm_id", rmId);
        rmRecord.setValue("rm.rm_cat", newRmCat);
        rmRecord.setValue("rm.rm_type", newRmType);
		rmRecord.setValue("rm.name", newRmName);
        rmRecord.oldValues = new Object();
        rmRecord.oldValues["rm.bl_id"] = blId;
        rmRecord.oldValues["rm.fl_id"] = flId;
        rmRecord.oldValues["rm.rm_id"] = rmId;
		rmRecord.oldValues["rm.rm_cat"] = rmCat;
        rmRecord.oldValues["rm.rm_type"] = rmType;
		rmRecord.oldValues["rm.name"] = rmName;
        
        try {
            this.ascBjUsmsProcChangeChangeReqDetailsTabRmDS.saveRecord(rmRecord);
            var message = "已经成功将房间：" + blId + "/" + flId + "/" + rmId + " 的用途由(" + rmCat + "/" + rmType + ")" + " 改为(" + newRmCat + "/" + newRmType + ")";
            alert(message);
            var parameter = {};
            parameter['activity_log.activity_log_id'] = activityLogRecord.getValue('activity_log.activity_log_id');
            parameter['activity_log.comments'] = "成功变更用途";
            Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-completeRequest', parameter);
            var log = new Object();
            log['activity_log_id'] = activityLogRecord.getValue('activity_log.activity_log_id');
            log['bl_id'] = blId;
            log['fl_id'] = flId;
            log['rm_id'] = rmId;
            log['description'] = message;
            USMS_addUpdateLog(log);
			updateStaticFieldAboutEmOrRm();
            //select next tab and reload the tab view
            var nextTabName = 'selectTab';
            var nextTab = this.tabs.findTab(nextTabName);
            nextTab.loadView();
            this.tabs.selectTab(nextTabName);
        } 
        catch (e) {
            View.showMessage('error', '', e.message, e.data);
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

