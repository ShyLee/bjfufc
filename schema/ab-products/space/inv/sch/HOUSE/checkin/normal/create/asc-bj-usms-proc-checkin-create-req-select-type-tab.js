var asgnCreateReqSelectTypeTabController = View.createController("asgnCreateSelectTypeTabController", {
    //main tab object , used here for store some globle varible
    tabs: null,
    activityType:null,
    afterViewLoad: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        
        this.tabs.showTab('basicInputTab',false);
        this.tabs.showTab('reviewTab',false);
        
        this.activityType=slaConstantController.LX_LEASE_RM_CHECK_IN;
        this.ascBjUsmsProcAsgnCreateReqSelectTypeTabGrid.addParameter("activity_type", "activitytype.activity_type= '" + this.activityType + "'");
    },
    afterInitialDataFetch: function(){
        this.reviewReqSelectTabGrid.addParameter("activityType", this.activityType);
        this.reviewReqSelectTabGrid.refresh();
    },
    reviewReqSelectTabGrid_check_onClick: function(row){
    	this.tabs.cardId = row.getFieldValue('activity_log.zzfcard_id');
        this.tabs.activityLogId = row.getFieldValue('activity_log.activity_log_id');
        
        var nextTabName = 'reviewTab';
        this.tabs.selectTab(nextTabName).loadView();
        this.tabs.selectTab(nextTabName, null, true);
        this.tabs.showTab(nextTabName,true);
    },
    
    ascBjUsmsProcAsgnCreateReqSelectTypeTabGrid_select_onClick: function(row){
        var record = row.getRecord();
        var activityTypeValue = record.getValue("activitytype.activity_type");
        var probTypeValue = record.getValue("activitytype.prob_type");
        
        this.tabs.probType = probTypeValue;
        this.tabs.activityType = activityTypeValue;
        
        var nextTabName = 'basicInputTab';
        this.tabs.selectTab(nextTabName).loadView();
        this.tabs.selectTab(nextTabName, null, true);
        this.tabs.showTab(nextTabName,true);
    }
});

