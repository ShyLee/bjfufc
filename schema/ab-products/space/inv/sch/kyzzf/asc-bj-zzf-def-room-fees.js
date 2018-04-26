var abRoomFeesControl = View.createController('abRoomFeesControl', {
	 
	afterInitialDataFetch: function(dialogView){  
		 this.addColorWarning(); //如果去掉，初始加载页面后，已缴状态的按钮不能隐藏掉
	},
	
	feesInfo_afterRefresh: function(){
		this.addColorWarning();
	},
	
	/**
	 * 增加颜色提醒
	 * 
	 * */
	addColorWarning: function(){
		var grids = this.feesInfo;
		var now = new Date();
		for(var i=0; i < grids.gridRows.length; i++){
			var payStatus = grids.gridRows.items[i].getFieldValue("bh_zzf_fees.pay_state");
			
			var id = "feesInfo_row" + i + "_field_gen0";
			
			if(payStatus == 1){// 已缴费
				$(id).disabled = true;
				continue;
			}

			var shouldPayDate = grids.gridRows.items[i].getFieldValue("bh_zzf_fees.should_fees_date");
			var days = (shouldPayDate.getTime() - now.getTime())/(3600000 * 24) + 1;
			
			if(days <= 0){
				$(id).style.backgroundColor = "#FF6666";
			}else if(days <= 30){
				$(id).style.backgroundColor = "#FFFF00";
			}else{
				$(id).style.backgroundColor = "#33CC99";
			}
		}
	},
	/**
	 * 查看协议详情
	 * 
	 * */
	feesInfo_checkProtocalInfo_onClick: function(row){
		var protocalId = row.getFieldValue('bh_zzf_fees.protocal_id');
		
		var res0 = new Ab.view.Restriction();
		res0.addClause("bh_zzf_protocal.protocal_id",protocalId,"=");
		
		var res1 = new Ab.view.Restriction();
		res1.addClause("bh_zzf_protocal_rm.protocal_id",protocalId,"=");
		
		var res2 = new Ab.view.Restriction();
		res2.addClause("bh_zzf_fees.protocal_id",protocalId,"=");
		
		View.openDialog('asc-bj-zzf-def-room-fees-check-protocal-dialog.axvw', null, true, {
            width: 1024,
            height: 800,
            closeButton: false,
            title: "查看协议[" + protocalId + "]详情" ,
            afterInitialDataFetch: function(dialogView){        	
                var dialogController = dialogView.controllers.get('checkProtocalDetailControl');
                dialogController.openerController = abRoomFeesControl;
                
                dialogController.leaseTerm.refresh(res0,false);
                dialogController.protocalRm.refresh(res1);
                dialogController.protocolInfo.refresh(res0,false);
                dialogController.feesInfo.refresh(res2);
            }
        });
	},
	/**
	 * 缴费
	 * 
	 * */
	payFee: function(){
		var rowRecord = this.feesInfo.gridRows.get(this.feesInfo.selectedRowIndex).getRecord();
		var fees_id = rowRecord.getValue('bh_zzf_fees.fees_id');
		
		var res = new Ab.view.Restriction();
		res.addClause("bh_zzf_fees.fees_id",fees_id,"=");
		
		this.payFeesInfo.refresh(res,false);
		
//		this.payFeesInfo.show(false);
	    this.payFeesInfo.showInWindow({
	    	 	x: 300, 
	    	 	y: 300, 
	            width: 900,
	            height: 300,
	            title: "缴费明细"
	    });
	},
	/**
	 * 保存缴费信息
	 * 
	 * */
	savePayInfo: function(){
		if(this.payFeesInfo.canSave()){
			this.payFeesInfo.setFieldValue('bh_zzf_fees.pay_state',"1");
			this.payFeesInfo.save();
			this.feesInfo.refresh();
		}
	},
    //生成通知单
    Report: function(){
        View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
            width: 470,
            height: 200,
            xmlName: "protocol",
            closeButton: false
        });
    }

});
