
var ascBjUsmsProcAsgnReviewLogController = View.createController("ascBjUsmsProcAsgnReviewLogController", {

    afterInitialDataFetch: function(){
        this.ascBjUsmsProcAsgnReviewLogGrid.addParameter('activityType', "房屋分配-办公用房");
    }
});
