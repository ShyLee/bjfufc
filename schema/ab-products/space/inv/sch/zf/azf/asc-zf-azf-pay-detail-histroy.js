var azfDetailController = View.createController('azfDetailController', {

    afterViewLoad: function(){
    
    },
    
    afterInitialDataFetch: function(){
        var res = "stop_reason is null";
        var stopRes = "stop_reason is not null";
        this.azfDetail.refresh(res);
        this.azfStopDetail.refresh(stopRes);
    },

})
