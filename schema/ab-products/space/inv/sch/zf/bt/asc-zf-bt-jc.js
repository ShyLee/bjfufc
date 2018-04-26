var ascZfbtJCController = View.createController('ascZfbtJCController', {
	selectedRow: null,
	afterInitialDataFetch:function(){
		//sc_zf_em.area_jz_std 就是当前员工最新的享受补贴面积标准，sc_zf_em.area_bt_should 为重复字段
		var restriction = "sc_zf_em.area_jz_std > sc_zf_em.area_bt_has";
		this.applyList.restriction = restriction;
        this.applyList.refresh();
        $('select').outerHTML = '<select id="select" onchange="ascZfbtJCController.changeApplyList()">'
        							+ '<option value="未处理列表">未处理列表</option>'
        							+ '<option value="已处理列表">已处理列表</option></select>';
        jQuery("#jcBtForm input").each(function(){
			jQuery(this).attr("disabled","disabled");
		});
	},
	applyList_afterRefresh: function(){
		this.applyList.enableSelectAll(false);
	},
	applyList_multipleSelectionColumn_onClick: function(row){
		if(this.selectedRow != null){
			this.selectedRow.select(false);
		}
		if(row.isSelected()){
			this.selectedRow = row;
		}else{
			this.selectedRow = null;
		}
	},
	/**
	 * 根据选择框的值，自动刷新申请列表中的内容
	 * */
	changeApplyList: function(selecter){
		var	selectedName =  $('select').options[$('select').selectedIndex].value;
		
		if(selectedName == "未处理列表"){
			var restriction = "sc_zf_em.area_jz_std > sc_zf_em.area_bt_has";
			this.applyList.restriction = restriction;
	        this.applyList.refresh();
	        this.applyList.setTitle("未处理列表");
		}else if(selectedName == "已处理列表"){
			var restriction = "sc_zf_em.em_id in (select em_id from sc_zfbt_jc)" ;
			this.applyList.restriction = restriction;
	        this.applyList.refresh();
			this.applyList.setTitle("已处理列表");
		}
		this.selectedRow = null;
	},
	applyList_onDeal: function(){
		if(this.selectedRow == null){
			View.showMessage("您必须要选择一条操作记录！");
			return;
		}
		var	selectedName =  $('select').options[$('select').selectedIndex].value;
		if(selectedName == "已处理列表"){
			var em_id = this.selectedRow.getFieldValue('sc_zf_em.em_id');
			var res = new Ab.view.Restriction();
	        res.addClause("sc_zfbt_jc.em_id", em_id, "=");
//	        this.jcBtForm.refresh(res);
	        this.jcBtForm.show(false);
	        this.jcBtGrid.refresh(res);
	        this.jcBtGrid.actions.get('return').show(true);
		}else if(selectedName == "未处理列表"){
			var em_id = this.selectedRow.getFieldValue('sc_zf_em.em_id');
			var em_name = this.selectedRow.getFieldValue('sc_zf_em.xm');
			var salary_num = this.selectedRow.getFieldValue('sc_zf_em.gzbm');
			var date_work_begin = this.selectedRow.getFieldValue('sc_zf_em.date_begin_work');
			var date_gjj = this.selectedRow.getFieldValue('sc_zf_em.date_first_gjj');
			
			var btbz_x = this.selectedRow.getFieldValue('sc_zf_em.area_jz_std');
			var btbz_y = this.selectedRow.getFieldValue('sc_zf_em.area_bt_has');
			
			btbz_x = btbz_x.replace(/,/,'');
			btbz_y = btbz_y.replace(/,/,'');
			var area_jc = btbz_x-btbz_y;
			
			var res = new Ab.view.Restriction();
	        res.addClause("sc_zfbt_jc.em_id", em_id, "=");
			
	        this.jcBtForm.refresh(res,true);
	        this.jcBtGrid.refresh(res);
	        
			this.jcBtForm.setFieldValue("sc_zfbt_jc.em_name",em_name);
			this.jcBtForm.setFieldValue("sc_zfbt_jc.salary_num",salary_num);
			this.jcBtForm.setFieldValue("sc_zfbt_jc.date_work_begin",dateToString(date_work_begin));
			this.jcBtForm.setFieldValue("sc_zfbt_jc.date_gjj",dateToString(date_gjj));
			if(valueExistsNotEmpty(date_work_begin) && valueExistsNotEmpty(date_gjj)){
				this.jcBtForm.setFieldValue("sc_zfbt_jc.gl_gjj",getGjjQGl(date_work_begin,date_gjj));
			}
			this.jcBtForm.setFieldValue("sc_zfbt_jc.btbz_x",btbz_x);
			this.jcBtForm.setFieldValue("sc_zfbt_jc.btbz_y",btbz_y);
			this.jcBtForm.setFieldValue("sc_zfbt_jc.area_jc",area_jc);
			this.jcBtForm.setFieldValue("sc_zfbt_jc.date_ff",new Date());
			
			//自动带出原职务职称的补贴信息
			this.getZhiwZhicInfoY(em_id);
			
			//自动带出现职务职称的补贴信息
			this.getZhiwZhicInfoX(em_id);
			//计算补贴金额
			this.calculateBtMoney();
			
			this.jcBtForm.show(true);
			this.jcBtGrid.actions.get('return').show(false);
		}
		
		this.detailTabs.selectTab('basicInfoTab');
	},
	jcBtForm_onReturn: function(){
		this.detailTabs.selectTab('applyListTab');
	},
	jcBtGrid_onReturn: function(){
		this.detailTabs.selectTab('applyListTab');
	},
	getZhiwZhicInfoY: function(em_id){
		var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt_jc.em_id", em_id, "=");
        
        var records = this.scZfBtJcDs.getRecords(res);
        if (records.length != 0) {
        	this.jcBtForm.setFieldValue("sc_zfbt_jc.zw_y",records[0].getValue("sc_zfbt_jc.zw_x"));
        	this.jcBtForm.setFieldValue("sc_zfbt_jc.zc_y",records[0].getValue("sc_zfbt_jc.zc_x"));
    	}
	},
	getZhiwZhicInfoX: function(em_id){
		var restriction = "sc_zf_em.em_id='" + em_id + "'";
        var parameters = {
            tableName: 'sc_zf_em',
            fieldNames: toJSON(['sc_zf_em.em_id', 'sc_zf_em.zw_name','sc_zf_em.zc_name']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
            var em_id = result.data.records[0]['sc_zf_em.em_id'];
            var zhiw_name = result.data.records[0]['sc_zf_em.zw_name'];
            var zhic_name = result.data.records[0]['sc_zf_em.zc_name'];
            this.jcBtForm.setFieldValue("sc_zfbt_jc.zw_x",zhiw_name);
        	this.jcBtForm.setFieldValue("sc_zfbt_jc.zc_x",zhic_name);
        }
	},
	jcBtForm_onSave: function(){
		this.jcBtForm.save();
		this.jcBtGrid.refresh();
		
		var em_id = this.jcBtForm.getFieldValue("sc_zfbt_jc.em_id");
		var btbz_x = this.jcBtForm.getFieldValue("sc_zfbt_jc.btbz_x");
		var area_jc = this.jcBtForm.getFieldValue("sc_zfbt_jc.area_jc");
		var res = new Ab.view.Restriction();
        res.addClause("sc_zf_em.em_id", em_id, "=");
        var record = this.scZfEmDs.getRecord(res);
        
        record.setValue("sc_zf_em.area_bt_has",btbz_x);
        record.setValue("sc_zf_em.area_jc",0);
        record.setValue("sc_zf_em.date_jc",new Date());
        this.scZfEmDs.saveRecord(record);
        this.applyList.refresh();
        this.detailTabs.selectTab('applyListTab');
        this.selectedRow = null;
	},
	calculateBtMoney: function(){
		var ndjz = parseFloat(this.jcBtForm.getFieldValue("sc_zfbt_jc.ndjz"));
		var ndgl = parseFloat(this.jcBtForm.getFieldValue("sc_zfbt_jc.ndgl"));
		var gl_gjj = parseFloat(this.jcBtForm.getFieldValue("sc_zfbt_jc.gl_gjj"));
		var area_jc = parseFloat(this.jcBtForm.getFieldValue("sc_zfbt_jc.area_jc"));
		var money_bt = (ndjz + ndgl*gl_gjj)*area_jc;
		this.jcBtForm.setFieldValue("sc_zfbt_jc.money_bt",money_bt);
	},
	/**
	 * 提供修改功能
	 * */
	showEditForm: function(){
		selectedIndex = this.jcBtGrid.selectedRowIndex;
		
		var items = this.jcBtGrid.gridRows.items;
		var jc_id =  items[selectedIndex].getFieldValue("sc_zfbt_jc.id");
		var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt_jc.id", jc_id, "=");
        this.jcBtForm.refresh(res,false);
        
        this.jcBtForm.getFieldElement("sc_zfbt_jc.money_bt").disabled = false;
        
		this.jcBtForm.show(true);
	}
	
});

//获取公积金前工龄
function getGjjQGl(day1,day2){
    return day2.getFullYear() - day1.getFullYear(); 
}

function dateToString(date){
	if(valueExistsNotEmpty(date)){
		return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
	}else{
		return "";
	}
}
