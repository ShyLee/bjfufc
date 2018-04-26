jQuery().ready(function() {
	
		 //给页面上 <field >设置了 cssClass 的字段 注册事件
		 jQuery("#zwFormPanel input[class*='inputValueChg']").on("change",function(e){
			   var eventSrc=e.target.id;

			   if(jQuery(this).val().trim()==''){
				   
				   switch(eventSrc)
				   {
				   case 'zwFormPanel_sc_zf_em_zwjl.zw_name': //判断当前的事件源 是哪一个文本框 case里面写的是 当前文本框的id
					   jQuery("#zwFormPanel_sc_zf_em_zwjl\\.zw_id").val('');
					   jQuery("#zwFormPanel_sc_zf_em_zwjl\\.zw_jb_name").val('');
					   jQuery("#zwFormPanel_sc_zf_em_zwjl\\.zw_jb_id").val('');
					     break;
				   case 'zwFormPanel_sc_zf_em_zwjl.zw_jb_name':
					   jQuery("#zwFormPanel_sc_zf_em_zwjl\\.zw_jb_id").val('');
					   break;
					    
				   default:
				    
				   }
			   }
		 });
		 
		//给页面上 <field >设置了 cssClass 的字段 注册事件
		 jQuery("#zcFormPanel input[class*='inputValueChg']").on("change",function(e){
			   var eventSrc=e.target.id;

			   if(jQuery(this).val().trim()==''){
				   
				   switch(eventSrc)
				   {
				   case 'zcFormPanel_sc_zf_em_zcjl.zc_name': //判断当前的事件源 是哪一个文本框 case里面写的是 当前文本框的id
					   jQuery("#zcFormPanel_sc_zf_em_zcjl\\.zc_id").val('');
					   jQuery("#zcFormPanel_sc_zf_em_zcjl\\.zc_jb_name").val('');
					   jQuery("#zcFormPanel_sc_zf_em_zcjl\\.zc_jb_id").val('');
					     break;
				   case 'zcFormPanel_sc_zf_em_zcjl.zc_jb_name':
					   jQuery("#zcFormPanel_sc_zf_em_zcjl\\.zc_jb_id").val('');
					   break;
					    
				   default:
				    
				   }
			   }
		 });
		 
});



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
	},
	zwGridPanel_onAdd: function(){
		var res = new Ab.view.Restriction();
		res.addClause("sc_zf_em_zwjl.em_id",SUPERCONTROLLER.EM_ID,"=");
		res.addClause("sc_zf_em_zwjl.archive_id",SUPERCONTROLLER.ARCHIVE_ID,"=");
		
		this.zwFormPanel.refresh(res,true);
		this.zwFormPanel.showInWindow({
			title: "添加职务经历",
			width: 600,
			height: 400
		});
	},
	/**
	 * 职务职称调整后，根据最后一条记录，
	 * 1.同步人员表的当前职务职称，
	 * 2.同步最大补贴面积与补贴金额
	 * */
	synchronizationZfEmByZWZC: function(em_id){
		if(!valueExistsNotEmpty(em_id)){//非本校教职工
			return;
		}
		
		var zw_jb_id =  "";
		var zw_jb_name = "";
		var zw_id = "";
		var zw_name =  "";
		var zw_get_date =  "";
		
		var zc_jb_id =  "";
		var zc_jb_name = "";
		var zc_id = "";
		var zc_name =  "";
		var zc_get_date =  "";
		
		//1.获取当前列表中最后一条职务职称
		var zwRecords = this.zwGridPanel.gridRows.items;
		if(zwRecords.length > 0){
			zw_jb_id =  zwRecords[zwRecords.length-1].getFieldValue("sc_zf_em_zwjl.zw_jb_id");
			zw_jb_name =  zwRecords[zwRecords.length-1].getFieldValue("sc_zf_em_zwjl.zw_jb_name");
			zw_id =  zwRecords[zwRecords.length-1].getFieldValue("sc_zf_em_zwjl.zw_id");
			zw_name =  zwRecords[zwRecords.length-1].getFieldValue("sc_zf_em_zwjl.zw_name");
			zw_get_date =  zwRecords[zwRecords.length-1].getFieldValue("sc_zf_em_zwjl.get_date");
		}
		
		var zcRecords = this.zcGridPanel.gridRows.items;
		if(zcRecords.length > 0){
			zc_jb_id =  zcRecords[zcRecords.length-1].getFieldValue("sc_zf_em_zcjl.zc_jb_id");
			zc_jb_name =  zcRecords[zcRecords.length-1].getFieldValue("sc_zf_em_zcjl.zc_jb_name");
			zc_id =  zcRecords[zcRecords.length-1].getFieldValue("sc_zf_em_zcjl.zc_id");
			zc_name =  zcRecords[zcRecords.length-1].getFieldValue("sc_zf_em_zcjl.zc_name");
			zc_get_date =  zcRecords[zcRecords.length-1].getFieldValue("sc_zf_em_zcjl.get_date");
		}
		
		//2.获得补贴金额，与补贴面积
		var btResult = getMaxBtArea(zw_name,zc_name);
		//3.更新到em表
		var res = new Ab.view.Restriction();
		res.addClause("sc_zf_em_zwjl.em_id",em_id,"=");
		var record = this.scZfEmDs.getRecord(res);
		record.setValue("sc_zf_em.zw_jb_id",zw_jb_id);
		record.setValue("sc_zf_em.zw_jb_name",zw_jb_name);
		record.setValue("sc_zf_em.zw_id",zw_id);
		record.setValue("sc_zf_em.zw_name",zw_name);
		record.setValue("sc_zf_em.zw_get_date",zw_get_date);
		record.setValue("sc_zf_em.zc_jb_id",zc_jb_id);
		record.setValue("sc_zf_em.zc_jb_name",zc_jb_name);
		record.setValue("sc_zf_em.zc_id",zc_id);
		record.setValue("sc_zf_em.zc_name",zc_name);
		record.setValue("sc_zf_em.zc_get_date",zc_get_date);
		
		record.setValue("sc_zf_em.area_jz_std",parseFloat(btResult['maxArea']));
		record.setValue("sc_zf_em.money_std",parseFloat(btResult['maxMoney']));
		this.scZfEmDs.saveRecord(record);
		
		//4.刷新tab
		SUPERCONTROLLER.emForm.refresh();
	},
	
	
	zwFormPanel_onSave: function(){
		if(this.zwFormPanel.canSave()){
			this.zwFormPanel.save();
			View.showMessage("保存成功");
			this.zwFormPanel.closeWindow();
			this.zwGridPanel.refresh();
			this.synchronizationZfEmByZWZC(SUPERCONTROLLER.EM_ID);
		}
	},
	zwFormPanel_onReturn: function(){
		this.zwFormPanel.closeWindow();
	},
	zwGridPanel_onDelete: function(){
		var selectedRecordList = this.zwGridPanel.getSelectedRecords();
		if(selectedRecordList.length == 0){
			View.alert('请选择要操作的数据');
			return;
		}
		var controller = this;
		View.confirm("您确定要删除此记录?[只能删除房产处新建的数据]", function(button){
			if(button == "yes"){
				for(var i = 0; i < selectedRecordList.length; i++){
					var record = selectedRecordList[i];
					var auto_id = record.getValue('sc_zf_em_zwjl.auto_id');
					var is_rc = record.getValue('sc_zf_em_zwjl.is_rc');
					if(is_rc == "fc"){
						var res = new Ab.view.Restriction();
						res.addClause("sc_zf_em_zwjl.auto_id",auto_id,"=");
						var record = controller.zwDs.getRecord(res);
						controller.zwDs.deleteRecord(record);
					}else{
//						var res = new Ab.view.Restriction();
//						res.addClause("hrbook_zwjl_local.id",auto_id,"=");
//						var record = controller.hrZwDs.getRecord(res);
//						controller.hrZwDs.deleteRecord(record);
					}
					controller.zwGridPanel.refresh();
					controller.synchronizationZfEmByZWZC(SUPERCONTROLLER.EM_ID);
				}
			}
		});
	},
	
	zcGridPanel_onAdd: function(){
		var res = new Ab.view.Restriction();
		res.addClause("sc_zf_em_zcjl.em_id",SUPERCONTROLLER.EM_ID,"=");
		res.addClause("sc_zf_em_zcjl.archive_id",SUPERCONTROLLER.ARCHIVE_ID,"=");
		
		this.zcFormPanel.refresh(res,true);
		this.zcFormPanel.showInWindow({
			title: "添加职称经历",
			width: 600,
			height: 400
		});
	},
	zcFormPanel_onSave: function(){
		if(this.zcFormPanel.canSave()){
			this.zcFormPanel.save();
			View.showMessage("保存成功");
			this.zcFormPanel.closeWindow();
			this.zcGridPanel.refresh();
			this.synchronizationZfEmByZWZC(SUPERCONTROLLER.EM_ID);
		}
	},
	zcFormPanel_onReturn: function(){
		this.zcFormPanel.closeWindow();
	},
	zcGridPanel_onDelete: function(){
		var selectedRecordList = this.zcGridPanel.getSelectedRecords();
		if(selectedRecordList.length == 0){
			View.alert('请选择要操作的数据');
			return;
		}
		var controller = this;
		View.confirm("您确定要删除此记录?[只能删除房产处新建的数据]", function(button){
			if(button == "yes"){
				for(var i = 0; i < selectedRecordList.length; i++){
					var record = selectedRecordList[i];
					var auto_id = record.getValue('sc_zf_em_zcjl.auto_id');
					var is_rc = record.getValue('sc_zf_em_zcjl.is_rc');
					if(is_rc == "fc"){
						var res = new Ab.view.Restriction();
						res.addClause("sc_zf_em_zcjl.auto_id",auto_id,"=");
						var record = controller.zcDs.getRecord(res);
						controller.zcDs.deleteRecord(record);
					}else{
//						var res = new Ab.view.Restriction();
//						res.addClause("hrbook_zcjl_local.id",auto_id,"=");
//						var record = controller.hrzcDs.getRecord(res);
//						controller.hrzcDs.deleteRecord(record);
					}
					controller.zcGridPanel.refresh();
					controller.synchronizationZfEmByZWZC(SUPERCONTROLLER.EM_ID);
				}
			}
		});
	},
	
	gzjlGridPanel_onAdd: function(){
		var res = new Ab.view.Restriction();
		res.addClause("sc_zf_em_gzjl.em_id",SUPERCONTROLLER.EM_ID,"=");
		res.addClause("sc_zf_em_gzjl.archive_id",SUPERCONTROLLER.ARCHIVE_ID,"=");
		
		this.gzjlFormPanel.refresh(res,true);
		this.gzjlFormPanel.showInWindow({
			title: "添加工作经历",
			width: 600,
			height: 400
		});
	},
	gzjlFormPanel_onSave: function(){
		if(this.gzjlFormPanel.canSave()){
			this.gzjlFormPanel.save();
			View.showMessage("保存成功");
			this.gzjlFormPanel.closeWindow();
			this.gzjlGridPanel.refresh();
		}
	},
	
   checkGzjlDate: function(){
    	var date_begin =  this.gzjlFormPanel.getFieldValue("sc_zf_em_gzjl.date_begin");
    	var date_end =  this.gzjlFormPanel.getFieldValue("sc_zf_em_gzjl.date_end");
    	if(!valueExistsNotEmpty(date_begin)){
    		this.gzjlFormPanel.setFieldValue("sc_zf_em_gzjl.date_end","");
    		View.showMessage("请先选择起始时间");
    		return;
    	}
    	if(getFormatDate(date_begin).getTime() > getFormatDate(date_end).getTime()){
    		this.gzjlFormPanel.setFieldValue("sc_zf_em_gzjl.date_begin","");
    		this.gzjlFormPanel.setFieldValue("sc_zf_em_gzjl.date_end","");
    		View.showMessage("截至时间不能早于起始时间");
    		return;
    	}
    },
		
	
	gzjlFormPanel_onReturn: function(){
		this.gzjlFormPanel.closeWindow();
	},
	gzjlGridPanel_onDelete: function(){
		var selectedRecordList = this.gzjlGridPanel.getSelectedRecords();
		if(selectedRecordList.length == 0){
			View.alert('请选择要操作的数据');
			return;
		}
		var controller = this;
		View.confirm("您确定要删除此记录?[只能删除房产处新建的数据]", function(button){
			if(button == "yes"){
				for(var i = 0; i < selectedRecordList.length; i++){
					var record = selectedRecordList[i];
					var auto_id = record.getValue('sc_zf_em_gzjl.auto_id');
					
					var res = new Ab.view.Restriction();
					res.addClause("sc_zf_em_gzjl.auto_id",auto_id,"=");
					var record = controller.gzjlDs.getRecord(res);
					controller.gzjlDs.deleteRecord(record);
					controller.gzjlGridPanel.refresh();
				}
			}
		});
	},
	
	
	
	
	jyjlGridPanel_onAdd: function(){
		var res = new Ab.view.Restriction();
		res.addClause("sc_zf_em_jyjl.em_id",SUPERCONTROLLER.EM_ID,"=");
		res.addClause("sc_zf_em_jyjl.archive_id",SUPERCONTROLLER.ARCHIVE_ID,"=");
		
		this.jyjlFormPanel.refresh(res,true);
		this.jyjlFormPanel.showInWindow({
			title: "添加教育经历",
			width: 600,
			height: 400
		});
	},
	jyjlFormPanel_onSave: function(){
		if(this.jyjlFormPanel.canSave()){
			this.jyjlFormPanel.save();
			View.showMessage("保存成功");
			this.jyjlFormPanel.closeWindow();
			this.jyjlGridPanel.refresh();
		}
	},
	jyjlFormPanel_onReturn: function(){
		this.jyjlFormPanel.closeWindow();
	},
	
	checkJyjlDate: function(){
    	var date_begin =  this.jyjlFormPanel.getFieldValue("sc_zf_em_jyjl.date_begin");
    	var date_end =  this.jyjlFormPanel.getFieldValue("sc_zf_em_jyjl.date_end");
    	if(!valueExistsNotEmpty(date_begin)){
    		this.jyjlFormPanel.setFieldValue("sc_zf_em_jyjl.date_end","");
    		View.showMessage("请先选择开始时间");
    		return;
    	}
    	if(getFormatDate(date_begin).getTime() > getFormatDate(date_end).getTime()){
    		this.jyjlFormPanel.setFieldValue("sc_zf_em_jyjl.date_begin","");
    		this.jyjlFormPanel.setFieldValue("sc_zf_em_jyjl.date_end","");
    		View.showMessage("截至时间不能早于开始时间");
    		return;
    	}
    },
	
	jyjlGridPanel_onDelete: function(){
		var selectedRecordList = this.jyjlGridPanel.getSelectedRecords();
		if(selectedRecordList.length == 0){
			View.alert('请选择要操作的数据');
			return;
		}
		var controller = this;
		View.confirm("您确定要删除此记录?[只能删除房产处新建的数据]", function(button){
			if(button == "yes"){
				for(var i = 0; i < selectedRecordList.length; i++){
					var record = selectedRecordList[i];
					var auto_id = record.getValue('sc_zf_em_jyjl.auto_id');
					
					var res = new Ab.view.Restriction();
					res.addClause("sc_zf_em_jyjl.auto_id",auto_id,"=");
					var record = controller.jyjlDs.getRecord(res);
					controller.jyjlDs.deleteRecord(record);
					controller.jyjlGridPanel.refresh();
				}
			}
		});
	}
	
	
});



function getMaxBtArea(zhiw_name,zhic_name){
	var result = new Array();
	result['maxArea'] = 0;
	result['maxMoney'] = 0;
	zwjbArea = 0;
	zcjbArea = 0;
	
	zwjbMoney = 0;
	zcjbMoney = 0;
	
	if(valueExistsNotEmpty(zhiw_name)){
		var restriction = "sc_zw_jb.zw_jb_id = (select  zw_jb_id from sc_zw where sc_zw.zw_name='" + zhiw_name+ "')";
        var parameters = {
            tableName: 'sc_zw_jb',
            fieldNames: toJSON(['sc_zw_jb.zw_jb_id', 'sc_zw_jb.area_zf_std', 'sc_zw_jb.amount_wf_std']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
        	zwjbArea = result.data.records[0]['sc_zw_jb.area_zf_std'];
        	zwjbMoney = result.data.records[0]['sc_zw_jb.amount_wf_std'];
        	//去除长数字（自动加的逗号）
        	zwjbArea = zwjbArea.replace(/,/,'');
        	zwjbMoney = zwjbMoney.replace(/,/,'');
        }
	}
	if(valueExistsNotEmpty(zhic_name)){
		var restriction = "sc_zc_jb.zc_jb_id = (select  zc_jb_id from sc_zc where sc_zc.zc_name='" + zhic_name+ "')";
        var parameters = {
            tableName: 'sc_zc_jb',
            fieldNames: toJSON(['sc_zc_jb.zc_jb_id', 'sc_zc_jb.area_zf_std', 'sc_zc_jb.amount_wf_std']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
        	zcjbArea = result.data.records[0]['sc_zc_jb.area_zf_std'];
        	zcjbMoney = result.data.records[0]['sc_zc_jb.amount_wf_std'];
        	//去除长数字（自动加的逗号）
        	zcjbArea = zcjbArea.replace(/,/,'');
        	zcjbMoney = zcjbMoney.replace(/,/,'');
        }
	}
	if(parseFloat(zwjbArea) > parseFloat(zcjbArea)){
		result['maxArea'] = zwjbArea;
	}else{
		result['maxArea'] = zcjbArea;
	}
	if(parseFloat(zwjbMoney) > parseFloat(zcjbMoney)){
		result['maxMoney'] =  zwjbMoney;
	}else{
		result['maxMoney'] = zcjbMoney;
	}
	
	return result;
}



