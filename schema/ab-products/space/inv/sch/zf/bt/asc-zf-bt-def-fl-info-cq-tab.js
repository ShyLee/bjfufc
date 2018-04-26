
var ascZfEdFcCqController = View.createController('ascZfEdFcCqController', {
	SUPERCONTROLLER: null,
	
	afterInitialDataFetch:function(){
		SUPERCONTROLLER = View.getControlsByType(parent, 'tabs')[0].SuperController;
		var res = new Ab.view.Restriction();
        res.addClause("sc_zf_cq.archive_id", SUPERCONTROLLER.ARCHIVE_ID, "=");
        this.cqfGrid.refresh(res);
	}
});




