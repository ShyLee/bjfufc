var controller=View.createController('HandoverForm',{
	afterInitialDataFetch: function(){
		this.enableField();
	},
	//弹出添加检查内容详细面板
	showHandoverCheckDetailForm: function(){
		var handoverId=this.handoverDetailPanel.getFieldValue('ts_handover.handover_id');
		if(valueExistsNotEmpty(handoverId)){
			this.HandovercheckDetailPanel.show(true);
			this.HandovercheckDetailPanel.showInWindow({
	            width: 800,
	            height: 250
	        });
			
			this.HandovercheckDetailPanel.clear();
			var handoverId=this.handoverDetailPanel.getFieldValue('ts_handover.handover_id');
			this.HandovercheckDetailPanel.setFieldValue('ts_handover_check.handover_id',handoverId);
			this.HandovercheckDetailPanel.actions.get('btnDelete').enable(false);
		}else{
			View.alert("请先保存交接单,然后再添加检查内容！");
		}
		
	},
	enableField:function(){
		 this.handoverDetailPanel.enableField("ts_handover.handover_id",false);
		 this.handoverDetailPanel.enableField("ts_handover.bl_id",false);
		 this.handoverDetailPanel.enableField("ts_handover.fl_id",false);
		 this.handoverDetailPanel.enableField("ts_handover.rm_id",false);
		 this.handoverDetailPanel.enableField("ts_handover.deal_id",false);
		 this.handoverDetailPanel.enableField("ts_handover.dv_id",false);
		 this.handoverDetailPanel.enableField("ts_handover.dv_user_id",false);
		 this.handoverDetailPanel.enableField("ts_handover.dv_user_name",false);
		 this.handoverDetailPanel.enableField("ts_handover.handling_dv",false);
		 this.handoverDetailPanel.enableField("ts_handover.handling_em_id",false);
		 this.handoverDetailPanel.enableField("ts_handover.handling_em_name",false);
		 this.handoverDetailPanel.enableField("ts_handover.property_company",false);
		 this.handoverDetailPanel.enableField("ts_handover.handling_time",false);
		 this.handoverDetailPanel.enableField("ts_handover.handover_type",false);
		
	},
	
	//过滤操作
	doFilter: function(){
		var handoverId=this.consoleForm.getFieldValue('ts_handover.handover_id');
		var dvId=this.consoleForm.getFieldValue('ts_handover.dv_id');
		var rmId=this.consoleForm.getFieldValue('ts_handover.rm_id');
		var dataFrom=this.consoleForm.getFieldValue('ts_handover.dateFrom');
		var dataTo=this.consoleForm.getFieldValue('ts_handover.dateTo');
		var consoleRes=new Ab.view.Restriction();
		if(valueExistsNotEmpty(handoverId)){
			consoleRes.addClause('ts_handover.handover_id',handoverId,'=');
		}
		if(valueExistsNotEmpty(dvId)){
			consoleRes.addClause('ts_handover.dv_id','%'+dvId+'%','LIKE');
		}
		if(valueExistsNotEmpty(rmId)){
			consoleRes.addClause('ts_handover.rm_id',rmId,'=');
		}
		if(valueExistsNotEmpty(dataFrom)){
			consoleRes.addClause('ts_handover.handling_time',dataFrom,'&gt;=');
		}
		if(valueExistsNotEmpty(dataTo)){
			consoleRes.addClause('ts_handover.handling_time',dataTo,'&lt;=');
		}
		this.handoverListPanel.refresh(consoleRes);
	},
	
	showDeviceTypePanel: function(){
		this.deviceTypePanel.show(false);
		this.deviceTypePanel.showInWindow({
            width: 800,
            height: 600
        });
		this.deviceTypePanel.refresh();
	},
	showDeviceTypeDetailForm: function(){
		this.deviceTypeDetailPanel.show(true);
		this.deviceTypeDetailPanel.showInWindow({
            width: 400,
            height: 200
        });
		this.deviceTypeDetailPanel.refresh();
		this.deviceTypeDetailPanel.clear();
		
	},
	afterSaveDeviceType: function(){
		var record=this.deviceTypeDetailPanel.getRecord();
		record.isNew=true;
		try{
			View.dataSources.get('ascBjTsingHouseTsDeviceTypeDs').saveRecord(record);
			this.deviceTypeDetailPanel.closeWindow();
			this.deviceTypePanel.refresh();
			View.alert("保存成功");
		}catch(e){
			View.alert("程序出错,终止");
		}
	},
	selectDeviceType: function(){
		var index=this.deviceTypePanel.selectedRowIndex;
		var gridRowRecord=this.deviceTypePanel.gridRows.get(index).getRecord();
		var deviceType=gridRowRecord.getValue('ts_device_type.device_type');
		this.HandovercheckDetailPanel.setFieldValue('ts_handover_check.device_type',deviceType);
		this.deviceTypePanel.closeWindow();
	},
	showDevicePanel: function(){
		this.deviceNamePanel.show(false);
		this.deviceNamePanel.showInWindow({
            width: 800,
            height: 600
        });
		var deviceType=this.HandovercheckDetailPanel.getFieldValue('ts_handover_check.device_type');
		var res=new Ab.view.Restriction();
		if(valueExistsNotEmpty(deviceType)){	
			res.addClause('ts_device.device_type',deviceType,'=');
		}
		
		this.deviceNamePanel.refresh(res);
	},
	showDeviceDetailForm: function(){
		this.deviceNameDetailPanel.show(true);
		this.deviceNameDetailPanel.showInWindow({
            width: 400,
            height: 200
        });
		this.deviceNameDetailPanel.refresh();
		this.deviceNameDetailPanel.clear();
	},
	afterSaveDevice: function(){
		var record=this.deviceNameDetailPanel.getRecord();
		record.isNew=true;
		try{
			View.dataSources.get('ascBjTsingHouseTsDeviceDs').saveRecord(record);
			this.deviceNameDetailPanel.closeWindow();
			this.deviceNamePanel.refresh();
			View.alert("保存成功");
		}catch(e){
			View.alert("程序出错,终止");
		}
	},
	selectDevice: function(){
		var index=this.deviceNamePanel.selectedRowIndex;
		var gridRowRecord=this.deviceNamePanel.gridRows.get(index).getRecord();
		var deviceType=gridRowRecord.getValue('ts_device.device_type');
		var deviceName=gridRowRecord.getValue('ts_device.device_name');
		this.HandovercheckDetailPanel.setFieldValue('ts_handover_check.device_type',deviceType);
		this.HandovercheckDetailPanel.setFieldValue('ts_handover_check.device_name',deviceName);
		this.deviceNamePanel.closeWindow();
	},
	saveHandoverCheck: function(){
		var handoverRecord=this.HandovercheckDetailPanel.getRecord();
		var hcId=this.HandovercheckDetailPanel.getFieldValue('ts_handover_check.hc_id');
		if(!valueExistsNotEmpty(hcId)){
			handoverRecord.isNew=true;
		}else{
			handoverRecord.isNew=false;
		}
		
		//在保存之前检查此交接单是否已经添加了当前的工种分类和验收项目
		var handoverId=this.HandovercheckDetailPanel.getFieldValue('ts_handover_check.handover_id');
		var deviceType=this.HandovercheckDetailPanel.getFieldValue('ts_handover_check.device_type');
		var deviceName=this.HandovercheckDetailPanel.getFieldValue('ts_handover_check.device_name');
		var checkNum=this.HandovercheckDetailPanel.getFieldValue('ts_handover_check.check_number');
		var ds=View.dataSources.get('ascBjTsingHouseTsHandoverCheckDs');
		var deviceTypeDs=View.dataSources.get('ascBjTsingHouseTsDeviceTypeDs');
		var deviceNameDs=View.dataSources.get('ascBjTsingHouseTsDeviceDs');
		if(!valueExistsNotEmpty(deviceType)){
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
			var hdRecord=ds.getRecord(checkRes);
			if(!hdRecord.isNew){
				View.alert('此交接单下已添加此项检查内容,不可重复添加!');
				return;
			}
		}
		
		try{
			ds.saveRecord(handoverRecord);
			this.HandoverCheckPanel.refresh();
			this.HandovercheckDetailPanel.closeWindow();
			View.alert("成功添加检查内容");
		}catch(e){
			View.alert("添加检查内容操作有误,操作终止!");
		}
	},
	//在交接单详细窗口显示以后，将当前操作人所在单位记入系统的<经办单位>字段
	afterShowHandoverPanel: function(){
		var dvId=View.user.employee.organization.divisionId;
		this.handoverDetailPanel.setFieldValue('ts_handover.handling_dv',dvId);
	},
	showEditeHandoverCheckDetailForm: function(){
		this.HandovercheckDetailPanel.show(true);
		this.HandovercheckDetailPanel.showInWindow({
			 width: 800,
	        height: 250
		});
		var selectRowsIndex=this.HandoverCheckPanel.selectedRowIndex;
		var rowRecord=this.HandoverCheckPanel.gridRows.get(selectRowsIndex).getRecord();
		var hcId=rowRecord.getValue('ts_handover_check.hc_id');
		var res=new Ab.view.Restriction();
		res.addClause('ts_handover_check.hc_id',hcId,'=');
		this.HandovercheckDetailPanel.refresh(res);
	},
	deleteHandoverCheckDetailForm: function(){
		var record=this.HandovercheckDetailPanel.getRecord();
		var deviceType=this.HandovercheckDetailPanel.getFieldValue('ts_handover_check.device_type');
		var deviceName=this.HandovercheckDetailPanel.getFieldValue('ts_handover_check.device_name');
		var handoverId=this.HandovercheckDetailPanel.getFieldValue('ts_handover_check.handover_id');
		var mes="确定要删除["+deviceType+"]下的["+deviceName+"]?";
		View.confirm(mes,function(button){
			if(button=="yes"){
				var handoverCheckDs=View.dataSources.get('ascBjTsingHouseTsHandoverCheckDs');
				handoverCheckDs.deleteRecord(record);
				View.panels.get('HandovercheckDetailPanel').closeWindow();
				var handoverCheckRes=new Ab.view.Restriction();
				handoverCheckRes.addClause('ts_handover_check.handover_id',handoverId);
				View.panels.get('HandoverCheckPanel').refresh(handoverCheckRes);
			}
		});
	}
});