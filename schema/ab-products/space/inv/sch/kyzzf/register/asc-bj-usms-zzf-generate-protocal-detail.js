var ascBjUsmsZZFProtocalInputTabController = View.createController("ascBjUsmsZZFProtocalInputTabController", {
	tabs: null,
    aprotocalRmRecords:null,
    rentStd:null,//当前租金标准
    applyBtn:null,
    printBtn:null,
    partyBResp:null,
    protocalId:null,
    applyUser:null,
    partyBDv:"",
    applyTableRecord:null,
    afterViewLoad:function(){
    	this.applyBtn=this.step2.actions.get('saveAndGenerateProtocal');
		this.printBtn=this.step2.actions.get('print');
		
    },
    afterInitialDataFetch: function(){
    	this.tabs = View.getControlsByType(parent, 'tabs')[0];
    	this.applyTableRecord=this.getInitAppliedRecord();
    	this.setInitProtocalRecord(this.applyTableRecord);
    	this.applyUser=	this.protocalForm.getFieldValue('bh_zzf_protocal.party_b_rep');
    	setRentedArea(this.applyUser);
    	this.initPartyAInfoMation();
    },
    setInitProtocalRecord:function(record){
    	this.partyBResp=record.getLocalizedValue('bh_zzf_apply.em_apply');
    	this.partyBDv=record.getLocalizedValue('bh_zzf_apply.em_dv')

    	var emName=dataService.getEmName(this.partyBResp);
		var dvName=dataService.getDvName(this.partyBDv);
    	this.protocalForm.setFieldValue('bh_zzf_protocal.protocal_sq_id',record.getLocalizedValue('bh_zzf_apply.zzf_sq_id'));
    	this.protocalForm.setFieldValue('bh_zzf_protocal.date_begin',record.getLocalizedValue('bh_zzf_apply.date_begin'));
    	this.protocalForm.setFieldValue('bh_zzf_protocal.date_end',record.getLocalizedValue('bh_zzf_apply.date_end'));
    	this.protocalForm.setFieldValue('bh_zzf_protocal.party_b_rep',this.partyBResp);
    	this.protocalForm.setFieldValue('bh_zzf_protocal.party_b_rep_tel',record.getLocalizedValue('bh_zzf_apply.em_mobile'));
    	this.protocalForm.setFieldValue('bh_zzf_protocal.party_b_rep_dv',this.partyBDv);
    	this.protocalForm.setFieldValue('bh_zzf_protocal.party_b_rep_email',record.getLocalizedValue('bh_zzf_apply.em_email'));
    	this.protocalForm.setFieldValue('em.name',emName);
    	this.protocalForm.setFieldValue('dv.dv_name',dvName);
        this.calculateDate();
        setRentedArea(this.partyBResp);
    },
    getInitAppliedRecord:function(){
    	   var restriction = new Ab.view.Restriction();
    	   restriction.addClause('bh_zzf_apply.zzf_sq_id', this.tabs.requestNumber);
    	   return this.applyTableDs.getRecord(restriction);
    },
    calculateDate: function(){
    	var dateBegin = this.protocalForm.getFieldValue("bh_zzf_protocal.date_begin").replace(/-/g,"/") + " 00:00:00";
    	var dateEnd = this.protocalForm.getFieldValue("bh_zzf_protocal.date_end").replace(/-/g,"/") + " 00:00:00";
    	var begin = new Date(dateBegin);
    	var end = new Date(dateEnd);
    	
    	var days = (end.getTime() - begin.getTime())/(3600000 * 24) + 1;
    	if(days > 0){
    		this.protocalForm.setFieldValue("bh_zzf_protocal.live_time",days);
    		this.applyBtn.enableButton(true);
    		this.printBtn.enableButton(true);
    	}else{
    		if( !isNaN(days) ){
    			this.protocalForm.setFieldValue("bh_zzf_protocal.live_time",days);
    		}
     		this.applyBtn.enableButton(false);
    		this.printBtn.enableButton(false);
    	}  
    },
    step2_onPrint:function(){
    	var protocalId=this.protocalForm.getFieldValue("bh_zzf_protocal.protocal_id");
    	if(protocalId==""){
    		View.showMessage("请先生成协议");
    		return ;
    	}
    	View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
            width: 470,
            height: 200,
            xmlName: "zzfprotocal",
            parameters: {
            	'aProtocal':protocalId
            },
            closeButton: false
        });
  
    },
    step2_onAdd: function(){
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
    		var area_rm = aprotocalRmRecords[i]['rm.area_fcz'];
    		var area_xy = aprotocalRmRecords[i]['rm.area'];
    		var bl_name = aprotocalRmRecords[i]['bl.name'];
    		var protocal_rm_type = aprotocalRmRecords[i]['rm.protocal_rm_type.raw'];
    		
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
    	var items = this.step2.gridRows.items;
    	if(items.length>0){
    		this.applyBtn.enableButton(true);
    		this.printBtn.enableButton(true);
    	}
    	//1.设置租金标准
    	this.protocalForm.setFieldValue("bh_zzf_protocal.price_rent_std",this.rentStd);
    	//2.计算协议总面积
    	var totalProtocalArea = this.calculateTotalProtocalArea();
    	this.protocalForm.setFieldValue("bh_zzf_protocal.area_protocal",totalProtocalArea);
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
    	return totalProtocalArea.toFixed(2);
    },
    /**
     * 
     * 计算租金总价与单价
     * */
    calculateRentFee: function(){
    	var live_time = this.protocalForm.getFieldValue("bh_zzf_protocal.live_time");
    	if(live_time == "" || live_time == null){
    		return;
    	}else{
    		live_time = parseFloat(live_time);
    	}
    	var rentedArea = parseFloat(this.protocalForm.getFieldValue("bh_zzf_protocal.area_rent")); //已租用的
    	var totalProtocalArea = parseFloat(this.protocalForm.getFieldValue("bh_zzf_protocal.area_protocal"));//本协议总面积
    	var rentStd = this.protocalForm.getFieldValue("bh_zzf_protocal.price_rent_std");
    	
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
			totalProtocalArea + rentedArea * fee;
			var totalResult;
			var priceResult;
			if(totalProtocalArea!=0){
				totalResult=(totalFee * live_time).toFixed(2);
				priceResult=(totalFee/totalProtocalArea).toFixed(2);
			}else{
				totalResult=0;
				priceResult=0;
			}
			//获取总价
			this.protocalForm.setFieldValue("bh_zzf_protocal.price_total_rent",totalResult);//总价  = （日总价） * 天数
			
			//获取单价
			this.protocalForm.setFieldValue("bh_zzf_protocal.price_rent",priceResult);
		}else{
			View.alert("租金标准未定义");
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
	step2_modify_onClick:function(row){
		var controller=this;
		  View.prompt("修改协议面积", "请输入新的协议面积", function(button, text) {
	            if (button == 'ok') {
	            	var currentIndex=row.getIndex();
	            	var record=row.getRecord();
	            	controller.step2.removeGridRow(currentIndex);
	    			record.setValue("bh_zzf_protocal_rm.area_xy",text);
	    			controller.step2.addGridRow(record,currentIndex);
	    			controller.step2.update();
	            }
	        });
			
		},
    /**
     * 保存协议建筑物信息
     * 
     * */
    saveProtocalRm: function(protocal_id){

    	var items = this.step2.gridRows.items;
    	if(items.length==0){
    		View.showMessage('协议房不能为空');
    		return false;
    	}
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
    		this.protocalRmDs.saveRecord(record);
    	}	
    	return true;
    },
    /**
     * 保存协议信息
     * */
    step2_onSaveAndGenerateProtocal: function(){
    	var totalFee = parseFloat(this.protocalForm.getFieldValue("bh_zzf_protocal.price_total_rent"));
    	if(totalFee <= 0){
    		View.showMessage("协议有问题，租金总价应大于零,请修改协议");
    		return;
    	}
    	if(this.protocalForm.canSave()){
    		var result =this.protocalForm.save();
    		if(result){
    			this.protocalId=this.protocalForm.getFieldValue("bh_zzf_protocal.protocal_id")
    			var flag=this.saveProtocalRm(this.protocalId);
    			if(flag){
    				this.feesInfo.show(true);
        			View.showMessage("协议生成成功!协议编号为:<font color='red'>【" + this.protocalId+"】</font>,请点击【计算应付租金】 生成租金信息");
        			this.applyBtn.enableButton(false);
        			this.step2.actions.get('add').enableButton(false);
        			this.printBtn.enableButton(true);
        			jQuery('#protocalForm input').attr("disabled","disabled");
        			jQuery('#protocalForm textarea').attr("disabled","disabled");
        	    	jQuery('#protocalForm select').attr("disabled","disabled");
        			jQuery('#step2 input:button').attr("disabled","disabled");
        			this.afterAllupdateProtocalApplyTableStatus();
    			}
    	
    		}else{
    			View.showMessage("不能成功生成协议");
    		}
    	}
    },
    feesInfo_onShowFees: function(){
    	var Fees = this.cauculateFees();//按第二种计算方式计算金额
    	var contactPeople = this.protocalForm.getFieldValue('bh_zzf_protocal.party_b_contacts');
    	var contactPeopleTel = this.protocalForm.getFieldValue('bh_zzf_protocal.party_b_con_tel');
    	this.feesInfo.clearGridRows();
    	for(var i=0; i < Fees.length ;i++){
    		var record= new Ab.data.Record();
    		
    		record.setValue("bh_zzf_fees.should_fees_date", Fees[i].payDate);
			record.setValue("bh_zzf_fees.end_date",Fees[i].payEnd);
    		record.setValue("bh_zzf_fees.should_fees_money", Fees[i].payFee);
    		record.setValue("bh_zzf_fees.party_contacts", contactPeople);
    		record.setValue("bh_zzf_fees.party_contacts_tel", contactPeopleTel);  		
    		this.feesInfo.addGridRow(record);
    	}
    	this.feesInfo.update();
    	
    	var flag=this.feesInfoSave();
    	if(flag){
    		this. feesInfo.actions.get('showFees').enableButton(false);
    		View.showMessage("成功生成应付租金")
    	}
    },
    /**
     * 计算方式1:
     *    按天进行计算、每个支付周期对应的天数不同，所以金额也不同
     * 
     * 根据支付周期自动计算应付租金
     * 
     * pay_period:[0;季付;1;半年付;2;年付]
     * 
     * @returns arry{object,object}
     * 
     * */
    cauculateFees: function(){
    	var arry = new Array();
    	
    	var pay_period = this.protocalForm.getFieldValue('bh_zzf_protocal.pay_period');
    	var tatalFee = this.protocalForm.getFieldValue('bh_zzf_protocal.price_total_rent');
    	
    	var date_begin = this.protocalForm.getFieldValue('bh_zzf_protocal.date_begin');
    	var date_end = this.protocalForm.getFieldValue('bh_zzf_protocal.date_end');
    	var live_time = this.protocalForm.getFieldValue('bh_zzf_protocal.live_time');
    	
    	var interval = 0;//付款间隔
    	if(pay_period == 0){//季付[每三个月付一次]
    		interval = 3;
    	}else if(pay_period == 1){//半年付
    		interval = 6;
    	}else if(pay_period == 2){//年付
    		interval = 12;
    	}
    	
		var payBegin = date_begin;
		var payEnd = null;
		var activityTime = live_time;
		var i = 0;
		do {
			var arr = payBegin.split("-");
			var yyyy = parseInt(arr[0]);
			var mm = parseInt(arr[1]);
			var dd = parseInt(arr[2]);
			if((mm + interval) <= 12){// 修改bug计算月份的时候逻辑不对
				mm += interval;
			}else{
				mm = mm + interval - 12;
				yyyy += 1;
			}
			if(mm < 10){
				mm = "0" + mm;
			}
			
			var payEnd = yyyy + "-" + mm + "-" + dd;
			//根据时间戳计算缴费天数
			payDays = this.getPayDate(payBegin,payEnd);
			
			if((activityTime - payDays) > 0){
				arry[i++] = new feeRecord(payBegin,payEnd,((tatalFee/live_time) * payDays).toFixed(2));
    			activityTime -= payDays;
    			payBegin = payEnd;
			}else{
    			arry[i++] = new feeRecord(payBegin,date_end,((tatalFee/live_time) * activityTime).toFixed(2));
    			break;
			}	
		}while(activityTime > 0);
		
		return arry;
    },
    /**
     * 计算方式2:
     *    忽略每个支付周期的具体时间间隔(n天)，按支付周期进行计算
     * 
     * 根据支付周期自动计算应付租金
     * 
     * pay_period:[0;季付;1;半年付;2;年付]
     * 
     * @returns arry{object,object}
     * 
     * */
//    cauculateFees2: function(){
//    	var arry = new Array();
//    	
//    	var pay_period = this.protocalForm.getFieldValue('bh_zzf_protocal.pay_period');
//    	var tatalFee = this.protocalForm.getFieldValue('bh_zzf_protocal.price_total_rent');
//    	
//    	var date_begin = this.protocalForm.getFieldValue('bh_zzf_protocal.date_begin');
//    	var date_end = this.protocalForm.getFieldValue('bh_zzf_protocal.date_end');
//    	
//    	var interval = 0;//付款间隔
//    	if(pay_period == 0){//季付[每三个月付一次]
//    		interval = 3;
//    	}else if(pay_period == 1){//半年付
//    		interval = 6;
//    	}else if(pay_period == 2){//年付
//    		interval = 12;
//    	}
//    	
//		var payBegin = date_begin;
//		var payEnd = null;
//		
//		var months = this.getMoths(date_begin,date_end);
//		var payCount = Math.ceil(months/interval);//向上取整
//		
//		var avgRentP = (tatalFee/payCount).toFixed(2);//平均每周期的应缴费额
//		var FistPay = (tatalFee - avgRentP * (payCount - 1)).toFixed(2);//第一个支付周期的金额
//		
//		var i = 0;
//		for(var i=0; i < payCount; i++){
//			var arr = payBegin.split("-");
//			var yyyy = parseInt(arr[0]);
//			var mm = parseInt(arr[1]);
//			var dd = parseInt(arr[2]);
//			
//			if((mm + interval) <= 12){
//				mm += interval;
//			}else{
//				mm = mm + interval - 12;
//				yyyy += 1;
//			}
//			
//			if(mm < 10){
//				mm = "0" + mm;
//			}
//			
//			var payEnd = yyyy + "-" + mm + "-" + dd;
//			
//			if(i == 0){
//				arry[i] = new feeRecord(payBegin,payEnd,FistPay);
//    			payBegin = payEnd + 1;
//			}else{
//    			arry[i] = new feeRecord(payBegin,date_end,avgRentP);
//    			payBegin = payEnd;
//			}	
//		}
//		
//		return arry;
//    },
    /**
     * 返回两个日期之间的月数
     * */
    getMoths: function(dateBegin,dateEnd){
    	var beginArr = dateBegin.split("-");
    	var endArr = dateEnd.split("-");
    	
        var months = (parseInt(endArr[0]) - parseInt(beginArr[0])) * 12 + (parseInt(endArr[1]) - parseInt(beginArr[1]));
        return months;
    },
    /**
     * 根据时间戳来计算缴费天数
     * 
     * */
    getPayDate: function(dateBegin,dateEnd){
    	dateBegin = dateBegin.replace(/-/g,"/") + " 00:00:00";
    	dateEnd = dateEnd.replace(/-/g,"/") + " 00:00:00";
    	
    	var begin = new Date(dateBegin);
    	var end = new Date(dateEnd); 
    	
    	return days = (end.getTime() - begin.getTime())/(3600000 * 24) + 1;
    },
    /**
     * 查看负责人下已租赁的房间信息
     * 
     * */
    protocalForm_onCheckRentedRoom: function(){
    	var party_b_rep = this.protocalForm.getFieldValue('bh_zzf_protocal.party_b_rep');
    	View.openDialog('asc-bj-usms-zzf-protocal-dj-check-protocal-rm-dialog.axvw', null, true, {
            width: 1024,
            height: 800,
            closeButton: false,
            title: "申请人[" + party_b_rep + "]已租赁的房屋",
            afterInitialDataFetch: function(dialogView){  
            	var dialogController = dialogView.controllers.get('abBjUsmsZZFProtocalDjCheckRmDialogController');
            	dialogController.protocalRm.addParameter("partyBRepId", party_b_rep);
            	dialogController.protocalRm.refresh();
            }    
                
        });
    	
    },
    dateToString: function(date){
        
        return str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        
    },
    feesInfoSave: function(){
    	var items = this.feesInfo.gridRows.items;
    	for(var i = 0; i < items.length; i++){
    		
    		var record= new Ab.data.Record();
    		
    		record.setValue("bh_zzf_fees.protocal_id", this.protocalId);
    		record.setValue("bh_zzf_fees.should_fees_date", items[i].getFieldValue('bh_zzf_fees.should_fees_date'));
    		record.setValue("bh_zzf_fees.should_fees_money", items[i].getFieldValue('bh_zzf_fees.should_fees_money'));
    	    record.setValue("bh_zzf_fees.end_date", items[i].getFieldValue('bh_zzf_fees.end_date'));
    		record.setValue("bh_zzf_fees.party_contacts", items[i].getFieldValue('bh_zzf_fees.party_contacts'));
    		record.setValue("bh_zzf_fees.party_contacts_tel", items[i].getFieldValue('bh_zzf_fees.party_contacts_tel'));
    		
    		this.zzf_fees_ds.saveRecord(record);
    	}	
    	return true;
    },
    initPartyAInfoMation:function(){
    	var records=this.partyADs.getRecords();
    	if(records.length>=1){
    		var record=records[0];
    		this.protocalForm.setFieldValue('bh_zzf_protocal.party_a',record.getValue('bh_zzf_protocal.party_a'));
        	this.protocalForm.setFieldValue('bh_zzf_protocal.party_a_con_tel',record.getValue('bh_zzf_protocal.party_a_con_tel'));
        	this.protocalForm.setFieldValue('bh_zzf_protocal.party_a_contacts',record.getValue('bh_zzf_protocal.party_a_contacts'));
        	this.protocalForm.setFieldValue('bh_zzf_protocal.party_a_rep',record.getValue('bh_zzf_protocal.party_a_rep'));
        	this.protocalForm.setFieldValue('bh_zzf_protocal.party_a_rep_dv',record.getValue('bh_zzf_protocal.party_a_rep_dv'));
        	this.protocalForm.setFieldValue('bh_zzf_protocal.party_a_rep_email',record.getValue('bh_zzf_protocal.party_a_rep_email'));
        	this.protocalForm.setFieldValue('bh_zzf_protocal.party_a_rep_tel',record.getValue('bh_zzf_protocal.party_a_rep_tel'));
    	}
    },
    afterAllupdateProtocalApplyTableStatus:function(){
    	//已生成协议
    	var status="ysc";
    	this.applyTableRecord.setValue("bh_zzf_apply.status",status);
    	this.applyTableDs.saveRecord(this.applyTableRecord);
    	View.getControlsByType(parent, 'tabs')[0].appliedPanel.refresh();
    }
   
});

/**
 * 选择负责人（乙方）后，
 *   1.自动带出乙方当前已租面积
 *   2.自动带出本责任人最后一条协议下的 协议房地址
 * */
function setRentedArea(emId){
		var controller = ascBjUsmsZZFProtocalInputTabController;
		var restriction = new Ab.view.Restriction();
		restriction.addClause("bh_zzf_protocal.party_b_rep",emId,"=");
		restriction.addClause("bh_zzf_protocal.is_active","1","=");
		
		var records = controller.protocalTableDs.getRecords(restriction);
		if(records.length > 0){
			var rentArea = 0;
			for(var i=0; i<records.length; i++){
				rentArea += parseFloat(records[i].getValue("bh_zzf_protocal.area_protocal"));
			}
			//1.自动带出乙方当前已租面积
			controller.protocalForm.setFieldValue("bh_zzf_protocal.area_rent",rentArea.toFixed(2));
			//2.自动带出本责任人最后一条协议下的 协议房地址
			controller.protocalForm.setFieldValue("bh_zzf_protocal.rm_address",records[records.length - 1].getValue("bh_zzf_protocal.rm_address"));
			controller.calculateRentFee();//重新计算总租金
		}

}





function feeRecord(payDate,payEnd,payFee)
{
	this.payDate = payDate;
	this.payEnd = payEnd;
	this.payFee = payFee;
}
