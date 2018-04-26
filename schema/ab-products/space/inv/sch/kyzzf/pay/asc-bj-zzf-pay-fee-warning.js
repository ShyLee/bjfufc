var zzfPayFeeController = View.createController('zzfPayFeeController',{
	curAlreadyPayForFee:0,//当前缴费项已缴金额
	
	afterInitialDataFetch: function(){
		$('idd1').innerHTML="<font size='2'>交款即将到期(30天)</font>";
		$('idd2').innerHTML="<font size='2'>交款已超期</font>";
		$('idd3').innerHTML="<font size='2'>合同到期</font>";
	},
	legendPanel_onCheckAllFees: function(){
		this.zzfFeesPanel.refresh({});
	},
	zzfFeesPanel_pay_onClick:function(row){
		var fee_id = row.record["bh_zzf_fees.fees_id"];
		this.curAlreadyPayForFee = row.record["bh_zzf_fees.practical_fees_money"];
		
		var restriction = new Ab.view.Restriction();
    	restriction.addClause("bh_zzf_fees.fees_id", fee_id, '=');
    	this.zzfFeesForm.show(true);
    	this.zzfFeesForm.refresh(restriction);
		this.zzfFeesForm.showInWindow({
			x: 200,
			y: 200,
			width: 850,
            height: 300,
            closeButton:false
		});
	},
	 /**
     * 缴费
     * */
	zzfFeesForm_onPay: function(){
		if(this.zzfFeesForm.canSave()){
			var pay = this.zzfFeesForm.getFieldValue("bh_zzf_fees.practical_fees_money");
			
			this.zzfFeesForm.setFieldValue("bh_zzf_fees.practical_fees_money",parseFloat(this.curAlreadyPayForFee) + parseFloat(pay));
			
			this.zzfFeesForm.save();
			this.zzfFeesForm.closeWindow();
			this.zzfFeesPanel.refresh();
		}
	},
	zzfFeesForm_onReturn: function(){
		this.zzfFeesForm.closeWindow();
	},
	idd1Click: function(){
		var restriction = new Ab.view.Restriction();
    	restriction.addClause("bh_zzf_fees.color", "'14 0 7 16763955'", '=');
    	this.zzfFeesPanel.refresh(restriction);
	},
	idd2Click: function(){
		var restriction = new Ab.view.Restriction();
    	restriction.addClause("bh_zzf_fees.color", "'14 0 1 16711680'", '=');
    	this.zzfFeesPanel.refresh(restriction);
	},
	idd3Click: function(){
		var restriction = new Ab.view.Restriction();
    	restriction.addClause("bh_zzf_fees.color", "'14 0 5 255'", '=');
    	this.zzfFeesPanel.refresh(restriction);
	}
	
	
});
