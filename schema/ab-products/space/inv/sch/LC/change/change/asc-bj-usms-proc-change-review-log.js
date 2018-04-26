
var ascBjUsmsProcChangeReviewLogController = View.createController("ascBjUsmsProcChangeReviewLogController", {

    afterInitialDataFetch: function(){
        this.ascBjUsmsProcChangeReviewLogGrid.addParameter('activityType', "SERVICE DESK - 房屋用途变更");
    }
});
