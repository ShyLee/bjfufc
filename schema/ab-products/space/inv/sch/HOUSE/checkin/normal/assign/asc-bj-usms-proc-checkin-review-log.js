
var ascBjUsmsProcAsgnReviewLogController = View.createController("ascBjUsmsProcAsgnReviewLogController", {

    afterInitialDataFetch: function(){
        this.ascBjUsmsProcAsgnReviewLogGrid.addParameter('activityType', ascBjUsmsConstantControl.LX_LEASE_RM_CHECK_IN);
    }
});
