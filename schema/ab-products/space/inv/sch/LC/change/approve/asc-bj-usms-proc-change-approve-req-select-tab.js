
var ascBjUsmsProcChagneApproveReqSelectTabController = View.createController("ascBjUsmsProcChagneApproveReqSelectTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.ascBjUsmsProcChagneApproveReqSelectTabGrid.addParameter('activityType', "SERVICE DESK - 房屋用途变更");
        
        if (this.tabs.selectTabConsoleRestriction) {
            this.ascBjUsmsProcChagneApproveReqSelectTabGrid.refresh(this.tabs.selectTabConsoleRestriction);
            var selectTabConsoleRecord = this.tabs.selectTabConsoleRecord;
            this.ascBjUsmsProcChagneApproveReqSelectTabConsole.setFieldValue('activity_log.prob_type', selectTabConsoleRecord['activity_log.prob_type']);
            this.ascBjUsmsProcChagneApproveReqSelectTabConsole.setFieldValue('activity_log.date_requested.from', selectTabConsoleRecord['activity_log.date_requested.from']);
            this.ascBjUsmsProcChagneApproveReqSelectTabConsole.setFieldValue('activity_log.date_requested.to', selectTabConsoleRecord['activity_log.date_requested.to']);
        }
        else {
            this.ascBjUsmsProcChagneApproveReqSelectTabGrid.refresh();
        }
    }
});

function selectNextTab(){
    var grid = View.panels.get('ascBjUsmsProcChagneApproveReqSelectTabGrid');
    var index = grid.selectedRowIndex;
    var record = grid.gridRows.get(index).getRecord();
    var activityLogId = record.getValue('activity_log.activity_log_id');
    var requestType = record.getValue('activity_log.prob_type');
    var stepType = record.getValue('activity_log_step_waiting.step');
    
    View.getWindow('parent').View.setTitle("房屋用途变更" + "-" + stepType.substring(stepType.length - 2));
    var restriction = new Ab.view.Restriction();
    restriction.addClause('activity_log.activity_log_id', activityLogId, '=');
    
    //set the globle request type to tabs object
    var tabs = ascBjUsmsProcChagneApproveReqSelectTabController.tabs;
    tabs.approveTabrestriction = restriction;
    tabs.selectTabConsoleRestriction = View.panels.get('ascBjUsmsProcChagneApproveReqSelectTabGrid').restriction;
    var consolePanel = View.panels.get('ascBjUsmsProcChagneApproveReqSelectTabConsole');
    var selectTabConsoleRecord = {};
    selectTabConsoleRecord['activity_log.prob_type'] = consolePanel.getFieldValue('activity_log.prob_type');
    selectTabConsoleRecord['activity_log.date_requested.from'] = consolePanel.getFieldValue('activity_log.date_requested.from');
    selectTabConsoleRecord['activity_log.date_requested.to'] = consolePanel.getFieldValue('activity_log.date_requested.to');
    tabs.selectTabConsoleRecord = selectTabConsoleRecord;
    
    //select next tab and reload the tab view
    var nextTabName = 'approveRequestTab';
    var nextTab = tabs.findTab(nextTabName);
    nextTab.loadView();
    tabs.selectTab(nextTabName);
}
