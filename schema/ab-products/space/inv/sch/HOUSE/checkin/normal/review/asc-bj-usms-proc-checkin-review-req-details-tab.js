var ascBjUsmsProcReviewDetailController = View.createController("ascBjUsmsProcReviewDetailController", {
    //main tab object , used here for store some globle varible
    tabs: null,
    record: null,
    activityLogId: '',
    restriction: '',
    blName:'',
    zzfcardId: '',
    parameters:'',

    ascBjUsmsProcAsgnCreateReqAddAttachmentsTabDestricptionForm_afterRefresh: function(){
        this.onStart();
    },
    onStart: function(){
        //this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.tabs = View.getControl('', 'reviewRequestTabs');
        //判断是否是教师 显示不同的panel
        //this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabDestricptionForm.setRecord(this.record);
        this.selectBasicFormByRequestType();
        //数据加入
        this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabDestricptionForm.show(true);
        this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabAttachmentForm.show(true);
    },
    onPrintAdmission:function(){
//		window.open("/archibus/schema/ab-products/htmlreport/printreport.jsp?xmlName=xinanruzhutongzhi&tName="+this.parameters['tName']+"&blInfo="+this.parameters['blInfo']+"");
    	var panel=null;
    	if(this.tabs.em=='1'){
    		panel=this.teacherForm;
    	}else{
    		panel=this.nteacherForm;
    	}
    	
    	var emName = panel.getFieldValue('sc_zzfcard.em_name');
	   	var blIds = panel.getFieldValue('sc_zzfcard.bl_id');
	   	var blName=this.blName;
        var flIds = panel.getFieldValue('sc_zzfcard.fl_id');
        var rmIds = panel.getFieldValue('sc_zzfcard.rm_id');
        var concatString='建筑物名称 : ['+blName+']  楼层 : ['+flIds +']  房间号 : ['+rmIds+']';
   	 	this.parameters={'tName':emName,'blInfo':concatString};
    
    
    	View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false,{
            width: 470,
            height: 200,
            xmlName: "xinanruzhutongzhi",
            parameters: {
                'tName':emName,
                'blInfo':concatString
            },
            closeButton: false
        });
    
    
    },
    init:function(panelName){
    	 var panel = View.panels.get(panelName);
    	 var emName = panel.getFieldValue('sc_zzfcard.em_name');
    	 var blIds = panel.getFieldValue('sc_zzfcard.bl_id');
    	 var blName=this.blName;
         var flIds = panel.getFieldValue('sc_zzfcard.fl_id');
         var rmIds = panel.getFieldValue('sc_zzfcard.rm_id');
         var concatString='建筑物名称 : ['+blName+']  楼层 : ['+flIds +']  房间号 : ['+rmIds+']';
    	 this.parameters={'tName':emName,'blInfo':concatString};
    },
    onBack: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        //View.getWindow('parent').View.setTitle("房屋租赁-申请");
        var tabName = 'selectRequestTab';
        var tab = this.tabs.findTab(tabName);
		tab.show(true);
        tab.loadView();
        this.tabs.selectTab(tabName);
    },
    onDownLoad:function(){
    	var panel=null;
    	if(this.tabs.em=='1'){
    		panel=this.teacherForm;
    	}else{
    		panel=this.nteacherForm;
    	}
		var card_id=panel.getFieldValue("sc_zzfcard.card_id");
		var pay=panel.getFieldValue("sc_zzfcard.desposit_payoff");
		
		//获得人民币大写
		var despositPayoff =parseFloat(panel.getFieldValue("sc_zzfcard.desposit_payoff"));
	
		var despositPayoffUpper="";
		
		if(despositPayoff!=""){
			try {
				var result1 = Workflow.callMethod('AbSpaceRoomInventoryBAR-RMBHandler-changeToUppercase',despositPayoff*12);
				
				if (result1.code == 'executed') {
					despositPayoffUpper=result1.message;
				}
				
			} 
			catch (e) {
				Workflow.handleError(e);
			}
		}
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false,{
            width: 470,
            height: 200,
            xmlName: "fangwuzupinghetong",
            parameters: {
                'card_id':card_id,
                'despositPayoffUpper':despositPayoffUpper
            },
            closeButton: false
        });

	},
    
    selectBasicFormByRequestType: function(){
        var restriction = new Ab.view.Restriction();
        restriction.addClause("activity_log.activity_log_id", this.tabs.activityLogId, "=");
        restriction.addClause("activity_log.zzfcard_id", this.tabs.cardId, "=");
        if(this.tabs.em=='1'){
        	this.teacherForm.show(true);
        	this.nteacherForm.show(false);
        	this.teacherForm.refresh(restriction);
        	this.printAdmission('teacherForm')
        	this.fillBlName('teacherForm');
        	this.init('teacherForm');
        	this.showHistoryPanel('teacherForm');
        }else{
        	this.teacherForm.show(false);
        	this.nteacherForm.show(true);
        	this.nteacherForm.refresh(restriction);
        	this.printAdmission('teacherForm')
        	this.fillBlName('nteacherForm');
        	this.init('nteacherForm');
        	this.showHistoryPanel('nteacherForm');
        }
        this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabAttachmentForm.refresh(restriction);
        //this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabDestricptionForm.refresh(restriction);
    },
    printAdmission:function(){
    	var panel=null;
    	if(this.tabs.em=='1'){
    		panel=this.teacherForm;
    	}else{
    		panel=this.nteacherForm;
    	}
        var card_status=panel.getFieldValue('sc_zzfcard.card_status');
		var date_checkin = panel.getFieldValue('sc_zzfcard.date_checkin');
        if(card_status ='1' && date_checkin !="" ){
			panel.actions.items[0].enable(true);
			panel.actions.items[1].enable(true);
		}else{
			panel.actions.items[0].enable(false);
			panel.actions.items[1].enable(false);
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
    	this.blName=name;
    	fillblNamePanel.setFieldValue('blName',name);
    },
    ascBjUsmsProcAsgnCreateReqAddAttachmentsTabForm2_afterRefresh: function(){
        USMS_showBaseInfoOfUserOrProject(this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabForm2, true);
    },
    ascBjUsmsProcAsgnCreateReqAddAttachmentsTabHistoryPanel_afterRefresh: function(){
        reloadHistoryPanel(this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabHistoryPanel);
    },

    
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
        
    }
});


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