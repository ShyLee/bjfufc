var ascDefineDealController = View.createController("ascDefineDealController", {
	editId:null,//用来控制房间信息是否是正在修改的
	editChangeArea:null,
	dealRmId:null,
	blId:null,
	flId:null,
	rmId:null,
	
    afterInitialDataFetch: function(){
		this.roomWindow.newRecord=true;
		this.editId=null;
//		this.searchConsole_onShow();
    },
    searchConsole_onShow:function(){
    	//自动展开grid
//		var toCollapse = View.getLayoutAndRegionById("searchWest");
//		var panel = toCollapse.layoutManager.getRegionPanel(toCollapse.region);
//		panel.expand(false);
		
		 this.dealForm.show(false);
		 this.formDocPanel.show(false);
		 this.roomGrid.show(false);
    	
		 this.dealForm.newRecord=false;
		 this.formDocPanel.newRecord=false;
		 
		 var type=this.searchConsole.getFieldValue("ts_deal.rq_rm_type");
		 var state=this.searchConsole.getFieldValue("ts_deal.deal_state");
		 var dateStart=this.searchConsole.getFieldValue("ts_deal.start");
		 var dateEnd=this.searchConsole.getFieldValue("ts_deal.end");
		 
		 var consoleRestriction = new Ab.view.Restriction();
		 if (type != "") {
				consoleRestriction.addClause("ts_deal.rq_rm_type", type, "like");
			}
			if (state != "") {
				consoleRestriction.addClause("ts_deal.deal_state", state, "=");
			}
			if (dateStart != "") {
				consoleRestriction.addClause("ts_deal.request_time", dateStart, "&gt;=");
			}
			if (dateEnd != "") {
				consoleRestriction.addClause("ts_deal.request_time",  dateEnd , "&lt;=");
			}
			if(dateStart != "" &&  dateEnd != ""){
				if(dateStart>dateEnd){
					 View.showMessage("【申请起始日期】不可以大于【申请截止日期】，请重新选择！");
					 return;
				}
			}
			this.recordGrid.refresh(consoleRestriction);
			if (this.recordGrid.rows.length == 0) {
		    	 View.showMessage("没有符合条件的用房协议信息！");
				 return;
			}
			this.onClickGrid(true);
	},
	onClickGrid:function(afterShow){
		 this.dealForm.newRecord=false;
		 this.formDocPanel.newRecord=false;
		 
		var selectedIndex = -1;
		if (afterShow) {
			selectedIndex = 0;
		} else {
			selectedIndex = this.recordGrid.selectedRowIndex;
		}
		 var dealId=this.recordGrid.rows[selectedIndex]["ts_deal.deal_id"];
		 var restriction = new Ab.view.Restriction();
		 restriction.addClause("ts_deal.deal_id",dealId,"=");
		 this.dealForm.refresh(restriction);
		 this.formDocPanel.refresh(restriction);
		 
		 var restrictionRm = new Ab.view.Restriction();
		 restrictionRm.addClause("ts_deal_rm.deal_id",dealId,"=");
		 this.roomGrid.refresh(restrictionRm);
		 
//		 this.enableActionByState();
//		 this.enableFieldByState();
		 
		 this.enableAddRoomAction();
		 
		 var state=this.dealForm.getFieldValue("ts_deal.deal_state");
		 if(state>1){
			 this.dealForm.actions.items[0].enable(false);
			 this.dealForm.actions.items[1].enable(false);
			 this.roomGrid.actions.items[0].enable(false);
			 var rows=this.roomGrid.rows;
			 for(var i=0;i<rows.length;i++){
			 $("roomGrid_row"+i+"_delete").disabled= true;
			 $("roomGrid_row"+i+"_edit").disabled= true;
			 }
		 }
		 
	},

	enableActionByState:function(){
		 var state=this.dealForm.getFieldValue("ts_deal.deal_state");
		 if(state=="0"){//未发布
			 this.enableAction(false);
			 this.dealForm.actions.items[0].enable(true);
			 this.dealForm.actions.items[1].enable(true);
		 }else  if(state=="1"){//已发布
			 this.enableAction(false);
			 this.dealForm.actions.items[0].enable(false);
			 this.dealForm.actions.items[1].enable(true);
		 }else  if(state=="2"){//已确认
			 this.enableAction(false);
			 this.dealForm.actions.items[2].enable(true);
		 }else  if(state=="3"){//3：/已交款
			 this.enableAction(false);
			 this.dealForm.actions.items[3].enable(true);
		 }else  if( state=="4"  || state=="5"){//3：/已交款，4：已生效归档 ，5：已关闭
			 this.enableAction(false);
		 }
	},
	enableFieldByState:function(){
		var state=this.dealForm.getFieldValue("ts_deal.deal_state");
		 if(state=="0" ){//1:未发布,
			 this.enableField(true);
		 }else  if( state=="1"){//2已发布
			 this.enableField(true);
		 }else  if(state=="2"){//已确认
			 this.enableField(false);
		 }else  if(state=="3"){//3：/已缴款
			 this.enableField(false);
		 }else  if( state=="4"  || state=="5"){//4：已生效归档 ，5：已关闭
		    this.enableField(false);
		 }
	},
	enableAction:function(trueOrFalse){
		 this.dealForm.actions.items[0].enable(trueOrFalse);
		 this.dealForm.actions.items[1].enable(trueOrFalse);
		 this.dealForm.actions.items[2].enable(trueOrFalse);
		 this.dealForm.actions.items[3].enable(trueOrFalse);
	},
	enableField:function(trueOrFalse){
		 this.dealForm.enableField("ts_deal.deal_id",trueOrFalse);
		 this.dealForm.enableField("ts_deal.deal_name",trueOrFalse);
		 this.dealForm.enableField("ts_deal.rq_rm_type",trueOrFalse);
		 this.dealForm.enableField("ts_deal.request_person_id",trueOrFalse);
		 this.dealForm.enableField("ts_deal.request_person_name",trueOrFalse);
		 this.dealForm.enableField("ts_deal.request_person_phone",trueOrFalse);
		 this.dealForm.enableField("ts_deal.request_time",trueOrFalse);
		 this.dealForm.enableField("ts_deal.dv_id",trueOrFalse);
		 this.dealForm.enableField("ts_deal.subject_name",false);
		 this.dealForm.enableField("ts_deal.handing_em_id",false);
		 this.dealForm.enableField("ts_deal.handing_em_name",false);
		 this.dealForm.enableField("ts_deal.handing_dv",false);
		 this.dealForm.enableField("ts_deal.sure_em_id",false);
		 this.dealForm.enableField("ts_deal.sure_em_name",false);
		 this.dealForm.enableField("ts_deal.sure_time",false);
		 this.dealForm.enableField("ts_deal.pay_num",false);
		 this.dealForm.enableField("ts_deal.wuye_price",trueOrFalse);
		 this.dealForm.enableField("ts_deal.rent_price",trueOrFalse);
		 this.dealForm.enableField("ts_deal.cash_bill_num",trueOrFalse);
		 this.dealForm.enableField("ts_deal.cash_cost",trueOrFalse);
		 this.dealForm.enableField("ts_deal.duration_time",trueOrFalse);
		 this.dealForm.enableField("ts_deal.start_time",trueOrFalse);
		 this.dealForm.enableField("ts_deal.due_time",trueOrFalse);
		 this.dealForm.enableField("ts_deal.comments",trueOrFalse);
	},
	searchConsole_onNew:function(){
		//自动收缩grid
//		var toCollapse = View.getLayoutAndRegionById("searchWest");
//		var panel = toCollapse.layoutManager.getRegionPanel(toCollapse.region);
//		panel.collapse(false);
		
    	this.dealForm.newRecord=true;
    	this.dealForm.refresh();
    	
//    	var currentDate = ASBT_getCurrentDate_Client();
    	var currentDate=new Date();
    	 var id = View.user.employee.id;
		 var name = View.user.name;
		 var dvId = View.user.employee.organization.divisionId;
		 
   		this.dealForm.setFieldValue("ts_deal.request_time",currentDate);
   		this.dealForm.setFieldValue("ts_deal.handing_em_id",id);
   		this.dealForm.setFieldValue("ts_deal.handing_em_name",name);
   		this.dealForm.setFieldValue("ts_deal.handing_dv",dvId);
   		
    	
    	 restriction = new Ab.view.Restriction();
         restriction.addClause('ts_deal_rm.deal_rm_id', '', 'IS NULL', 'AND', true);
         this.roomGrid.refresh(restriction);
         
         this.formDocPanel.newRecord=true;
         this.formDocPanel.refresh();
		
//         this.enableField(true);
         this.enableAction(false);
         this.dealForm.actions.items[0].enable(true);
         var aa=this.dealForm.newRecord;
//         this.enableAddRoomAction();
         this.roomGrid.actions.items[0].enable(true);
    },
    /**
     * 
     * 根据协议是否添加，确定添加房间按钮是否可用
     * 
     */
    enableAddRoomAction:function(){
    	this.roomGrid.refresh();
    	  if(this.dealForm.newRecord){
         	 this.roomGrid.actions.items[0].enable(false);
          }else{
         	 this.roomGrid.actions.items[0].enable(true);
          }
    },
    dealForm_onSave : function(){
     // 对填入的数据进行非空判断
    	var dealName=this.dealForm.getFieldValue('ts_deal.deal_name');
    	var requestPersonId=this.dealForm.getFieldValue('ts_deal.request_person_id');
    	var requestPersonName=this.dealForm.getFieldValue('ts_deal.request_person_name');
    	var requestPersonPhone=this.dealForm.getFieldValue('ts_deal.request_person_phone');
    	var dvId=this.dealForm.getFieldValue('ts_deal.dv_id');
    	var subjectId=this.dealForm.getFieldValue('ts_deal.subject_id');
    	var handingEmId=this.dealForm.getFieldValue('ts_deal.handing_em_id');
    	var handingEmName=this.dealForm.getFieldValue('ts_deal.handing_em_name');
    	var handingDv=this.dealForm.getFieldValue('ts_deal.handing_dv');
    	var sureEmId=this.dealForm.getFieldValue('ts_deal.sure_em_id');
    	var sureEmName=this.dealForm.getFieldValue('ts_deal.sure_em_name');
    	var sureTime=this.dealForm.getFieldValue('ts_deal.sure_time');
    	var payNum=this.dealForm.getFieldValue('ts_deal.pay_num');
    	var wuyePrice=this.dealForm.getFieldValue('ts_deal.wuye_price');
    	var rentPrice=this.dealForm.getFieldValue('ts_deal.rent_price');
    	var cashBillNum=this.dealForm.getFieldValue('ts_deal.cash_bill_num');
    	var cashCost=this.dealForm.getFieldValue('ts_deal.cash_cost');
    	var durationTime=this.dealForm.getFieldValue('ts_deal.duration_time');
    	var startTime=this.dealForm.getFieldValue('ts_deal.start_time');
    	var dueTime=this.dealForm.getFieldValue('ts_deal.due_time');
    	var comments=this.dealForm.getFieldValue('ts_deal.comments');
    	if(dealName==''){
    		View.showMessage("请填写协议名称 ！");
    		return;
    	}
    	if(requestPersonId==''){
    		View.showMessage("请填写申请人编号 ！");
    		return;
    	}
    	if(requestPersonName==''){
    		View.showMessage("请填写申请人名称 ！");
    		return;
    	}
    	if(dvId==''){
    		View.showMessage("请填写申请单位 ！");
    		return;
    	}
    	if(subjectId==''){
    		View.showMessage("请填写科目名称 ！");
    		return;
    	}
    	if(wuyePrice==''){
    		View.showMessage("请填写物业费率！");
    		return;
    	}
    	if(rentPrice==''){
    		View.showMessage("请填写租用费率 ！");
    		return;
    	}
//    	if(cashBillNum==''){
//    		View.showMessage("请填写押金单据号 ！");
//    		return;
//    	}
    	if(cashCost==''){
    		View.showMessage("请填写押金金额 ！");
    		return;
    	}
    	if(durationTime==''){
    		View.showMessage("请填写协议时间 ！");
    		return;
    	}
    	if(startTime==''){
    		View.showMessage("请填写入住时间！");
    		return;
    	}
    	if(dueTime==''){
    		View.showMessage("请填写到期时间！");
    		return;
    	}
    	
    	//自增主键
    	
    	
    	var controller=this;
		var confirmMessage="你确定保存该协议?";
		 View.confirm(confirmMessage, function(button){
			 if (button == 'yes') {
					try {	
						controller. dealForm.setFieldValue("ts_deal.deal_state",'0');
						var dealId=controller.dealForm.getFieldValue('ts_deal.deal_id');
						if(dealId==""){
							var dealType=controller.chooseType();
							var dealid=controller.insertPrimary(dealType);
							controller.dealForm.setFieldValue("ts_deal.deal_id",dealid);					
						}
						var success=controller.dealForm.save();
						if(success){
//							controller.enableField(true);
//							controller.enableAction(false);
							controller.dealForm.actions.items[0].enable(true);
							controller.dealForm.actions.items[1].enable(true);
							
							var dealId=controller.dealForm.getFieldValue("ts_deal.deal_id");
									
							var restriction=new Ab.view.Restriction();
							restriction.addClause("ts_deal.deal_id",dealId,"=");
							controller.recordGrid.refresh();
							controller.formDocPanel.newRecord=false;
							controller.formDocPanel.refresh(restriction);														
							
							controller.enableAddRoomAction();
						}
					}catch(e){
	                	 return;
	                 }
			 }
		 });
    	
    },
    
     //    自增主键
    insertPrimary:function(dealType){
    	try{
    		//XY为ID类型的参数obj.dealID为结果
    		var result = Workflow.callMethod('AbBldgOpsHelpDesk-CreateDealId-getUniquePKeyCode', dealType,"ts_deal","REQUEST_TIME");
    		var obj = eval("(" + result.jsonExpression + ")");
//		alert(obj.dealID);
    		var dealid=obj.dealID;
    		return dealid;
    		
    	} catch (e) {
            Workflow.handleError(e);
            return null;
        }
    },
    //   判断协议类型
    chooseType:function(){
    	var dealType="";
    	var requestType=this.dealForm.getFieldValue('ts_deal.rq_rm_type');
    	if(requestType=="0"){
    		dealType="KY";
    	}
    	if(requestType=="1"){
    		dealType="XZ";
    	}
    	if(requestType=="2"){
    		dealType="SY";
    	}
    	if(requestType=="3"){
    		dealType="XS";
    	}
    	if(requestType=="4"){
    		dealType="JZG";
    	}
    	return dealType;
    },
    /**
     * 
     * 协议发布
     * 
     */
    dealForm_onPublish : function(){
    	var length=this.roomGrid.gridRows.length;
    	if(length==0){
    		View.showMessage('您还没有添加房间，请先添加房间！');
    		return;
    	}
    	var dealId=this.dealForm.getFieldValue('ts_deal.deal_id');
    	var controller=this;
		var confirmMessage="你确定发布该协议?";
		 View.confirm(confirmMessage, function(button){
			 if (button == 'yes') {
					try {		
						controller.dealForm.save();
						var restriction = new Ab.view.Restriction();
				    	restriction.addClause('ts_deal.deal_id',dealId,'=');
				    	var datasource=View.dataSources.get('ts_dealDS');
				    	var record=datasource.getRecord(restriction);
				    	
				    	record.setValue("ts_deal.deal_state",1);
				    	datasource.saveRecord(record);
				    	
				    	View.showMessage("协议发布成功 ！");
				    	
				    	controller.recordGrid.refresh();
				    	controller.dealForm.refresh();
//				    	controller.enableFieldByState(false);   
//				    	controller.enableActionByState(false);    
					}catch(e){
	                	 return;
	                 }
			 }
		 });
    	
    },
    
    /**
     * 
     * 打印缴费通知单
     * 
     */
    dealForm_onPaySheet : function(){
    	var state=this.dealForm.getFieldValue("ts_deal.deal_state");
    	if(state<1){
    		View.showMessage('您还没有发布协议，不能进行此操作！');
    		return;
    	}
		var dealid=this.dealForm.getFieldValue("ts_deal.deal_id");
		var dealrmnumber = this.roomGrid.rows.length;
		var sendblname = "";
		var changeblname = "";
		var blname = "";
		for(var i=0;i<dealrmnumber;i++)
		{
			blname = this.roomGrid.rows[i]["ts_deal_rm.bl_name"];
			if(blname!=changeblname)
			{
				if(sendblname!="")
					sendblname = sendblname+","+blname;
				else
					sendblname = blname;
				changeblname = blname;
			}
		}
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false,
		{
            width: 470,
            height: 200,
            xmlName: "tsingPaySheet",
            parameters: {
                'deal_id': dealid,
                'bl_name':sendblname
            },
            closeButton: false
        });
    },
    
   /**
    * 
    * 协议生效归档
    * 
    */   
    dealForm_onEffective:function(){
    	var state=this.dealForm.getFieldValue("ts_deal.deal_state");
    	if(state<3){
    		View.showMessage('没有进行缴款确认，协议不能生效归档！');
    		return;
    	}
    	
		var controller=this;
		var confirmMessage="你确定该协议要生效归档?";
		 View.confirm(confirmMessage, function(button){
			 if (button == 'yes') {
					try {	
						//更新协议表ts_deal，deal_state=4表示已生效归档
						controller.dealForm.setFieldValue("ts_deal.deal_state",'4');
//						controller.enableField(false);
//						controller.enableAction(false);
						var success=controller. dealForm.save();
						if(success){
							var dealId=controller.dealForm.getFieldValue("ts_deal.deal_id");
							
							//更新rm表中对应房间的协议编号
							controller.updateRmDealId(dealId);
							//更改房屋状态
//							var rmDatasource=View.dataSources.get('rmDS');
//							var restriction=new Ab.view.Restriction();
//							restriction.addClause("rm.deal_id",dealId,"=");
//							var records=rmDatasource.getRecords(restriction);
//							for(var i=0;i<records.length;i++){
//							   var a=records[i].getValue('rm.ruzhu_status');
//							   records[i].setValue('rm.ruzhu_status',0);
//							   var record=records[i];
//							   rmDatasource.saveRecord(record);
//							}
							View.showMessage("该用房协议已经生效归档！");
							controller.recordGrid.refresh();
							 return;
						}
					}catch(e){
						View.showMessage(e.message);
	                	 return;
	                 }
			 }
		 });
    },
    /**
     * 
     * 更新rm表中对应房间的协议编号及房间的状态
     * 
     */
   updateRmDealId:function(dealId){
		var rows=this.roomGrid.rows;
		   for(var i=0;i<rows.length;i++){
			   var blId=rows[i].row.getFieldValue("ts_deal_rm.bl_id");
			   var flId=rows[i].row.getFieldValue("ts_deal_rm.fl_id");
			   var rmId=rows[i].row.getFieldValue("ts_deal_rm.rm_id");
			   
			   var restriction=new Ab.view.Restriction();
			   var account = View.dataSources.get("rmDS");
			   restriction.addClause("rm.bl_id",blId,"=");
			   restriction.addClause("rm.fl_id",flId,"=");
			   restriction.addClause("rm.rm_id",rmId,"=");
			   
			   var record=account.getRecord(restriction);
			   record.setValue("rm.deal_id", dealId);
			   record.setValue("rm.ruzhu_status", 3);
			   account.saveRecord(record);
		   }
   },
    roomGrid_onInsert : function(){
    	this.roomWindow.newRecord=true;
    	this.editId=null;
    	var dealId=this.dealForm.getFieldValue('ts_deal.deal_id');
    	if(dealId==''){
    		View.showMessage("请先填写协议基本信息！");
    		return;
    	}else{
    		
    		this.roomWindow.showInWindow({
        	    width: 800,
                height: 300,
                closeButton: false
        	    });
        	this.roomWindow.refresh(); 
    		this.roomWindow.setFieldValue('ts_deal_rm.deal_id',dealId);
    	}
    },
    
    roomWindow_onCancel : function(){
    	if(this.editId!=null){
    		this.editId=null;
    		this.roomWindow.closeWindow();
    	}else{
    		this.roomWindow.refresh();
    		this.roomWindow.show(false);
    		this.roomWindow.closeWindow();
    	}
    	
    },
    roomWindow_onSaveroom : function(){
    	
    	var siteId=this.roomWindow.getFieldValue("ts_deal_rm.site_id");
    	var prId=this.roomWindow.getFieldValue("ts_deal_rm.pr_id");
    	var blId=this.roomWindow.getFieldValue("ts_deal_rm.bl_id");
    	var blName=this.roomWindow.getFieldValue("ts_deal_rm.bl_name");
    	var flId=this.roomWindow.getFieldValue("ts_deal_rm.fl_id");
    	var rmId=this.roomWindow.getFieldValue("ts_deal_rm.rm_id");
    	var rmArea=this.roomWindow.getFieldValue("ts_deal_rm.rm_area");
    	var changeArea=this.roomWindow.getFieldValue("ts_deal_rm.charge_area");
    	
    	var dealId=this.dealForm.getFieldValue("ts_deal.deal_id");
    	
    	if(siteId==''){
    		View.showMessage("请填写校区！");
    		return;
    	}
    	if(prId==''){
    		View.showMessage("请填写片区！");
    		return;
    	}
    	if(blId==''){
    		View.showMessage("请填写建筑物编码！");
    		return;
    	}
    	if(blName==''){
    		View.showMessage("请填写建筑物名称！");
    		return;
    	}
    	if(flId==''){
    		View.showMessage("请填写楼层！");
    		return;
    	}
    	if(rmId==''){
    		View.showMessage("请填写房间！");
    		return;
    	}
    	if(rmArea==''){
    		View.showMessage("请填写住房面积！");
    		return;
    	}
    	if(changeArea==''){
    		View.showMessage("请填写计费面积！");
    		return;
    	}
    
    	this.roomWindow.closeWindow();
    	var account = View.dataSources.get("roomDS");									  
    	var record="";
    	
    	var editRoomChange;
    	var dealRmId="";
    	if(this.editId!=null){
    		  restriction = new Ab.view.Restriction();
              restriction.addClause('ts_deal_rm.deal_rm_id',this.editId, '=');
              record = account.getRecord(restriction);
              dealRmId= this.dealRmId;
    	}else{
    		dealRmId=this.roomWindow.getFieldValue("ts_deal_rm.deal_rm_id");
    		record = account.getRecord();
    		record.isNew=true;
    		
    		  if(this.verifyRoomExists(blId,flId,rmId)){
    			  View.showMessage("房间["+blName+"-"+flId+"-"+rmId+"]已经添加过了,请重新选择！");
    			  return;
        	  }
    	}
    	record.setValue("ts_deal_rm.site_id", siteId);
    	record.setValue("ts_deal_rm.pr_id", prId);
    	record.setValue("ts_deal_rm.bl_id", blId);
    	record.setValue("ts_deal_rm.bl_name", blName);
    	record.setValue("ts_deal_rm.fl_id", flId);
    	record.setValue("ts_deal_rm.rm_id", rmId);
    	record.setValue("ts_deal_rm.rm_area", rmArea);
    	record.setValue("ts_deal_rm.charge_area", changeArea);
    	record.setValue("ts_deal_rm.deal_rm_id", dealRmId);
    	record.setValue("ts_deal_rm.deal_id", dealId);
    	account.saveRecord(record);
    	
//    	var dealId=this.roomWindow.getFieldValue("ts_deal_rm.deal_id");
		 var restriction = new Ab.view.Restriction();
		 restriction.addClause("ts_deal.deal_id",dealId,"=");
		 this.roomGrid.refresh(restriction);
		 
		if(this.editId!=null){
			this.autoChangeAreaAndCostReduce(this.editChangeArea);
		 }
		
		this.autoChangeAreaAndCostAdd();
		
		//由于租用总面积和总费用会根据添加房间来变动，以防用户忘记保存数据，所以自动保存数据
		this. dealForm.save();
    	  
    	  //更改rm表中的房屋状态
		  //判断是否重新选择房间 如果重新选择房间，把以前选择的状态更改为空置0，现在新选择的房间状态更改为暂借2
		if(this.editId!=null){
			 if(blId==this.blId && flId==this.flId &&  rmId==this.rmId){
				 this.changeRmStatus(blId, flId, rmId, "add");
			 }else{
				 this.changeRmStatus(this.blId, this.flId, this.rmId, "del");
				 this.changeRmStatus(blId, flId, rmId, "add");
			 }
		}else{
			this.changeRmStatus(blId, flId, rmId, "add");
		}
	
    },
    /**
     * 房间面积变化（新增、编辑）时，租用面积需要新增
     */
    autoChangeAreaAndCostAdd:function(){
    	var changeArea=this.roomWindow.getFieldValue("ts_deal_rm.charge_area");
    	var preChangeArea=this.dealForm.getFieldValue("ts_deal.total_rent_area");
		var currentRentArea=parseFloat(preChangeArea)+parseFloat(changeArea);
		this.dealForm.setFieldValue("ts_deal.total_rent_area",currentRentArea.toFixed(2));
		var rentPrice=this.dealForm.getFieldValue('ts_deal.rent_price');
		var wuyePrice=this.dealForm.getFieldValue('ts_deal.wuye_price');
		var totalpay=currentRentArea*parseFloat(rentPrice)+currentRentArea*parseFloat(wuyePrice);
		this.dealForm.setFieldValue('ts_deal.total_cost',totalpay.toFixed(2));
    },
    /**
     * 房间面积变化（删除）时，租用面积需要减少
     */
    autoChangeAreaAndCostReduce:function(changeArea){
    	 var preChangeArea=this.dealForm.getFieldValue("ts_deal.total_rent_area");
//	      var currentRentArea=parseFloat(preChangeArea)-parseFloat(this.editChangeArea);
	      var currentRentArea=parseFloat(preChangeArea)-parseFloat(changeArea);
	      this.dealForm.setFieldValue("ts_deal.total_rent_area",currentRentArea.toFixed(2));
	      var rentPrice=this.dealForm.getFieldValue('ts_deal.rent_price');
	      var totalpay=currentRentArea*parseFloat(rentPrice);
	      this.dealForm.setFieldValue('ts_deal.total_cost',totalpay.toFixed(2));
    },
	/**
	 * 
	 * 验证该房间是否添加过，如果已经添加，则返回true，如果没有添加过，返回false
	 * 
	 */
	verifyRoomExists:function(blId,flId,rmId){
		  var panel=this.roomGrid;
		   for(var i=0;i<panel.rows.length;i++){
			   var blIdValue=panel.rows[i].row.getFieldValue("ts_deal_rm.bl_id");
			   var flIdValue=panel.rows[i].row.getFieldValue("ts_deal_rm.fl_id");
			   var rmIdValue=panel.rows[i].row.getFieldValue("ts_deal_rm.rm_id");
			   if(blId==blIdValue && flId==flIdValue &&  rmId==rmIdValue){
				   return true;
			   }
		   }
		   return false;
	},
    fujiFormz_onSavefujian : function(){
    	var dealId=this.dealForm.getFieldValue('ts_deal.deal_id');
    	var restriction=new Ab.view.Restriction();
    	restriction.addClause("ts_deal.deal_id",dealId,"=");
    	this.fujiFormz.refresh(restriction);
    	this.fujiFormz.save();
    	
    	
    },
    /**
     * 
     * 1.删除房间时，用房协议里面对应的租金总面积和租金总金额要对应改变
     * 
     * 2.从表ts_deal_rm中删除需要删除的房间信息
     * 
     * 3.更新房间的状态为空置-0
     * 
     */
    roomGrid_delete_onClick:function(row){
    	 var changeArea=row.record["ts_deal_rm.charge_area"];
    	 var blName=row.record["ts_deal_rm.bl_name"];
    	 var flId=row.record["ts_deal_rm.fl_id"];
    	 var rmId=row.record["ts_deal_rm.rm_id"];
		 var preChangeArea=this.dealForm.getFieldValue("ts_deal.total_rent_area");
		 
		var controller=this;
		var confirmMessage="你确定删除房间["+blName+"-"+flId+"-"+rmId+"]吗?";
		 View.confirm(confirmMessage, function(button){
			 if (button == 'yes') {
					try {	
					      var tealRoomId=row.record["ts_deal_rm.deal_rm_id"];
					      restriction = new Ab.view.Restriction();
				          restriction.addClause('ts_deal_rm.deal_rm_id',tealRoomId, '=');
				          var record=View.dataSources.get('roomDS').getRecord(restriction);
				          
				          controller.roomGrid.removeGridRow(row.getIndex());
				          controller.roomGrid.update();
				          
				          View.dataSources.get('roomDS').deleteRecord(record);
				          controller.autoChangeAreaAndCostReduce(changeArea);
				          controller. dealForm.save();
				          
				          
				          
				        //更改rm表中的房屋状态
				          var blId=row.record["ts_deal_rm.bl_id"];
				          var flId=row.record["ts_deal_rm.fl_id"];
				          var rmId=row.record["ts_deal_rm.rm_id"];
				          controller.changeRmStatus(blId, flId, rmId, "del");

				          View.showMessage("房间["+blName+"-"+flId+"-"+rmId+"]已经添成功删除！");
				          return;
				          
					}catch(e){
	                	 return;
	                 }
			 }
		 });
	},
    roomGrid_edit_onClick:function(row){
    	
    	this. roomGrid_onInsert();
    	
    	this.editId=row.record["ts_deal_rm.deal_rm_id"];
        restriction = new Ab.view.Restriction();
        restriction.addClause('ts_deal_rm.deal_rm_id',this.editId, '=');
        this.roomWindow.newRecord=false;
        this.roomWindow.refresh(restriction);
        
        this.editChangeArea= this.roomWindow.getFieldValue("ts_deal_rm.charge_area");
        this.dealRmId=row.record["ts_deal_rm.deal_rm_id"];
        this.blId= row.record["ts_deal_rm.bl_id"];
        this.flId= row.record["ts_deal_rm.fl_id"];
        this.rmId= row.record["ts_deal_rm.rm_id"];
        
        
    },
    /**
     * 
     * 更新房间入住状态 删除时改为空置0，添加时改为锁定6
     * 
     */
    changeRmStatus:function(blId,flId,rmId,type){
		
		var dataRoom = View.dataSources.get('rmDS');
		restriction = new Ab.view.Restriction();
		restriction.addClause("rm.bl_id", blId, "=");
		restriction.addClause("rm.fl_id", flId, "=");
		restriction.addClause("rm.rm_id", rmId, "=");
		var rec = dataRoom.getRecord(restriction);
		var beginStatus=this.roomWindow.getFieldValue('ts_deal_rm.begin_status');
		
		if(type=="del"){
			rec.setValue('rm.ruzhu_status', beginStatus);
		}else if(type=="add"){
			rec.setValue('rm.ruzhu_status', 6);
		}
		       
		dataRoom.saveRecord(rec);
    }
  
});
/**
 * 
 * 自动获取计费面积，默认情况下，计费面积=住房面积
 * 
 */
 function autoGetChangeArea(fieldName,newValue,oldValue){
	 var rmArea=''; 
	 if(fieldName=='ts_deal_rm.rm_area'){
		 rmArea=newValue;
	 }
	 var panel=View.panels.get('roomWindow');
	 panel.setFieldValue('ts_deal_rm.charge_area',rmArea);
 }
 /**
  * 
  * 根据所在单位自动获取科目名称
  * 
  */
 function autoGetSubject(fieldName,newValue,oldValue){
	 var dvId="";
	 var subjectName="";
	 var subjectId="";
	 if(fieldName=='ts_deal.dv_id'){
		 dvId=newValue;
	 }
	 if(dvId!=""){
		 var dataSubject=View.dataSources.get('subjectDS');
		 restriction = new Ab.view.Restriction();
		 restriction.addClause('ts_subject.dv_id',dvId, '=');
		 var record=dataSubject.getRecord(restriction);
		 if(record!=""){
			 subjectName =record.getValue("ts_subject.subject_name");
			 subjectId =record.getValue("ts_subject.subject_id");
		 }else{
			 View.showMessage("单位【"+dvId+"】没有对应的科目，请定义改单位对应的科目！");
		 }
		 
		 var panel=View.panels.get('dealForm');
		 panel.setFieldValue('ts_deal.subject_id',subjectId);
		 panel.setFieldValue('ts_deal.subject_name',subjectName);
	 }
 }
 /**
  * 
  * 根据物业费和租费 自动变更租金总面积和租金总金额
  * 
  */
 function changeAreaAndCost(){
	 var panel=View.panels.get('dealForm');
	 var rentPrice=panel.getFieldValue('ts_deal.rent_price');
	 var totalArea= panel.getFieldValue('ts_deal.total_rent_area');
	 
	  var totalpay=totalArea*parseFloat(rentPrice);
	  panel.setFieldValue('ts_deal.total_cost',totalpay.toFixed(2));
	 
 }

