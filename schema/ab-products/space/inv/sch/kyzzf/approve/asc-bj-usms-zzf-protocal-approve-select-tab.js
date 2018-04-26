var approveRequestController = View.createController("approveRequestController", {
    tabs: null,
    dataSource:null,
    stepLogRestricion:"",
    afterViewLoad:function(){
    	this.dataSource=this.stepLogDs;
    	this.stepLogRestricion = new Ab.view.Restriction();
    	this.stepLogRestricion.addClause('activity_log_step_waiting.user_name',View.user.name); 
    },
    afterInitialDataFetch: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.approveGrid.addParameter('activityType',ZZFCommonController.activityType);
        this.approveGrid.refresh();
    }
});

function selectNextTab(){
    var grid = View.panels.get('approveGrid');
    var index = grid.selectedRowIndex;
    var record = grid.gridRows.get(index).getRecord();
    var activityLogId = record.getValue('activity_log.activity_log_id');
    //问题类型
    var probtType = record.getValue('activity_log.prob_type');
    var activityType = record.getValue('activity_log.activity_type');
    //步骤类型
    approveRequestController.stepLogRestricion.addClause('activity_log_step_waiting.activity_log_id',activityLogId); 
    var record2=approveRequestController.dataSource.getRecord(approveRequestController.stepLogRestricion);
    var applyNumber= record.getValue('bh_zzf_apply.zzf_sq_id');
    var stepType = record2.getValue('activity_log_step_waiting.step');
    var step=stepType.substring(stepType.length - 2);
    View.getWindow('parent').View.setTitle(activityType + "-" + step);
    var tabs = approveRequestController.tabs;
    tabs.activityLogId = activityLogId;
    tabs.selectRequestPanel = approveRequestController.approveGrid;
    tabs.step=step;
    tabs.applyNumber=applyNumber;
    var nextTabName = 'approveRequestTab';
    approveRequestController.stepLogRestricion.removeClause('activity_log_step_waiting.activity_log_id');
    var nextTab = tabs.findTab(nextTabName);
    nextTab.loadView();
    tabs.selectTab(nextTabName);
}

/**
 * 过滤我处理过的面板信息
 * */
function refeshGrid(){
    var grid = View.panels.get('reviewGrid');
    var console = View.panels.get('filterConsole');
    var from_date = console.getFieldValue('activity_log.date_requested.from');
    var to_date = console.getFieldValue('activity_log.date_requested.to');
    var restriction = new Ab.view.Restriction();
    if (valueExistsNotEmpty(to_date)) {
        restriction.addClause('activity_log_hactivity_log.date_requested', to_date, '&lt;=');
    }
    if (valueExistsNotEmpty(from_date)) {
        restriction.addClause('activity_log_hactivity_log.date_requested', from_date, '&gt;=');
    }
    grid.refresh(restriction);
}
