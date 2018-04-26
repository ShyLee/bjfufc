
var ascBjUsmsProcChangeCreateReqSelectTypeTabController = View.createController("ascBjUsmsProcChangeCreateReqSelectTypeTabController", {
    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.ascBjUsmsProcChangeCreateReqSelectTypeTabGrid.addParameter('prob_type', '房屋用途变更%');
        this.ascBjUsmsProcChangeCreateReqSelectTypeTabGrid.refresh();
    }
});

function selectNextTab(requestType){
    View.getWindow('parent').View.setTitle("房屋用途变更" + "-申请");
	
    //set the globle request type to tabs object
    var tabs = ascBjUsmsProcChangeCreateReqSelectTypeTabController.tabs;
    tabs.requestType = requestType;
    
    //select next tab and reload the tab view
    var nextTabName = 'basicInputTab';
    var nextTab = tabs.findTab(nextTabName);
    nextTab.loadView();
    tabs.selectTab(nextTabName);
}
