var applyZZFController = View.createController("applyZZFController", {
    requestNumber:null,
    tabs:null,
    afterViewLoad:function(){
    	this.setEditable();
    	this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.requestNumber = this.tabs.requestNumber;
        var restriction = new Ab.view.Restriction();
        restriction.addClause('bh_zzf_apply.zzf_sq_id', this.requestNumber, '=');
        this.applyForm.refresh(restriction);

    },
    afterInitialDataFetch: function(){
    },
    setEditable:function(){
    	jQuery('#applyForm input').attr("disabled","disabled");
    	jQuery('#applyForm textarea').attr("disabled","disabled");
    	jQuery('#applyForm select').attr("disabled","disabled");
    }
});



