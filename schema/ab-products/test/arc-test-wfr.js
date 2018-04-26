

var wfController = View.createController('wfController', {

    testPanel_onRun: function(){
        try {
            var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SyncData-sync');
            if (result.code == 'executed') {
                return result.data;
            }
            else {
                Workflow.handleError(result);
            }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
    }
});
