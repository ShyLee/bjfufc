var zzfOutsiderController = View.createController('zzfOutsiderController', {

    afterViewLoad: function(){
//        document.getElementById("require_reply").checked = false;
        jQuery('#new_rm_detail_sc_zzfcard\\.djfr').hide();
        jQuery('#new_rm_detail_sc_zzfcard\\.djfr_labelCell').hide();
        jQuery('#new_rm_detail_sc_zzfcard\\.sponsor_name').hide();
        jQuery('#new_rm_detail_sc_zzfcard\\.sponsor_name_labelCell').hide();
    },
    setNewRoomdates: function(){
        var today = new Date();
        var startDay = monthStartDate(today);
        this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkin', today);
        this.new_rm_detail.setFieldValue('sc_zzfcard.date_first_pay', startDay);
    },
    
    applicant_info_afterRefresh: function(){
        this.applicant_info.setFieldValue('sc_zzfcard.rent_type', 'CCSQ');
    },
    
    /****
     * 复位：还原到最初加载界面的状态
     * */
    reset: function(){
    	this.applicant_info.refresh(null, true);
        this.new_rm_detail.refresh(null, true);
        this.rm_detail.refresh(null, true);
        this.rm_detail.setFieldValue('rm.fl_id', '');
        jQuery('#checkout').attr('value', '');
        jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', false);
        this.setNewRoomdates();
    },
    
//    site_tree_afterRefresh: function(){
//        this.applicant_info.refresh(null, true);
//        this.new_rm_detail.refresh(null, true);
//		this.used_rm_detail.refresh(null,true);
//        this.rm_detail.refresh(null, true);
//        this.rm_detail.setFieldValue('rm.fl_id', '');
//        jQuery('#checkout').attr('value', '');
//        jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', false);
//        this.used_rm_detail.setFieldValue('sc_zzfcard.date_payrent_last', '');
//        this.used_rm_detail.enableField('sc_zzfcard.date_payrent_last', true);
//        this.used_rm_detail.setFieldValue('sc_zzfcard.ttqx', 0);
//        this.used_rm_detail.enableField('sc_zzfcard.ttqx', true);
//        this.setNewRoomdates();
//    },
    
    applicant_info_onClear: function(){
//        this.site_tree_afterRefresh();
    	this.site_tree.refresh();
        this.reset();
        this.used_rm_detail.refresh('1<>1');
    },
    
    changeYear: function(){
        var dateCheckin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        var inputYear = jQuery('#checkout').val();
        if (isNaN(inputYear)) {
            View.showMessage('请输入数字');
            jQuery('#checkout').attr('value', '');
            return;
        }
        if (inputYear) {
            var dateCheckout = nYearsLaterSameDayTwoByLeiLin(dateCheckin, inputYear);
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', dateCheckout);
        }
        else {
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', '');
        }
    },
    
    changeCheckin: function(){
        var inputYear = jQuery('#checkout').val();
        var dateCheckin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        //dateCheckin = new Date(dateCheckin);
        var startDay = monthStartStr(dateCheckin);
        this.new_rm_detail.setFieldValue('sc_zzfcard.date_first_pay', startDay);
        if (inputYear != '') {
            var dateCheckout = nYearsLaterSameDay(dateCheckin, inputYear);
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', dateCheckout);
        }
        else {
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', '');
        }
    },
    
    showHistory: function(identity){
//        var identity = this.applicant_info.getFieldValue('sc_zzfcard.identi_code');
//        //验证身份证号输入是否合法
//        var idValidate = IdCardValidate(identity);
//        if (!idValidate) {
//            View.showMessage('输入身份证无效，请重新输入');
//            this.applicant_info.setFieldValue('sc_zzfcard.identi_code', '');
//        }
        //确定租赁类型
        var res = new Ab.view.Restriction();
        var term = ['yrz', 'yxq', 'ytz'];
        res.addClause('sc_zzfcard.identi_code', identity, '=');
        res.addClause('sc_zzfcard.card_status', term, 'IN');
        var records = this.sc_zzfcardDataSource.getRecords(res);
        if (records.length > 0) {
            this.applicant_info.setFieldValue('sc_zzfcard.rent_type', 'ZLTZ');
        }
        else {
            this.applicant_info.setFieldValue('sc_zzfcard.rent_type', 'CCSQ');
        }
        //如果申请人拥有两套或以上住房，不能登记
        var res1 = new Ab.view.Restriction();
        var term1 = ['yrz', 'yxq'];
        res1.addClause('sc_zzfcard.identi_code', identity, '=');
        res1.addClause('sc_zzfcard.card_status', term1, 'IN');
        var records = this.sc_zzfcardDataSource.getRecords(res1);
        if (records.length > 1) {
            View.showMessage("申请过多住房");
            this.applicant_info.actions.get('save').enable(false);
        }else{
			this.applicant_info.actions.get('save').enable(true);
		}
        //刷新正在使用的房间信息
        var lastDate = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        lastDate = getPrevMonthLastDay(new Date(lastDate));
        var res2 = new Ab.view.Restriction();
        res2.addClause('sc_zzfcard.identi_code', identity, '=');
        res2.addClause('sc_zzfcard.card_status', term1, 'IN');
        var records = this.sc_zzfcardDataSource.getRecords(res2);
        if (records.length > 0) {
            this.used_rm_detail.refresh(res2, false);
            this.used_rm_detail.enableField('sc_zzfcard.date_payrent_last', true);
            this.used_rm_detail.enableField('sc_zzfcard.ttqx', true);
            this.used_rm_detail.setFieldValue('sc_zzfcard.date_payrent_last', lastDate);
        }
        else {
            this.used_rm_detail.setFieldValue('sc_zzfcard.date_payrent_last', '');
            this.used_rm_detail.enableField('sc_zzfcard.date_payrent_last', false);
            this.used_rm_detail.setFieldValue('sc_zzfcard.ttqx', 0);
            this.used_rm_detail.enableField('sc_zzfcard.ttqx', false);
        }
    },
    
    paymentChange: function(){
        var paymentTo = this.new_rm_detail.getFieldValue('sc_zzfcard.payment_to');
        if (paymentTo == 'finance') {
            this.new_rm_detail.setFieldValue('sc_zzfcard.rent_period', 'Month');
            jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', 'disabled');
        }
        else {
            jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', false);
        }
    },
    
    onClickRmNode: function(){
        var currentNode = this.site_tree.lastNodeClicked;
        var blId = currentNode.data['rm.bl_id'];
        var flId = currentNode.data['rm.fl_id'];
        var rmId = currentNode.data['rm.rm_id'];
        res1 = new Ab.view.Restriction();
        res1.addClause('rm.bl_id', blId);
        res1.addClause('rm.fl_id', flId);
        res1.addClause('rm.rm_id', rmId);
        this.rm_detail.refresh(res1, false);
        var area_jianzhu = this.rm_detail.getFieldValue('rm.area_jianzhu');
        this.new_rm_detail.setFieldValue('sc_zzfcard.area_lease', area_jianzhu);
        
        var rent_std = this.rm_detail.getFieldValue('rm.rent_std');
        this.new_rm_detail.setFieldValue('sc_zzfcard.rent_std', rent_std);
        
        this.new_rm_detail.show();
    },
    
    applicant_info_onSave: function(){
    	
    	
    	var dateCheckoutTime = this.new_rm_detail.getFieldValue("sc_zzfcard.date_checkout_ought");
    	
    	if(!dateCheckoutTime) {
    		View.alert("请填写应退日期");
    		return;
    	}
    	
    	var uuid;
    	var result;
    	//生成guid
        try {
    			result = Workflow.callMethod('AbSpaceRoomInventoryBAR-GetMyGUID-getMyGUID');
            } catch (e) {
        	Workflow.handleError(e);
         	}	
            if (result.code == 'executed') {
            	var a;
                //var id = eval('(' + result.jsonExpression + ')');
                var temp = result.jsonExpression.toString().split(":")[1];
                uuid = temp.substring(0,temp.length-2);
                //uuid = id[0].GUID
            }
            this.applicant_info.setFieldValue("sc_zzfcard.uuid",uuid);
        //未选房间提醒
        var rmId = this.rm_detail.getFieldValue('rm.rm_id');
        if (rmId == '') {
            View.showMessage('请选择房间');
            return;
        }
        var inputYear = jQuery('#checkout').val();
        if (inputYear == '') {
            View.showMessage('请输入合同期限');
            return;
        }
      //未填入住日期提醒
        var dateCheckin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        if (!dateCheckin) {
            View.showMessage('入住日期是必须的');
            return;
        }
		var area = this.new_rm_detail.getFieldValue('sc_zzfcard.area_lease');
        if (parseFloat(area) == 0) {
            View.showMessage('协议面积是必须的且不能为0');
            return;
        }
        //选择别人代缴却没有填写代缴人提醒
//        var checked = document.getElementById("require_reply").checked;
//        var daijiaoren = this.new_rm_detail.getFieldValue('sc_zzfcard.djfr');
//        var danbaoren = this.new_rm_detail.getFieldValue('sc_zzfcard.sponsor_name');
//        if (checked == true) {
//            if (daijiaoren == '' || danbaoren == '') {
//                View.showMessage('请选择代缴人');
//                return;
//            }
//        }
        var identity = this.applicant_info.getFieldValue('sc_zzfcard.identi_code');
        //修改未腾退房间协议信息
        var res = new Ab.view.Restriction();
        var term = ['yrz', 'yxq'];
        res.addClause('sc_zzfcard.identi_code', identity, '=');
        res.addClause('sc_zzfcard.card_status', term, 'IN');
        var record = this.sc_zzfcardDataSource.getRecord(res);
        if (record != '') {
            var dateLast = this.used_rm_detail.getFieldValue('sc_zzfcard.date_payrent_last');
            var ttqx = this.used_rm_detail.getFieldValue('sc_zzfcard.ttqx');
            if (!dateLast || !ttqx) {
                View.showMessage('请填写停缴时间和腾退期限');
                return;
            }
            record.setValue('sc_zzfcard.date_payrent_last', this.used_rm_detail.getFieldValue('sc_zzfcard.date_payrent_last'));
            record.setValue('sc_zzfcard.ttqx', this.used_rm_detail.getFieldValue('sc_zzfcard.ttqx'));
            this.sc_zzfcardDataSource.saveRecord(record);
        }
        
        //存入新的房间协议
        this.applicant_info.save();
        
       //通过guid 查找card_id
        var res = new Ab.view.Restriction();
        res.addClause("sc_zzfcard.uuid",uuid,"=");
        var record=this.sc_zzfcardDataSource.getRecord(res);
        var cardId = record.getValue("sc_zzfcard.card_id");
        this.applicant_info.setFieldValue("sc_zzfcard.card_id",cardId);
       //获取登记信息
        var dateBegin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        var dateEnd = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkout_ought');
        var period = this.new_rm_detail.getFieldValue('sc_zzfcard.rent_period');
        var price = this.new_rm_detail.getFieldValue('sc_zzfcard.curr_rent_rate');
        var otherPrice = this.new_rm_detail.getFieldValue('sc_zzfcard.other_rent');
        var cardId = this.applicant_info.getFieldValue('sc_zzfcard.card_id');
        var blId = this.rm_detail.getFieldValue('rm.bl_id');
        var flId = this.rm_detail.getFieldValue('rm.fl_id');
        var rmId = this.rm_detail.getFieldValue('rm.rm_id');
        var inputYear = jQuery('#checkout').val();
        var htqx = '';
        if (inputYear != '') {
            htqx = inputYear + '年';
        }
        var res1 = new Ab.view.Restriction();
        res1.addClause('sc_zzfcard.card_id', cardId);
        var record1 = this.sc_zzfcardDataSource.getRecord(res1);
        record1.setValue('sc_zzfcard.bl_id', blId);
        record1.setValue('sc_zzfcard.fl_id', flId);
        record1.setValue('sc_zzfcard.rm_id', rmId);
        record1.setValue('sc_zzfcard.area_manual', this.rm_detail.getFieldValue('rm.area_manual'));
        record1.setValue('sc_zzfcard.area_yangtai', this.rm_detail.getFieldValue('rm.area_yangtai'));
        record1.setValue('sc_zzfcard.gl_area', this.rm_detail.getFieldValue('rm.gl_area'));
        record1.setValue('sc_zzfcard.huxing', this.rm_detail.getFieldValue('rm.huxing'));
        record1.setValue('sc_zzfcard.site_id', this.rm_detail.getFieldValue('bl.site_id'));
        record1.setValue('sc_zzfcard.pr_id', this.rm_detail.getFieldValue('bl.pr_id'));
        record1.setValue('sc_zzfcard.rm_type', this.rm_detail.getFieldValue('rm.rm_type'));
        
        record1.setValue('sc_zzfcard.num_water_a', this.rm_detail.getFieldValue('rm.num_water'));
        record1.setValue('sc_zzfcard.num_ele_a', this.rm_detail.getFieldValue('rm.num_ele'));
        record1.setValue('sc_zzfcard.num_gas_a', this.rm_detail.getFieldValue('rm.num_gas'));
        record1.setValue('sc_zzfcard.money_water_a', this.rm_detail.getFieldValue('rm.money_water'));
        record1.setValue('sc_zzfcard.money_ele_a', this.rm_detail.getFieldValue('rm.money_ele'));
        record1.setValue('sc_zzfcard.money_gas_a', this.rm_detail.getFieldValue('rm.money_gas'));
        
        
        record1.setValue('sc_zzfcard.date_checkin', this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin'));
        record1.setValue('sc_zzfcard.date_checkout_ought', this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkout_ought'));
        record1.setValue('sc_zzfcard.date_checkout_ought_first', this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkout_ought'));
        record1.setValue('sc_zzfcard.date_first_pay', this.new_rm_detail.getFieldValue('sc_zzfcard.date_first_pay'));
        record1.setValue('sc_zzfcard.date_payrent_last', this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkout_ought'));
        record1.setValue('sc_zzfcard.rent_std', this.new_rm_detail.getFieldValue('sc_zzfcard.rent_std'));
        record1.setValue('sc_zzfcard.payment_to', this.new_rm_detail.getFieldValue('sc_zzfcard.payment_to'));
        record1.setValue('sc_zzfcard.rent_period', this.new_rm_detail.getFieldValue('sc_zzfcard.rent_period'));
        record1.setValue('sc_zzfcard.cash_deposit', this.new_rm_detail.getFieldValue('sc_zzfcard.cash_deposit'));
        record1.setValue('sc_zzfcard.area_lease', this.new_rm_detail.getFieldValue('sc_zzfcard.area_lease'));
        record1.setValue('sc_zzfcard.djfr', this.new_rm_detail.getFieldValue('sc_zzfcard.djfr'));
        record1.setValue('sc_zzfcard.curr_rent_rate', this.new_rm_detail.getFieldValue('sc_zzfcard.curr_rent_rate'));
        record1.setValue('sc_zzfcard.other_rent', this.new_rm_detail.getFieldValue('sc_zzfcard.other_rent'));
        record1.setValue('sc_zzfcard.card_status', 'yrz');
        record1.setValue('sc_zzfcard.card_type', '1');
        record1.setValue('sc_zzfcard.htqx', htqx);
        this.sc_zzfcardDataSource.saveRecord(record1);
        
        //更新房间的可租赁资源数
        var res2 = new Ab.view.Restriction();
        res2.addClause('rm.bl_id', blId);
        res2.addClause('rm.fl_id', flId);
        res2.addClause('rm.rm_id', rmId);
        var record2 = this.rm_detail.getRecord(res2);
        var source = parseInt(record2.getValue('rm.yzlzys'),10);
        this.rm_detail.setFieldValue('rm.yzlzys',source +1);
         var rmDetail =  this.rm_detail;
         this.rm_detail.save();
        
        //更新未腾退房间字段
        if (this.used_rm_detail.getFieldValue('sc_zzfcard.bl_id')) {
            var res3 = new Ab.view.Restriction();
            var cardIdTengtui = this.used_rm_detail.getFieldValue('sc_zzfcard.card_id');
            res3.addClause('sc_zzfcard.card_id', cardIdTengtui);
            var record3 = this.sc_zzfcardDataSource.getRecord(res3);
            record3.setValue('sc_zzfcard.card_id', 'ttz');
            this.sc_zzfcardDataSource.saveRecord(record3);
        }
        
//        try {
//            var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-CalcZzfRent-othersPaymentHandle', dateBegin, dateEnd, period, parseFloat(price),parseFloat(otherPrice),cardId, parseFloat(area));
//        } 
//        catch (e) {
//            Workflow.handleError(e);
//        }
		View.showMessage('保存成功');
		
		this.addCqfInfo();
        this.site_tree.refresh();
        this.reset();
		
        this.applicant_info.actions.get('save').enable(false);
    },
    
    /***
     * 把周转房信息添加到房产档案中
     * */
    addCqfInfo: function(){
    	var identity = this.applicant_info.getFieldValue('sc_zzfcard.identi_code');
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
    	
    	var rec = new Ab.data.Record();
    	
    	var em_id = this.applicant_info.getFieldValue('sc_zzfcard.em_id');
    	var em_name = this.applicant_info.getFieldValue('sc_zzfcard.em_name');
    	var dv_name = this.applicant_info.getFieldValue('sc_zzfcard.dv_name');
    	
    	var po_name = this.applicant_info.getFieldValue('sc_zzfcard.po_name');
        //员工个人信息
        rec.setValue("sc_zf_cq.em_id", em_id);
		rec.setValue("sc_zf_cq.archive_id", archive_id);
		rec.setValue("sc_zf_cq.em_name", em_name);
		rec.setValue("sc_zf_cq.dv_name", dv_name);
		if(valueExistsNotEmpty(po_name)){//有配偶信息
			rec.setValue("sc_zf_cq.owner_names", (em_name + "/" + po_name));
		}else{//无配偶信息
			rec.setValue("sc_zf_cq.owner_names", em_name);
		}
		
		//房间基本信息
		var blId = this.rm_detail.getFieldValue('rm.bl_id');
		var blName = this.rm_detail.getFieldValue('bl.name');
        var flId = this.rm_detail.getFieldValue('rm.fl_id');
        var rmId = this.rm_detail.getFieldValue('rm.rm_id');
        var area_jianzhu = this.rm_detail.getFieldValue('rm.area_jianzhu');
        var area_yangtai = this.rm_detail.getFieldValue('rm.area_yangtai');
        var area_manual = this.rm_detail.getFieldValue('rm.area_manual');
		rec.setValue("sc_zf_cq.bl_id", blId);
		rec.setValue("sc_zf_cq.bl_name", blName);
		rec.setValue("sc_zf_cq.fl_id", flId);
		rec.setValue("sc_zf_cq.rm_id", rmId);
		rec.setValue("sc_zf_cq.super_type",'2');
		rec.setValue("sc_zf_cq.zf_type_id", '0004');
		rec.setValue("sc_zf_cq.zf_type_name", "周转房");
		rec.setValue("sc_zf_cq.area_jianzhu", area_jianzhu);
		rec.setValue("sc_zf_cq.area_yt", area_yangtai);
		rec.setValue("sc_zf_cq.area_sy", area_manual);
		rec.setValue("sc_zf_cq.area_hd", area_jianzhu);
		rec.setValue("sc_zf_cq.is_audit_admin", '1');
		
		this.scZfcqDs.saveRecord(rec);
    },
    
    new_rm_detail_onUploadFile: function(){
        var cardId = this.applicant_info.getFieldValue('sc_zzfcard.card_id');
        if (cardId != '') {
            var restriction = new Ab.view.Restriction();
            restriction.addClause("sc_zzfcard.card_id", cardId, '=');
            this.upload_file.refresh(restriction);
            this.upload_file.showInWindow({
                title: "附件上传",
                x: 800,
                y: 200,
                width: 500,
                height: 260,
                closeButton: false
            });
        }
        else {
            View.showMessage("保存协议后再进行附件上传");
        }
    },
    
    selectDaikouPerson: function(){
        if (document.getElementById("require_reply").checked) {
            jQuery('#new_rm_detail_sc_zzfcard\\.djfr').show();
            jQuery('#new_rm_detail_sc_zzfcard\\.djfr_labelCell').show();
            jQuery('#new_rm_detail_sc_zzfcard\\.sponsor_name').show();
            jQuery('#new_rm_detail_sc_zzfcard\\.sponsor_name_labelCell').show();
            this.new_rm_detail.setFieldValue('sc_zzfcard.payment_to', 'finance');
            this.new_rm_detail.setFieldValue('sc_zzfcard.rent_period', 'Month');
            jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', 'disabled');
        }
        else {
            jQuery('#new_rm_detail_sc_zzfcard\\.djfr').hide();
            jQuery('#new_rm_detail_sc_zzfcard\\.djfr_labelCell').hide();
            jQuery('#new_rm_detail_sc_zzfcard\\.sponsor_name').hide();
            jQuery('#new_rm_detail_sc_zzfcard\\.sponsor_name_labelCell').hide();
            this.new_rm_detail.setFieldValue('sc_zzfcard.payment_to', 'house');
            jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', false);
        }
    },
    
    new_rm_detail_onCalRentStandard : function () {
    	var rmType = this.rm_detail.getFieldValue("rm.rm_type");
    	var identiCode = this.applicant_info.getFieldValue("sc_zzfcard.identi_code");
    	
    	var restriction = "identi_code='"+ identiCode +"' and rm_id||'~'||fl_id||'~'||bl_id in (select rm_id||'~'||fl_id||'~'||bl_id from rm where rm_type='"+ rmType +"') and date_checkout_actual is not null";
        var parameters = {
            tableName: 'sc_zzfcard',
            fieldNames: toJSON(['sc_zzfcard.card_id', 'sc_zzfcard.htqx','sc_zzfcard.date_checkin','sc_zzfcard.date_checkout_ought', 'sc_zzfcard.date_checkout_actual', 'sc_zzfcard.payment_to', 'sc_zzfcard.rent_period', 'sc_zzfcard.rent_std','sc_zzfcard.em_id','sc_zzfcard.em_name','sc_zzfcard.bl_id','sc_zzfcard.fl_id','sc_zzfcard.rm_id']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        
        if(valueExistsNotEmpty(result.data.records[0])) {
        	//var date_checkin = result.data.records[0]["sc_zzfcard.date_checkin"];
        	//var date_checkout_ought = result.data.records[0]["sc_zzfcard.date_checkout_ought"];
        	//var rent_std = result.data.records[0]["sc_zzfcard.rent_std"];
        	var rent_std = this.new_rm_detail.getFieldValue("sc_zzfcard.rent_std");
        	
        	var records = result.data;
        	rent_std = this.calRent_std(rmType,identiCode,rent_std,result.data.records);
        	
        	this.new_rm_detail.setFieldValue("sc_zzfcard.rent_std",rent_std);
        }
    },
    
    calRent_std : function(rmType,identiCode,rent_std,records) {
    	//按套类判断
    	var sumMonth = 0;
    	var rent = 0;
    	
    	if(rmType=='30601') {
    		if ( records.length > 0 ) {  //大于0说明住过多套A类周转房
        		for(var i=0; i<records.length; i++) {
    				//续签表中没有此合约的续签记录，入住和，应退时间从sc_zzfcard表中获取
        			sumMonth = sumMonth + this.calRentMonth(records[i]["sc_zzfcard.date_checkin"],records[i]["sc_zzfcard.date_checkout_actual"]);
        		}
        	}
        	if(sumMonth==0) {
        		return rent_std;
        	}
        	
        	var rentNumber = rent_std.split("(")[0];
        	
        	var sumYear = parseInt(sumMonth/12);
        	
        	//以前入住的年数还要+现在要入住的1年
        	if( sumYear>=1 && sumYear<5 ) {
        		rent = (rentNumber*Math.pow((1.1),sumYear)).toFixed(2);
        	} else if (sumYear==5) {
        		rent = (rentNumber*Math.pow((1.1),4)*1.5).toFixed(2);
        	} else if ( sumYear>5 ) {
        		rent = (rentNumber*Math.pow((1.1),4)*Math.pow(1.5,(sumYear-5+1))).toFixed(2);
        	}
        	rent = parseFloat(rent).toFixed(0);
        	return rent + "(" + rent_std.split("(")[1];
    	} else {
    		if ( records.length > 0 ) {  //大于0说明住过多套A类周转房
        		for(var i=0; i<records.length; i++) {
    				//续签表中没有此合约的续签记录，入住和，应退时间从sc_zzfcard表中获取
        			sumMonth = sumMonth + this.calRentMonth(records[i]["sc_zzfcard.date_checkin"],records[i]["sc_zzfcard.date_checkout_actual"]);
        		}
        	}
        	if(sumMonth==0) {
        		return rent_std;
        	}
        	
        	var rentNumber = rent_std.split("(")[0];
        	
        	var sumYear = parseInt(sumMonth/12);
        	
        	//以前入住的年数还要+现在要入住的1年
        	if( sumYear>=1 && sumYear<5 ) {
        		rent = (rentNumber*Math.pow((1.1),sumYear)).toFixed(2);
        	} else if (sumYear==5) {
        		rent = (rentNumber*Math.pow((1.1),4)*1.5).toFixed(2);
        	} else if ( sumYear>5 ) {
        		rent = (rentNumber*Math.pow((1.1),4)*Math.pow(1.5,(sumYear-5+1))).toFixed(2);
        	}
        	return rent + "(" + rent_std.split("(")[1];
    	}
    	
    	
	},
	
	//根据入住日期应退日期，计算入住月数
	calRentMonth: function(date_checkin,date_checkout_ought){
    	var arrayBegin = date_checkin.split("-");
    	var arrayEnd = date_checkout_ought.split("-");
    	
    	var totalMonths = (parseInt(arrayEnd[0]) - parseInt(arrayBegin[0])) * 12 
    					  + (parseInt(arrayEnd[1]) - parseInt(arrayBegin[1]));
    	//如果不够一个月的日期 按一个月计算
    	if(parseInt(arrayEnd[2]) > parseInt(arrayBegin[2])){
    		totalMonths++;
    	}
    	return totalMonths;
    }
});


/***
 * 自动带出个人信息（从私房人员库中，注意字段设计不一致），配偶信息，已租赁房屋信息
 * 
 * */
function initBaiscInfo(fieldName,selectedValue,previousValue){
	//;;mal;男;fe;女
	if(fieldName=='sc_zzfcard.sex'){
		if( selectedValue =='男' ){
			zzfOutsiderController.applicant_info.setFieldValue("sc_zzfcard.sex",'mal');
			
			zzfOutsiderController.site_tree.addParameter('rmType', " renter_sex = '1' ");

	        zzfOutsiderController.site_tree.refresh();
		}else if( selectedValue =='女' ){
			zzfOutsiderController.applicant_info.setFieldValue("sc_zzfcard.sex",'fe');
			
			zzfOutsiderController.site_tree.addParameter('rmType', " renter_sex = '2' ");

			zzfOutsiderController.site_tree.refresh();
		}
		
		
		return false;
	}
	
	if(fieldName=='sc_zzfcard.identi_code'){
		zzfOutsiderController.applicant_info.setFieldValue("sc_zzfcard.identi_code",selectedValue);
		
		addOtherEmInfo(selectedValue);
		zzfOutsiderController.showHistory(selectedValue);
	}
}

/***
 * 自动带出剩余的个人信息
 *   【sc_zzfcard.marriage_stat,sc_zzfcard.is_working_parents,sc_zzfcard.phone,sc_zzfcard.email,sc_zzfcard.date_work_begin,sc_zzfcard.zhiw_id,sc_zzfcard.zhic_id】
 *    【sc_zf_em.status_married,sc_zf_em.is_sworker,sc_zf_em.mphone,sc_zf_em.email,sc_zf_em.date_come_sch,sc_zf_em.zw_id,sc_zf_em.zc_id】
 * */
function addOtherEmInfo(sfzh){
	if(valueExistsNotEmpty(sfzh)){
		var restriction = "sc_zf_em.sfzh='" + sfzh + "'";
        var parameters = {
            tableName: 'sc_zf_em',
            fieldNames: toJSON(['sc_zf_em.status_married', 'sc_zf_em.is_sworker', 'sc_zf_em.mphone', 'sc_zf_em.email', 'sc_zf_em.date_come_sch', 'sc_zf_em.zw_id', 'sc_zf_em.zc_id']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
	        var	status_married = result.data.records[0]['sc_zf_em.status_married'];//1;未婚;2;已婚;3;离异
	        var	is_sworker = result.data.records[0]['sc_zf_em.is_sworker'];//1;是;2;否
	        var	mphone = result.data.records[0]['sc_zf_em.mphone'];
	        var	email = result.data.records[0]['sc_zf_em.email'];
	        var date_come_sch = result.data.records[0]['sc_zf_em.date_come_sch'];
	        var	zw_id = result.data.records[0]['sc_zf_em.zw_id'];
	        var	zc_id = result.data.records[0]['sc_zf_em.zc_id'];
        	
	        if(status_married == '未婚'){
	        	zzfOutsiderController.applicant_info.setFieldValue("sc_zzfcard.marriage_stat",'1');
	        }else if(status_married == '已婚'){
	        	zzfOutsiderController.applicant_info.setFieldValue("sc_zzfcard.marriage_stat",'2');
	        }else if(status_married == '离异'){
	        	zzfOutsiderController.applicant_info.setFieldValue("sc_zzfcard.marriage_stat",'3');
	        }
	        
//	        if(is_sworker == '是'){
//	        	zzfOutsiderController.applicant_info.setFieldValue("sc_zzfcard.is_working_parents",'1');
//	        }else if(is_sworker == '否'){
//	        	zzfOutsiderController.applicant_info.setFieldValue("sc_zzfcard.is_working_parents",'2');
//	        }
	        zzfOutsiderController.applicant_info.setFieldValue("sc_zzfcard.phone",mphone);
	        zzfOutsiderController.applicant_info.setFieldValue("sc_zzfcard.email",email);
	        zzfOutsiderController.applicant_info.setFieldValue("sc_zzfcard.date_work_begin",date_come_sch);
//	        zzfOutsiderController.applicant_info.setFieldValue("sc_zzfcard.zhiw_id",zw_id);
//	        zzfOutsiderController.applicant_info.setFieldValue("sc_zzfcard.zhic_id",zc_id);
        }
        
        //从配偶表带出现配偶信息 [po_name po_dv_id po_em_id po_identi_code] 
        // 
        var restriction = "sc_zf_em_po.archive_id in (select archive_id from sc_zf_em where sc_zf_em.sfzh='" + sfzh + "') and sc_zf_em_po.status = '1'";
        var parameters = {
            tableName: 'sc_zf_em_po',
            fieldNames: toJSON(['sc_zf_em_po.xm', 'sc_zf_em_po.sfzh', 'sc_zf_em_po.dv_id']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
        	var xm = result.data.records[0]['sc_zf_em_po.xm'];
 	        var	sfzh = result.data.records[0]['sc_zf_em_po.sfzh'];
 	        var	dv_id = result.data.records[0]['sc_zf_em_po.dv_id'];
 	        
 	        zzfOutsiderController.applicant_info.setFieldValue("sc_zzfcard.po_name",xm);
	        zzfOutsiderController.applicant_info.setFieldValue("sc_zzfcard.po_identi_code",sfzh);
	        zzfOutsiderController.applicant_info.setFieldValue("sc_zzfcard.po_dv_id",dv_id);
        }
	}
}
