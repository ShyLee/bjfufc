


var ascZfbtLXQController = View.createController('ascZfbtLXQController', {
	selectedRow: null,
	afterInitialDataFetch:function(){
        var restriction = "sc_zf_em.em_id not in (select em_id from sc_zfbt_lxq) and sc_zf_em.em_id in (select em_id from sc_zfbt where sc_zfbt.if_lxq = '0')" ;
		this.applyList.restriction = restriction;
        this.applyList.refresh();
        
        $('select').outerHTML = '<select id="select" onchange="ascZfbtLXQController.changeApplyList()">'
        							+ '<option value="未处理列表">未处理列表</option>'
        							+ '<option value="已处理列表">已处理列表</option></select>';
        
        jQuery("#emInfoForm input").each(function(){
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
	applyList_onDeal: function(){
		if(this.selectedRow == null){
			View.showMessage("您必须要选择一条操作记录！");
			return;
		}
		var em_id = this.selectedRow.getFieldValue('sc_zf_em.em_id');
		var archive_id = this.selectedRow.getFieldValue('sc_zf_em.archive_id');
		var	selectedName =  $('select').options[$('select').selectedIndex].value;
		
		if(selectedName == "未处理列表"){
			this.initApplyInfo(em_id,archive_id);
		}else if(selectedName == "已处理列表"){
			var res = new Ab.view.Restriction();
	        res.addClause("sc_zfbt_lxq.em_id", em_id, "=");
	        this.emInfoForm.refresh(res,false);
	        this.emInfoForm.getFieldElement("sc_zfbt_lxq.gl_h").disabled = false;
	        this.emInfoForm.getFieldElement("sc_zfbt_lxq.zw_h").disabled = false;
	        this.emInfoForm.getFieldElement("sc_zfbt_lxq.zc_h").disabled = false;
	        this.emInfoForm.getFieldElement("sc_zfbt_lxq.btbz_h").disabled = false;
		}
		var res2 = new Ab.view.Restriction();
        res2.addClause("sc_zf_em_gzjl.em_id", em_id, "=");
        this.gzjlGridPanel.refresh(res2);
        var res3 = new Ab.view.Restriction();
        res3.addClause("sc_zf_em_jyjl.em_id", em_id, "=");
        this.jyjlGridPanel.refresh(res3);
		
	    this.detailTabs.selectTab('applyInfoTab');
	},
	emInfoForm_onReturn: function(){
		this.detailTabs.selectTab('applyListTab');
	},
	/**
	 * 根据选择框的值，自动刷新申请列表中的内容
	 * */
	changeApplyList: function(selecter){
		var	selectedName =  $('select').options[$('select').selectedIndex].value;
		
		if(selectedName == "未处理列表"){
			var restriction = "sc_zf_em.em_id not in (select em_id from sc_zfbt_lxq) and sc_zf_em.em_id in (select em_id from sc_zfbt where sc_zfbt.if_lxq = '0')" ;
			this.applyList.restriction = restriction;
	        this.applyList.refresh();
	        this.applyList.setTitle("来校前补贴未处理列表");
		}else if(selectedName == "已处理列表"){
			var restriction = "sc_zf_em.em_id in (select em_id from sc_zfbt_lxq)" ;
			this.applyList.restriction = restriction;
	        this.applyList.refresh();
			this.applyList.setTitle("来校前补贴已处理列表");
		}
		this.selectedRow = null;
	},
	initApplyInfo: function(em_id,archive_id){
		var res = new Ab.view.Restriction();
        res.addClause("sc_zf_em.em_id", em_id, "=");
		var emRecord = this.scZfEmDs.getRecord(res);
		if(valueExistsNotEmpty(emRecord)){
			this.emInfoForm.refresh({},true);
			this.emInfoForm.setFieldValue("sc_zfbt_lxq.em_id",emRecord.getValue("sc_zf_em.em_id"));
			this.emInfoForm.setFieldValue("sc_zfbt_lxq.em_name",emRecord.getValue("sc_zf_em.xm"));
			this.emInfoForm.setFieldValue("sc_zfbt_lxq.salary_num",emRecord.getValue("sc_zf_em.gzbm"));
			
			if(valueExistsNotEmpty(emRecord.getValue("sc_zf_em.date_begin_work"))){
				this.emInfoForm.setFieldValue("sc_zfbt_lxq.date_begin_work",dateToString(emRecord.getValue("sc_zf_em.date_begin_work")));
			}
			if(valueExistsNotEmpty(emRecord.getValue("sc_zf_em.date_come_sch"))){
				this.emInfoForm.setFieldValue("sc_zfbt_lxq.date_come_sch",dateToString(emRecord.getValue("sc_zf_em.date_come_sch")));
			}
			if(valueExistsNotEmpty(emRecord.getValue("sc_zf_em.date_first_gjj"))){
				this.emInfoForm.setFieldValue("sc_zfbt_lxq.date_first_gjj",dateToString(emRecord.getValue("sc_zf_em.date_first_gjj")));
			}
			if(valueExistsNotEmpty(emRecord.getValue("sc_zf_em.zw_get_date"))){
				this.emInfoForm.setFieldValue("sc_zfbt_lxq.zw_date",dateToString(emRecord.getValue("sc_zf_em.zc_get_date")));
			}
			if(valueExistsNotEmpty(emRecord.getValue("sc_zf_em.zc_get_date"))){
				this.emInfoForm.setFieldValue("sc_zfbt_lxq.zc_date",dateToString(emRecord.getValue("sc_zf_em.zc_get_date")));
			}
			this.emInfoForm.setFieldValue("sc_zfbt_lxq.sfzh",emRecord.getValue("sc_zf_em.sfzh"));
			
			var restriction = "sc_zf_em.em_id='" + em_id + "'";
	        var parameters = {
	            tableName: 'sc_zf_em',
	            fieldNames: toJSON(['sc_zf_em.em_id', 'sc_zf_em.zw_name','sc_zf_em.zc_name']),
	            restriction: toJSON(restriction)
	        };
	        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	        if (result.data.records.length > 0) {
	            this.emInfoForm.setFieldValue("sc_zfbt_lxq.zw_name",result.data.records[0]['sc_zf_em.zw_name']);
				this.emInfoForm.setFieldValue("sc_zfbt_lxq.zc_name",result.data.records[0]['sc_zf_em.zc_name']);
	        }
			
	    	var restriction = "sc_zf_em_po.archive_id='" + archive_id + "'";
	        var parameters = {
	            tableName: 'sc_zf_em_po',
	            fieldNames: toJSON(['sc_zf_em_po.archive_id', 'sc_zf_em_po.xm','sc_zf_em_po.sfzh']),
	            restriction: toJSON(restriction)
	        };
	        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	        if (result.data.records.length > 0) {
	            this.emInfoForm.setFieldValue("sc_zfbt_lxq.po_name",result.data.records[0]['sc_zf_em_po.xm']);
				this.emInfoForm.setFieldValue("sc_zfbt_lxq.po_sfzh",result.data.records[0]['sc_zf_em_po.sfzh']);
	        }
			
	        this.emInfoForm.getFieldElement("sc_zfbt_lxq.gl_h").disabled = false;
	        this.emInfoForm.getFieldElement("sc_zfbt_lxq.zw_h").disabled = false;
	        this.emInfoForm.getFieldElement("sc_zfbt_lxq.zc_h").disabled = false;
	        this.emInfoForm.getFieldElement("sc_zfbt_lxq.btbz_h").disabled = false;
		}
	},
	emInfoForm_onNext: function(){
		this.detailTabs.em_id = this.emInfoForm.getFieldValue("sc_zfbt_lxq.em_id");
		this.emInfoForm.save();
		this.detailTabs.findTab('ffTab').loadView();
		this.detailTabs.selectTab('ffTab');
		
		var	selectedName =  $('select').options[$('select').selectedIndex].value;
		if(selectedName == "未处理列表"){
			var restriction = "sc_zf_em.em_id in (select em_id from sc_zfbt_lxq)" ;
			this.applyList.restriction = restriction;
	        this.applyList.refresh();
			this.applyList.setTitle("来校前补贴已处理列表");
			$('select').selectedIndex = 1;
		}
	},
	gzjlGridPanel_onCheck: function(){
		var em_id = this.selectedRow.getFieldValue('sc_zf_em.em_id');
		var archive_id = this.selectedRow.getFieldValue('sc_zf_em.archive_id');
		
		View.openDialog('asc-zf-bt-lxq-zwzc-dialog.axvw', null, true, {
	        width: 800,
	        height: 500,
	        em_id: em_id,
	        archive_id: archive_id,
	        closeButton: true
	    });
	}
	
});


function dateToString(date){
	return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
}

/**
 * 当职务职称发生变化后，根据级别自动带出最大值存入字段【98年补贴标准】中
 * 
 * */
function autoGetBtMoney(fieldName, selectedValue, previousValue){
	if (fieldName == "sc_zfbt_lxq.zw_h") {
		var zw_h = selectedValue;
		var zc_h = ascZfbtLXQController.emInfoForm.getFieldValue("sc_zfbt_lxq.zc_h");
	}
	if (fieldName == "sc_zfbt_lxq.zc_h") {
		var zw_h = ascZfbtLXQController.emInfoForm.getFieldValue("sc_zfbt_lxq.zw_h");
		var zc_h = selectedValue;
	}
	var money = getMaxBtMoney(zw_h,zc_h);
	ascZfbtLXQController.emInfoForm.setFieldValue("sc_zfbt_lxq.btbz_h",money);
}


function getMaxBtMoney(zw_h,zc_h){
	zwjbMoney = 0;
	zcjbMoney = 0;
	
	if(valueExistsNotEmpty(zw_h)){
		var restriction = "sc_zw_jb.zw_jb_id = (select  zw_jb_id from sc_zw where sc_zw.zw_name='" + zw_h+ "')";
        var parameters = {
            tableName: 'sc_zw_jb',
            fieldNames: toJSON(['sc_zw_jb.area_zf_std','sc_zw_jb.amount_wf_std']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
        	zwjbMoney = result.data.records[0]['sc_zw_jb.amount_wf_std'].replace(/,/,'');
        }
	}
	if(valueExistsNotEmpty(zc_h)){
		var restriction = "sc_zc_jb.zc_jb_id = (select  zc_jb_id from sc_zc where sc_zc.zc_name='" + zc_h+ "')";
        var parameters = {
            tableName: 'sc_zc_jb',
            fieldNames: toJSON(['sc_zc_jb.area_zf_std','sc_zc_jb.amount_wf_std']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
        	zcjbMoney = result.data.records[0]['sc_zc_jb.amount_wf_std'].replace(/,/,'');
        }
	}
	if(parseFloat(zwjbMoney) > parseFloat(zcjbMoney)){
		return zwjbMoney;
	}else{
		return zcjbMoney;
	}
}

