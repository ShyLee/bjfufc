
jQuery().ready(function() {
		 //给页面上 <field >设置了 cssClass 的字段 注册事件
		 jQuery("#changeForm input[class*='inputValueChg']").on("change",function(e){
			   var eventSrc=e.target.id;
			   
			   if(jQuery(this).val().trim()==''){
				   
				   switch(eventSrc)
				   {
				   case 'changeForm_sc_zf_cq.zf_type_name':
					   jQuery("#changeForm_sc_zf_cq\\.zf_type_id").val('');
					   break;
				   case 'changeForm_sc_zf_cq.c_xm':
					   jQuery("#changeForm_sc_zf_cq\\.c_em_id").val('');
					   jQuery("#changeForm_sc_zf_cq\\.c_archive_id").val('');
					   jQuery("#changeForm_sc_zf_cq\\.c_sfzh").val('');
					   break; 
					   
				   case 'changeForm_sc_zf_cq.c_sfzh':
					   jQuery("#changeForm_sc_zf_cq\\.c_em_id").val('');
					   jQuery("#changeForm_sc_zf_cq\\.c_archive_id").val('');
					   jQuery("#changeForm_sc_zf_cq\\.c_xm").val('');
					   break; 
					   
				   default:
				    
				   }
			   }
		 });
});


var defZFFcInfoChangeController = View.createController('defZFFcInfoChangeController', {
	AUTO_ID: null,
	PARENT_CONTROLLER: null,
	IS_ADMIN_ACCOUNT: null,//是否管理员账户
	
	afterInitialDataFetch:function(){
		if (this.view.parameters){
        	this.AUTO_ID = this.view.parameters['autoId'];
        	this.PARENT_CONTROLLER = this.view.parameters['controller'];
        	this.IS_ADMIN_ACCOUNT = this.view.parameters['IS_ADMIN_ACCOUNT'];
        }
		
		var res = new Ab.view.Restriction();
        res.addClause("sc_zf_cq.auto_id", this.AUTO_ID, "=");
        this.changeForm.refresh(res,false);
	},
	changeForm_onReturn: function(){
		View.closeThisDialog();
	},
	changeForm_onChange: function(){
		//1;腾退可售房;2;腾退不可售房;3;上市出售;4;继承;5;拆迁;6;其他
//		var c_deal = this.changeForm.getFieldValue("sc_zf_cq.c_deal");
		
		if(!this.changeForm.canSave()){
			return;
		}
		var c_xm = this.changeForm.getFieldValue("sc_zf_cq.c_xm");
		var controller = this;
		var message = "您确定要把房产转到[" + c_xm + "]名下?";
		View.confirm(message, function(button){
			if(button == "yes"){
				controller.changeForm.save();
				controller.saveHcqf();
				var archive_id = controller.changeForm.getFieldValue("sc_zf_cq.c_archive_id");
				//如果存在档案编号,我们可以认为是卖给本校教职工
				if(valueExistsNotEmpty(archive_id)){
					controller.addCqf(archive_id);
				}else{
					
				}
				controller.changeForm.deleteRecord();
				controller.PARENT_CONTROLLER.cqfForm.show(false);
				controller.PARENT_CONTROLLER.cqfGrid.refresh();
				View.closeThisDialog();
				View.showMessage("交易成功！");
			}
		});
	},
	
	/**
	 * 从住房人员表中带人员信息
	 * 
	 * */
	getEmInfo: function(restriction){
	     var parameters = {
	         tableName: 'sc_zf_em',
	         fieldNames: toJSON(['sc_zf_em.em_id','sc_zf_em.archive_id','sc_zf_em.xm','sc_zf_em.dv_id','sc_zf_em.dv_name','sc_zf_em.zw_jb_id',
	                             'sc_zf_em.zw_jb_name','sc_zf_em.zw_id','sc_zf_em.zc_jb_id','sc_zf_em.zc_jb_name',
	                             'sc_zf_em.zc_id','sc_zf_em.zw_name','sc_zf_em.zc_name','sc_zf_em.sfzh']),
	         restriction: toJSON(restriction)
	     };
	     var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	     return result;
	},
	
	/**
	 * 从住房人员表中带人员信息
	 * 
	 * */
	getEmPoInfo: function(restriction){
	     var parameters = {
	         tableName: 'sc_zf_em_po',
	         fieldNames: toJSON(['sc_zf_em_po.archive_id','sc_zf_em_po.xm','sc_zf_em_po.dv_id','sc_zf_em_po.dv_name','sc_zf_em_po.zw_jb_id',
	                             'sc_zf_em_po.zw_jb_name','sc_zf_em_po.zw_id','sc_zf_em_po.zc_jb_id','sc_zf_em_po.zc_jb_name',
	                             'sc_zf_em_po.zc_id','sc_zf_em_po.zw_name','sc_zf_em_po.zc_name','sc_zf_em_po.sfzh']),
	         restriction: toJSON(restriction)
	     };
	     var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	     return result;
	},
	
	/**
	 * 新增现住产权房
	 * 	1.房间信息 2.员工个人信息 3.私人信息
	 * */
	addCqf: function(archive_id){
		
		var res = new Ab.view.Restriction();
        res.addClause("sc_zf_cq.auto_id", this.AUTO_ID, "=");
        var cqfRecord = this.scZfcqDs.getRecord(res);
        
        var restriction = "sc_zf_em.archive_id = '" + archive_id + "'";
		var result = this.getEmInfo(restriction);//因为有档案号，所以一定存在员工信息
			
		var restrictionPo = "sc_zf_em_po.archive_id = '" + archive_id + "' and sc_zf_em_po.status = '1'";
		var resultPo = this.getEmPoInfo(restrictionPo);
			
        var rec = new Ab.data.Record();
        
        //员工个人信息
        rec.setValue("sc_zf_cq.em_id", result.data.records[0]['sc_zf_em.em_id']);
		rec.setValue("sc_zf_cq.archive_id", result.data.records[0]['sc_zf_em.archive_id']);
		rec.setValue("sc_zf_cq.xm", result.data.records[0]['sc_zf_em.xm']);
		rec.setValue("sc_zf_cq.dv_id", result.data.records[0]['sc_zf_em.dv_id']);
		rec.setValue("sc_zf_cq.dv_name", result.data.records[0]['sc_zf_em.dv_name']);
        rec.setValue("sc_zf_cq.zw_jb_id", result.data.records[0]['sc_zf_em.zw_jb_id']);
		rec.setValue("sc_zf_cq.zw_jb_name",result.data.records[0]['sc_zf_em.zw_jb_name']);
		rec.setValue("sc_zf_cq.zw_id", result.data.records[0]['sc_zf_em.zw_id']);
		rec.setValue("sc_zf_cq.zc_jb_id", result.data.records[0]['sc_zf_em.zc_jb_id']);
		rec.setValue("sc_zf_cq.zc_jb_name", result.data.records[0]['sc_zf_em.zc_jb_name']);
		rec.setValue("sc_zf_cq.zc_id", result.data.records[0]['sc_zf_em.zc_id']);
		rec.setValue("sc_zf_cq.zw_name", result.data.records[0]['sc_zf_em.zw_name']);
		rec.setValue("sc_zf_cq.zc_name", result.data.records[0]['sc_zf_em.zc_name']);
		
		if(resultPo.data.records.length > 0){//有配偶信息
			rec.setValue("sc_zf_cq.owner_names", (result.data.records[0]['sc_zf_em.xm'] + "/" + resultPo.data.records[0]['sc_zf_em_po.xm']));
			
			rec.setValue("sc_zf_cq.p_zw_jb_id", resultPo.data.records[0]['sc_zf_em_po.zw_jb_id']);
			rec.setValue("sc_zf_cq.p_zw_jb_name", resultPo.data.records[0]['sc_zf_em_po.zw_jb_name']);
			rec.setValue("sc_zf_cq.p_zw_id", resultPo.data.records[0]['sc_zf_em_po.zw_id']);
			rec.setValue("sc_zf_cq.p_zc_jb_id", resultPo.data.records[0]['sc_zf_em_po.zc_jb_id']);
			rec.setValue("sc_zf_cq.p_zc_jb_name", resultPo.data.records[0]['sc_zf_em_po.zc_jb_name']);
			rec.setValue("sc_zf_cq.p_zc_id", resultPo.data.records[0]['sc_zf_em_po.zc_id']);
			rec.setValue("sc_zf_cq.p_zw_name", resultPo.data.records[0]['sc_zf_em_po.zw_name']);
			rec.setValue("sc_zf_cq.p_zc_name", resultPo.data.records[0]['sc_zf_em_po.zc_name']);
		}else{//无配偶信息
			rec.setValue("sc_zf_cq.owner_names", result.data.records[0]['sc_zf_em.xm']);
			
			rec.setValue("sc_zf_cq.p_zw_jb_id", "");
			rec.setValue("sc_zf_cq.p_zw_jb_name","");
			rec.setValue("sc_zf_cq.p_zw_id","");
			rec.setValue("sc_zf_cq.p_zc_jb_id","");
			rec.setValue("sc_zf_cq.p_zc_jb_name", "");
			rec.setValue("sc_zf_cq.p_zc_id","");
			rec.setValue("sc_zf_cq.p_zw_name", "");
			rec.setValue("sc_zf_cq.p_zc_name", "");
		}
		
		//房间基本信息
		rec.setValue("sc_zf_cq.bl_id", cqfRecord.getValue('sc_zf_cq.bl_id'));
		rec.setValue("sc_zf_cq.bl_name", cqfRecord.getValue('sc_zf_cq.bl_name'));
		rec.setValue("sc_zf_cq.fl_id", cqfRecord.getValue('sc_zf_cq.fl_id'));
		rec.setValue("sc_zf_cq.rm_id", cqfRecord.getValue('sc_zf_cq.rm_id'));
		rec.setValue("sc_zf_cq.rm_addr", cqfRecord.getValue('sc_zf_cq.rm_addr'));
		rec.setValue("sc_zf_cq.community", cqfRecord.getValue('sc_zf_cq.community'));
		rec.setValue("sc_zf_cq.super_type", cqfRecord.getValue('sc_zf_cq.super_type'));
		
		rec.setValue("sc_zf_cq.cqz_code", cqfRecord.getValue('sc_zf_cq.cqz_code'));
		rec.setValue("sc_zf_cq.zf_type_id", cqfRecord.getValue('sc_zf_cq.zf_type_id'));
		rec.setValue("sc_zf_cq.zf_type_name", cqfRecord.getValue('sc_zf_cq.zf_type_name'));
		rec.setValue("sc_zf_cq.date_building_end", cqfRecord.getValue('sc_zf_cq.date_building_end'));
		rec.setValue("sc_zf_cq.area_jianzhu", cqfRecord.getValue('sc_zf_cq.area_jianzhu'));
		rec.setValue("sc_zf_cq.ytys", cqfRecord.getValue('sc_zf_cq.ytys'));
		rec.setValue("sc_zf_cq.area_yt", cqfRecord.getValue('sc_zf_cq.area_yt'));
		rec.setValue("sc_zf_cq.area_sy", cqfRecord.getValue('sc_zf_cq.area_sy'));
		rec.setValue("sc_zf_cq.area_hd", cqfRecord.getValue('sc_zf_cq.area_hd'));
		rec.setValue("sc_zf_cq.bl_type", cqfRecord.getValue('sc_zf_cq.bl_type'));
		rec.setValue("sc_zf_cq.chaoxiang", cqfRecord.getValue('sc_zf_cq.chaoxiang'));
		rec.setValue("sc_zf_cq.huxing", cqfRecord.getValue('sc_zf_cq.huxing'));
//		rec.setValue("sc_zf_cq.date_gf", cqfRecord.getValue('sc_zf_cq.date_gf'));
		//新房产记录的房屋购得时间久是本次交易时间
		rec.setValue("sc_zf_cq.date_gf", cqfRecord.getValue('sc_zf_cq.c_date_jy'));
		rec.setValue("sc_zf_cq.price_unit", cqfRecord.getValue('sc_zf_cq.price_unit'));
		rec.setValue("sc_zf_cq.dw_sale_rm", cqfRecord.getValue('sc_zf_cq.dw_sale_rm'));
		rec.setValue("sc_zf_cq.price_sum", cqfRecord.getValue('sc_zf_cq.price_sum'));
		
		rec.setValue("sc_zf_cq.wxjjbz", cqfRecord.getValue('sc_zf_cq.wxjjbz'));
		rec.setValue("sc_zf_cq.doc_fcz", cqfRecord.getValue('sc_zf_cq.doc_fcz'));
		
		if(this.IS_ADMIN_ACCOUNT){
			rec.setValue("sc_zf_cq.is_audit_admin", '1');
		}
		
		this.scZfcqDs.saveRecord(rec);
	},
	
	/**
	 * 存入曾住产权房
	 * 
	 * */
	saveHcqf: function(){
		var res = new Ab.view.Restriction();
        res.addClause("sc_zf_cq.auto_id", this.AUTO_ID, "=");
        var cqfRecord = this.scZfcqDs.getRecord(res);
		
		var rec = new Ab.data.Record();
		rec.setValue("sc_zf_hcq.em_id", cqfRecord.getValue('sc_zf_cq.em_id'));
		rec.setValue("sc_zf_hcq.archive_id", cqfRecord.getValue('sc_zf_cq.archive_id'));
		rec.setValue("sc_zf_hcq.xm", cqfRecord.getValue('sc_zf_cq.xm'));
		rec.setValue("sc_zf_hcq.dv_id", cqfRecord.getValue('sc_zf_cq.dv_id'));
		rec.setValue("sc_zf_hcq.dv_name", cqfRecord.getValue('sc_zf_cq.dv_name'));
		rec.setValue("sc_zf_hcq.bl_id", cqfRecord.getValue('sc_zf_cq.bl_id'));
		rec.setValue("sc_zf_hcq.bl_name", cqfRecord.getValue('sc_zf_cq.bl_name'));
		rec.setValue("sc_zf_hcq.fl_id", cqfRecord.getValue('sc_zf_cq.fl_id'));
		rec.setValue("sc_zf_hcq.rm_id", cqfRecord.getValue('sc_zf_cq.rm_id'));
		rec.setValue("sc_zf_hcq.rm_addr", cqfRecord.getValue('sc_zf_cq.rm_addr'));
		rec.setValue("sc_zf_hcq.community", cqfRecord.getValue('sc_zf_cq.community'));
		rec.setValue("sc_zf_hcq.super_type", cqfRecord.getValue('sc_zf_cq.super_type'));
		rec.setValue("sc_zf_hcq.owner_names", cqfRecord.getValue('sc_zf_cq.owner_names'));
		rec.setValue("sc_zf_hcq.cqz_code", cqfRecord.getValue('sc_zf_cq.cqz_code'));
		rec.setValue("sc_zf_hcq.zf_type_id", cqfRecord.getValue('sc_zf_cq.zf_type_id'));
		rec.setValue("sc_zf_hcq.zf_type_name", cqfRecord.getValue('sc_zf_cq.zf_type_name'));
		rec.setValue("sc_zf_hcq.date_building_end", cqfRecord.getValue('sc_zf_cq.date_building_end'));
		rec.setValue("sc_zf_hcq.area_jianzhu", cqfRecord.getValue('sc_zf_cq.area_jianzhu'));
		rec.setValue("sc_zf_hcq.ytys", cqfRecord.getValue('sc_zf_cq.ytys'));
		rec.setValue("sc_zf_hcq.area_yt", cqfRecord.getValue('sc_zf_cq.area_yt'));
		rec.setValue("sc_zf_hcq.area_sy", cqfRecord.getValue('sc_zf_cq.area_sy'));
		rec.setValue("sc_zf_hcq.area_hd", cqfRecord.getValue('sc_zf_cq.area_hd'));
		rec.setValue("sc_zf_hcq.bl_type", cqfRecord.getValue('sc_zf_cq.bl_type'));
		rec.setValue("sc_zf_hcq.chaoxiang", cqfRecord.getValue('sc_zf_cq.chaoxiang'));
		rec.setValue("sc_zf_hcq.huxing", cqfRecord.getValue('sc_zf_cq.huxing'));
		rec.setValue("sc_zf_hcq.date_gf", cqfRecord.getValue('sc_zf_cq.date_gf'));
		rec.setValue("sc_zf_hcq.price_unit", cqfRecord.getValue('sc_zf_cq.price_unit'));
		rec.setValue("sc_zf_hcq.dw_sale_rm", cqfRecord.getValue('sc_zf_cq.dw_sale_rm'));
		rec.setValue("sc_zf_hcq.price_sum", cqfRecord.getValue('sc_zf_cq.price_sum'));
		rec.setValue("sc_zf_hcq.zw_jb_id", cqfRecord.getValue('sc_zf_cq.zw_jb_id'));
		rec.setValue("sc_zf_hcq.zw_jb_name", cqfRecord.getValue('sc_zf_cq.zw_jb_name'));
		rec.setValue("sc_zf_hcq.zw_id", cqfRecord.getValue('sc_zf_cq.zw_id'));
		rec.setValue("sc_zf_hcq.zc_jb_id", cqfRecord.getValue('sc_zf_cq.zc_jb_id'));
		rec.setValue("sc_zf_hcq.zc_jb_name", cqfRecord.getValue('sc_zf_cq.zc_jb_name'));
		rec.setValue("sc_zf_hcq.zc_id", cqfRecord.getValue('sc_zf_cq.zc_id'));
		rec.setValue("sc_zf_hcq.p_zw_jb_id", cqfRecord.getValue('sc_zf_cq.p_zw_jb_id'));
		rec.setValue("sc_zf_hcq.p_zw_jb_name", cqfRecord.getValue('sc_zf_cq.p_zw_jb_name'));
		rec.setValue("sc_zf_hcq.p_zw_id", cqfRecord.getValue('sc_zf_cq.p_zw_id'));
		rec.setValue("sc_zf_hcq.p_zc_jb_id", cqfRecord.getValue('sc_zf_cq.p_zc_jb_id'));
		rec.setValue("sc_zf_hcq.p_zc_jb_name", cqfRecord.getValue('sc_zf_cq.p_zc_jb_name'));
		rec.setValue("sc_zf_hcq.p_zc_id", cqfRecord.getValue('sc_zf_cq.p_zc_id'));
		rec.setValue("sc_zf_hcq.zw_name", cqfRecord.getValue('sc_zf_cq.zw_name'));
		rec.setValue("sc_zf_hcq.p_zw_name", cqfRecord.getValue('sc_zf_cq.p_zw_name'));
		rec.setValue("sc_zf_hcq.zc_name", cqfRecord.getValue('sc_zf_cq.zc_name'));
		rec.setValue("sc_zf_hcq.p_zc_name", cqfRecord.getValue('sc_zf_cq.p_zc_name'));
		rec.setValue("sc_zf_hcq.wxjjbz", cqfRecord.getValue('sc_zf_cq.wxjjbz'));
		rec.setValue("sc_zf_hcq.doc_fcz", cqfRecord.getValue('sc_zf_cq.doc_fcz'));
		
		rec.setValue("sc_zf_hcq.c_deal", cqfRecord.getValue('sc_zf_cq.c_deal'));
		rec.setValue("sc_zf_hcq.c_date_jy", cqfRecord.getValue('sc_zf_cq.c_date_jy'));
		rec.setValue("sc_zf_hcq.c_price_je", cqfRecord.getValue('sc_zf_cq.c_price_je'));
		rec.setValue("sc_zf_hcq.c_archive_id", cqfRecord.getValue('sc_zf_cq.c_archive_id'));
		rec.setValue("sc_zf_hcq.c_em_id", cqfRecord.getValue('sc_zf_cq.c_em_id'));
		rec.setValue("sc_zf_hcq.c_xm", cqfRecord.getValue('sc_zf_cq.c_xm'));
		rec.setValue("sc_zf_hcq.c_sfzh", cqfRecord.getValue('sc_zf_cq.c_sfzh'));
		rec.setValue("sc_zf_hcq.zf_type_id", cqfRecord.getValue('sc_zf_cq.zf_type_id'));
		rec.setValue("sc_zf_hcq.zf_type_name", cqfRecord.getValue('sc_zf_cq.zf_type_name'));
		rec.setValue("sc_zf_hcq.description", cqfRecord.getValue('sc_zf_cq.description'));
		rec.setValue("sc_zf_hcq.is_audit_admin", cqfRecord.getValue('sc_zf_cq.is_audit_admin'));
		
		if(this.IS_ADMIN_ACCOUNT){
			rec.setValue("sc_zf_hcq.is_audit_admin", '1');
		}
		
		this.scZfhcqDs.saveRecord(rec);
	},
	/**
	 * 
	 * 增加现住产权房
	 * */
	
	/**
	 * 验证身份证号是否有效
	 * */
	verifyIdCard: function(){
		var idCard = this.changeForm.getFieldValue("sc_zf_cq.c_sfzh");
		if(!IdCardValidate(idCard)){
			View.showMessage("身份证号无效!");
			Ext.fly(this.changeForm.getFieldElement("sc_zf_cq.c_sfzh").parentNode).addClass('formError');
			return false;
		}else{
			Ext.fly(this.changeForm.getFieldElement("sc_zf_cq.c_sfzh").parentNode).removeClass('formError');
			return true;
		}
	},
	/**
	 *  手动填写买受人信息
	 *  因为姓名不能确定唯一人，所以其他字段直接清空
	 *  
	 *  
	 * */
	manualInputXm: function(){
		this.changeForm.setFieldValue("sc_zf_cq.c_em_id","");
		this.changeForm.setFieldValue("sc_zf_cq.c_archive_id","");
	},
	/**
	 * 手工填入身份证号
	 * 
	 * */
	manualInputSFZH: function(){
		if(!this.verifyIdCard()){
			this.changeForm.setFieldValue("sc_zf_cq.c_em_id","");
			this.changeForm.setFieldValue("sc_zf_cq.c_archive_id","");
		}
		var sfzh = this.changeForm.getFieldValue("sc_zf_cq.c_sfzh");
		var restriction = "sc_zf_em.sfzh = '" + sfzh + "'";
		var result = this.getEmInfo(restriction);
		if (result.data.records.length > 0) {//证明本校教职工
		    this.changeForm.setFieldValue("sc_zf_cq.c_em_id",result.data.records[0]['sc_zf_em.em_id']);
			this.changeForm.setFieldValue("sc_zf_cq.c_archive_id",result.data.records[0]['sc_zf_em.archive_id']);
			this.changeForm.setFieldValue("sc_zf_cq.c_xm",result.data.records[0]['sc_zf_em.xm']);
		}else{
			this.changeForm.setFieldValue("sc_zf_cq.c_em_id","");
			this.changeForm.setFieldValue("sc_zf_cq.c_archive_id","");
		}
	}
	
	
});









