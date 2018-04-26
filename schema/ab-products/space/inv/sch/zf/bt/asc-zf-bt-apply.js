
var ascZfbtApplyController = View.createController('ascZfbtApplyController', {
	
	afterInitialDataFetch:function(){
		var result = this.checkApply(View.user.name);
		if(result == null){
			
			return;
		}else{
			this.initApplyInfo(result);
			
			this.applyForm.show(true);
			this.emInfoForm.show(true);
			this.poInfoForm.show(true);
			this.rmList.show(true);
		}
	},
	//判断申请资格,如果有申请资格返回 record信息，如果无 返回null
	checkApply: function(em_id){
		//每人只能申请一次住房补贴
		var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt.em_id", em_id, "=");
        var records = this.zfBtDs.getRecords(res);
        if(records.length > 0){
        	View.showMessage("您已申请过住房补贴，不能重复申请");
        	return null;
        }
		
		var res = new Ab.view.Restriction();
        res.addClause("sc_zf_em.em_id", em_id, "=");
        var records = this.scZfEmDs.getRecords(res);
        var record = records[0];
        
        if(!valueExistsNotEmpty(record)){
        	View.showMessage("不存在与账户相关的人员档案信息，不能进行住房补贴申请");
        	return null;
        }else{
        	var archive_id = record.getValue("sc_zf_em.archive_id");
        	
        	var restriction = "sc_zf_em.archive_id in (select archive_id from SC_ZFBT_PER_FLINFO where  SC_ZFBT_PER_FLINFO.archive_id='" + archive_id + "' and SC_ZFBT_PER_FLINFO.fl_num > 0)";
            var parameters = {
                tableName: 'sc_zf_em',
                fieldNames: toJSON(['sc_zf_em.archive_id']),
                restriction: toJSON(restriction)
            };
            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        	
            if (result.data.records.length > 0){
            	View.showMessage("您为有房户，不能申请无房按月补贴");
            	return null;
            }else{
            	return record;
            }
        }
	},
	//初始化申请人及配偶信息
	initApplyInfo: function(record){
		this.applyForm.setFieldValue("sc_zfbt.date_apply",new Date());
		
		this.emInfoForm.setFieldValue("sc_zfbt.em_name",record.getValue("sc_zf_em.xm"));
		this.emInfoForm.setFieldValue("sc_zfbt.em_sex",record.getValue("sc_zf_em.xb"));
		this.emInfoForm.setFieldValue("sc_zfbt.em_id",record.getValue("sc_zf_em.em_id"));
		this.emInfoForm.setFieldValue("sc_zfbt.salary_num",record.getValue("sc_zf_em.gzbm"));
		this.emInfoForm.setFieldValue("sc_zfbt.mobile",record.getValue("sc_zf_em.mphone"));
		if(valueExistsNotEmpty(record.getValue("sc_zf_em.date_first_gjj"))){
			this.emInfoForm.setFieldValue("sc_zfbt.date_gjj",dateToString(record.getValue("sc_zf_em.date_first_gjj")));
		}
		if(valueExistsNotEmpty(record.getValue("sc_zf_em.date_begin_work"))){
			this.emInfoForm.setFieldValue("sc_zfbt.date_work_begin",dateToString(record.getValue("sc_zf_em.date_begin_work")));
		}
		if(valueExistsNotEmpty(record.getValue("sc_zf_em.date_come_sch"))){
			this.emInfoForm.setFieldValue("sc_zfbt.date_come_school",dateToString(record.getValue("sc_zf_em.date_come_sch")));
		}
		if(valueExistsNotEmpty(record.getValue("sc_zf_em.date_retired"))){
			this.emInfoForm.setFieldValue("sc_zfbt.date_retire",dateToString(record.getValue("sc_zf_em.date_retired")));
		}
		
        this.emInfoForm.setFieldValue("sc_zfbt.zhiw_name",record.getValue("sc_zf_em.zw_name"));
		this.emInfoForm.setFieldValue("sc_zfbt.zhic_name",record.getValue("sc_zf_em.zc_name"));
		
		var res = new Ab.view.Restriction();
        res.addClause("sc_zf_em_po.archive_id", record.getValue("sc_zf_em.archive_id"), "=");
        var records = this.scZfEmPoDs.getRecords(res);
        var record2 = records[0];
		if(valueExistsNotEmpty(record2)){
			this.poInfoForm.setFieldValue("sc_zfbt.po_name",record2.getValue("sc_zf_em_po.xm"));
			this.poInfoForm.setFieldValue("sc_zfbt.po_dv_name",record2.getValue("sc_zf_em_po.dv_name"));
		}
		
		var res2 = new Ab.view.Restriction();
        res2.addClause("sc_zf_cq.archive_id", record.getValue("sc_zf_em.archive_id"), "=");
        this.rmList.refresh(res2);
	},
	applyForm_onApply: function(){
		var controller = this;
		View.confirm("您确定要申请住房补贴吗?", function(button){
            if (button == 'yes') {
            	controller.saveApplyInfo();
            	View.showMessage("申请成功");
            	
            	controller.applyForm.show(false);
            	controller.emInfoForm.show(false);
            	controller.poInfoForm.show(false);
            	controller.rmList.show(false);
            }
        });
	},
	saveApplyInfo: function(){
		this.emInfoForm.setFieldValue("sc_zfbt.date_apply",this.applyForm.getFieldValue("sc_zfbt.date_apply"));
		this.emInfoForm.setFieldValue("sc_zfbt.date_approve",this.applyForm.getFieldValue("sc_zfbt.date_approve"));
		this.emInfoForm.setFieldValue("sc_zfbt.date_pay_begin",this.applyForm.getFieldValue("sc_zfbt.date_pay_begin"));
		
		this.emInfoForm.setFieldValue("sc_zfbt.po_name",this.poInfoForm.getFieldValue("sc_zfbt.po_name"));
		this.emInfoForm.setFieldValue("sc_zfbt.po_dv_name",this.poInfoForm.getFieldValue("sc_zfbt.po_dv_name"));
		this.emInfoForm.setFieldValue("sc_zfbt.po_residence",this.poInfoForm.getFieldValue("sc_zfbt.po_residence"));
		
		this.emInfoForm.save();
	}
	
});

function dateToString(date){
	return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
}







