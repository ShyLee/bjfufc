var handovercheckinControlller = View.createController('handovercheckinControlller',{
	afterInitialDataFetch: function()
	{
		if(this.ts_handover_grid.rows.length!=0)
		{
			var hdId=this.ts_handover_grid.rows[0]["ts_handover.handover_id"];
			var restriction = new Ab.view.Restriction();
			restriction.addClause("ts_handover_check.handover_id",hdId,"=");
			this.ts_handover_check_grid.refresh(restriction);
			this.ts_handover_check_grid.show(false);
		}
		this.enableField();
	},
	enableField:function(){
		 this.ts_handover_form.enableField("ts_handover.handover_id",false);
		 this.ts_handover_form.enableField("ts_handover.bl_id",false);
		 this.ts_handover_form.enableField("ts_handover.fl_id",false);
		 this.ts_handover_form.enableField("ts_handover.rm_id",false);
		 this.ts_handover_form.enableField("ts_handover.deal_id",false);
		 this.ts_handover_form.enableField("ts_handover.dv_id",false);
		 this.ts_handover_form.enableField("ts_handover.dv_user_id",false);
		 this.ts_handover_form.enableField("ts_handover.dv_user_name",false);
		 this.ts_handover_form.enableField("ts_handover.handling_dv",false);
		 this.ts_handover_form.enableField("ts_handover.handling_em_id",false);
		 this.ts_handover_form.enableField("ts_handover.handling_em_name",false);
		 this.ts_handover_form.enableField("ts_handover.property_company",false);
		 this.ts_handover_form.enableField("ts_handover.handling_time",false);
		 this.ts_handover_form.enableField("ts_handover.handover_type",false);
		
	},
	consolePanel_onShow:function()
	{
		var panel=this.consolePanel;
		var hdid = panel.getFieldValue('ts_handover.handover_id');
		var rmid = panel.getFieldValue('ts_handover.rm_id');
		var thf = panel.getFieldValue('ts_handover.handling_time.from');
		var tht = panel.getFieldValue('ts_handover.handling_time.to');
		var restriction = new Ab.view.Restriction();
		if(hdid!='')
		{
			restriction.addClause('ts_handover.handover_id',hdid,'=');
		}
		if(rmid!='')
		{
			restriction.addClause('ts_handover.rm_id',rmid,'=');
		}
		if(thf!='')
		{
			restriction.addClause('ts_handover.handling_time',thf,'>');
		}
		if(tht!='')
		{
			restriction.addClause('ts_handover.handling_time',tht,'<');
		}
		this.ts_handover_grid.refresh(restriction);
		if (this.ts_handover_grid.rows.length == 0)
		{
	    	 View.showMessage("没有符合条件的入住交接单！");
			 return;
		}
	},
	onClickGrid:function(flag)
	{
		var selectedIndex = -1;
		if (flag) {
			selectedIndex = 0;
		} else {
			selectedIndex = this.ts_handover_grid.selectedRowIndex;
		}
		var handoverId=this.ts_handover_grid.rows[selectedIndex]["ts_handover.handover_id"];
		alert(handoverId);
		var restriction1 = new Ab.view.Restriction();
		var restriction2 = new Ab.view.Restriction();
		restriction1.addClause("ts_handover.handover_id",handoverId,"=");
		this.ts_handover_form.refresh(restriction1);
		restriction2.addClause("ts_handover_check.handover_id",handoverId,"=");
		this.ts_handover_check_grid.refresh(restriction2);
	},
	ts_handover_grid_onXinzeng:function()
	{
		var handingDv=View.user.employee.organization.divisionId;
//		this.ts_handover_form.setFieldValue("ts_handover.handover_id","");
//		this.ts_handover_form.setFieldValue("ts_handover.bl_id","");
//		this.ts_handover_form.setFieldValue("ts_handover.fl_id","");
//		this.ts_handover_form.setFieldValue("ts_handover.rm_id","");
//		this.ts_handover_form.setFieldValue("ts_handover.deal_id","");
		this.ts_handover_form.enableField("ts_handover.deal_id",false);
//		this.ts_handover_form.setFieldValue("ts_handover.dv_id","");
//		this.ts_handover_form.setFieldValue("ts_handover.dv_user_id","");
//		this.ts_handover_form.setFieldValue("ts_handover.dv_user_name","");
		this.ts_handover_form.enableField("ts_handover.dv_user_name",false);
		this.ts_handover_form.setFieldValue("ts_handover.handling_dv",handingDv);
		this.ts_handover_form.enableField("ts_handover.handling_dv",false);
//		this.ts_handover_form.setFieldValue("ts_handover.handling_em_id","");
//		this.ts_handover_form.setFieldValue("ts_handover.handling_em_name","");
		this.ts_handover_form.enableField("ts_handover.handling_em_name",false);
//		this.ts_handover_form.setFieldValue("ts_handover.property_company","");
//		this.ts_handover_form.setFieldValue("ts_handover.handling_time","");
//		this.ts_handover_form.setFieldValue("ts_handover.handover_id","");
	},
	ts_handover_form_onDelete:function()
	{
		var number = this.ts_handover_check_grid.rows.length;
		var handoverid = this.ts_handover_form.getFieldValue("ts_handover.handover_id");
		var checkDataSource = View.dataSources.get("ts_handover_check_ds");
		var restriction = new Ab.view.Restriction();
		restriction.addClause("ts_handover_check.handover_id",handoverid,"=");
		for(var i=0;i<number;i++)
		{
			var record = checkDataSource.getRecord(restriction);
			checkDataSource.deleteRecord(record);
		}
		
		var restriction1 = new Ab.view.Restriction();
		restriction1.addClause("ts_handover.handover_id",handoverid,"=");
		var handoverDataSource = View.dataSources.get("ts_handover_ds");
		var record1 = handoverDataSource.getRecord(restriction1);
		handoverDataSource.deleteRecord(record1);
		
		this.ts_handover_grid.refresh();
		this.ts_handover_form.show(false);
		this.ts_handover_check_grid.show(false);
	},
	Ts_handover_check_form:function()
	{
		this.ts_handover_check_form.show(true);
		this.ts_handover_check_form.showInWindow({width:800,height:250});
		var index = this.ts_handover_check_grid.selectedRowIndex;
		var record = this.ts_handover_check_grid.gridRows.get(index).getRecord();
		var hcid = record.getValue('ts_handover_check.hc_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ts_handover_check.hc_id',hcid,'=');
		this.ts_handover_check_form.refresh(restriction);
	},
	newcheckform:function()
	{
		this.ts_handover_check_form.show(true);
		this.ts_handover_check_form.showInWindow({width:800,height:250});
		this.ts_handover_check_form.clear();
		var handoverid = this.ts_handover_form.getFieldValue('ts_handover.handover_id');
		this.ts_handover_check_form.setFieldValue('ts_handover_check.handover_id',handoverid);
		this.ts_handover_check_form.actions.get('deletecheck').enable(false);
	},//显示工种分类列表
	showDeviceTypePanel:function()
	{
		this.ts_device_type_grid.show(false);
		this.ts_device_type_grid.showInWindow({
            width: 800,
            height: 600
        });
		this.ts_device_type_grid.refresh();
	},
	//***********工种部分开始***********\\
	//新增工种表单
	showDeviceTypeDetailForm: function()
	{
		this.ts_device_type_form.show(true);
		this.ts_device_type_form.showInWindow({
            width: 300,
            height: 250
        });
		this.ts_device_type_form.refresh();
		this.ts_device_type_form.clear();
	},//保存新写的工种
	afterSaveDeviceType: function(){
		var record=this.ts_device_type_form.getRecord();
		record.isNew=true;
		try{
			View.dataSources.get('ts_device_type_ds').saveRecord(record);
			this.ts_device_type_form.closeWindow();
			this.ts_device_type_grid.refresh();
			View.alert("保存成功");
		}catch(e){
			View.alert("程序出错,或者重复记录,终止");
		}
	},//选择一个工种到上层的页面
	selectDeviceType: function()
	{
		var index=this.ts_device_type_grid.selectedRowIndex;
		var gridRowRecord=this.ts_device_type_grid.gridRows.get(index).getRecord();
		var deviceType=gridRowRecord.getValue('ts_device_type.device_type');
		this.ts_handover_check_form.setFieldValue('ts_handover_check.device_type',deviceType);
		this.ts_device_type_grid.closeWindow();
	},
	//***********工种部分结束***********\\
	//-----------验收项目开始-----------\\
	showDevicePanel: function()
	{
		this.ts_device_grid.show(false);
		this.ts_device_grid.showInWindow({
            width: 800,
            height: 600
        });
		var deviceType=this.ts_handover_check_form.getFieldValue('ts_handover_check.device_type');
		var restriction=new Ab.view.Restriction();
		if(valueExistsNotEmpty(deviceType)){	
			restriction.addClause('ts_device.device_type',deviceType,'=');
		}
		this.ts_device_grid.refresh(restriction);
	},
	showDeviceDetailForm: function()
	{
		this.ts_device__form.show(true);
		this.ts_device__form.showInWindow({
            width: 300,
            height: 250
        });
		this.ts_device__form.refresh();
		this.ts_device__form.clear();
	},
	afterSaveDevice: function(){
		var record=this.ts_device__form.getRecord();
		record.isNew=true;
		try{
			View.dataSources.get('ts_device_ds').saveRecord(record);
			this.ts_device__form.closeWindow();
			this.ts_device_grid.refresh();
			View.alert("保存成功");
		}catch(e){
			View.alert("程序出错,或者重复记录,终止");
		}
	},
	selectDevice: function()
	{
		var index=this.ts_device_grid.selectedRowIndex;
		var gridRowRecord=this.ts_device_grid.gridRows.get(index).getRecord();
		var deviceType=gridRowRecord.getValue('ts_device.device_type');
		var deviceName=gridRowRecord.getValue('ts_device.device_name');
		this.ts_handover_check_form.setFieldValue('ts_handover_check.device_type',deviceType);
		this.ts_handover_check_form.setFieldValue('ts_handover_check.device_name',deviceName);
		this.ts_device_grid.closeWindow();
	},
	//保存交接检查内容表
	saveCheck: function(){
		var handoverRecord=this.ts_handover_check_form.getRecord();
		var hcId=this.ts_handover_check_form.getFieldValue('ts_handover_check.hc_id');
		if(!valueExistsNotEmpty(hcId)){
			handoverRecord.isNew=true;
		}else{
			handoverRecord.isNew=false;
		}
		
		//在保存之前检查此交接单是否已经添加了当前的工种分类和验收项目
		var handoverId=this.ts_handover_check_form.getFieldValue('ts_handover_check.handover_id');
		var deviceType=this.ts_handover_check_form.getFieldValue('ts_handover_check.device_type');
		var deviceName=this.ts_handover_check_form.getFieldValue('ts_handover_check.device_name');
		var checkNum=this.ts_handover_check_form.getFieldValue('ts_handover_check.check_number');
		
		var checkds=View.dataSources.get('ts_handover_check_ds');
		var deviceTypeDs=View.dataSources.get('ts_device_type_ds');
		var deviceNameDs=View.dataSources.get('ts_device_ds');
		if(!valueExistsNotEmpty(deviceType))
		{
			View.alert("[工种分类]字段不能为空!");
			return;
		}else{
			var res=new Ab.view.Restriction();
			res.addClause('ts_device_type.device_type',deviceType,'=');
			var record=deviceTypeDs.getRecord(res);
			if(record.isNew){
				View.alert("填写的[工种分类]字段在库中不存在,请重新选择!");
				return;
			}
		}
		if(!valueExistsNotEmpty(deviceName)){
			View.alert("[验收项目]字段不能为空!");
			return;
		}else{
			//检查库中此工种分类下的验收项目是否存在
			var res=new Ab.view.Restriction();
			res.addClause('ts_device.device_type',deviceType,'=');
			res.addClause('ts_device.device_name',deviceName,'=');
			var record=deviceNameDs.getRecord(res);
			if(record.isNew){
				View.alert("["+deviceType+"]下不存在["+deviceName+"],请重新选择!");
				return;
			}
		}
		
		
		if(!valueExistsNotEmpty(checkNum)){
			View.alert("[数量]字段不能为空!");
			return;
		}
		if(handoverRecord.isNew){
			//检查此交接单下是否已经存在这个工种分类和验收项目
			var checkRes=new Ab.view.Restriction();
			checkRes.addClause('ts_handover_check.handover_id',handoverId,'=');
			checkRes.addClause('ts_handover_check.device_type',deviceType,'=');
			checkRes.addClause('ts_handover_check.device_name',deviceName,'=');
			var hdRecord=checkds.getRecord(checkRes);
			if(!hdRecord.isNew){
				View.alert('此交接单下已添加此项检查内容,不可重复添加!');
				return;
			}
		}
		try{
			checkds.saveRecord(handoverRecord);
			this.ts_handover_check_grid.refresh();
			this.ts_handover_check_form.closeWindow();
			View.alert("成功添加检查内容");
		}catch(e){
			View.alert("添加检查内容操作有误,操作终止!");
		}
	},
	deleteCheck:function()
	{
		var handoverid = this.ts_handover_check_form.getFieldValue('ts_handover_check.handover_id');
		var record = this.ts_handover_check_form.getRecord();
		var mes = "您确定要删除这条检查记录吗？";
		View.confirm(mes,function(button)
		{
			if(button=="yes")
			{
				var hcds = View.dataSources.get('ts_handover_check_ds');
				hcds.deleteRecord(record);
				View.panels.get('ts_handover_check_form').closeWindow();
				var restriction = new Ab.view.Restriction();
				restriction.addClause('ts_handover_check.handover_id',handoverid);
				View.panels.get('ts_handover_check_grid').refresh(restriction);
			}
		});
	}
});