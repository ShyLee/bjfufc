var zzfBoshiController = View.createController('zzfBoshiController', {

    afterViewLoad: function(){
        this.site_tree.addParameter('rmType', " rm_type in ('30601','30602','30603','30604','30605','30606')");
        this.treePrDS.addParameter('rmType', " rm_type in ('30601','30602','30603','30604','30605','30606')");
        this.treeBlDS.addParameter('rmType', " rm_type in ('30601','30602','30603','30604','30605','30606')");
        this.treeFlDS.addParameter('rmType', " rm_type in ('30601','30602','30603','30604','30605','30606')");
        this.treeRmDS.addParameter('rmType', " rm_type in ('30601','30602','30603','30604','30605','30606')");
    },
//    
//    afterInitialDataFetch: function(){
//        this.applicant_info_onClear();
//    },
    
    setNewRoomdates: function(){
        var today = new Date();
        var startDay = monthStartDate(today);
        this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkin', today);
        this.new_rm_detail.setFieldValue('sc_zzfcard.date_first_pay', startDay);
    },
    
    site_tree_afterRefresh: function(){
        this.applicant_info.refresh(null, true);
        this.new_rm_detail.refresh(null, true);
        this.rm_detail.refresh(null, true);
        this.rm_detail.setFieldValue('rm.fl_id', '');
        jQuery('#checkout').attr('value', '');
        jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', false);
        this.setNewRoomdates();
    },
    
    applicant_info_onClear: function(){
        this.site_tree_afterRefresh();
        this.site_tree.refresh();
    },
    
    changeYear: function(){
        var dateCheckin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        //dateCheckin = new Date(dateCheckin);
        var inputYear = jQuery('#checkout').val();
        var type = jQuery('#selectType').val();
        var dateCheckout = '';
        if (isNaN(inputYear)) {
            View.showMessage('请输入数字');
            jQuery('#checkout').attr('value', '');
            return;
        }
        if (inputYear != '') {
            if (type == 'year') {
                dateCheckout = nYearsLaterSameDay(dateCheckin, inputYear);
            }
            else 
                if (type == 'month') {
                    dateCheckout = nMonthLater(dateCheckin, inputYear);
                }
                else {
                    dateCheckout = nDaysLater(dateCheckin, inputYear);
                }
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', dateCheckout);
        }
        else {
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', '');
        }
    },
    
    changeSelectType: function(){
        var dateCheckin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        //dateCheckin = new Date(dateCheckin);
        var inputYear = jQuery('#checkout').val();
        var type = jQuery('#selectType').val();
        var dateCheckout = '';
        if (inputYear != '') {
            if (type == 'year') {
                dateCheckout = nYearsLaterSameDay(dateCheckin, inputYear);
            }
            else 
                if (type == 'month') {
                    dateCheckout = nMonthLater(dateCheckin, inputYear);
                }
                else {
                    dateCheckout = nDaysLater(dateCheckin, inputYear);
                }
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', dateCheckout);
        }
        else {
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', '');
        }
    },
    
    changeCheckin: function(){
        var inputYear = jQuery('#checkout').val();
        var type = jQuery('#selectType').val();
        var dateCheckin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        //dateCheckin = new Date(dateCheckin);
        var startDay = monthStartStr(dateCheckin);
        this.new_rm_detail.setFieldValue('sc_zzfcard.date_first_pay', startDay);
        if (inputYear != '') {
            var dateCheckout = ''
            if (type == 'year') {
                dateCheckout = nYearsLaterSameDay(dateCheckin, inputYear);
            }
            else 
                if (type == 'month') {
                    dateCheckout = nMonthLater(dateCheckin, inputYear);
                }
                else {
                    dateCheckout = nDaysLater(dateCheckin, inputYear);
                }
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', dateCheckout);
        }
        else {
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', '');
        }
    },
    
    showHistory: function(){
        var identity = this.applicant_info.getFieldValue('sc_zzfcard.identi_code');
        //验证身份证号输入是否合法
        var idValidate = IdCardValidate(identity);
        if (!idValidate) {
            View.showMessage('输入身份证无效，请重新输入');
            this.applicant_info.setFieldValue('sc_zzfcard.identi_code', '');
        }
        //判断租房数量
        var res = new Ab.view.Restriction();
        var term = ['yrz', 'yxq'];
        res.addClause('sc_zzfcard.identi_code', identity, '=');
        res.addClause('sc_zzfcard.card_status', term, 'IN');
        var records = this.sc_zzfcardDataSource.getRecords(res);
        if (records.length > 0) {
            View.showMessage("已拥有一套住房，不能再次申请");
            this.applicant_info.actions.get('save').enable(false);
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
          var area_comn_rm = this.rm_detail.getFieldValue('rm.area_comn_rm');
          this.new_rm_detail.setFieldValue('sc_zzfcard.area_lease', area_comn_rm);
          this.new_rm_detail.show();
    },
    
    applicant_info_onSave: function(){
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
        //页面提示信息
        var rmId = this.rm_detail.getFieldValue('rm.rm_id');
        if (rmId == '') {
            View.showMessage('请选择房间');
            return;
        }
        var inputYear = jQuery('#checkout').val();
        var type = jQuery('#selectType').val();
        var htqx = '';
        if (inputYear == '') {
            View.showMessage('请输入合同期限');
            return;
        }
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
        else {
            if (type == 'year') {
                htqx = inputYear + '年';
            }
            else 
                if (type == 'month') {
                    htqx = inputYear + '月';
                }
                else {
                    htqx = inputYear + '天';
                }
        }
      //其他费用验证
        var otherPrice1 = this.new_rm_detail.getFieldValue('sc_zzfcard.other_rent');
        if(!valueExistsNotEmpty(otherPrice1)){
        	View.showMessage('请填写其它费用');
        	return;
        }
        this.applicant_info.save();
        
      //通过guid 查找card_id
        var res = new Ab.view.Restriction();
        res.addClause("sc_zzfcard.uuid",uuid,"=");
        var record=this.sc_zzfcardDataSource.getRecord(res);
        var cardId = record.getValue("sc_zzfcard.card_id");
        this.applicant_info.setFieldValue("sc_zzfcard.card_id",cardId);
        //获得登记信息
        var cardId = this.applicant_info.getFieldValue('sc_zzfcard.card_id');
        var blId = this.rm_detail.getFieldValue('rm.bl_id');
        var flId = this.rm_detail.getFieldValue('rm.fl_id');
        var rmId = this.rm_detail.getFieldValue('rm.rm_id');
        var res = new Ab.view.Restriction();
        res.addClause('sc_zzfcard.card_id', cardId);
        var record = this.sc_zzfcardDataSource.getRecord(res);
        record.setValue('sc_zzfcard.bl_id', blId);
        record.setValue('sc_zzfcard.fl_id', flId);
        record.setValue('sc_zzfcard.rm_id', rmId);
        record.setValue('sc_zzfcard.area_manual', this.rm_detail.getFieldValue('rm.area_manual'));
        record.setValue('sc_zzfcard.area_yangtai', this.rm_detail.getFieldValue('rm.area_yangtai'));
        record.setValue('sc_zzfcard.gl_area', this.rm_detail.getFieldValue('rm.gl_area'));
        record.setValue('sc_zzfcard.huxing', this.rm_detail.getFieldValue('rm.huxing'));
        record.setValue('sc_zzfcard.site_id', this.rm_detail.getFieldValue('bl.site_id'));
        record.setValue('sc_zzfcard.pr_id', this.rm_detail.getFieldValue('bl.pr_id'));
        record.setValue('sc_zzfcard.rm_type', this.rm_detail.getFieldValue('rm.rm_type'));
        record.setValue('sc_zzfcard.date_checkin', this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin'));
        record.setValue('sc_zzfcard.date_checkout_ought', this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkout_ought'));
        record.setValue('sc_zzfcard.date_checkout_ought_first', this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkout_ought'));
        record.setValue('sc_zzfcard.date_first_pay', this.new_rm_detail.getFieldValue('sc_zzfcard.date_first_pay'));
        record.setValue('sc_zzfcard.payment_to', this.new_rm_detail.getFieldValue('sc_zzfcard.payment_to'));
        record.setValue('sc_zzfcard.rent_period', this.new_rm_detail.getFieldValue('sc_zzfcard.rent_period'));
        record.setValue('sc_zzfcard.cash_deposit', this.new_rm_detail.getFieldValue('sc_zzfcard.cash_deposit'));
        record.setValue('sc_zzfcard.curr_rent_rate', this.new_rm_detail.getFieldValue('sc_zzfcard.curr_rent_rate'));
        record.setValue('sc_zzfcard.price_lately', this.new_rm_detail.getFieldValue('sc_zzfcard.curr_rent_rate'));
        record.setValue('sc_zzfcard.area_lease', this.new_rm_detail.getFieldValue('sc_zzfcard.area_lease'));
        record.setValue('sc_zzfcard.other_rent', this.new_rm_detail.getFieldValue('sc_zzfcard.other_rent'));
        record.setValue('sc_zzfcard.card_status', 'yrz');
        record.setValue('sc_zzfcard.card_type', '2');
        record.setValue('sc_zzfcard.htqx', htqx);
        this.sc_zzfcardDataSource.saveRecord(record);
        
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
        var otherPrice = this.new_rm_detail.getFieldValue('sc_zzfcard.other_rent');
        var dateBegin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        var period = this.new_rm_detail.getFieldValue('sc_zzfcard.rent_period');
        var price = this.new_rm_detail.getFieldValue('sc_zzfcard.curr_rent_rate');
        var cardId = this.applicant_info.getFieldValue('sc_zzfcard.card_id');
        var dateEnd = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkout_ought');
        try {
            var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-CalcZzfRent-othersPaymentHandle', dateBegin, dateEnd, period, parseFloat(price),parseFloat(otherPrice),cardId, parseFloat(area));
        } 
        catch (e) {
            Workflow.handleError(e);
        }
		View.showMessage('保存成功');
		this.site_tree.refresh();
        this.applicant_info.actions.get('save').enable(false);
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
    }
});
