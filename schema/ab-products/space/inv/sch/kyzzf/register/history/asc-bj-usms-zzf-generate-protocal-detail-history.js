var ascBjUsmsZZFProtocalInputTabController = View.createController("ascBjUsmsZZFProtocalInputTabController", {
	tabs: null,
    aprotocalRmRecords:null,
    rentStd:null,//当前租金标准
    applyBtn:null,
    printBtn:null,
    partyBResp:null,
    protocalId:null,
    applyUser:null,
    applyTableRecord:null,
    afterViewLoad:function(){
    	this.applyBtn=this.step2.actions.get('saveAndGenerateProtocal');
		this.printBtn=this.step2.actions.get('print');
		jQuery('#protocalForm input').attr("disabled","disabled");
		jQuery('#protocalForm textarea').attr("disabled","disabled");
    	jQuery('#protocalForm select').attr("disabled","disabled");
		jQuery('#step2 input:button').attr("disabled","disabled");
    },
    afterInitialDataFetch: function(){
    	this.tabs = View.getControlsByType(parent, 'tabs')[0];

    	   var restriction = new Ab.view.Restriction();
    	   restriction.addClause('bh_zzf_protocal.protocal_sq_id', this.tabs.requestNumber);
    	   this.protocalForm.refresh(restriction);
    	   
    	   var res = new Ab.view.Restriction();
    	   res.addClause('bh_zzf_protocal_rm.protocal_id',this.protocalForm.getFieldValue('bh_zzf_protocal.protocal_id'));
    	   
    	   this.step2.refresh(res);
    	   
    	   var res2 = new Ab.view.Restriction();
    	   res2.addClause('bh_zzf_fees.protocal_id',this.protocalForm.getFieldValue('bh_zzf_protocal.protocal_id'));
    	   
    	
    	   
    	   this.feesInfo.refresh(res2);
    },
    step2_onPrint:function(){
    	var protocalId=this.protocalForm.getFieldValue("bh_zzf_protocal.protocal_id");
    	if(protocalId==""){
    		View.showMessage("请先生成协议");
    		return ;
    	};
    	
    	View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
            width: 470,
            height: 200,
            xmlName: "zzfprotocal",
            parameters: {
            	'aProtocal':protocalId
            },
            closeButton: false
        });
  
    },
 
    /**
     * 查看负责人下已租赁的房间信息
     * 
     * */
    protocalForm_onCheckRentedRoom: function(){
    	var party_b_rep = this.protocalForm.getFieldValue('bh_zzf_protocal.party_b_rep');
    	View.openDialog('asc-bj-usms-zzf-protocal-dj-check-protocal-rm-dialog.axvw', null, true, {
            width: 1024,
            height: 800,
            closeButton: false,
            title: "申请人[" + party_b_rep + "]已租赁的房屋",
            afterInitialDataFetch: function(dialogView){  
            	var dialogController = dialogView.controllers.get('abBjUsmsZZFProtocalDjCheckRmDialogController');
            	dialogController.protocalRm.addParameter("partyBRepId", party_b_rep);
            	dialogController.protocalRm.refresh();
            }    
                
        });
    	
    }
});

