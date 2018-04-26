var rentOutController = View.createController("rentOutController", {
    cardId: null,
    cardType: null,
    parentController: null,
    wfrId: 'AbSpaceRoomInventoryBAR-iReportHandler-PmreReport',
    
    afterInitialDataFetch: function(){
        if (this.view.parameters) {
            this.cardId = this.view.parameters['cardId'];
            this.cardType = this.view.parameters['cardType'];
            this.parentController = this.view.parameters['parentController'];
        }
        
        var restriction = new Ab.view.Restriction();
        restriction.addClause("sc_zzfcard.card_id", this.cardId, "=");
        
        this.rentOutInfo.refresh(restriction, false);
        this.proInfo.refresh(restriction, false);
        this.FCBInfo.refresh(restriction, false);
    },
    autoSetDate: function(){
        var date_checkout_actual = this.rentOutInfo.getFieldValue('sc_zzfcard.date_checkout_actual');
        if (this.cardType == '博士后公寓') {
            var day = this.getDayBefore(date_checkout_actual);
            this.rentOutInfo.setFieldValue('sc_zzfcard.date_payrent_last', day);
        }
        else {
            var day = this.getLastDayBefore(date_checkout_actual);
            this.rentOutInfo.setFieldValue('sc_zzfcard.date_payrent_last', day);
        }
    },
    rentOutInfo_onSave: function(){
    	//判断是否符合退租的条件
    	var canNotOut = this.showWarningInfo();
    	if(canNotOut){
    		return;
    	}
    	
        if (!this.rentOutInfo.canSave()) {
            return;
        }
        
        var bl_id = this.rentOutInfo.getFieldValue("sc_zzfcard.bl_id");
        var fl_id = this.rentOutInfo.getFieldValue("sc_zzfcard.fl_id");
        var rm_id = this.rentOutInfo.getFieldValue("sc_zzfcard.rm_id");
        var identi_code = this.rentOutInfo.getFieldValue("sc_zzfcard.identi_code");
    	
        var controller = this;
        View.confirm("确定要退租吗？", function(button){
            if (button == 'yes') {
                //保存退租信息
                controller.saveRentOutInfo(controller.cardId,controller.cardType);
                //维护租赁资源
                controller.saveValueIntoRm(bl_id,fl_id,rm_id);
                //维护周转房信息
                controller.saveHcqf(identi_code,bl_id,fl_id,rm_id);
                //保存续签信息
                /**
                 * 此处数据库建立一个触发器，如果，监听到此协议已续租，则自动更新属于此协议的续签列表为无效
                 * */
                View.closeThisDialog();
                if (controller.parentController.id == 'checkoutController') {
                    controller.parentController.sc_zzfCardListPanel.refresh();
                }
                else 
                    if (controller.parentController.id == 'ascProtocolWarnController') {
                        controller.parentController.zzf_fee_detail.refresh();
                    }
              
            }
        });
        
    },
    /**
     * 维护租赁资源
     * 
     * 同时维护电水表等信息
     * 
     * */
    saveValueIntoRm: function(bl_id,fl_id,rm_id){
    	var num_water_b = this.proInfo.getFieldValue('sc_zzfcard.num_water_b');
  	    var num_ele_b = this.proInfo.getFieldValue('sc_zzfcard.num_ele_b');
  	    var num_gas_b = this.proInfo.getFieldValue('sc_zzfcard.num_gas_b');
  	    var money_water_b = this.proInfo.getFieldValue('sc_zzfcard.money_water_b');
  	    var money_ele_b = this.proInfo.getFieldValue('sc_zzfcard.money_ele_b');
  	    var money_gas_b = this.proInfo.getFieldValue('sc_zzfcard.money_gas_b');
          
    	
		var rmDs=View.dataSources.get('rmDs');
		var res = new Ab.view.Restriction();
		res.addClause('rm.bl_id',bl_id,'=');
		res.addClause('rm.fl_id',fl_id,'=');
		res.addClause('rm.rm_id',rm_id,'=');
		var record=rmDs.getRecord(res);
		record.setValue("rm.yzlzys",(record.getValue('rm.yzlzys')-1));
		record.setValue("rm.num_water",num_water_b);
		record.setValue("rm.num_ele",num_ele_b);
		record.setValue("rm.num_gas",num_gas_b);
		record.setValue("rm.money_water",money_water_b);
		record.setValue("rm.money_ele",money_ele_b);
		record.setValue("rm.money_gas",money_gas_b);
		
		rmDs.saveRecord(record);
	},
    /**
     * 警告信息
     * */
    showWarningInfo: function(){
    	var boolen = false;
    	var str = "";
    	var i = 0;
    	var date_checkout_ought = this.rentOutInfo.getFieldValue("sc_zzfcard.date_checkout_ought");
    	var date_payrent_last = this.rentOutInfo.getFieldValue("sc_zzfcard.date_payrent_last");
    	if(new Date(formatDate(date_payrent_last)).getTime() >= new Date(formatDate(date_checkout_ought)).getTime()){
    		boolen = true;
    		str = (++i) + ": 房租缴至日期 [" + date_payrent_last + "]超过应退日期 [" + date_checkout_ought + "]，请先走续签界面，并完成缴费\n"; 
    	}
    	
    	var num = this.isNoPayNums(this.cardId);
    	if(num > 0){
    		boolen = true;
    		str += (++i) + ": 您还有[" +num + "]项房租未缴齐,请缴齐再来退租";
    	}
    	
    	if(boolen){
    		View.showMessage(str);
    	}
    	return boolen;
    },
    /**
     *判断是否存在还未缴费完全的缴费项目 
     * 
     * */
    isNoPayNums: function(card_id){
		var restriction = "sc_zzf_fee.card_id='" + card_id + "' and sc_zzf_fee.pay_ought != sc_zzf_fee.pay_actual";
        var parameters = {
            tableName: 'sc_zzf_fee',
            fieldNames: toJSON(['sc_zzf_fee.card_id']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        return result.data.records.length;
	},
    
    rentOutInfo_onCancel: function(){
        View.closeThisDialog();
    },
    /**
     * 保存退租信息，如果是教职工退租的话，还要计算当前协议的累积租住月份
     * 
     * */
    saveRentOutInfo: function(cardId,cardType){
        var date_checkout_actual = this.rentOutInfo.getFieldValue('sc_zzfcard.date_checkout_actual');
        var cause_checkout = this.rentOutInfo.getFieldValue('sc_zzfcard.cause_checkout');
        var date_payrent_last = this.rentOutInfo.getFieldValue('sc_zzfcard.date_payrent_last');
        
//        var fee_water_info = this.proInfo.getFieldValue('sc_zzfcard.fee_water_info');
//        var fee_ele_info = this.proInfo.getFieldValue('sc_zzfcard.fee_ele_info');
//        var pro_info = this.proInfo.getFieldValue('sc_zzfcard.pro_info');
//        var pro_other_info = this.proInfo.getFieldValue('sc_zzfcard.pro_other_info');
//        var pro_people = this.proInfo.getFieldValue('sc_zzfcard.pro_people');
        
        var num_water_b = this.proInfo.getFieldValue('sc_zzfcard.num_water_b');
	    var num_ele_b = this.proInfo.getFieldValue('sc_zzfcard.num_ele_b');
	    var num_gas_b = this.proInfo.getFieldValue('sc_zzfcard.num_gas_b');
	    var money_water_b = this.proInfo.getFieldValue('sc_zzfcard.money_water_b');
	    var money_ele_b = this.proInfo.getFieldValue('sc_zzfcard.money_ele_b');
	    var money_gas_b = this.proInfo.getFieldValue('sc_zzfcard.money_gas_b');
        
        var rent_info = this.FCBInfo.getFieldValue('sc_zzfcard.rent_info');
        var key_info = this.FCBInfo.getFieldValue('sc_zzfcard.key_info');
        var furniture_info = this.FCBInfo.getFieldValue('sc_zzfcard.furniture_info');
        var room_info = this.FCBInfo.getFieldValue('sc_zzfcard.room_info');
        var fcb_other_info = this.FCBInfo.getFieldValue('sc_zzfcard.fcb_other_info');
        var fcb_people = this.FCBInfo.getFieldValue('sc_zzfcard.fcb_people');
        
        var record = this.sc_zzfcardDataSource.getRecord({
            'sc_zzfcard.card_id': cardId
        });
        record.setValue('sc_zzfcard.card_status', 'ytz');
        record.setValue('sc_zzfcard.date_checkout_actual', date_checkout_actual);
        record.setValue('sc_zzfcard.cause_checkout', cause_checkout);
        record.setValue('sc_zzfcard.date_payrent_last', date_payrent_last);
        
        record.setValue('sc_zzfcard.num_water_b', num_water_b);
        record.setValue('sc_zzfcard.num_ele_b', num_ele_b);
        record.setValue('sc_zzfcard.num_gas_b', num_gas_b);
        record.setValue('sc_zzfcard.money_water_b', money_water_b);
        record.setValue('sc_zzfcard.money_ele_b', money_ele_b);
        record.setValue('sc_zzfcard.money_gas_b', money_gas_b);
        
        record.setValue('sc_zzfcard.rent_info', rent_info);
        record.setValue('sc_zzfcard.key_info', key_info);
        record.setValue('sc_zzfcard.furniture_info', furniture_info);
        record.setValue('sc_zzfcard.room_info', room_info);
        record.setValue('sc_zzfcard.fcb_other_info', fcb_other_info);
        record.setValue('sc_zzfcard.fcb_people', fcb_people);
        
        /**
         * 如果是2012年7月1日以后进校教职工退租的话，
         * 
         * 还要计算当前协议的累积租住月份
         * 
         * */
//        if(cardType == '周转房(在校职工)'){
//        	var date_work_begin = this.rentOutInfo.getFieldValue('sc_zzfcard.date_work_begin');
//        	if(new Date(formatDate(date_work_begin)).getTime() >= new Date("2012-07-01").getTime()){
//        		
//        		var date_checkin = this.rentOutInfo.getFieldValue('sc_zzfcard.date_checkin');
//            	var date_checkout_actual = this.rentOutInfo.getFieldValue('sc_zzfcard.date_checkout_actual');
//            	
//        		var total_rent = this.getTotalRentMonth(date_checkin,date_checkout_actual);
//            	record.setValue('sc_zzfcard.total_rent', total_rent);
//            	
//        	}
//        }
        
        this.sc_zzfcardDataSource.saveRecord(record);
    },
    /**
     * 计算当前协议的累积租住月份
     * */
    getTotalRentMonth: function(date_checkin,date_checkout_actual){
    	var arrayBegin = date_checkin.split("-");
    	var arrayEnd = date_checkout_actual.split("-");
    	
    	var totalMonths = (parseInt(arrayEnd[0]) - parseInt(arrayBegin[0])) * 12 
    					  + (parseInt(arrayEnd[1]) - parseInt(arrayBegin[1]));
    	//如果不够一个月的日期 按一个月计算
    	if(parseInt(arrayEnd[2]) > parseInt(arrayBegin[2])){
    		totalMonths++;
    	}
    		
    	return totalMonths;
    },
    /**
     * 返回当前日期的前一天
     * */
    getDayBefore: function(date_begin){
        var time = new Date(formatDate(date_begin)).getTime() - 1000 * 60 * 60 * 24;
        var date = new Date(time);
        var strYear = date.getFullYear();
        var strDay = date.getDate();
        var strMonth = date.getMonth() + 1;
        return strYear + "-" + strMonth + "-" + strDay;
    },
    /**
     * 返回当前日期上一个月的最后一天
     * */
    getLastDayBefore: function(date_begin){
        var array = date_begin.split("-");
        
        var dd = parseInt(array[2]);
        
        var time = new Date(formatDate(date_begin)).getTime() - 1000 * 60 * 60 * 24 * dd;
        var date = new Date(time);
        var strYear = date.getFullYear();
        var strDay = date.getDate();
        var strMonth = date.getMonth() + 1;
        return strYear + "-" + strMonth + "-" + strDay;
    },
    
    /**
     * ireport 打印退换单
     */
    rentOutInfo_onReport:function(){
    	if (!this.rentOutInfo.canSave()) {
            return;
        }
    	this.rentOutInfo.save();
    	this.proInfo.save();
    	this.FCBInfo.save();
    	
		var card_id =this.proInfo.getFieldValue("sc_zzfcard.card_id");
		
		var xmlName= "sczzf_tf";
        var parameters= {
			'cardId': card_id
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
	},
	/******************************     同步产权房信息    ************************************************/
	
	/**
	 * 存入曾住产权房
	 * 
	 * */
	saveHcqf: function(identity,bl_id,fl_id,rm_id){
		
    	var archive_id = null;
    	if(valueExistsNotEmpty(identity)){
    		var restriction = "sc_zf_em.sfzh='" + identity + "'";
            var parameters = {
                tableName: 'sc_zf_em',
                fieldNames: toJSON(['sc_zf_em.archive_id']),
                restriction: toJSON(restriction)
            };
            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
            if (result.data.records.length > 0) {
    	        archive_id = result.data.records[0]['sc_zf_em.archive_id'];//1;未婚;2;已婚;3;离异
            }
        }
    	
    	if(!valueExistsNotEmpty(archive_id)){//不存在档案信息直接返回
    		return;
    	}
		
		
		var res = new Ab.view.Restriction();
        res.addClause("sc_zf_cq.bl_id", bl_id, "=");
        res.addClause("sc_zf_cq.fl_id", fl_id, "=");
        res.addClause("sc_zf_cq.rm_id", rm_id, "=");
        res.addClause("sc_zf_cq.archive_id", archive_id, "=");
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
		
		rec.setValue("sc_zf_hcq.is_audit_admin", '1');
		
		this.scZfhcqDs.saveRecord(rec);
		
		this.scZfcqDs.deleteRecord(cqfRecord);
	}
    
});
/**
 * 格式化日期
 * archibus系统 获取的date类型的字符串儿， 月份与日期没有自动补零
 *     (如 我们选的日期时"2014-08-08" 但form和grid界面中显示的是"2014-8-8")
 * 如果我们从界面中获取的值是"2014-8-8"
 * 用js Date函数  new Date("2014-8-8")时,获取不到具体的时间值
 * 此函数自动补零
 * */
function formatDate(date){
    var array = date.split("-");
    var yyyy = parseInt(array[0]);
    var mm = parseInt(array[1]);
    var dd = parseInt(array[2]);
    if (mm < 10) {
        mm = '0' + mm;
    }
    if (dd < 10) {
        dd = '0' + dd;
    }
    datastr = yyyy + "-" + mm + "-" + dd;
    return datastr;
}

