
var ascBjUsmsProcAsgnAsgnReqSelectTabController = View.createController("ascBjUsmsProcAsgnAsgnReqSelectTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.ascBjUsmsProcAsgnAsgnReqSelectTabGrid.addParameter('activityType', "房屋分配-办公用房");
        this.ascBjUsmsProcAsgnAsgnReqSelectTabGrid.refresh();
    }
});

function selectNextTab(activityLogId){

    var restriction = "activity_log_id = " + activityLogId;
    
    //set the globle request type to tabs object
    var tabs = ascBjUsmsProcAsgnAsgnReqSelectTabController.tabs;
    tabs.restriction = restriction;
    
    //select next tab and reload the tab view
    var nextTabName = 'detailsTab';
    
    
    tabs.selectTab(nextTabName);
}
