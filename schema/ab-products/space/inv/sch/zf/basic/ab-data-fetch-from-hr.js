

var wfController = View.createController('wfController', {

    testPanel_onRun: function(){
        try {
            var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SyncData');
            if (result.code == 'executed') {
                View.showMessage("更新成功")
            }
            else {
                Workflow.handleError(result);
                View.showMessage("更新遇到错误");
            }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
    },
    
    testPanel_onSyncZCJL: function(){
        try {
            var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SyncZCData');
            if (result.code == 'executed') {
                View.showMessage("更新成功")
            }
            else {
                Workflow.handleError(result);
                View.showMessage("更新遇到错误");
            }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
    },
    testPanel_onSyncZWJL: function(){
        try {
            var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SyncZWData');
            if (result.code == 'executed') {
                View.showMessage("更新成功")
            }
            else {
                Workflow.handleError(result);
                View.showMessage("更新遇到错误");
            }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
    }
});
