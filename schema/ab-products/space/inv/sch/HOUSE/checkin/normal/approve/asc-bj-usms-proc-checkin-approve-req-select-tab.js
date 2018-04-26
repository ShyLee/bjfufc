var ascbjApproveController = View.createController("ascbjApproveController", {
    //main tab object , used here for store some globle varible
    tabs: null,
    activityType:null,
    probType:null,
    afterViewLoad:function(){
    	this.activityType=slaConstantController.LX_LEASE_RM_CHECK_IN;
    	this.probType=slaConstantController.PB_LEASE_RM_CHECN_IN;
    },
    afterInitialDataFetch: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.ascBjUsmsProcAsgnApproveReqSelectTabGrid.addParameter('activityType',this.activityType);
        this.ascBjUsmsProcAsgnApproveReqSelectTabGrid.refresh();
    },
    ascBjUsmsProcAsgnApproveReqSelectTabConsole_onFilter: function(){
    	var from = this.ascBjUsmsProcAsgnApproveReqSelectTabConsole.getFieldValue("from");
    	var to = this.ascBjUsmsProcAsgnApproveReqSelectTabConsole.getFieldValue("to");
    	
    	var restriction = new Ab.view.Restriction();
    	if(valueExistsNotEmpty(from)){
    		restriction.addClause("activity_log.date_requested", from, "&gt;=");
    	}
    	if(valueExistsNotEmpty(to)){
    		restriction.addClause("activity_log.date_requested", to, "&lt;=");
    	}
    	if(valueExistsNotEmpty(from) && valueExistsNotEmpty(to)){
    		if(new Date(formatDate(from)).getTime() > new Date(formatDate(to)).getTime()){
        		View.showMessage("申请起始时间不能大于申请截止时间");
        		return;
        	}
    	}
    	
        this.ascBjUsmsProcAsgnApproveReqSelectTabGrid.refresh(restriction);
    },
    ascBjUsmsProcAsgnApproveReqSelectTabConsole_onClear: function(){
		this.ascBjUsmsProcAsgnApproveReqSelectTabConsole.clear();
		
	    this.ascBjUsmsProcAsgnApproveReqSelectTabGrid.restriction = null;
	    this.ascBjUsmsProcAsgnApproveReqSelectTabGrid.refresh();
	}
    
});
/**
 * 格式化日期
 * archibus系统 获取的date类型的字符串儿， 月份与日期没有自动补零
 *     (如 我们选的日期时"2014-08-08" 但form和grid界面中显示的是"2014-8-8")
 * 如果我们从界面中获取的值是"2014-8-8"
 * 用js Date函数  new Date("2014-8-8")时,获取不到具体的时间值
 * 此函数自动补零
 * */
function formatDate(date){
    var array = date.split("-");
    var yyyy = parseInt(array[0]);
    var mm = parseInt(array[1]);
    var dd = parseInt(array[2]);
    if (mm < 10) {
        mm = '0' + mm;
    }
    if (dd < 10) {
        dd = '0' + dd;
    }
    datastr = yyyy + "-" + mm + "-" + dd;
    return datastr;
}


function selectNextTab(){
	//当点击select按钮时候  获得当前选择的
    var grid = View.panels.get('ascBjUsmsProcAsgnApproveReqSelectTabGrid');
    var index = grid.selectedRowIndex;
    var record = grid.gridRows.get(index).getRecord();
    
    var tabs = View.getControl('', 'approveTabs');
    tabs.activityLogId= record.getValue('activity_log.activity_log_id');
    tabs.cardId = record.getValue('sc_zzfcard.card_id');
    var requestType = record.getValue('activity_log.prob_type');
    var stepType = record.getValue('activity_log_step_waiting.step');
    View.getWindow('parent').View.setTitle(requestType + "-" + stepType.substring(stepType.length - 2));
    tabs.step=stepType;
  //驳回流程添加wgw
    tabs.activityType = slaConstantController.LX_LEASE_RM_CHECK_IN;
  
    //select next tab and reload the tab view
    var nextTabName = 'approveRequestTab';
    var nextTab = tabs.findTab(nextTabName);
    tabs.selectTab(nextTabName);
    nextTab.loadView();
    nextTab.show(true);
}



