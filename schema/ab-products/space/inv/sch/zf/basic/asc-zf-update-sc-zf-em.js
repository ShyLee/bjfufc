var ascUpdateZfemController = View.createController('ascUpdateZfemController', {

    afterViewLoad: function(){
    },
    
    sczfemMinusEmList_onUpdate: function(){
    	try {
            var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-UpdateZfEm-doUpdate');
			View.showMessage("更新成功");
			this.sczfemMinusEmList.refresh();
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    },
	
	newDataFromHrPanel_onUpdate: function(){
		try {
            var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-UpdateZfEm-doInsert');
            View.showMessage("更新成功");
            this.newDataFromHrPanel.refresh();
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    },
    clickItem:function(){
    	var grid=this.sczfemMinusEmList;
    	var record = grid.rows[grid.selectedRowIndex].row.getRecord();
    
    	var obj=toJSON(record);
    	var json=toJSON(obj.evalJSON().values)
    	if(typeof(AjaxDataService)!="undefined"){
    		AjaxDataService.compareDiffer(json,{
    			   callback:function(data){
    				if(data!=''){
    					var json=data.evalJSON();
    					var message="";
    					 for(var i=0; i<json.length; i++)   
    					 {   
    					     message+= json[i].value+"<br/>";   
    					 }   ;
    					 View.showMessage(message);
    				}
    			   }
    			  });

    	}
    }
});

