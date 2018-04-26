var ascBjUsmsZZFProtocalInputTabController = View.createController("ascBjUsmsZZFProtocalInputTabController", {

    //main tab object , used here for store some globle varible
	tabs: null,
    aprotocalRmRecords:null,
    rentStd:null,//当前租金标准
    
    afterInitialDataFetch: function(){
    	
    	$('apply').disabled = true;
		$('print').disabled = true;
		$('labelForSQH').textContent = "申请号:";
		$('apply').value = "申请";
		$('print').value = "打印";
		$('back').value = "返回";
		
    	this.initApplyNo();//生成申请序号	
    },
    /**
     * 返回到首页
     * */
    onBack: function(){
    	this.tabs = View.getControlsByType(parent, 'tabs')[0];
    	 View.getWindow('parent').View.setTitle("创建申请");
         var tabName = 'selectTab';
        /* var tab = this.tabs.findTab(tabName);
         tab.loadView();*/
         this.tabs.selectTab(tabName);
    },
    /**
     * 计算租期
     * */
    calculateDate: function(){
    	var dateBegin = this.step1.getFieldValue("bh_zzf_protocal.date_begin").replace(/-/g,"/") + " 00:00:00";
    	var dateEnd = this.step1.getFieldValue("bh_zzf_protocal.date_end").replace(/-/g,"/") + " 00:00:00";
    	var begin = new Date(dateBegin);
    	var end = new Date(dateEnd);
    	
    	var days = (end.getTime() - begin.getTime())/(3600000 * 24) + 1;
    	if(days > 0){
    		this.step1.setFieldValue("bh_zzf_protocal.live_time",days);
    		$('apply').disabled = false;
    		$('print').disabled = false;
    	}else{
    		if( !isNaN(days) ){
    			this.step1.setFieldValue("bh_zzf_protocal.live_time",days);
    		}
    		$('apply').disabled = true;
    		$('print').disabled = true;
//    		alert("租期时间错误");
    	}  
    },
    /**
     * 自动生成申请序号
     * */
    initApplyNo: function(){
    	var myDate = new Date();
    	var yyyy = myDate.getFullYear();
    	var mm = myDate.getMonth() + 1;
    	if(mm < 10){
    		mm = '0' + mm;
    	}
    	var prefix = "XYSQ" + yyyy + mm;
    	
    	var restriction = new Ab.view.Restriction();
        restriction.addClause('bh_zzf_protocal.protocal_sq_id', prefix, "like");
        
        var records = this.ascBjUsmsProcAsgnCreateReqBasicInputTabFormDS.getRecords(restriction);
        if(records.length > 0){
        	var lastSqNum = records[records.length - 1].getValue("bh_zzf_protocal.protocal_sq_id");
        	var lsh = parseInt(lastSqNum.substring(10)) + 1;

        	if(lsh < 10){
        		lsh = '00' + lsh;
        	}else if(lsh < 100){
        		lsh = '0' + lsh;
        	}
        	
        	$('protocal_sq_id').value = prefix + lsh;
        }else{
        	var newSqNum = prefix + '001';
        	$('protocal_sq_id').value = newSqNum;
        }
    },
    /**
     * 添加协议房
     * */
    step2_onAdd: function(){
    	
    	//选择过的不重复出现
    	var recordNum = this.step2.gridRows.items.length;
    	var sql = null;
    	if(recordNum > 0){
    		sql = "rm.bl_id||'-'||rm.fl_id||'-'||rm.rm_id not in(";
    		for(var i=0; i<recordNum; i++ ){
    			sql += ("'" + this.step2.gridRows.items[i].getFieldValue("bh_zzf_protocal_rm.bl_id") + "-");
    			sql += (this.step2.gridRows.items[i].getFieldValue("bh_zzf_protocal_rm.fl_id") + "-");
    			sql += (this.step2.gridRows.items[i].getFieldValue("bh_zzf_protocal_rm.rm_id") + "',");
        	}
    		sql = sql.substr(0,(sql.length - 1)) + ")";
    	}
    	
    	View.openDialog('asc-bj-usms-zzf-protocal-apply-select-rm-dialog.axvw', null, true, {
            width: 1024,
            height: 800,
            sqlStr: sql,
            closeButton: false,
            afterInitialDataFetch: function(dialogView){        	
                var dialogController = dialogView.controllers.get('abBjUsmsZZFSelectRmDialogController');
                dialogController.openerController = ascBjUsmsZZFProtocalInputTabController;
                dialogController.rentStd = ascBjUsmsZZFProtocalInputTabController.rentStd;
                if(ascBjUsmsZZFProtocalInputTabController.rentStd != null){
                	dialogController.typeCouldChange = false;
                }else{
                	dialogController.typeCouldChange = true;
                }
                
                var sql  = dialogController.view.parameters['sqlStr'];
                if(sql != null){
                	dialogController.selectXYRmGrid.addParameter('selectedRm',sql);
                	dialogController.selectXYRmGrid.refresh();
                }
            }
        });
    },
    /**
     * 将添加的协议房显示到界面上
     * */
    showSelectedProtocalRm: function(aprotocalRmRecords){
    	for(var i=0; i < aprotocalRmRecords.length ;i++){
    		var bl_id = aprotocalRmRecords[i]['rm.bl_id'];
    		var fl_id = aprotocalRmRecords[i]['rm.fl_id'];
    		var rm_id = aprotocalRmRecords[i]['rm.rm_id'];
    		var area_jianZhu = aprotocalRmRecords[i]['rm.area'];
    		var area_rm = aprotocalRmRecords[i]['rm.area_manual'];
    		var area_xy = aprotocalRmRecords[i]['rm.area_manual'];
    		var bl_name = aprotocalRmRecords[i]['bl.name'];
    		var protocal_rm_type = aprotocalRmRecords[i]['rm.protocal_rm_type'];
    		
    		var record= new Ab.data.Record();
    		
    		record.setValue("bh_zzf_protocal_rm.bl_id", bl_id);
    		record.setValue("bh_zzf_protocal_rm.fl_id", fl_id);
    		record.setValue("bh_zzf_protocal_rm.rm_id", rm_id);
    		record.setValue("bh_zzf_protocal_rm.area_jianZhu", area_jianZhu);
    		record.setValue("bh_zzf_protocal_rm.area_rm", area_rm);
    		record.setValue("bh_zzf_protocal_rm.area_xy", area_xy);
    		record.setValue("rm.protocal_rm_type", protocal_rm_type);
    		record.setValue("bl.rent_std", this.rentStd);
    		
    		record.setValue("bl.name", bl_name);
    		this.step2.addGridRow(record);
    	}
    	this.step2.update();
    },
    /**
     * 自动计算协议总面积与租金单价
     * */
    step2_afterRefresh: function(){
    	//1.设置租金标准
    	this.step3.setFieldValue("bh_zzf_protocal.price_rent_std",this.rentStd);
    	//2.计算协议总面积
    	var totalProtocalArea = this.calculateTotalProtocalArea();
    	this.step3.setFieldValue("bh_zzf_protocal.area_protocal",totalProtocalArea);
    	//3.计算租金总价与单价
    	this.calculateRentFee();
    },
    /**
     * 计算协议总面积
     * */
    calculateTotalProtocalArea: function(){
    	var totalProtocalArea = 0;
    	var recordNum = this.step2.gridRows.items.length;
    	for(var i=0; i<recordNum; i++ ){
    		totalProtocalArea += parseFloat(this.step2.gridRows.items[i].getFieldValue("bh_zzf_protocal_rm.area_xy"));
    	}
    	return totalProtocalArea;
    },
    /**
     * 
     * 计算租金总价与单价
     * */
    calculateRentFee: function(){
    	var live_time = this.step1.getFieldValue("bh_zzf_protocal.live_time");
    	if(live_time == "" || live_time == null){
    		return;
    	}else{
    		live_time = parseFloat(live_time);
    	}
    	var rentedArea = parseFloat(this.step3.getFieldValue("bh_zzf_protocal.area_rent")); //已租用的
    	var totalProtocalArea = parseFloat(this.step3.getFieldValue("bh_zzf_protocal.area_protocal"));//本协议总面积
    	var rentStd = this.step3.getFieldValue("bh_zzf_protocal.price_rent_std");
    	
    	if(rentStd == "null"){
    		return;
    	}
    	//获取协议标准
    	var restriction = new Ab.view.Restriction();
		restriction.addClause("bh_zzf_rent_std_detail.rent_std",rentStd,"=");
		
		var totalFee = 0.0;// 日租金总价
		
		var records = this.rentStdDetailDs.getRecords(restriction);
		var begin = 0.0;
		var end = 0.0;
		var fee = 0.0;
		
		/**
		 * 阶梯计算公式
		 * */
		if(records.length > 0){
			for(var i=0; i<records.length; i++){
				
				fee = parseFloat(records[i].getValue("bh_zzf_rent_std_detail.fee"));
				begin = parseFloat(records[i].getValue("bh_zzf_rent_std_detail.area_begin"));
				if(9999999 == parseFloat(records[i].getValue("bh_zzf_rent_std_detail.area_end"))){//表示分段计算到最后一价格区间
					
					if(rentedArea >= begin){//表示此协议面积都在最后一个价格区间
						totalFee += totalProtocalArea * fee;
						break;
					}else{//表示本协议面积一部分在之前价格区间也参与计算
						totalFee += ((totalProtocalArea + rentedArea) - begin) * fee;
						break;
					}
				}else{
					end = parseFloat(records[i].getValue("bh_zzf_rent_std_detail.area_end"));
				}
				if(rentedArea >= end){//此价格区间不参与计算
					continue;
				}
				
				if((totalProtocalArea + rentedArea) <= begin){//此价格区间之后所有价格区间（包含此价格区间）不参与计算
					break;
				}
				
				if(rentedArea > begin){//结合之前条件(rentedArea < end)
					totalFee += (end - rentedArea) * fee;
				}else{
					if((totalProtocalArea + rentedArea) > end){
						totalFee += (end - begin) * fee;
					}else{//表示本次协议面积已参与计算完成
						totalFee += ((totalProtocalArea + rentedArea) - begin) * fee;
						break;
					}
				}
					
			}
			//获取总价
			this.step3.setFieldValue("bh_zzf_protocal.price_total_rent",(totalFee * live_time).toFixed(2));//总价  = （日总价） * 天数
			
			//获取单价
			this.step3.setFieldValue("bh_zzf_protocal.price_rent",(totalFee/totalProtocalArea).toFixed(2));
		}else{
			alert("租金标准未定义");
		}
    },
    /**
     * 删除所选的建筑物
     * */
    step2_delete_onClick:function(row){
		this.step2.removeGridRow(row.getIndex());
		this.step2.update();
		var recordNum = this.step2.gridRows.items.length;
    	if(recordNum == 0){
    		this.rentStd = null;
    	}
	},
	/**
	 * 提交申请:
	 *    1.保存协议,并返回协议ID
	 * 	  2.保存协议与建筑物关系
	 * 	  3.把协议id存入流程主表
	 * 	  4.显示历史记录
	 * */
    submitApply: function(){
    	//1.保存协议,并返回协议ID
    	var protocal_id = this.saveProtocal();
    	if(protocal_id == null){
    		alert("协议生成失败!");
    		return;
    	}
    	//2.保存协议建筑物信息
    	this.saveProtocalRm(protocal_id);
    	//3.把协议id存入流程主表
    	var activityLogId = this.saveWorkFlow(protocal_id);
    	//4.显示历史记录
    	this.showHistoryPanel(activityLogId);
    	
    	alert("协议保存成功! 任务Id:" + activityLogId + "协议Id:" + protocal_id  );
    },
    /**
     * 把协议id存入流程主表
     * */
    saveWorkFlow:function(protocal_id){
    	 var record = {};
	     var ds = this.activityLogDs;
	     record['activity_log.activity_log_id'] = "";
	     record['activity_log.prob_type'] = "房屋协议管理";
	     record['activity_log.activity_type'] = "房屋协议管理-周转房";
	     record['activity_log.protocal_id'] = protocal_id;
	     record['activity_log.requestor'] = View.user.name;
  
	 	var activityLogId = null;
        try {
            result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', 0, record);
            if (result.code == 'executed') {
                //get activity_log_id from result 
            	activityLogId=eval('(' + result.jsonExpression + ')').activity_log_id;
                return activityLogId;
            }
            else {
                return activityLogId;
            }
        } 
        catch (e) {
            Workflow.handleError(e);
            return activityLogId;
        }
    },
    /**
     * 保存协议建筑物信息
     * 
     * */
    saveProtocalRm: function(protocal_id){

    	var items = this.step2.gridRows.items;
    	for(var i = 0; i < items.length; i++){
    		
    		var record= new Ab.data.Record();
    		
    		record.setValue("bh_zzf_protocal_rm.protocal_id", protocal_id);
    		record.setValue("bh_zzf_protocal_rm.bl_id", items[i].getFieldValue('bh_zzf_protocal_rm.bl_id'));
    		record.setValue("bh_zzf_protocal_rm.fl_id", items[i].getFieldValue('bh_zzf_protocal_rm.fl_id'));
    		record.setValue("bh_zzf_protocal_rm.rm_id", items[i].getFieldValue('bh_zzf_protocal_rm.rm_id'));
    		record.setValue("bh_zzf_protocal_rm.area_jianZhu", items[i].getFieldValue('bh_zzf_protocal_rm.area_jianZhu'));
    		record.setValue("bh_zzf_protocal_rm.area_rm", items[i].getFieldValue('bh_zzf_protocal_rm.area_rm'));
    		record.setValue("bh_zzf_protocal_rm.area_xy", items[i].getFieldValue('bh_zzf_protocal_rm.area_xy'));
//    		record.setValue("bh_zzf_protocal_rm.is_active", '1');//协议默认是有效的
    		
    		this.rentalAgreementRoomDS.saveRecord(record);
    	}	
    },
    /**
     * 保存协议信息
     * */
    saveProtocal: function(){
    	var protocal_id = null;
    	
    	var totalFee = parseFloat(this.step3.getFieldValue("bh_zzf_protocal.price_total_rent"));
    	if(totalFee <= 0){
    		alert("协议有问题，租金总价应大于零,请修改协议");
    		return protocal_id;
    	}
    	if(this.step3.canSave()){
    		this.step3.setFieldValue("bh_zzf_protocal.protocal_sq_id",$('protocal_sq_id').value);
    		
    		var date_begin = this.step1.getFieldValue("bh_zzf_protocal.date_begin");
    		var date_end = this.step1.getFieldValue("bh_zzf_protocal.date_end");
    		var live_time = this.step1.getFieldValue("bh_zzf_protocal.live_time");
    		
    		this.step3.setFieldValue("bh_zzf_protocal.date_begin",date_begin);
    		this.step3.setFieldValue("bh_zzf_protocal.date_end",date_end);
    		this.step3.setFieldValue("bh_zzf_protocal.live_time",live_time);
    		
    		this.step3.save();
    		
    		//获取协议标准
        	var restriction = new Ab.view.Restriction();
    		restriction.addClause("bh_zzf_protocal.protocal_sq_id",$('protocal_sq_id').value,"=");
    		
    		var record = this.ascBjUsmsProcAsgnCreateReqBasicInputTabFormDS.getRecord(restriction);
    		
    		protocal_id = record.getValue("bh_zzf_protocal.protocal_id");
    		
    		return protocal_id;
    	}
    },
    
    /**
     * 显示历史
     * */
    showHistoryPanel: function(activityLogId){
        var historyPanel = this.stepHistoryPanel;
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation', 'activity_log', 'activity_log_id',activityLogId);
            
            var apps = eval('(' + result.jsonExpression + ')');
            if (apps.length == 0) {
                historyPanel.show(false);
            }
            else {
                historyPanel.show(true);
                var restriction = new Ab.view.Restriction();
                if (apps.length == 1) {
                    restriction.addClause('helpdesk_step_log.step_log_id', apps[0].step_log_id, "=");
                }
                else {
                    restriction.addClause('helpdesk_step_log.step_log_id', apps[0].step_log_id, "=", ")AND(");
                    for (var i = 1, app; app = apps[i]; i++) {
                        restriction.addClause('helpdesk_step_log.step_log_id', app.step_log_id, "=", "OR");
                    }
                }
                historyPanel.refresh(restriction);
                //刷新历史记录面板
            	reloadHistoryPanel(historyPanel);
            }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
    }
});

/**
 * 选择负责人（乙方）后，
 *   1.自动带出乙方当前已租面积
 * 
 *   2.自动带出本责任人最后一条协议下的 协议房地址
 * */
function setRentedArea(fieldName, newValue, oldValue){
	if (fieldName == 'bh_zzf_protocal.party_b_rep') {
		var emId = newValue;
		
		var controller = ascBjUsmsZZFProtocalInputTabController;
		var restriction = new Ab.view.Restriction();
		restriction.addClause("bh_zzf_protocal.party_b_rep",emId,"=");
		restriction.addClause("bh_zzf_protocal.is_active","1","=");
		
		var records = controller.ascBjUsmsProcAsgnCreateReqBasicInputTabFormDS.getRecords(restriction);
		if(records.length > 0){
			var rentArea = 0;
			for(var i=0; i<records.length; i++){
				rentArea += parseFloat(records[i].getValue("bh_zzf_protocal.area_protocal"));
			}
			//1.自动带出乙方当前已租面积
			controller.step3.setFieldValue("bh_zzf_protocal.area_rent",rentArea);
			//2.自动带出本责任人最后一条协议下的 协议房地址
			controller.step3.setFieldValue("bh_zzf_protocal.rm_address",records[records.length - 1].getValue("bh_zzf_protocal.rm_address"));
			
			controller.calculateRentFee();//重新计算总租金
		}
	}
}

/**
 * 刷新申请历史
 * */

function reloadHistoryPanel(historyPanel){
    var rows = historyPanel.rows;
    
    var datetime = "";
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var user = "";
        if (row['helpdesk_step_log.user_name']) 
            user = row['helpdesk_step_log.user_name'];
        if (row['em.name']) 
            user = row['em.name'];
        if (row['helpdesk_step_log.vn_id']) 
            user = row['helpdesk_step_log.vn_id'];
        row['helpdesk_step_log.vn_id'] = user;
        
        if (row["helpdesk_step_log.date_response"] == "" && row["helpdesk_step_log.time_response"] == "") {
            datetime = '下一步>>';
        }
        else {
            datetime = row["helpdesk_step_log.date_response"] + " " + row["helpdesk_step_log.time_response"];
        }
        row['helpdesk_step_log.date_response'] = datetime;

		if(row['afm_wf_steps.step'] == '基础'){
			if(i==0){
				row['afm_wf_steps.step'] = '申请人提交申请';
			}else{
				row['afm_wf_steps.step'] = '';
			}
		}
    }
    historyPanel.reloadGrid();
}




