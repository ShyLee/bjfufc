 var ascZZFProtocolQueryDialogController = View.createController("ascZZFProtocolQueryDialogController",{
	
	 afterInitialDataFetch: function(){
		 var protocol_id = View.parameters['protocolId'];
		 
		 var restriction = new Ab.view.Restriction();
	     restriction.addClause("bh_zzf_fees.protocal_id", protocol_id, '=');
		 this.hdBizFeesPanel.refresh(restriction);
		 this.hdBizFeesPanel.show(true);
		 
		 var restriction = new Ab.view.Restriction();
	     restriction.addClause("bh_zzf_protocal_rm.protocal_id", protocol_id, '=');
		 this.zzfProtocolRmPanel.refresh(restriction);
		 this.zzfProtocolRmPanel.show(true);
	 },
	 /**
     * 生成缴费项序号
     * */
	 hdBizFeesPanel_afterRefresh: function(){
    	var items = this.hdBizFeesPanel.gridRows.items;
    	for(var i=0; i<items.length; i++){
    		items[i].setFieldValue('bh_zzf_fees.fees_id',i+1);
    	}
    	
    },
    /**
     * 生成缴费项序号
     * */
    zzfProtocolRmPanel_afterRefresh: function(){
    	var items = this.zzfProtocolRmPanel.gridRows.items;
    	for(var i=0; i<items.length; i++){
    		items[i].setFieldValue('bh_zzf_protocal_rm.id',i+1);
    	}
    	
    }
	 
	 
	
 });
