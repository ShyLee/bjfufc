
var ascZfbtApplyController = View.createController('ascZfbtApplyController', {
	selectedRow: null,
	wfrId: 'AbSpaceRoomInventoryBAR-iReportHandler-PmreReport',
    xmlName: "",
    parameters:{},
	
	afterInitialDataFetch:function(){
		var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt.status", 'sq', "=");
        
        this.applyList.refresh(res);
        
        $('select1').outerHTML = '<select id="select1" onchange="ascZfbtApplyController.changeApplyList(1)">'
        							+ '<option value="未审批列表">未审批列表</option>'
        							+ '<option value="已审批列表">已审批列表</option>'
        							+ '<option value="未申请列表">未申请列表</option></select>';
        $('select2').outerHTML = '<select id="select2" onchange="ascZfbtApplyController.changeApplyList(2)">'
			+ '<option value="未审批列表">未审批列表</option>'
			+ '<option value="已审批列表">已审批列表</option>'
			+ '<option value="未申请列表">未申请列表</option></select>';
        
        this.applyForm.getFieldElement("sc_zfbt.date_apply").disabled = true;
        this.applyForm.getFieldElement("sc_zfbt.money").disabled = true;
        
        jQuery("#emInfoForm input").each(function(){
			jQuery(this).attr("disabled","disabled");
		});
        
        jQuery("#poInfoForm input").each(function(){
			jQuery(this).attr("disabled","disabled");
		});
	},
	applyList_afterRefresh: function(){
		this.applyList.enableSelectAll(false);
	},
	noApplyList_afterRefresh: function(){
		this.noApplyList.enableSelectAll(false);
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
	
	noApplyList_multipleSelectionColumn_onClick: function(row){
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
	 * 添加默认值
	 * */
	applyForm_afterRefresh: function(){
		this.applyForm.setFieldValue("sc_zfbt.approve_advice","同意");
	},
	
	applyList_onApprove: function(){
		if(this.selectedRow == null){
			View.showMessage("您必须要选择一条申请记录！");
			return;
		}
		
		this.applyForm.getFieldElement("sc_zfbt.date_apply").disabled = true;
		this.emInfoForm.getFieldElement("sc_zfbt.mobile").disabled = true;
		this.emInfoForm.getFieldElement("sc_zfbt.other_info").disabled = true;
		this.emInfoForm.getFieldElement("sc_zfbt.date_gljd_begin").disabled = true;
		this.emInfoForm.getFieldElement("sc_zfbt.date_gljd_end").disabled = true;
		this.emInfoForm.getFieldElement("sc_zfbt.em_residence").disabled = true;
		this.emInfoForm.getFieldElement("sc_zfbt.if_lxq").disabled = true;
		this.emInfoForm.getFieldElement("sc_zfbt.money_lxq").disabled = true;
		this.poInfoForm.getFieldElement("sc_zfbt.po_residence").disabled = true;
		
		var id = this.selectedRow.getFieldValue('sc_zfbt.id');
		var em_id = this.selectedRow.getFieldValue('sc_zfbt.em_id');
		
		this.initApplyInfo(id,em_id);
		this.setBtMoney(em_id);
		
	    this.detailTabs.selectTab('applyInfoTab');
	    this.applyForm.actions.get('save').show(false);
		this.applyForm.actions.get('approve').show(true);
		
	    var date = new Date();
		ascZfbtApplyController.applyForm.setFieldValue("sc_zfbt.date_approve",date);
		
		var date_come_school = this.emInfoForm.getFieldValue("sc_zfbt.date_come_school");
		var array = date_come_school.split("-");
		ascZfbtApplyController.applyForm.setFieldValue("sc_zfbt.date_pay_begin",array[0] + array[1]);
	},
	/**
	 * 根据选择框的值，自动刷新申请列表中的内容
	 * */
	changeApplyList: function(selecter){
		var selectedName = "";
		if(selecter == 1){
			selectedName =  $('select1').options[$('select1').selectedIndex].value;
		}else if(selecter == 2){
			selectedName =  $('select2').options[$('select2').selectedIndex].value;
		}
		
		if(selectedName == "未审批列表"){
			this.noApplyList.show(false);
			
			var res = new Ab.view.Restriction();
	        res.addClause("sc_zfbt.status", 'sq', "=");
	        this.applyList.refresh(res);
	        this.applyList.show(true);
	        this.applyList.setTitle("住房补贴申请列表");
	        
	        $('select1').selectedIndex = 0;
		}else if(selectedName == "已审批列表"){
			this.noApplyList.show(false);
			
			var res = new Ab.view.Restriction();
	        res.addClause("sc_zfbt.status", 'sp', "=");
	        this.applyList.refresh(res);
	        this.applyList.show(true);
	        this.applyList.setTitle("住房补贴已审批列表");
	        
	        $('select1').selectedIndex = 1;
		}else if(selectedName == "未申请列表"){
			this.applyList.show(false);
			this.noApplyList.refresh();
			this.noApplyList.show(true);
			this.noApplyList.setTitle("住房补贴未申请列表");
			
			$('select2').selectedIndex = 2;
		}
		
		this.selectedRow = null;
	},
	
	initApplyInfo: function(id,em_id){
		var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt.id", id, "=");
        
        this.applyForm.refresh(res,false);
		this.emInfoForm.refresh(res,false);
		this.poInfoForm.refresh(res,false);
        
		var restriction = "sc_zf_em.em_id='" + em_id + "'";
        var parameters = {
            tableName: 'sc_zf_em',
            fieldNames: toJSON(['sc_zf_em.em_id', 'sc_zf_em.archive_id']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
            var archive_id = result.data.records[0]['sc_zf_em.archive_id'];
            
            var res2 = new Ab.view.Restriction();
            res2.addClause("sc_zf_cq.archive_id", archive_id, "=");
            this.rmList.refresh(res2);
        }
	},
	//根据员工号获取补贴
	
	setBtMoney: function(em_id){
		if(typeof(BuTieService)!="undefined"){
			//根据现职务职称所享受金额的最大金额按月发放
			BuTieService.getBuTieByZj(em_id,{
				   callback:function(data){
					if(data!=''){
						var obj=data.evalJSON();
						ascZfbtApplyController.applyForm.setFieldValue("sc_zfbt.money",obj['amount']);
					}
				   }
			});
		}
	},
	applyForm_onReturn: function(){
		this.detailTabs.selectTab('applyListTab');
//		this.selectedRow = null;
	},
	applyForm_onApprove: function(){
		var controller = this;
		View.confirm("您确定审批通过了吗?", function(button){
            if (button == 'yes') {
            	controller.applyForm.setFieldValue("sc_zfbt.status",'sp');
            	controller.applyForm.save();
            	View.showMessage("审批通过");
            	
            	var selectedName =  $('select1').options[$('select1').selectedIndex].value
        		if(selectedName == "已审批列表"){//此时列表显示的是已审批的内容
        			
        		}else if(selectedName == "未审批列表"){//此时列表显示的是未审批的内容
        			var res = new Ab.view.Restriction();
        	        res.addClause("sc_zfbt.status", 'sq', "=");
        	        
        	        controller.applyList.refresh(res);
        	        controller.selectedRow = null;
        		}
        		controller.detailTabs.selectTab('applyListTab');
            }
        });
	},
	noApplyList_onAdd: function(){
		if(this.selectedRow == null){
			View.showMessage("您必须要选择一条申请记录！");
			return;
		}
		
		this.detailTabs.selectTab('applyInfoTab');
		this.initAddInfo(this.selectedRow);
		
		this.applyForm.actions.get('save').show(true);
		this.applyForm.actions.get('approve').show(false);
	},
	/**
	 * 管理员新增时，初始化信息
	 * 
	 * 
	 * */
	initAddInfo: function(selectedRow){
		this.applyForm.refresh({},true);
		this.emInfoForm.refresh({},true);
		this.poInfoForm.refresh({},true);
		
		//显示可填写字段
		this.applyForm.getFieldElement("sc_zfbt.date_apply").disabled = false;
		this.emInfoForm.getFieldElement("sc_zfbt.mobile").disabled = false;
		this.emInfoForm.getFieldElement("sc_zfbt.other_info").disabled = false;
		this.emInfoForm.getFieldElement("sc_zfbt.date_gljd_begin").disabled = false;
		this.emInfoForm.getFieldElement("sc_zfbt.date_gljd_end").disabled = false;
		this.emInfoForm.getFieldElement("sc_zfbt.em_residence").disabled = false;
		this.emInfoForm.getFieldElement("sc_zfbt.money_bf").disabled = false;
		this.emInfoForm.getFieldElement("sc_zfbt.if_lxq").disabled = false;
		this.emInfoForm.getFieldElement("sc_zfbt.money_lxq").disabled = false;
		this.poInfoForm.getFieldElement("sc_zfbt.po_residence").disabled = false;
		
		//初始化员工个人信息
		this.emInfoForm.setFieldValue("sc_zfbt.em_id",selectedRow.getFieldValue('sc_zf_em.em_id'));
		this.emInfoForm.setFieldValue("sc_zfbt.em_name",selectedRow.getFieldValue('sc_zf_em.xm'));
		this.emInfoForm.setFieldValue("sc_zfbt.em_sex",selectedRow.getFieldValue('sc_zf_em.xb'));
		this.emInfoForm.setFieldValue("sc_zfbt.em_id",selectedRow.getFieldValue('sc_zf_em.em_id'));
		this.emInfoForm.setFieldValue("sc_zfbt.salary_num",selectedRow.getFieldValue('sc_zf_em.gzbm'));
		this.emInfoForm.setFieldValue("sc_zfbt.zhiw_name",selectedRow.getFieldValue('sc_zf_em.zw_name'));
		this.emInfoForm.setFieldValue("sc_zfbt.zhic_name",selectedRow.getFieldValue('sc_zf_em.zc_name'));
		this.emInfoForm.setFieldValue("sc_zfbt.mobile",selectedRow.getFieldValue('sc_zf_em.mphone'));
		if(valueExistsNotEmpty(selectedRow.getFieldValue("sc_zf_em.date_first_gjj"))){
			this.emInfoForm.setFieldValue("sc_zfbt.date_gjj",dateToString(selectedRow.getFieldValue("sc_zf_em.date_first_gjj")));
		}
		if(valueExistsNotEmpty(selectedRow.getFieldValue("sc_zf_em.date_begin_work"))){
			this.emInfoForm.setFieldValue("sc_zfbt.date_work_begin",dateToString(selectedRow.getFieldValue("sc_zf_em.date_begin_work")));
		}
		if(valueExistsNotEmpty(selectedRow.getFieldValue("sc_zf_em.date_come_sch"))){
			this.emInfoForm.setFieldValue("sc_zfbt.date_come_school",dateToString(selectedRow.getFieldValue("sc_zf_em.date_come_sch")));
		}
		if(valueExistsNotEmpty(selectedRow.getFieldValue("sc_zf_em.date_retired"))){
			this.emInfoForm.setFieldValue("sc_zfbt.date_retire",dateToString(selectedRow.getFieldValue("sc_zf_em.date_retired")));
		}
		
		//初始化配偶信息
		var archive_id = selectedRow.getFieldValue('sc_zf_em.archive_id');
		var restriction = "sc_zf_em_po.archive_id='" + archive_id + "' and sc_zf_em_po.status = '1'";
        var parameters = {
            tableName: 'sc_zf_em_po',
            fieldNames: toJSON(['sc_zf_em_po.xm', 'sc_zf_em_po.dv_name']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
            this.poInfoForm.setFieldValue("sc_zfbt.po_name",result.data.records[0]['sc_zf_em_po.xm']);
    		this.poInfoForm.setFieldValue("sc_zfbt.po_dv_name",result.data.records[0]['sc_zf_em_po.dv_name']);
        }
		
        //初始化审批信息
        var date = new Date();
        this.applyForm.setFieldValue("sc_zfbt.date_apply",date);
		this.applyForm.setFieldValue("sc_zfbt.date_approve",date);
		
		var date_come_school = this.emInfoForm.getFieldValue("sc_zfbt.date_come_school");
		var array = date_come_school.split("-");
		this.applyForm.setFieldValue("sc_zfbt.date_pay_begin",array[0] + array[1]);
		
		//初始化发放金额
		var em_id = selectedRow.getFieldValue('sc_zf_em.em_id');
		this.setBtMoney(em_id);
		
		//刷新产权房信息
		var res2 = new Ab.view.Restriction();
        res2.addClause("sc_zf_cq.archive_id", archive_id, "=");
        this.rmList.refresh(res2);
	},
	applyForm_onSave: function(){
		
		var controller = this;
		View.confirm("您确定要保存吗?", function(button){
            if (button == 'yes') {
            	var rec = new Ab.data.Record();
        		rec.isNew = true;
        		rec.setValue("sc_zfbt.date_apply",controller.applyForm.getFieldValue("sc_zfbt.date_apply"));
        		rec.setValue("sc_zfbt.approve_advice",controller.applyForm.getFieldValue("sc_zfbt.approve_advice"));
        		rec.setValue("sc_zfbt.date_approve",controller.applyForm.getFieldValue("sc_zfbt.date_approve"));
        		rec.setValue("sc_zfbt.date_pay_begin",controller.applyForm.getFieldValue("sc_zfbt.date_pay_begin"));
        		rec.setValue("sc_zfbt.money",controller.applyForm.getFieldValue("sc_zfbt.money"));
        		rec.setValue("sc_zfbt.status","sp");
        		rec.setValue("sc_zfbt.money_bf",controller.emInfoForm.getFieldValue("sc_zfbt.money_bf"));
        		rec.setValue("sc_zfbt.em_id",controller.emInfoForm.getFieldValue("sc_zfbt.em_id"));
        		rec.setValue("sc_zfbt.em_name",controller.emInfoForm.getFieldValue("sc_zfbt.em_name"));
        		rec.setValue("sc_zfbt.em_sex",controller.emInfoForm.getFieldValue("sc_zfbt.em_sex"));
        		rec.setValue("sc_zfbt.salary_num",controller.emInfoForm.getFieldValue("sc_zfbt.salary_num"));
        		rec.setValue("sc_zfbt.zhiw_name",controller.emInfoForm.getFieldValue("sc_zfbt.zhiw_name"));
        		rec.setValue("sc_zfbt.zhic_name",controller.emInfoForm.getFieldValue("sc_zfbt.zhic_name"));
        		rec.setValue("sc_zfbt.mobile",controller.emInfoForm.getFieldValue("sc_zfbt.mobile"));
        		rec.setValue("sc_zfbt.date_gjj",controller.emInfoForm.getFieldValue("sc_zfbt.date_gjj"));
        		rec.setValue("sc_zfbt.date_work_begin",controller.emInfoForm.getFieldValue("sc_zfbt.date_work_begin"));
        		rec.setValue("sc_zfbt.date_come_school",controller.emInfoForm.getFieldValue("sc_zfbt.date_come_school"));
        		rec.setValue("sc_zfbt.date_retire",controller.emInfoForm.getFieldValue("sc_zfbt.date_retire"));
        		rec.setValue("sc_zfbt.other_info",controller.emInfoForm.getFieldValue("sc_zfbt.other_info"));
        		rec.setValue("sc_zfbt.date_gljd_begin",controller.emInfoForm.getFieldValue("sc_zfbt.date_gljd_begin"));
        		rec.setValue("sc_zfbt.date_gljd_end",controller.emInfoForm.getFieldValue("sc_zfbt.date_gljd_end"));
        		rec.setValue("sc_zfbt.em_residence",controller.emInfoForm.getFieldValue("sc_zfbt.em_residence"));
        		rec.setValue("sc_zfbt.if_lxq",controller.emInfoForm.getFieldValue("sc_zfbt.if_lxq"));
        		rec.setValue("sc_zfbt.money_lxq",controller.emInfoForm.getFieldValue("sc_zfbt.money_lxq"));
        		rec.setValue("sc_zfbt.po_name",controller.poInfoForm.getFieldValue("sc_zfbt.po_name"));
        		rec.setValue("sc_zfbt.po_dv_name",controller.poInfoForm.getFieldValue("sc_zfbt.po_dv_name"));
        		rec.setValue("sc_zfbt.po_residence",controller.poInfoForm.getFieldValue("sc_zfbt.po_residence"));
        		
        		controller.zfBtDs.saveRecord(rec);
            	View.showMessage("保存成功");
            	
            	controller.noApplyList.refresh();
            	controller.selectedRow = null;
        		controller.detailTabs.selectTab('applyListTab');
            }
        });
	},
	applyForm_onReport: function(){
		var id = this.emInfoForm.getFieldValue("sc_zfbt.id");
		if(!valueExistsNotEmpty(id)){
			View.showMessage("您还未提交补贴申请，请保存后再打印！");
			return;
		}
		
		var em_id = this.emInfoForm.getFieldValue("sc_zfbt.em_id");
		xmlName= "sc_zfbt_apply";
        parameters= {
          'Pem_id': em_id,
          subReports:'sc_zfbt_apply_sub1'
        };
		try {
            var result = Workflow.callMethod(this.wfrId, xmlName, 0, parameters);
            if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
                result.data = eval('(' + result.jsonExpression + ')');
                this.jobId = result.data.jobId;
                var url = 'ab-ireport-example.axvw?jobId=' + this.jobId;
                window.open(url);
            }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
//    	View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
//            width: 470,
//            height: 200,
//            xmlName: "sc_zfbt_apply",
//            parameters: {
//            	'Pem_id': em_id,
//            	subReports:'sc_zfbt_apply_sub1'
//            },
//            closeButton: false
//        });
	}
	
});

//获取年月
function getYMFormDate(date){
	var yyyy = date.getFullYear();
	var mm = date.getMonth() + 1;
	if(mm < 10){
		mm = '0' + mm;
	}
	
	return '' + yyyy + mm;
}

function dateToString(date){
	return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
}




