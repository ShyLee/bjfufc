var viewRmEmController = View.createController('viewRmEmController', {

	blId:"",
	flId:"",
    rmId:"",
	
	/**
	 * Initializes the view.
	 */
    afterViewLoad: function(){
        if (this.view.parameters){
        	this.blId = this.view.parameters['blId'];
			this.flId = this.view.parameters['flId'];
			this.rmId = this.view.parameters['rmId'];
		
			if (this.blId && this.flId && this.rmId) {
				this.ascBjUsmsBlRmDetails.addParameter("blIdRes",this.blId);
				this.ascBjUsmsBlRmDetails.addParameter("flIdRes",this.flId);
				this.ascBjUsmsBlRmDetails.addParameter("rmIdRes",this.rmId);
				
				this.rmPhotos.addParameter("blIdRes",this.blId);
				this.rmPhotos.addParameter("flIdRes",this.flId);
				this.rmPhotos.addParameter("rmIdRes",this.rmId);
				
				this.ascBjUsmsBlRmEmDetails.addParameter("blIdRes",this.blId);
				this.ascBjUsmsBlRmEmDetails.addParameter("flIdRes",this.flId);
				this.ascBjUsmsBlRmEmDetails.addParameter("rmIdRes",this.rmId);
				
				this.ascBjUsmsBlRmEditDetails.addParameter("blIdRes",this.blId);
				this.ascBjUsmsBlRmEditDetails.addParameter("flIdRes",this.flId);
				this.ascBjUsmsBlRmEditDetails.addParameter("rmIdRes",this.rmId);
				
			    this.tsyqgrid.addParameter("blIdRes",this.blId);
				this.tsyqgrid.addParameter("flIdRes",this.flId);
				this.tsyqgrid.addParameter("rmIdRes",this.rmId);
	    	}
		}
		this.showDistinctPhoto();
    },
    
    afterInitialDataFetch : function () {
    	var tabs = View.panels.get("EditTabs");
 	 	tabs.addEventListener('afterTabChange',this.onTabsChange);
    },
    
    
    onTabsChange: function(tabPanel, selectedTabName, newTabName){
		//disable the view tabs.
		var tabs = View.panels.get("EditTabs");
 	 	
		if(selectedTabName == 'editRmInformation'){
			var res = new Ab.view.Restriction();
			res.addClause("rm.bl_id",viewRmEmController.blId);
			res.addClause("rm.fl_id",viewRmEmController.flId);
			res.addClause("rm.rm_id",viewRmEmController.rmId);
			
			viewRmEmController.editRoomPanel.refresh(res);
	 	}
	},
    
    

    ascBjUsmsBlRmDetails_onEidt: function(){
    	var rmRecord = this.ascBjUsmsBlRmDetails.getRecord();
        this.ascBjUsmsBlRmEditDetails.setRecord(rmRecord);
        this.ascBjUsmsBlRmEditDetails.show(true);
    	this.ascBjUsmsBlRmEditDetails.showInWindow({
    	    width: 350,
    	    height: 250
    	   });
    },
    ascBjUsmsBlRmEditDetails_onSave: function(){
    	var form = View.panels.get("ascBjUsmsBlRmEditDetails");
    	 if (form.save()) {
 	   		var panel = View.panels.get("ascBjUsmsBlRmDetails");
 	     	panel.refresh();		
 	   	}
    },
	
	showDistinctPhoto:function(){
	    var addr=View.project.projectGraphicsFolder + "/rm/" + this.blId+"~"+this.flId+"~" +this.rmId+ ".jpg";
	    jQuery.ajax({
	              url: addr,
	              success: function(){
	                  jQuery("#rm_photo").attr("src",addr);
	
	              },
	              error:function(e){
	                  jQuery("#rm_photo").removeAttr("src");
	                  jQuery("#rm_photo").attr("display","none");
	              }
		 });
    },
    

});
