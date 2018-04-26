 var ascUsmsProtocolQueryController = View.createController("ascUsmsProtocolQueryController",{
	
	 showProtocalRmAndFeeDetail: function(){
		 var selectedIndex = this.zzfProtocolDetail.selectedRowIndex;
		 var protocol_id = this.zzfProtocolDetail.gridRows.items[selectedIndex].getFieldValue("bh_zzf_protocal.protocal_id");
		 
		 View.openDialog('asc-bj-usms-zzf-protocol-query-dialog.axvw', null, false, {
			 x:200,
			 y:200,
			 width:800, 
			 height:500,
			 protocolId:protocol_id
		 });
	 }
	 
	
 });
