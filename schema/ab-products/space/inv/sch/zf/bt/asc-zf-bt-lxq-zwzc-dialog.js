
var ascZfCheckEmZWZCController = View.createController('ascZfCheckEmZWZCController', {
	afterInitialDataFetch:function(){
		if (this.view.parameters){
        	var em_id = this.view.parameters['em_id'];
        	var archive_id = this.view.parameters['archive_id'];
        	
			this.zwGridPanel.addParameter('jgh', em_id);
			this.zcGridPanel.addParameter('jgh', em_id);
			this.zwGridPanel.addParameter('archive_id', archive_id);
			this.zcGridPanel.addParameter('archive_id', archive_id);
			
    		this.zwGridPanel.refresh();
    		this.zcGridPanel.refresh();
        }
	}
	
});







