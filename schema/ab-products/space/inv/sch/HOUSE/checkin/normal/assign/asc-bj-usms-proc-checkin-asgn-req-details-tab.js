var assignDetailController = View.createController("assignDetailController", {
    tabs: null,
    record: null,
    activityLogId: '',
    restriction: '',
    zzfcardId: '',


    ascBjUsmsProcAsgnCreateReqAddAttachmentsTabAttachmentForm_afterRefresh: function(){
        this.onStart();
    },
	
    onSave:function(){
    	var panel=null;
 	   if(this.tabs.em=='1'){
 		   panel= View.panels.get("teacherForm");
 	   }else{
 		   panel= View.panels.get("nteacherForm");
 	   }
    	 var rentPayPeople = panel.getFieldValue('sc_zzfcard.rent_pay_people');
         var cleanPayPeople = panel.getFieldValue('sc_zzfcard.clean_pay_people');
  	   var dateCheckin=panel.getFieldValue('sc_zzfcard.date_checkin');
  	   var registerTime=panel.getFieldValue('sc_zzfcard.date_register');
  	   var duetoCheckout=panel.getFieldValue('sc_zzfcard.date_checkout_ought');
  	   var allPay=panel.getFieldValue('sc_zzfcard.all_payoff');
  	   var b=panel.getFieldValue('sc_zzfcard.lease_id');
  	   var emName = panel.getFieldValue('sc_zzfcard.em_name');
  	   var emId = panel.getFieldValue('sc_zzfcard.em_id');
  	   
  	   if(dateCheckin==''){
  		   View.showMessage("请填写入住日期");
  		   return;
  	   }
  	   if(duetoCheckout==''){
  		   View.showMessage("请填退租时间");
  		   return;
  	   }
  	 var myCheckinDate = NewDate(dateCheckin);
	   var myCheckOutDate=NewDate(duetoCheckout);
	   
	   	if(Date.parse(myCheckinDate)>Date.parse(myCheckOutDate)){
		   alert("退租时间不能小于入住时间");
		   return false;
			}
    
    	   	//计算入住和退租的时间差
    	   	var yearIn=myCheckinDate.getFullYear();
    	   	var yearOut=myCheckOutDate.getFullYear();
    	   	
    	   	var monthIn=myCheckinDate.getMonth();
    	   	var monthOut=myCheckOutDate.getMonth();
    	   	
    	   	var amount_month=(yearOut-yearIn)*12+(monthOut-monthIn);
    	   	
    	   	var operator=View.user.employee.id;
    	   	
    	   	var card=panel.getFieldValue('sc_zzfcard.card_id');
	   		var res=new Ab.view.Restriction();
			res.addClause('sc_zzfcard.card_id',card,'=');
			var record=this.sc_zzfcardDataSource.getRecord(res);
			record.setValue('sc_zzfcard.date_register',registerTime);
			record.setValue('sc_zzfcard.date_checkin',dateCheckin);
			record.setValue('sc_zzfcard.date_payrent_last',dateCheckin);
			record.setValue('sc_zzfcard.all_payoff',allPay);
			record.setValue('sc_zzfcard.actual_payoff',0);
			record.setValue('sc_zzfcard.em_name',emName);
			record.setValue('sc_zzfcard.date_checkout_ought',duetoCheckout);
			record.setValue('sc_zzfcard.amount_months',amount_month);
			record.setValue('sc_zzfcard.operator',operator);
			record.setValue('sc_zzfcard.rent_pay_people',rentPayPeople);
			record.setValue('sc_zzfcard.clean_pay_people',cleanPayPeople);
			
			
			//判断是否有合同编号，如果没有则生成一个合同编号
			/*var lease_id=record.getValue("sc_zzfcard.lease_id");
			if(lease_id ==""){
	    	    try {
	               result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SchoolHandler-createFixedIndex',"sc_zzfcard","lease_id","date_created");
	                if(result.code=="executed"){
	                 var obj = eval("(" + result.jsonExpression + ")");
	                 var leaseId = obj.leaseId;
	                 var dateCreate = obj.dateCreate;
	                 var dateCreateTime = obj.dateCreateTime;
	                }
	             } catch (e) {
	            		Workflow.handleError(e);
	            		return;
	             }
	             record.setValue('sc_zzfcard.lease_id',leaseId);
	             record.setValue('sc_zzfcard.date_created',dateCreate);
	 			 record.setValue('sc_zzfcard.date_created_time',dateCreateTime);
			}*/
			
			
			var dataSource = View.dataSources.get('sc_zzfcardDataSource');
			dataSource.saveRecord(record);
			
		   	/*
	    	 * 更新room表 根据联合主键bl_id,fl_id,rm_id 更新 RUZHU_STATUS=1
	    	 */
			var blId=panel.getFieldValue('sc_zzfcard.bl_id');
			var flId=panel.getFieldValue('sc_zzfcard.fl_id');
			var rmId=panel.getFieldValue('sc_zzfcard.rm_id');
			
			var restriction=new Ab.view.Restriction();
			restriction.addClause('rm.bl_id',blId,'=');
			restriction.addClause('rm.fl_id',flId,'=');
			restriction.addClause('rm.rm_id',rmId,'=');  
			
			var roomRecord=this.RoomDs.getRecord(restriction);
			roomRecord.setValue('rm.ruzhu_status','1');
			if(this.tabs.em=='1'){//如果是本校教职工，保存本校教职工id,否则保存 申请人姓名
				roomRecord.setValue('rm.owner_name',emId);
		 	}else{
		 		roomRecord.setValue('rm.owner_name',emName);
		 	}
			var rmDs=View.dataSources.get('RoomDs');
			rmDs.saveRecord(roomRecord);
			
			/*
			 * 再走一下流程 结束流程 
			 */
		
		
		var record = this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabFormDS.getRecord(this.tabs.restriction);
		var activity_log_id=record.getValue('activity_log.activity_log_id');
		var cardid = record.getValue('sc_zzfcard.card_id');
		var res = new Ab.view.Restriction();
		
		res.addClause('activity_log.activity_log_id', activity_log_id , '=');
		res.addClause('sc_zzfcard.card_id' , cardid , '=');
		this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabAttachmentForm.newRecord=false;
		this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabAttachmentForm.refresh(res);
		this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabAttachmentForm.enableField("sc_zzfcard.doc_lease",true);
		var b;
	    	/*
	    	 * 弹出入住信息录入成功
	    	 * 跳转到下一个界面
	    	 */
	
    },
	
	
	
	
    onAssign: function(){
    	var doc_lease = this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabAttachmentForm.getFieldValue('sc_zzfcard.doc_lease');
    	if(doc_lease == ""){
    		View.showMessage('请先保存后添加附件，再确定入住');
    		return ; 
    	}else{
    		this.closeWorkflow();
    	}
    },
    closeWorkflow:function(){
    	  var record=this.getRecord();
    	  try{
    		  var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-closeRequest',record);
    		  this.selectNextTab(this.tabs.restriction);
    	  }catch(e){
    		  Workflow.handleError(e);
      		return;
    	  }
    },
    getRecord:function(){
    	var record={};
    	record['activity_log.activity_log_id']=this.activityLogId;
    	return record;
    }
    ,
    selectNextTab: function(restriction){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.tabs.restriction = restriction;
        var nextTabName = 'assignTab';
       
        var restrictiona = new Ab.view.Restriction();
        restrictiona.addClause("activity_log.activity_log_id", this.tabs.activityLogId, "=");
        restrictiona.addClause("activity_log.zzfcard_id", this.tabs.cardId, "=");
			
		this.tabs.findTab(nextTabName).show(true);
		this.tabs.selectTab(nextTabName,restrictiona,false);
    },
    onStart: function(){
        this.tabs = View.getControl('', 'assignTabs');
        //判断是否是教师 显示不同的panel
        this.selectBasicFormByRequestType();
    	var currentDate = ASBT_getCurrentDate_Client();
    	var emName= this.teacherForm.getFieldValue('sc_zzfcard.em_name');
    	var emName1= this.nteacherForm.getFieldValue('sc_zzfcard.em_name');
        var panel = View.panels.get("teacherForm");
        var panel2 = View.panels.get("nteacherForm");
        
        panel.setFieldValue('sc_zzfcard.rent_pay_people' , emName);
        panel2.setFieldValue('sc_zzfcard.rent_pay_people' , emName1);
		panel.setFieldValue('sc_zzfcard.date_register', currentDate);
	    panel2.setFieldValue('sc_zzfcard.date_register', currentDate);
        //数据加入
        this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabAttachmentForm.show(true);
        //判断其是否为空 
        this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabAttachmentForm.enableField("sc_zzfcard.doc_lease",false);
    },
    onBack: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        var tabName = "selectTab";
        var tab = this.tabs.findTab(tabName);
        tab.loadView();
        tab.show(true);
        this.tabs.selectTab(tabName);
    },
    selectBasicFormByRequestType: function(){
        var restriction = new Ab.view.Restriction();
        restriction.addClause("activity_log.activity_log_id", this.tabs.activityLogId, "=");
        restriction.addClause("activity_log.zzfcard_id", this.tabs.cardId, "=");
        /*
         * 跳转到下一页需要用的 restriction
         */
        this.tabs.restriction=restriction;
        if(this.tabs.em=='1'){
        	this.teacherForm.show(true);
        	this.nteacherForm.show(false);
        	this.teacherForm.refresh(restriction);
        	this.showHistoryPanel('teacherForm');
        	this.fillBlName('teacherForm');
        	this.activityLogId=this.teacherForm.getFieldValue('activity_log.activity_log_id');
        }else{
        	this.teacherForm.show(false);
        	this.nteacherForm.show(true);
        	this.nteacherForm.refresh(restriction);
        	this.showHistoryPanel('nteacherForm');
        	this.fillBlName('nteacherForm');
        	this.activityLogId=this.nteacherForm.getFieldValue('activity_log.activity_log_id');
        }
    },
    fillBlName:function(panelName){
    	var fillblNamePanel=View.panels.get(panelName);
        var res=new Ab.view.Restriction();
        var blDs=View.dataSources.get('blDataSource');
        var blId=fillblNamePanel.getFieldValue('sc_zzfcard.bl_id');
        res.addClause('bl.bl_id',blId,'=');
    	var record=blDs.getRecord(res);
    	var name=record.getValue('bl.name');
    	fillblNamePanel.setFieldValue('blName',name);
    }
    ,
    showHistoryPanel: function(panelName){
    	//根据传入的不同面板值  获得不同的activity_log_id
        var panel = View.panels.get(panelName);
        var historyPanel = this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabHistoryPanel;
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation', 'activity_log', 'activity_log_id',this.tabs.activityLogId);
            
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
            }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    },
	autoGetAllPayment:function(){
	   var panel=null;
  	   if(this.tabs.em=='1'){
  		   panel= View.panels.get("teacherForm");
  	   }else{
  		   panel= View.panels.get("nteacherForm");
  	   }
  	   var dateCheckin=panel.getFieldValue('sc_zzfcard.date_checkin');
  	   var registerTime=panel.getFieldValue('sc_zzfcard.date_register');
  	   var duetoCheckout=panel.getFieldValue('sc_zzfcard.date_checkout_ought');
  	   var monthPay=panel.getFieldValue('sc_zzfcard.desposit_payoff');
  	   if(dateCheckin==''){
  		   return;
  	   }
  	   if(duetoCheckout==''){
  		   return;
  	   }
  	   var myCheckinDate = new Date(dateCheckin.replace(/-/g,"/"));
   	   var myCheckOutDate=new Date(duetoCheckout.replace(/-/g,"/"));
  	   	if(Date.parse(myCheckinDate)>Date.parse(myCheckOutDate)){
  		   alert("退租时间不能小于入住时间");
  		   return false;
 			}
  	   	//计算入住和退租的时间差
  	   	var yearIn=myCheckinDate.getFullYear();
  	   	var yearOut=myCheckOutDate.getFullYear();
  	   	
  	   	var monthIn=myCheckinDate.getMonth();
  	   	var monthOut=myCheckOutDate.getMonth();
  	   	
  	   	var amount_month=(yearOut-yearIn)*12+(monthOut-monthIn);
  	   	var allPay=(parseFloat(monthPay)*parseFloat(amount_month)).toFixed(2);
  	   	if(allPay==""){
  	   		allPay=0;
  	   	}
  	   	panel.setFieldValue("sc_zzfcard.all_payoff",allPay);
	},
	teacherForm_afterRefresh: function(){
			var blId  = this.teacherForm.getFieldValue("blName");
			var blName = GetBlName(blId);
			this.teacherForm.setFieldValue("blName", blName);
	    },
	nteacherForm_afterRefresh: function(){
		var blId  = this.teacherForm.getFieldValue("blName");
		var blName = GetBlName(blId);
		this.teacherForm.setFieldValue("blName", blName);
    }
	
});

function GetBlName(blId){
    var parameters = {
        tableName: 'bl',
        fieldNames: toJSON(['bl.name']),
        restriction: "bl.bl_id ='" + blId + "'"
    };
    
    var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    var dataList = [];
    if (result.data.records.length > 0) {
        var blName = result.data.records[0]['bl.name'];
        return blName;
    }
    else {
        return null;
    }
}

function getTotalPayment(){
	assignDetailController.autoGetAllPayment();
}
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
        
        if (row['afm_wf_steps.step'] == '基础') {
            if (i == 0) {
                row['afm_wf_steps.step'] = '申请人提交申请';
            }
            else {
                row['afm_wf_steps.step'] = '';
            }
        }
    }
    historyPanel.reloadGrid();
}
function NewDate(str) {
	str = str.split('-');
	var date = new Date();
	date.setUTCFullYear(str[0], str[1]  , str[2]);
	date.setUTCHours(0, 0, 0, 0);
	return date;
	} 