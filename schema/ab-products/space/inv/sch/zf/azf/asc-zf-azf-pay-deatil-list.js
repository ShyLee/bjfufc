var azfListController = View.createController('azfListController', {

    afterViewLoad: function(){
    
    },
    
    afterInitialDataFetch: function(){
        var stopRes = "stop_reason is not null";
        this.azfStopDetail.refresh(stopRes);
        var year = this.dateDetail.getFieldValue('azf_detail.year');
        var month = this.dateDetail.getFieldValue('azf_detail.month');
        if (!compareDate(year, month)) {
            View.showMessage('不能生成当前月以后的安置费记录');
            this.azfDetail.actions.get('save').enable(false);
            this.azfDetail.refresh('1<>1');
            this.azfStopDetail.refresh('1<>1');
        }
    },
    
    azfDetail_onSave: function(){
		var year = this.dateDetail.getFieldValue('azf_detail.year');
        var month = this.dateDetail.getFieldValue('azf_detail.month');
		if(compareDate(year, month) == 'equal'){
			View.confirm("列表显示的是当前月份的记录，确认要保存?",function(button){
				if(button == 'yes'){
				    	azfListController.saveRecords();
				}
			});
		}else{
			this.saveRecords();
		}
    },

    saveRecords:function(){
		try {
            var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-UpdateAzfHistroy-updateHistroy');
            View.showMessage("保存成功");
            azfListController.azfDetail.actions.get('save').enable(false);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
	}
})

function compareDate(year, month){
    var today = new Date();
    var yearOfToday = today.getFullYear();
    var monthOfToday = today.getMonth() + 1;
    var yearForInt = parseInt(year, 10);
    var monthForInt = parseInt(month, 10);
    if (yearOfToday < yearForInt || (yearOfToday == yearForInt && monthOfToday < monthForInt)) {
        return false;
    }
    else 
        if (yearOfToday == yearForInt && monthOfToday == monthForInt) {
            return 'equal';
        }
        else {
            return 'others';
        }
}
