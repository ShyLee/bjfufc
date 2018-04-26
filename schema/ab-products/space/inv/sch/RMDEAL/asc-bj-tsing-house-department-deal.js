var departmentdealControlller = View.createController('departmentdealControlller',{
	 afterInitialDataFetch: function(){
		this.statEnableField(false);
	    },
	    statEnableField:function(trueOrFalse){
			this.ts_deal_form.enableField('ts_deal.deal_name',trueOrFalse);
			this.ts_deal_form.enableField('ts_deal.rq_rm_type',trueOrFalse);
			this.ts_deal_form.enableField('ts_deal.handing_dv',trueOrFalse);
			this.ts_deal_form.enableField('ts_deal.request_person_id',trueOrFalse);
			this.ts_deal_form.enableField('ts_deal.request_person_name',trueOrFalse);
			this.ts_deal_form.enableField('ts_deal.request_person_phone',trueOrFalse);
			this.ts_deal_form.enableField('ts_deal.subject_id',trueOrFalse);
			this.ts_deal_form.enableField('ts_deal.request_time',trueOrFalse); 
			this.ts_deal_form.enableField('ts_deal.wuye_price',trueOrFalse);
			this.ts_deal_form.enableField('ts_deal.rent_price',trueOrFalse);
			this.ts_deal_form.enableField('ts_deal.cash_cost',trueOrFalse);
			this.ts_deal_form.enableField('ts_deal.cash_bill_num',trueOrFalse);
			this.ts_deal_form.enableField('ts_deal.total_rent_area',trueOrFalse);
			this.ts_deal_form.enableField('ts_deal.total_cost',trueOrFalse);
			this.ts_deal_form.enableField('ts_deal.duration_time',trueOrFalse);
			this.ts_deal_form.enableField('ts_deal.start_time',trueOrFalse);
			this.ts_deal_form.enableField('ts_deal.due_time',trueOrFalse);
			this.ts_deal_form.enableField('ts_deal.deal_state',trueOrFalse);
			this.ts_deal_form.enableField('ts_deal.doc1',trueOrFalse);
			this.ts_deal_form.enableField('ts_deal.doc2',trueOrFalse);
		},
	consolePanel_onShow:function()
	{
		this.ts_deal_panel.show(true);
		var panel=this.consolePanel;
		var rt = panel.getFieldValue('ts_deal.rq_rm_type');
		var di = panel.getFieldValue('ts_deal.deal_id');
		var rtf = panel.getFieldValue('ts_deal.request_time.from');
		var rtt = panel.getFieldValue('ts_deal.request_time.to');
		var restriction = new Ab.view.Restriction();
		
		if(rt!='')
		{    	 
			restriction.addClause('ts_deal.rq_rm_type',rt,'=');
		}
		if(di!='')
		{
			restriction.addClause('ts_deal.deal_id',di,'=');
		}
		if(rtf!='')
		{
			restriction.addClause('ts_deal.request_time',rtf,'>');
		}
		if(rtt!='')
		{
			restriction.addClause('ts_deal.request_time',rtt,'<');
		}
		this.ts_deal_panel.refresh(restriction);
		if (this.ts_deal_panel.rows.length == 0) {
	    	 View.showMessage("没有符合条件的用房协议信息！");
			 return;
		}
		
	},
	ts_deal_form_onQuxiao:function()
	{
		var form = this.ts_deal_form;
	},
	afterInitialDataFetch: function()
	{	
		if(this.ts_deal_panel.rows.length!=0)
		{
			var dealId=this.ts_deal_panel.rows[0]["ts_deal.deal_id"];
			var restriction = new Ab.view.Restriction();
			restriction.addClause("ts_deal_rm.deal_id",dealId,"=");
			this.ts_deal_rm_panel.refresh(restriction);
		}
	},
	onClickGrid:function(flag)
	{
		this.statEnableField(false);
		this.ts_deal_form.show(true);
		this.ts_deal_rm_panel.show(true);
		var selectedIndex = -1;
		if (flag) {
			selectedIndex = 0;
		} else {
			selectedIndex = this.ts_deal_panel.selectedRowIndex;
		}
		 var id = View.user.employee.id;//获取session中的id
		 var name = View.user.name;     //获取session中的name
		 
		 var dealId=this.ts_deal_panel.rows[selectedIndex]["ts_deal.deal_id"];
		 var restriction = new Ab.view.Restriction();
		 var restriction2 = new Ab.view.Restriction();
		 restriction.addClause("ts_deal.deal_id",dealId,"=");
		 restriction2.addClause("ts_deal_rm.deal_id",dealId,"=");
		 this.ts_deal_form.refresh(restriction);

		 
		 var dealstate = this.ts_deal_form.getFieldValue('ts_deal.deal_state');
		 if(dealstate!=2)
		 {
			 this.ts_deal_form.enableField("ts_deal.pay_num",false);
			 this.ts_deal_form.enableField("ts_deal.doc",false);
			
		 }
		 if(dealstate==2)
		 {
			 this.ts_deal_form.enableField("ts_deal.pay_num",true);
			 this.ts_deal_form.fields.get("ts_deal.pay_num").fieldDef.required=true;
			 this.ts_deal_form.enableField("ts_deal.doc",true);
			 this.ts_deal_form.fields.get("ts_deal.doc").fieldDef.required=true;
			 this.ts_deal_form.actions.items[0].enable(false);
		 }
		 if(dealstate==3){
			 this.ts_deal_form.enableField("ts_deal.pay_num",false); 
			 this.ts_deal_form.enableField("ts_deal.doc",false);
//			 this.ts_deal_form.getFieldValue("ts_deal.doc").readOnly=true;
			 this.ts_deal_form.actions.items[0].enable(false);
			 this.ts_deal_form.actions.items[1].enable(false);
		 }
		 if(dealstate==0||dealstate==1){
			 this.enableField(true); 
		 }else{
			 this.enableField(false);
		 }
		 
		 var oldid = this.ts_deal_form.getFieldValue('ts_deal.sure_em_id');
		 var oldname = this.ts_deal_form.getFieldValue('ts_deal.sure_em_name');
		 var oldtime = this.ts_deal_form.getFieldValue('ts_deal.sure_time');
//		 var currentDate = ASBT_getCurrentDate_Client();
		 var currentDate=new Date();
		 if(oldid==""||oldid==null)
		 {
			 this.ts_deal_form.setFieldValue('ts_deal.sure_em_id',id);
		 }
		 if(oldname==""||oldname==null)
		 {
			 this.ts_deal_form.setFieldValue('ts_deal.sure_em_name',name);
		 }
		 if(oldtime==""||oldtime==null)
		 {
			 this.ts_deal_form.setFieldValue('ts_deal.sure_time',currentDate);
		 }
		 this.ts_deal_rm_panel.refresh(restriction2);
		 
		 
	},
	enableField:function(trueOrFalse){
		this.ts_deal_form.enableField('ts_deal.sure_em_id',trueOrFalse);
		this.ts_deal_form.enableField('ts_deal.sure_em_name',trueOrFalse);
		this.ts_deal_form.enableField('ts_deal.sure_time',trueOrFalse);
		this.ts_deal_form.enableField('ts_deal.dv_comments',trueOrFalse);
	},
	ts_deal_form_onSaveform:function()
	{
		var oldid = this.ts_deal_form.getFieldValue('ts_deal.sure_em_id');
		var oldname = this.ts_deal_form.getFieldValue('ts_deal.sure_em_name');
		var oldtime = this.ts_deal_form.getFieldValue('ts_deal.sure_time');
		var dv_comments=this.ts_deal_form.getFieldValue('ts_deal.dv_comments');
		var dealstate = this.ts_deal_form.getFieldValue('ts_deal.deal_state');
		if(dealstate!=""&&dealstate!='1')
		{
			View.showMessage("此项协议已经确认，操作失败！");
			return;
		}
		if(oldid=="")
		{
			View.showMessage("“二级单位确认人编号 ” 不能为空！");
			return;
		}
		if(oldname=="")
		{
			View.showMessage("“二级单位确认人名称 ” 不能为空！");
			return;
		}
		if(oldtime=="")
		{
			View.showMessage("“确认时间 ” 不能为空！");
			return;
		}
		if(dv_comments=="")
		{
			View.showMessage("“二级单位备注 ” 不能为空！");
			return;
		}
		var controller = this;
		View.confirm("您是否要确认信息？", function(button)
		{
			if (button == 'yes')
			{
				try {
					controller.ts_deal_form.setFieldValue('ts_deal.deal_state','2');
					var success = controller.ts_deal_form.save();
					if(success)
					{
						View.showMessage("该用房协议已经确认信息！");
						controller.enableField(false);
						controller.ts_deal_form.actions.items[0].enable(false);
						controller.ts_deal_panel.refresh();
//						controller.ts_deal_form.enableField("ts_deal.pay_num",true);
//						controller.ts_deal_form.enableField("ts_deal.doc",true);
					}
					}catch(e){
		            	return;
		            }
			}
		});
	},
	ts_deal_form_onJiaokuan:function()
	{
		var dealstate = this.ts_deal_form.getFieldValue('ts_deal.deal_state');
		var paynum = this.ts_deal_form.getFieldValue('ts_deal.pay_num');
		var doc = this.ts_deal_form.getFieldValue('ts_deal.doc');
		if(dealstate!=""&&dealstate=='1')
		{
			View.showMessage("此项协议还没有进行确认信息，所以不能确认缴款！");
			return;
		}
		if(dealstate!=""&&dealstate!='2')
		{
			View.showMessage("此项协议已经确认缴款，操作失败！");
			return;
		}
		if(paynum=="")
		{
			View.showMessage("请填写缴款单号！");
			return;
		}
		if(doc=="")
		{
			View.showMessage("请上传缴费单文件！");
			return;
		}
		var controller = this;
		View.confirm("您是否确定协议已缴款？", function(button)
		{
			if (button == 'yes')
			{
				try{
					controller.ts_deal_form.setFieldValue('ts_deal.deal_state','3');
					var success = controller.ts_deal_form.save();
					if(success)
					{
						View.showMessage("该用房协议已经确认缴款！");
						controller.ts_deal_form.enableField("ts_deal.pay_num",false); 
						controller.ts_deal_form.enableField("ts_deal.doc",false);
//						 this.ts_deal_form.getFieldValue("ts_deal.doc").readOnly=true;
						controller.ts_deal_form.actions.items[1].enable(false);
						controller.ts_deal_panel.refresh();
//						controller.ts_deal_form.refresh();
//						controller.ts_deal_form.enableField("ts_deal.pay_num",false);
					}
					}catch(e){
	               	 return;
	                }
			}
		});
	},

	ts_deal_form_onDowload2:function()
	{
		var deal_id=this.ts_deal_form.getFieldValue("ts_deal.deal_id");
		var dealrmnumber = this.ts_deal_rm_panel.rows.length;
		var bl_name = "";
		var changeblname = "";
		var blname = "";
		for(var i=0;i<dealrmnumber;i++)
		{
			blname = this.ts_deal_rm_panel.rows[i]["ts_deal_rm.bl_name"];
			if(blname!=changeblname)
			{
				if(bl_name!="")
					bl_name = bl_name+","+blname;
				else
					bl_name = blname;
				changeblname = blname;
			}
		}
		//获得人民币大写
		var rentPrice=parseFloat(this.ts_deal_form.getFieldValue("ts_deal.rent_price"));
		var wuyePrice=parseFloat(this.ts_deal_form.getFieldValue("ts_deal.wuye_price"));
		var rentPriceUpper="";
		var wuyepriceUpper="";
		if(rentPrice!=""){
			try {
				var result1 = Workflow.callMethod('AbSpaceRoomInventoryBAR-RMBHandler-changeToUppercase',rentPrice*365);
				var result2 = Workflow.callMethod('AbSpaceRoomInventoryBAR-RMBHandler-changeToUppercase',wuyePrice*365);
				if (result1.code == 'executed') {
					rentPriceUpper=result1.message;
				}
				if (result2.code == 'executed') {
					wuyepriceUpper=result2.message;
				}
			} 
			catch (e) {
				Workflow.handleError(e);
			}
		}
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false,
		{
            width: 470,
            height: 200,
            xmlName: "TsingHouseUseDeal",
            parameters: {
                'deal_id':deal_id,
                'bl_name':bl_name,
                'rentPriceUpper':rentPriceUpper,
                'wuyepriceUpper':wuyepriceUpper
            },
            closeButton: false
        });

	},
	ts_deal_form_onDowload:function()
	{
		var dealid=this.ts_deal_form.getFieldValue("ts_deal.deal_id");
		var dealrmnumber = this.ts_deal_rm_panel.rows.length;
		var bl_name = "";
		var changeblname = "";
		var blname = "";
		for(var i=0;i<dealrmnumber;i++)
		{
			blname = this.ts_deal_rm_panel.rows[i]["ts_deal_rm.bl_name"];
			if(blname!=changeblname)
			{
				if(bl_name!="")
					bl_name = bl_name+","+blname;
				else
					bl_name = blname;
				changeblname = blname;
			}
		}
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false,
		{
            width: 470,
            height: 200,
            xmlName: "TsingHouseSafety",
            parameters: {
                'deal_id':dealid,
                'bl_name':bl_name
            },
            closeButton: false
        });

	}
});