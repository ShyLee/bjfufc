
var ascBjUsmsProcChangeChangeReqSelectTabController = View.createController("ascBjUsmsProcChangeChangeReqSelectTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.ascBjUsmsProcChangeChangeReqSelectTabGrid.addParameter('activityType', "SERVICE DESK - 房屋用途变更");
        this.ascBjUsmsProcChangeChangeReqSelectTabGrid.refresh();
    }
});

function selectNextTab(activityLogId){

    var restriction = "activity_log_id = " + activityLogId;
    
    //set the globle request type to tabs object
    var tabs = ascBjUsmsProcChangeChangeReqSelectTabController.tabs;
    tabs.restriction = restriction;
    
    //select next tab and reload the tab view
    var nextTabName = 'detailsTab';
    var nextTab = tabs.findTab(nextTabName);
    nextTab.loadView();
    tabs.selectTab(nextTabName);
}
