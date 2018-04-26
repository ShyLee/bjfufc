
var ascZfbtPauseController = View.createController('ascZfbtPauseController', {
	selectedRow: null,
	afterInitialDataFetch:function(){
		var restriction = " (status = 'sp' and status_em != '1') or (status = 'sp' and em_type = '98') or (status = 'zt' and status_em = '1' and em_type != '98')";
		this.zfbtList.restriction = restriction;
        this.zfbtList.refresh();
		
		 $('select').outerHTML = '<select id="select" onchange="ascZfbtPauseController.changeApplyList()">'
				+ '<option value="未处理列表">未处理列表</option>'
				+ '<option value="已处理列表">已处理列表</option></select>';
	},
	
	/**
	 * 根据选择框的值，自动刷新申请列表中的内容
	 * */
	changeApplyList: function(selecter){
		var	selectedName =  $('select').options[$('select').selectedIndex].value;
		
		if(selectedName == "未处理列表"){
			var restriction = " (status = 'sp' and status_em != '1') or (status = 'sp' and em_type = '98') or (status = 'zt' and status_em = '1' and em_type != '98')";
			this.zfbtList.restriction = restriction;
	        this.zfbtList.refresh();
	        this.zfbtList.setTitle("待处理人员列表");
		}else if(selectedName == "已处理列表"){
			var restriction = "sc_zfbt.em_id in (select em_id from sc_zfbt_pause)" ;
			this.zfbtList.restriction = restriction;
	        this.zfbtList.refresh();
			this.zfbtList.setTitle("已处理人员列表");
		}
		this.selectedRow = null;
	},
	
	zfbtList_afterRefresh: function(){
		this.zfbtList.enableSelectAll(false);
		$('zfbtList_filterColumn_sc_zfbt.status_em').disabled = true;
		$('zfbtList_filterColumn_sc_zfbt.status').disabled = true;
		//1;正常;2;暂停工资;3;调离;4;已故;09;无
		// 员工状态是枚举值,反馈回来变为汉字
		var items = this.zfbtList.gridRows.items;
    	for(var i=0; i<items.length; i++){
    		var j = items[i].getFieldValue('sc_zfbt.status_em');
    		switch(j){
    		   case "1" : items[i].setFieldValue('sc_zfbt.status_em',"正常"); break;
    		   case "2" : items[i].setFieldValue('sc_zfbt.status_em',"暂停工资"); break;
    		   case "3" : items[i].setFieldValue('sc_zfbt.status_em',"调离"); break;
    		   case "4" : items[i].setFieldValue('sc_zfbt.status_em',"已故"); break;
    		   case "09" : items[i].setFieldValue('sc_zfbt.status_em',"无"); break;
    		   default : break;
    		} 
    	}
	},
	zfbtList_multipleSelectionColumn_onClick: function(row){
		if(this.selectedRow != null){
			this.selectedRow.select(false);
		}
		if(row.isSelected()){
			this.selectedRow = row;
		}else{
			this.selectedRow = null;
		}
	},
	zfbtList_onPauseOrOpen: function(){
		if(this.selectedRow == null){
			View.showMessage("您必须要选择一条操作记录！");
			return;
		}
		
		jQuery("#zfBtPauseForm input").each(function(){
			jQuery(this).attr("disabled","disabled");
		});
		
		var em_id = this.selectedRow.getFieldValue('sc_zfbt.em_id');
		var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt_pause.em_id", em_id, "=");
        this.btPauseGrid.refresh(res);
        this.detailTabs.selectTab('basicInfoTab');
        
		var	selectedName =  $('select').options[$('select').selectedIndex].value;
		if(selectedName == "已处理列表"){//只查看历史
			return;
		}
		//初始化操作panel
		var status = this.selectedRow.getFieldValue('sc_zfbt.status');
		var em_id = this.selectedRow.getFieldValue('sc_zfbt.em_id');
		var em_name = this.selectedRow.getFieldValue('sc_zfbt.em_name');
		var em_sex = this.selectedRow.getFieldValue('sc_zfbt.em_sex');
		if(em_sex == "1"){
			em_sex = "男";
		}else{
			em_sex = "女";
		}
		var archive_id = this.selectedRow.getFieldValue('sc_zfbt.archive_id');
		var sfzh = this.selectedRow.getFieldValue('sc_zfbt.sfzh');
		var money = this.selectedRow.getFieldValue('sc_zfbt.money');
		var status_em = this.selectedRow.getFieldValue('sc_zfbt.status_em');
		if(status == 'sp'){
			var res = new Ab.view.Restriction();
	        res.addClause("sc_zfbt_pause.em_id", em_id, "=");
	        res.addClause("sc_zfbt_pause.em_name", em_name, "=");
	        res.addClause("sc_zfbt_pause.em_sex", em_sex, "=");
	        res.addClause("sc_zfbt_pause.archive_id", archive_id, "=");
	        res.addClause("sc_zfbt_pause.sfzh", sfzh, "=");
	        res.addClause("sc_zfbt_pause.status_em", status_em, "=");
	        res.addClause("sc_zfbt_pause.money", money, "=");
			this.zfBtPauseForm.refresh(res,true);
			this.zfBtPauseForm.showInWindow({
				closeButton: false,
				x:200,
				y:200,
		        width: 800,
		        height: 300
		    });
			this.zfBtPauseForm.getFieldElement("sc_zfbt_pause.date_tf").disabled = false;
			this.zfBtPauseForm.setTitle("暂停补贴发放");
		}else{
			var res = new Ab.view.Restriction();
	        res.addClause("sc_zfbt_pause.em_id", em_id, "=");
	        res.addClause("sc_zfbt_pause.date_hf", '', 'IS NULL');
	        
			this.zfBtPauseForm.refresh(res,false);
			this.zfBtPauseForm.showInWindow({
				closeButton: false,
				x:200,
				y:200,
		        width: 800,
		        height: 300
		    });
			this.zfBtPauseForm.getFieldElement("sc_zfbt_pause.date_hf").disabled = false;
			this.zfBtPauseForm.getFieldElement("sc_zfbt_pause.month_bf").disabled = false;
			this.zfBtPauseForm.getFieldElement("sc_zfbt_pause.money_bf").disabled = false;
			this.zfBtPauseForm.setTitle("恢复补贴发放");
		}
	},
	btPauseGrid_onReturn: function(){
		this.detailTabs.selectTab('applyListTab');
	},
	zfBtPauseForm_onReturn: function(){
		this.zfBtPauseForm.closeWindow();
	},
	zfBtPauseForm_onConfirm: function(){
		var em_id = this.zfBtPauseForm.getFieldValue("sc_zfbt_pause.em_id");
		var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt.em_id", em_id, "=");
        var record = this.zfBtDs.getRecord(res);
        
        var title = this.zfBtPauseForm.getTitle();
        if(title == "暂停补贴发放"){
        	var date_tf = this.zfBtPauseForm.getFieldValue("sc_zfbt_pause.date_tf");
        	if(!valueExistsNotEmpty(date_tf)){
        		View.showMessage("停发日期未填写，请填写后再保存");
        		return;
        	}
        	var restriction = "sc_zfbt_ff.em_id='" + em_id + "' and last_day(sc_zfbt_ff.pay_date) >= to_date('" + date_tf + "','yyyy-mm-dd')";
            var parameters = {
                tableName: 'sc_zfbt_ff',
                fieldNames: toJSON(['sc_zfbt_ff.em_id']),
                restriction: toJSON(restriction)
            };
            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
            if (result.data.records.length > 0) {
            	View.showMessage("暂停日期必须大于已经发放补贴的月份");
            	return;
            }
        	
        	this.zfBtPauseForm.save();
        	record.setValue("sc_zfbt.status","zt");
            record.setValue("sc_zfbt.bt_date_tf",this.zfBtPauseForm.getFieldValue("sc_zfbt_pause.date_tf"));
            this.zfBtDs.saveRecord(record);
            this.zfBtPauseForm.closeWindow();
            this.zfbtList.refresh();
            
            View.showMessage("暂停操作成功!");
        }else if(title == "恢复补贴发放"){
        	var date_hf = this.zfBtPauseForm.getFieldValue("sc_zfbt_pause.date_hf");
    		var month_bf = this.zfBtPauseForm.getFieldValue("sc_zfbt_pause.month_bf");
    		var money_bf = this.zfBtPauseForm.getFieldValue("sc_zfbt_pause.money_bf");
        	if(!valueExistsNotEmpty(date_hf) || !valueExistsNotEmpty(month_bf) || !valueExistsNotEmpty(money_bf)){
        		View.showMessage("恢复时间、补发月数、补发金额未填写，请填写后保存");
        		return;
        	}
        	this.zfBtPauseForm.save();
        	record.setValue("sc_zfbt.status","sp");
            record.setValue("sc_zfbt.bt_date_tf","");
            this.zfBtDs.saveRecord(record);
            
            this.zfBtPauseForm.closeWindow();
            this.zfbtList.refresh();
            View.showMessage("恢复操作成功!");
        }
        
        this.btPauseGrid.refresh();
	},
	changeDateHf: function(){
		var date_tf = this.zfBtPauseForm.getFieldValue("sc_zfbt_pause.date_tf");
		var date_hf = this.zfBtPauseForm.getFieldValue("sc_zfbt_pause.date_hf");
		var money = this.zfBtPauseForm.getFieldValue("sc_zfbt_pause.money");
		if(!valueExistsNotEmpty(date_hf)){
			this.zfBtPauseForm.setFieldValue("sc_zfbt_pause.date_hf","");
			this.zfBtPauseForm.setFieldValue("sc_zfbt_pause.month_bf","");
			this.zfBtPauseForm.setFieldValue("sc_zfbt_pause.money_bf","");
		}else if(bDateIsBefore(date_tf,date_hf)){
			var month = getMonthBetween(date_tf,date_hf) + 1;
			
			this.zfBtPauseForm.setFieldValue("sc_zfbt_pause.month_bf",month);
			this.zfBtPauseForm.setFieldValue("sc_zfbt_pause.money_bf",month * money);
		}else{
			View.showMessage("补发日期不能早于暂停日期");
			
			this.zfBtPauseForm.setFieldValue("sc_zfbt_pause.date_hf","");
			this.zfBtPauseForm.setFieldValue("sc_zfbt_pause.month_bf","");
			this.zfBtPauseForm.setFieldValue("sc_zfbt_pause.money_bf","");
		}
	},
	changeMonth: function(){
		var month = this.zfBtPauseForm.getFieldValue("sc_zfbt_pause.month_bf");
		var money = this.zfBtPauseForm.getFieldValue("sc_zfbt_pause.money");
		this.zfBtPauseForm.setFieldValue("sc_zfbt_pause.money_bf",month * money);
	},
	showEditForm: function(){
		selectedIndex = this.btPauseGrid.selectedRowIndex;
		
		var items = this.btPauseGrid.gridRows.items;
		var pause_id =  items[selectedIndex].getFieldValue("sc_zfbt_pause.id");
		var date_hf =  items[selectedIndex].getFieldValue("sc_zfbt_pause.date_hf");
		var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt_pause.id", pause_id, "=");
        this.zfBtPauseForm.refresh(res,false);
        if(valueExistsNotEmpty(date_hf)){
        	this.zfBtPauseForm.setTitle("恢复补贴发放");
        	this.zfBtPauseForm.getFieldElement("sc_zfbt_pause.date_hf").disabled = false;
    		this.zfBtPauseForm.getFieldElement("sc_zfbt_pause.month_bf").disabled = false;
    		this.zfBtPauseForm.getFieldElement("sc_zfbt_pause.money_bf").disabled = false;
        }else{
        	this.zfBtPauseForm.setTitle("暂停补贴发放");
        	this.zfBtPauseForm.getFieldElement("sc_zfbt_pause.date_tf").disabled = false;
        }
        
		this.zfBtPauseForm.showInWindow({
			closeButton: false,
			x:200,
			y:200,
	        width: 800,
	        height: 300
	    });
		this.zfBtPauseForm.show(true);
	}
	
	
});

/**
 * 获取两日期之间的月数
 * 
 * @parameter
 * 	日期字符串["2014-1-1","2014-01-01"]
 * @retrun
 * 	两日期之间的月数 day2- day1
 * */
function getMonthBetween(day1,day2){
	var array1 = day1.split("-");
    var yyyy1 = parseInt(array1[0]);
    var mm1 = parseInt(array1[1]);
    var dd1 = parseInt(array1[2]);
    
    var array2 = day2.split("-");
    var yyyy2 = parseInt(array2[0]);
    var mm2 = parseInt(array2[1]);
    var dd2 = parseInt(array2[2]);
    
    return (yyyy2 - yyyy1) * 12 + (mm2 - mm1); 
}






