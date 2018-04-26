var ascZfEdFcHcqController = View.createController('ascZfEdFcHcqController', {
	SUPERCONTROLLER: null,
	
	afterInitialDataFetch:function(){
		SUPERCONTROLLER = View.getControlsByType(parent, 'tabs')[0].SuperController;
		var res = new Ab.view.Restriction();
        res.addClause("sc_zf_hcq.archive_id", SUPERCONTROLLER.ARCHIVE_ID, "=");
        this.hcqfGrid.refresh(res);
	}
	
});






