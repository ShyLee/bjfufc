var abScDefRelationRmcatAndRmuseController = View.createController('abScDefRelationRmcatAndRmuseController', {
    abScDefRelationRmcatAndRmuseGrid_onUpdate: function(){
        var result = {};
        //This method serve as a WFR to update tool count by tool type to table tooltype
        try {
            result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SchoolHandler-updateRoomUse');
        } 
        catch (e) {
            Workflow.handleError(e);
        }
		
        if (result.code == 'executed') {
			alert(getMessage("okMessage"));
        }
        
    }
    
})
