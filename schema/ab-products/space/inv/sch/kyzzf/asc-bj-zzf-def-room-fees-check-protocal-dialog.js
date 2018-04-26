var checkProtocalDetailControl = View.createController('checkProtocalDetailControl', {
	openerController : null,
	
	 afterInitialDataFetch: function(){     
		 var protocalSqId = this.protocolInfo.getFieldValue('bh_zzf_protocal.protocal_sq_id');
		 var protocalDjId = this.protocolInfo.getFieldValue('bh_zzf_protocal.protocal_dj_id');

		 $('protocal_sq_id').value = protocalSqId;
		 $('protocal_dj_id').value = protocalDjId;
		 
		 $('labelForSQH').textContent = "申请号:";
		 $('labelForDJH').textContent = "登记号:";
	 }
	
});