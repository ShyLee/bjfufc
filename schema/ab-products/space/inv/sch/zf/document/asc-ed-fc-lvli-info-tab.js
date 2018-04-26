


var ascZfDefEmLvLiController = View.createController('ascZfDefEmLvLiController', {
	SUPERCONTROLLER: null,
	
	afterInitialDataFetch:function(){
		SUPERCONTROLLER = View.getControlsByType(parent, 'tabs')[0].SuperController;
		if(valueExistsNotEmpty(SUPERCONTROLLER.EM_ID)){
			this.zwGridPanel.addParameter('jgh', SUPERCONTROLLER.EM_ID);
			this.zcGridPanel.addParameter('jgh', SUPERCONTROLLER.EM_ID);
		}
		if(valueExistsNotEmpty(SUPERCONTROLLER.ARCHIVE_ID)){
			this.zwGridPanel.addParameter('archive_id', SUPERCONTROLLER.ARCHIVE_ID);
			this.zcGridPanel.addParameter('archive_id', SUPERCONTROLLER.ARCHIVE_ID);
		}
		
		this.zwGridPanel.refresh();
		this.zcGridPanel.refresh();
		
		var res = new Ab.view.Restriction();
	    res.addClause("sc_zf_em_gzjl.archive_id", SUPERCONTROLLER.ARCHIVE_ID, "=");
		this.gzjlGridPanel.refresh(res);
		
		var res2 = new Ab.view.Restriction();
	    res2.addClause("sc_zf_em_jyjl.archive_id", SUPERCONTROLLER.ARCHIVE_ID, "=");
		this.jyjlGridPanel.refresh(res2);
	}
	
});







