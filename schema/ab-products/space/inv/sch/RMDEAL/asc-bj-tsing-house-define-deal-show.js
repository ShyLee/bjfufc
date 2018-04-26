var ascDefineDealController = View.createController("ascDefineDealController", {
	editId:null,//用来控制房间信息是否是正在修改的
	editChangeArea:null,
	dealRmId:null,
	blId:null,
	flId:null,
	rmId:null,
	
    afterInitialDataFetch: function(){
	
//		this.searchConsole_onShow();
		this.enableField(false);
    },
    searchConsole_onShow:function(){
    	//自动展开grid
//		var toCollapse = View.getLayoutAndRegionById("searchWest");
//		var panel = toCollapse.layoutManager.getRegionPanel(toCollapse.region);
//		panel.expand(false);
		
		 this.dealForm.show(false);
		 this.formDocPanel.show(false);
		 this.roomGrid.show(false);
    	
//		 this.dealForm.newRecord=false;
//		 this.formDocPanel.newRecord=false;
		 
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
//			this.onClickGrid(true);
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
	
    /**
     * 
     * 根据协议是否添加，确定添加房间按钮是否可用
     * 
  
   
  
    /**
     * 
     * 更新rm表中对应房间的协议编号
     * 
     */
   updateRmDealId:function(dealId){
		var rows=this.roomGrid.rows;
		   for(var i=0;i<rows.length;i++){
			   var blId=rows[i].row.getFieldValue("ts_deal_rm.bl_id");
			   var flId=rows[i].row.getFieldValue("ts_deal_rm.fl_id");
			   var rmId=rows[i].row.getFieldValue("ts_deal_rm.rm_id");
			   
			   var restriction=new Ab.view.Restriction();
			   var account = View.dataSources.get("rm_ds");
			   restriction.addClause("rm.bl_id",blId,"=");
			   restriction.addClause("rm.fl_id",flId,"=");
			   restriction.addClause("rm.rm_id",rmId,"=");
			   
			   var record=account.getRecord(restriction);
			   record.setValue("rm.deal_id", dealId);
			   account.saveRecord(record);
		   }
   },
   
   
   
   
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
   
    /**
     * 
     * 更新房间入住状态 删除时改为空置0，添加时改为暂借2
     * 
     */
    changeRmStatus:function(blId,flId,rmId,type){
		
		var dataRoom = View.dataSources.get('rmDS');
		restriction = new Ab.view.Restriction();
		restriction.addClause("rm.bl_id", blId, "=");
		restriction.addClause("rm.fl_id", flId, "=");
		restriction.addClause("rm.rm_id", rmId, "=");
		var rec = dataRoom.getRecord(restriction);
		if(type=="del"){
			rec.setValue('rm.ruzhu_status', 0);
		}else if(type=="add"){
			rec.setValue('rm.ruzhu_status', 2);
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

