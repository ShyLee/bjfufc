
var ascZfbtPayByMonthController = View.createController('ascZfbtPayByMonthController', {
    CUR_YYYYMM:null,
    wfrId: 'AbSpaceRoomInventoryBAR-iReportHandler-PmreReport',
    xmlName: "",
    parameters:{},
	
    afterViewLoad: function(){
        var date = new Date();
        newSelectYM($('yyyymm'),date.getFullYear(),date.getMonth() + 1);
    },
    afterInitialDataFetch: function(){
        this.yearMonth_onShow();
    },
    yearMonth_onShow: function(){
        this.CUR_YYYYMM = $('yyyymm').options[$('yyyymm').selectedIndex].value;
        //刷新无房月补贴金额
        this.doRefreshFFListTab();
        
        //刷新本月停发的人员信息
        this.tfList.addParameter("YYYYMM", this.CUR_YYYYMM);    
        this.tfList.refresh();
        
        //刷新来校前一次性补贴
        this.doRefreshLxqListTab();
        
        //刷新级差与差额一次性补贴
        this.doRefreshJcListTab();
    },
    
    /******************         无房月补贴发放              *******************/
    doRefreshFFListTab: function(){
        var strYM = this.CUR_YYYYMM.substring(0, 4) + "年" + this.CUR_YYYYMM.substring(4, 6) + "月";
        //查看实际发放表中是否有记录
        //  如果有已归档的，则是历史记录，不能重新发放
        var restriction = "sc_zfbt_ff.pay_month='" + this.CUR_YYYYMM + "' and sc_zfbt_ff.is_gd = '1'";
        var parameters = {
            tableName: 'sc_zfbt_ff',
            fieldNames: toJSON(['sc_zfbt_ff.id', 'sc_zfbt_ff.pay_month']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
            this.ffList.show(false);
            var res = new Ab.view.Restriction();
            res.addClause("sc_zfbt_ff.pay_month", this.CUR_YYYYMM, "=");
            this.hffList.refresh(res);
            this.hffList.show(true);
            
            this.hffList.setTitle(strYM + " 已发放");
        }else{
            this.hffList.show(false);
            this.ffList.addParameter("YYYYMM", this.CUR_YYYYMM);    
            this.ffList.refresh();
            var restriction = "sc_zfbt_ff.pay_month='" + this.CUR_YYYYMM + "'";
            var parameters = {
                tableName: 'sc_zfbt_ff',
                fieldNames: toJSON(['sc_zfbt_ff.id', 'sc_zfbt_ff.pay_month']),
                restriction: toJSON(restriction)
            };
            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
            if (result.data.records.length > 0) {
                this.ffList.setTitle(strYM + "  已生成");
                this.ffList.actions.get('file').show(true);
            }else{
                this.ffList.setTitle(strYM + "  未生成");
                this.ffList.actions.get('file').show(false);
            }
        }
    },
    ffList_onSaveFFDetail: function(){
        var controller = this;
        View.confirm("您确定要生成本月的发放明细吗?若本月已生成过，继续生成则会覆盖之前的记录.", function(button){
            if (button == 'yes') {
                controller.doFF(controller.CUR_YYYYMM);
                View.showMessage("生成成功!");
                //只需刷新按月发放tab页
                controller.doRefreshFFListTab();
            }
        });
    },
    doFF: function(yyyymm){
        //1.先删除当前月的发放记录
        var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt_ff.pay_month", yyyymm, "=");
        var records = this.scZFBtFFDs.getRecords(res);
        for(var i=0; i<records.length; i++){
            this.scZFBtFFDs.deleteRecord(records[i]);
        }
        //2.增加本月的记录
        var date = new Date();
        var items = this.ffList.gridRows.items;
        for(var i = 0; i < items.length; i++){
            var record= new Ab.data.Record();
            record.setValue("sc_zfbt_ff.em_id", items[i].getFieldValue('sc_zfbt.em_id'));
            record.setValue("sc_zfbt_ff.salary_num", items[i].getFieldValue('sc_zfbt.salary_num'));
            record.setValue("sc_zfbt_ff.em_name", items[i].getFieldValue('sc_zfbt.em_name'));
            
            if(valueExistsNotEmpty(items[i].getFieldValue('sc_zfbt.date_come_school'))){
                record.setValue("sc_zfbt_ff.date_come_school", items[i].getFieldValue('sc_zfbt.date_come_school'));
            }
            
            record.setValue("sc_zfbt_ff.zhiw_name", items[i].getFieldValue('sc_zfbt.zw_name'));
            
            if(valueExistsNotEmpty(items[i].getFieldValue('sc_zfbt.zw_get_date'))){
                record.setValue("sc_zfbt_ff.zhiw_date", items[i].getFieldValue('sc_zfbt.zw_get_date'));
            }
            
            record.setValue("sc_zfbt_ff.zhic_name", items[i].getFieldValue('sc_zfbt.zc_name'));
            
            if(valueExistsNotEmpty(items[i].getFieldValue('sc_zfbt.zc_get_date'))){
                record.setValue("sc_zfbt_ff.zhic_date", items[i].getFieldValue('sc_zfbt.zc_get_date'));
            }
            
            record.setValue("sc_zfbt_ff.pay", items[i].getFieldValue('sc_zfbt.money'));
            record.setValue("sc_zfbt_ff.tz_pay", items[i].getFieldValue('sc_zfbt.tz_pay'));
            record.setValue("sc_zfbt_ff.back_pay", items[i].getFieldValue('sc_zfbt.back_pay'));
            record.setValue("sc_zfbt_ff.actual_pay", items[i].getFieldValue('sc_zfbt.sf_pay'));
            record.setValue("sc_zfbt_ff.pay_month", yyyymm);
            record.setValue("sc_zfbt_ff.pay_date", date);
            
            this.scZFBtFFDs.saveRecord(record);
        }   
    },
//  ffList_afterRefresh: function(){
//      var items = this.ffList.gridRows.items;
//      var money = 0;
//      var tz_pay = 0;
//      var back_pay = 0;
//      var sf_pay = 0;
//      for(var i=0; i<items.length; i++){
//          money = items[i].getFieldValue('sc_zfbt.money');
//          tz_pay = items[i].getFieldValue('sc_zfbt.tz_pay');
//          back_pay = items[i].getFieldValue('sc_zfbt.back_pay');
//          
//          sf_pay = parseFloat(money) + parseFloat(tz_pay) + parseFloat(back_pay);
//          items[i].setFieldValue('sc_zfbt.sf_pay',sf_pay);
//      }
//  },
    ffList_onFile: function(){
        var selectedRecordList=this.ffList.getSelectedRecords();
        if(selectedRecordList.length==0){
            View.showMessage('请选择要操作的数据');
            return;
        }
        var controller = this;
        View.confirm("您确定要将这些数据归档吗?归档后不能重新生成当月发放明细", function(button){
            if (button == 'yes') {
                for(var i=0;i<selectedRecordList.length;i++){
                    var record=selectedRecordList[i];
                    var em_id=record.getValue('sc_zfbt.em_id');
                    
                    controller.doFile(em_id,controller.CUR_YYYYMM);
                }
                
                controller.ffList.show(false);
                var res = new Ab.view.Restriction();
                res.addClause("sc_zfbt_ff.pay_month", controller.CUR_YYYYMM, "=");
                controller.hffList.refresh(res);
                controller.hffList.show(true);
                var strYM = controller.CUR_YYYYMM.substring(0, 4) + "年" + controller.CUR_YYYYMM.substring(4, 6) + "月";
                controller.hffList.setTitle(strYM + "   已发放");
            }
        });
    },
    doFile: function(em_id,yyyymm){
        var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt_ff.em_id", em_id, "=");
        res.addClause("sc_zfbt_ff.pay_month", yyyymm, "=");
        var record = this.scZFBtFFDs.getRecord(res);
        
        record.setValue("sc_zfbt_ff.is_gd",'1');//修改为归档状态
        this.scZFBtFFDs.saveRecord(record);
    },
    hffList_onFile: function(){
        var selectedRecordList=this.hffList.getSelectedRecords();
        if(selectedRecordList.length==0){
            View.showMessage('请选择要操作的数据');
            return;
        }
        var controller = this;
        View.confirm("您确定要将这些数据归档吗?归档后不能重新生成当月发放明细", function(button){
            if (button == 'yes') {
                for(var i=0;i<selectedRecordList.length;i++){
                    var record=selectedRecordList[i];
                    var em_id=record.getValue('sc_zfbt_ff.em_id');
                    controller.doFile(em_id,controller.CUR_YYYYMM);
                }
                controller.hffList.refresh();
            }
        });
    },
    /***
     * 当月补贴没有发放转移以后补发的月份
     * 
     * 1.只能转移未归档的缴费项目
     * 2.转移到目标月份之前，请确保目标月份的当月补贴情况为最终版本，即不再重新生成【重新生成会覆盖当月的之前的所有操作，转移结果也被覆盖了】
     * */
    hffList_onTransfer: function(){
    	var selectedRecordList=this.hffList.getSelectedRecords();
        if(selectedRecordList.length==0){
            View.showMessage('请选择要操作的数据');
            return;
        }
        var controller = this;
        View.prompt('输入转入月份', '1.只能转移未归档的缴费项目<br/>2.转移到目标月份之前，请确保目标月份的当月补贴情况为最终版本   <br/>【重新生成会覆盖当月的之前的所有操作，转移结果也被覆盖了】<br/>3.请输入合法的日期"YYYYMM"<br/>', function(button, text) {
	           if (button == 'ok') {
	        	   if(!verifyDateStr(text)){
                   		View.showMessage("请填写有效的年月");
                   		return;
                   }
	        	   for(var i=0;i<selectedRecordList.length;i++){
	                    var record=selectedRecordList[i];
	                    var is_gd=record.getValue('sc_zfbt_ff.is_gd');
	                    
	                    if(is_gd == '1'){
	                    	View.showMessage("您选择了已归档的缴费项目,请修改");
	                    	return;
	                    }
	                }
	        	   //验证通过进行转移
	        	    for(var i=0;i<selectedRecordList.length;i++){
	                    var record=selectedRecordList[i];
	                    controller.doTransfer(record,text);
	                 }
	        	     controller.hffList.refresh();
	           }
	    });
    },
    /**
     * 转移缴费项
     * 
     * 1.目标月份有本人的补贴记录，金额累加
     * 2.目标月份没有本人的补贴记录，新增记录
     * */
    doTransfer: function(record,targetMonth){
        var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt_ff.em_id", record.getValue("sc_zfbt_ff.em_id"), "=");
        res.addClause("sc_zfbt_ff.pay_month", targetMonth, "=");
        var records = this.scZFBtFFDs.getRecords(res);
        if(records.length > 0){//目标月份有本人的补贴记录，金额累加
        	var target = records[0];
        	var pay = parseFloat(target.getValue("sc_zfbt_ff.pay")) + parseFloat(record.getValue("sc_zfbt_ff.pay"));
        	var tz_pay = parseFloat(target.getValue("sc_zfbt_ff.tz_pay")) + parseFloat(record.getValue("sc_zfbt_ff.tz_pay"));
        	var back_pay = parseFloat(target.getValue("sc_zfbt_ff.back_pay")) + parseFloat(record.getValue("sc_zfbt_ff.back_pay"));
        	var actual_pay = parseFloat(target.getValue("sc_zfbt_ff.actual_pay")) + parseFloat(record.getValue("sc_zfbt_ff.actual_pay"));
        	
        	target.setValue("sc_zfbt_ff.pay", pay);
        	target.setValue("sc_zfbt_ff.tz_pay", tz_pay);
        	target.setValue("sc_zfbt_ff.back_pay", back_pay);
        	target.setValue("sc_zfbt_ff.actual_pay", actual_pay);
        	
        	target.isNew = false;
        	this.scZFBtFFDs.saveRecord(target);
        }else{//目标月份没有本人的补贴记录，新增记录
        	  var target= new Ab.data.Record();
        	  target.setValue("sc_zfbt_ff.em_id", record.getValue('sc_zfbt_ff.em_id'));
        	  target.setValue("sc_zfbt_ff.salary_num", record.getValue('sc_zfbt_ff.salary_num'));
        	  target.setValue("sc_zfbt_ff.em_name", record.getValue('sc_zfbt_ff.em_name'));
              
              if(valueExistsNotEmpty(record.getValue('sc_zfbt_ff.date_come_school'))){
            	  target.setValue("sc_zfbt_ff.date_come_school", record.getValue('sc_zfbt_ff.date_come_school'));
              }
              
              target.setValue("sc_zfbt_ff.zhiw_name", record.getValue('sc_zfbt_ff.zhiw_name'));
              
              if(valueExistsNotEmpty(record.getValue('sc_zfbt_ff.zhiw_date'))){
            	  target.setValue("sc_zfbt_ff.zhiw_date", record.getValue('sc_zfbt_ff.zhiw_date'));
              }
              
              target.setValue("sc_zfbt_ff.zhic_name", record.getValue('sc_zfbt_ff.zhic_name'));
              
              if(valueExistsNotEmpty(record.getValue('sc_zfbt_ff.zhic_date'))){
            	  target.setValue("sc_zfbt_ff.zhic_date", record.getValue('sc_zfbt_ff.zhic_date'));
              }
              
              target.setValue("sc_zfbt_ff.pay", parseFloat(record.getValue('sc_zfbt_ff.pay')));
              target.setValue("sc_zfbt_ff.tz_pay", parseFloat(record.getValue('sc_zfbt_ff.tz_pay')));
              target.setValue("sc_zfbt_ff.back_pay", parseFloat(record.getValue('sc_zfbt_ff.back_pay')));
              target.setValue("sc_zfbt_ff.actual_pay", parseFloat(record.getValue('sc_zfbt_ff.actual_pay')));
              target.setValue("sc_zfbt_ff.pay_month", targetMonth);
              target.setValue("sc_zfbt_ff.pay_date", new Date());
              this.scZFBtFFDs.saveRecord(target);
        }
        
        //更新当月缴费项目的状态
        record.setValue("sc_zfbt_ff.is_gd",'2');
        record.isNew = false;
        this.scZFBtFFDs.saveRecord(record);
    },
    ffList_onReport: function(){
        var strYM = this.CUR_YYYYMM.substring(0, 4) + "年" + this.CUR_YYYYMM.substring(4, 6) + "月";
        xmlName="sc_zfbt_detail_ff";//我们拿到财务处的也按具体生成的发放表[他的数据时最准的]
        parameters= {
              pyyyymm:this.CUR_YYYYMM,
              pyyyymmStr:strYM,
              subReports:'sc_zfbt_detail_sub1'
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
//        View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
//            width: 470,
//            height: 200,
//            xmlName: "sc_zfbt_detail",
//            parameters: {
//                pyyyymm:this.CUR_YYYYMM,
//                pyyyymmStr:strYM,
//                subReports:'sc_zfbt_detail_sub1'
//            },
//            closeButton: false
//        });
    },
    hffList_onReport: function(){
        var strYM = this.CUR_YYYYMM.substring(0, 4) + "年" + this.CUR_YYYYMM.substring(4, 6) + "月";
        xmlName= "sc_zfbt_detail_ff";
        parameters= {
            pyyyymm:this.CUR_YYYYMM,
            pyyyymmStr:strYM,
            subReports:'sc_zfbt_detail_sub1'
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
//        View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
//            width: 470,
//            height: 200,
//            xmlName: "sc_zfbt_detail_ff",
//            parameters: {
//                pyyyymm:this.CUR_YYYYMM,
//                pyyyymmStr:strYM,
//                subReports:'sc_zfbt_detail_sub1'
//            },
//            closeButton: false
//        });
    },
    /******************         来校前一次性补贴补贴发放              *******************/
    
    /**
     * 来校前为一次性发放补贴
     * 查询月份只要含有已归档的，这个月便不能重新发放【本月发放未归档的，要么删除，要么重新在本页归档】
     * 否则显示所有未生成发放明细的记录[注意：本月中含有未归档的，下个月重新生成发放明细会删除所有未归档的,本月中的未归档的会进入下个月的发放明细中]
     * 
     * */
    doRefreshLxqListTab: function(){
        var strYM = this.CUR_YYYYMM.substring(0, 4) + "年" + this.CUR_YYYYMM.substring(4, 6) + "月";
        //查看实际发放表中是否有记录
        //  如果有已归档的，则是历史记录，不能重新发放
        var restriction = "sc_zfbt_lxq_ff.pay_month='" + this.CUR_YYYYMM + "' and sc_zfbt_lxq_ff.is_gd = '1'";
        var parameters = {
            tableName: 'sc_zfbt_lxq_ff',
            fieldNames: toJSON(['sc_zfbt_lxq_ff.em_id', 'sc_zfbt_lxq_ff.pay_month']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
            this.lxqList.show(false);
            var res = new Ab.view.Restriction();
            res.addClause("sc_zfbt_lxq_ff.pay_month", this.CUR_YYYYMM, "=");
            this.lxqListFF.refresh(res);
            this.lxqListFF.show(true);
            
            this.lxqListFF.setTitle(strYM + "   已发放");
        }else{
            this.lxqListFF.show(false);
            
            //注意此处会重复之前所有未归档的一次性发放记录
            var restriction = "sc_zfbt_lxq.em_id not in (select em_id from sc_zfbt_lxq_ff where sc_zfbt_lxq_ff.is_gd = '1')";
            this.lxqList.restriction = restriction;
            this.lxqList.refresh();
            
            var restriction = "sc_zfbt_lxq_ff.pay_month='" + this.CUR_YYYYMM + "'";
            var parameters = {
                tableName: 'sc_zfbt_lxq_ff',
                fieldNames: toJSON(['sc_zfbt_lxq_ff.em_id', 'sc_zfbt_lxq_ff.pay_month']),
                restriction: toJSON(restriction)
            };
            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
            if (result.data.records.length > 0) {
                this.lxqList.setTitle(strYM + " 已生成");
                this.lxqList.actions.get('file').show(true);
            }else{
                this.lxqList.setTitle(strYM + " 未生成");
                this.lxqList.actions.get('file').show(false);
            }
        }
    },
    lxqList_onSaveFFDetail: function(){
        var controller = this;
        View.confirm("您确定要重新生成发放明细吗?重新生成会覆盖之前未归档的所有发放记录.", function(button){
            if (button == 'yes') {
                controller.doFFLXQ(controller.CUR_YYYYMM);
                View.showMessage("生成成功!");
                //只需刷新一次性补发tab页
                //controller.doRefreshLxqListTab();
                //实质上不用刷新，界面数据一样，只需改下标题即可
                var strYM = controller.CUR_YYYYMM.substring(0, 4) + "年" + controller.CUR_YYYYMM.substring(4, 6) + "月";
                controller.lxqList.setTitle(strYM + "   已生成");
                controller.lxqList.actions.get('file').show(true);
            }
        });
    },
    doFFLXQ: function(yyyymm){
        //1.先删除所有未归档的发放记录
        var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt_lxq_ff.is_gd", '0', "=");
        var records = this.scZfBtLxqFFDs.getRecords(res);
        for(var i=0; i<records.length; i++){
            this.scZfBtLxqFFDs.deleteRecord(records[i]);
        }
        
        //2.增加本月的记录
        var date = new Date();
        var items = this.lxqList.gridRows.items;
        for(var i = 0; i < items.length; i++){
            var record= new Ab.data.Record();
            record.setValue("sc_zfbt_lxq_ff.em_id", items[i].getFieldValue('sc_zfbt_lxq.em_id'));
            record.setValue("sc_zfbt_lxq_ff.salary_num", items[i].getFieldValue('sc_zfbt_lxq.salary_num'));
            record.setValue("sc_zfbt_lxq_ff.em_name", items[i].getFieldValue('sc_zfbt_lxq.em_name'));
            if(valueExistsNotEmpty(items[i].getFieldValue('sc_zfbt_lxq.date_come_sch'))){
                record.setValue("sc_zfbt_lxq_ff.date_come_sch", items[i].getFieldValue('sc_zfbt_lxq.date_come_sch'));
            }
            if(valueExistsNotEmpty(items[i].getFieldValue('sc_zfbt_lxq.date_begin_work'))){
                record.setValue("sc_zfbt_lxq_ff.date_begin_work", items[i].getFieldValue('sc_zfbt_lxq.date_begin_work'));
            }
            record.setValue("sc_zfbt_lxq_ff.money_a", items[i].getFieldValue('sc_zfbt_lxq.money_a'));
            record.setValue("sc_zfbt_lxq_ff.money_b", items[i].getFieldValue('sc_zfbt_lxq.money_b'));
            record.setValue("sc_zfbt_lxq_ff.money_c", items[i].getFieldValue('sc_zfbt_lxq.money_c'));
            record.setValue("sc_zfbt_lxq_ff.money_hj", items[i].getFieldValue('sc_zfbt_lxq.money_hj'));
            record.setValue("sc_zfbt_lxq_ff.em_name", items[i].getFieldValue('sc_zfbt_lxq.em_name'));
            record.setValue("sc_zfbt_lxq_ff.em_name", items[i].getFieldValue('sc_zfbt_lxq.em_name'));
            
            record.setValue("sc_zfbt_lxq_ff.pay_month", yyyymm);
            record.setValue("sc_zfbt_lxq_ff.pay_date", date);
            
            this.scZfBtLxqFFDs.saveRecord(record);
        }   
    },
    lxqList_onFile: function(){
        var selectedRecordList=this.lxqList.getSelectedRecords();
        if(selectedRecordList.length==0){
            View.showMessage('请选择要操作的数据');
            return;
        }
        var controller = this;
        View.confirm("您确定要将这些数据归档吗?归档后不能重新生成当月发放明细", function(button){
            if (button == 'yes') {
                for(var i=0;i<selectedRecordList.length;i++){
                    var record=selectedRecordList[i];
                    var em_id=record.getValue('sc_zfbt_lxq.em_id');
                    
                    controller.doFileLXQ(em_id);
                }
                
                controller.lxqList.show(false);
                var res = new Ab.view.Restriction();
                res.addClause("sc_zfbt_lxq_ff.pay_month", controller.CUR_YYYYMM, "=");
                controller.lxqListFF.refresh(res);
                controller.lxqListFF.show(true);
                var strYM = controller.CUR_YYYYMM.substring(0, 4) + "年" + controller.CUR_YYYYMM.substring(4, 6) + "月";
                controller.lxqListFF.setTitle(strYM + " 已发放");
            }
        });
    },
    doFileLXQ: function(em_id){
        var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt_lxq_ff.em_id", em_id, "=");
        var record = this.scZfBtLxqFFDs.getRecord(res);
        
        record.setValue("sc_zfbt_lxq_ff.is_gd",'1');//修改为归档状态
        this.scZfBtLxqFFDs.saveRecord(record);
    },
    lxqListFF_onFile: function(){
        var selectedRecordList=this.lxqListFF.getSelectedRecords();
        if(selectedRecordList.length==0){
            View.showMessage('请选择要操作的数据');
            return;
        }
        var controller = this;
        View.confirm("您确定要将这些数据归档吗?", function(button){
            if (button == 'yes') {
                for(var i=0;i<selectedRecordList.length;i++){
                    var record=selectedRecordList[i];
                    var em_id=record.getValue('sc_zfbt_lxq_ff.em_id');
                    controller.doFileLXQ(em_id);
                }
                controller.lxqListFF.refresh();
            }
        });
    },
    lxqList_onReport: function(){
        var strYM = this.CUR_YYYYMM.substring(0, 4) + "年" + this.CUR_YYYYMM.substring(4, 6) + "月";
        xmlName= "sc_zfbt_lxqff_detail";
        parameters= {
          pyyyymm:strYM
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
//        View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
//            width: 470,
//            height: 200,
//            xmlName: "sc_zfbt_lxqff_detail",
//            parameters: {
//                pyyyymm:strYM
//            },
//            closeButton: false
//        });
    },
    lxqListFF_onReport: function(){
        var strYM = this.CUR_YYYYMM.substring(0, 4) + "年" + this.CUR_YYYYMM.substring(4, 6) + "月";
        xmlName= "sc_zfbt_lxqff_detail_ff";
        parameters= {
            pyyyymmstr:strYM,
            yyyymm:this.CUR_YYYYMM
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
//        View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
//            width: 470,
//            height: 200,
//            xmlName: "sc_zfbt_lxqff_detail_ff",
//            parameters: {
//                pyyyymmstr:strYM,
//                yyyymm:this.CUR_YYYYMM
//            },
//            closeButton: false
//        });
    },
    /******************         级差与差额补贴发放              *******************/
    
    
    doRefreshJcListTab: function(){
        var strYM = this.CUR_YYYYMM.substring(0, 4) + "年" + this.CUR_YYYYMM.substring(4, 6) + "月";
        //查看实际发放表中是否有记录
        //  如果有已归档的，则是历史记录，不能重新发放
        var restriction = "sc_zfbt_jc_ff.pay_month='" + this.CUR_YYYYMM + "' and sc_zfbt_jc_ff.is_gd = '1'";
        var parameters = {
            tableName: 'sc_zfbt_jc_ff',
            fieldNames: toJSON(['sc_zfbt_jc_ff.id', 'sc_zfbt_jc_ff.pay_month']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
            this.jcList.show(false);
            var res = new Ab.view.Restriction();
            res.addClause("sc_zfbt_jc_ff.pay_month", this.CUR_YYYYMM, "=");
            this.jcListFF.refresh(res);
            this.jcListFF.show(true);
            
            this.jcListFF.setTitle(strYM + "    已发放");
        }else{
            this.jcListFF.show(false);
            
            //注意此处会重复之前所有未归档的一次性发放记录
            var restriction = "sc_zfbt_jc.id not in (select ref_id from sc_zfbt_jc_ff where sc_zfbt_jc_ff.is_gd = '1') "
                                + "and sc_zfbt_jc.date_ff < add_months(to_date( " + this.CUR_YYYYMM + ",'yyyymm'),1)";
            this.jcList.restriction = restriction;
            this.jcList.refresh();
            
            var restriction = "sc_zfbt_jc_ff.pay_month='" + this.CUR_YYYYMM + "'";
            var parameters = {
                tableName: 'sc_zfbt_jc_ff',
                fieldNames: toJSON(['sc_zfbt_jc_ff.id', 'sc_zfbt_jc_ff.pay_month']),
                restriction: toJSON(restriction)
            };
            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
            if (result.data.records.length > 0) {
                this.jcList.setTitle(strYM + "  已生成");
                this.jcList.actions.get('file').show(true);
            }else{
                this.jcList.setTitle(strYM + "  未生成");
                this.jcList.actions.get('file').show(false);
            }
        }
    },
    jcList_onSaveFFDetail: function(){
        var controller = this;
        View.confirm("您确定要重新生成发放明细吗?重新生成会覆盖之前未归档的所有发放记录.", function(button){
            if (button == 'yes') {
                controller.doFFJC(controller.CUR_YYYYMM);
                View.showMessage("生成成功!");
                //只需刷新一次性补发tab页
                //controller.doRefreshJcListTab();
                //实质上不用刷新，界面数据一样，只需改下标题即可
                var strYM = controller.CUR_YYYYMM.substring(0, 4) + "年" + controller.CUR_YYYYMM.substring(4, 6) + "月";
                controller.jcList.setTitle(strYM + "    已生成");
                controller.jcList.actions.get('file').show(true);
            }
        });
    },
    doFFJC: function(yyyymm){
        //1.先删除所有未归档的发放记录
        var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt_jc_ff.is_gd", '0', "=");
        var records = this.scZfBtJcFFDs.getRecords(res);
        for(var i=0; i<records.length; i++){
            this.scZfBtJcFFDs.deleteRecord(records[i]);
        }
        
        //2.增加本月的记录
        var date = new Date();
        var items = this.jcList.gridRows.items;
        for(var i = 0; i < items.length; i++){
            var record= new Ab.data.Record();
            record.setValue("sc_zfbt_jc_ff.ref_id", items[i].getFieldValue('sc_zfbt_jc.id'));
            record.setValue("sc_zfbt_jc_ff.em_id", items[i].getFieldValue('sc_zfbt_jc.em_id'));
            record.setValue("sc_zfbt_jc_ff.salary_num", items[i].getFieldValue('sc_zfbt_jc.salary_num'));
            record.setValue("sc_zfbt_jc_ff.em_name", items[i].getFieldValue('sc_zfbt_jc.em_name'));
            record.setValue("sc_zfbt_jc_ff.zw_x", items[i].getFieldValue('sc_zfbt_jc.zw_x'));
            record.setValue("sc_zfbt_jc_ff.zw_y", items[i].getFieldValue('sc_zfbt_jc.zw_y'));
            record.setValue("sc_zfbt_jc_ff.zc_x", items[i].getFieldValue('sc_zfbt_jc.zc_x'));
            record.setValue("sc_zfbt_jc_ff.zc_y", items[i].getFieldValue('sc_zfbt_jc.zc_y'));
            record.setValue("sc_zfbt_jc_ff.btbz_x", items[i].getFieldValue('sc_zfbt_jc.btbz_x'));
            record.setValue("sc_zfbt_jc_ff.btbz_y", items[i].getFieldValue('sc_zfbt_jc.btbz_y'));
            record.setValue("sc_zfbt_jc_ff.area_jc", items[i].getFieldValue('sc_zfbt_jc.area_jc'));
            record.setValue("sc_zfbt_jc_ff.money_bt", items[i].getFieldValue('sc_zfbt_jc.money_bt'));
            
            record.setValue("sc_zfbt_jc_ff.zw_x", items[i].getFieldValue('sc_zfbt_jc.zw_x'));
            record.setValue("sc_zfbt_jc_ff.zw_x", items[i].getFieldValue('sc_zfbt_jc.zw_x'));
            record.setValue("sc_zfbt_jc_ff.zw_x", items[i].getFieldValue('sc_zfbt_jc.zw_x'));
            record.setValue("sc_zfbt_jc_ff.zw_x", items[i].getFieldValue('sc_zfbt_jc.zw_x'));
            record.setValue("sc_zfbt_jc_ff.zw_x", items[i].getFieldValue('sc_zfbt_jc.zw_x'));
            
            record.setValue("sc_zfbt_jc_ff.pay_month", yyyymm);
            record.setValue("sc_zfbt_jc_ff.pay_date", date);
            
            this.scZfBtJcFFDs.saveRecord(record);
        }   
    },
    jcList_onFile: function(){
        var selectedRecordList=this.jcList.getSelectedRecords();
        if(selectedRecordList.length==0){
            View.showMessage('请选择要操作的数据');
            return;
        }
        var controller = this;
        View.confirm("您确定要将这些数据归档吗?归档后不能重新生成当月发放明细", function(button){
            if (button == 'yes') {
                for(var i=0;i<selectedRecordList.length;i++){
                    var record=selectedRecordList[i];
                    var id=record.getValue('sc_zfbt_jc.id');
                    
                    controller.doFileJC(id);
                }
                
                controller.jcList.show(false);
                var res = new Ab.view.Restriction();
                res.addClause("sc_zfbt_jc_ff.pay_month", controller.CUR_YYYYMM, "=");
                controller.jcListFF.refresh(res);
                controller.jcListFF.show(true);
                var strYM = controller.CUR_YYYYMM.substring(0, 4) + "年" + controller.CUR_YYYYMM.substring(4, 6) + "月";
                controller.jcListFF.setTitle(strYM + "  已发放");
            }
        });
    },
    doFileJC: function(id){
        var res = new Ab.view.Restriction();
        res.addClause("sc_zfbt_jc_ff.ref_id", id, "=");
        var record = this.scZfBtJcFFDs.getRecord(res);
        
        record.setValue("sc_zfbt_jc_ff.is_gd",'1');//修改为归档状态
        this.scZfBtJcFFDs.saveRecord(record);
    },
    jcListFF_onFile: function(){
        var selectedRecordList=this.jcListFF.getSelectedRecords();
        if(selectedRecordList.length==0){
            View.showMessage('请选择要操作的数据');
            return;
        }
        var controller = this;
        View.confirm("您确定要将这些数据归档吗?", function(button){
            if (button == 'yes') {
                for(var i=0;i<selectedRecordList.length;i++){
                    var record=selectedRecordList[i];
                    var id=record.getValue('sc_zfbt_jc_ff.ref_id');
                    controller.doFileJC(id);
                }
                controller.jcListFF.refresh();
            }
        });
    },
    jcList_onReport: function(){
        var strYM = this.CUR_YYYYMM.substring(0, 4) + "年" + this.CUR_YYYYMM.substring(4, 6) + "月";
        xmlName= "sc_zfbt_jcff_detail";
        parameters= {
          pyyyymmstr:strYM,
          yyyymm:this.CUR_YYYYMM
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
//        View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
//            width: 470,
//            height: 200,
//            xmlName: "sc_zfbt_jcff_detail",
//            parameters: {
//                pyyyymmstr:strYM,
//                yyyymm:this.CUR_YYYYMM
//            },
//            closeButton: false
//        });
    },
    jcListFF_onReport: function(){
        var strYM = this.CUR_YYYYMM.substring(0, 4) + "年" + this.CUR_YYYYMM.substring(4, 6) + "月";
        xmlName= "sc_zfbt_jcff_detail_ff";
        parameters= {
          pyyyymmstr:strYM,
          yyyymm:this.CUR_YYYYMM
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
//        View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
//            width: 470,
//            height: 200,
//            xmlName: "sc_zfbt_jcff_detail_ff",
//            parameters: {
//                pyyyymmstr:strYM,
//                yyyymm:this.CUR_YYYYMM
//            },
//            closeButton: false
//        });
    }
    
});

/***
 * 生成选择年份月份的下拉框
 * @author Weigw
 * 
 * @parameter
 *  select Dom元素 select,
 *  当前年份  yyyy
 *  当前月份  currentMM
 * */
function newSelectYM(select,yyyy,currentMM){
    select.currentMM = currentMM;
    
    select.options.length=0;
    select.options.add(new Option("<<--","<<--"));
    for(var i=1; i<=12; i++){
        var mm = "";
        if(i < 10){
            mm = "0" + i;
        }else{
            mm = "" + i;
        }
        var str = yyyy + mm;
        select.options.add(new Option(str,str));
    }
    select.options.add(new Option("-->>","-->>"));
    select.selectedIndex = select.currentMM;
    
    if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/8./i)=="8."){ 
        select.attachEvent('onchange', function() {
            var selectVal = select.options[select.selectedIndex].value;
            if(selectVal === "<<--"){
                newSelectYM(select,--yyyy,select.currentMM);
            }else if(selectVal === "-->>"){
                newSelectYM(select,++yyyy,select.currentMM);
            }else{
                var ss = selectVal.substring(4, 6);
                select.currentMM = parseInt(ss);
            }
        });
    }else{
        select.addEventListener('change', function() {
            var selectVal = this.options[this.selectedIndex].value;
            if(selectVal === "<<--"){
                newSelectYM(this,--yyyy,this.currentMM);
            }else if(selectVal === "-->>"){
                newSelectYM(this,++yyyy,this.currentMM);
            }else{
                var ss = selectVal.substring(4, 6);
                this.currentMM = parseInt(ss);
            }
        });
    }
}

/**
 * 验证是否为合法日期
 * 
 * 'YYYYMM'
 * **/
function verifyDateStr(dateStr){
	if(dateStr.length != 6){
		return false;
	}
	if(!/^\d+$/.test(dateStr))//字符串只能以数字组成 
	{ 
	     return false;
	}
	var mm = dateStr.substr(4,2);
	if(parseInt(mm)>0 && parseInt(mm)<=12){
		return true;
	}else{
		return false;
	}
}


