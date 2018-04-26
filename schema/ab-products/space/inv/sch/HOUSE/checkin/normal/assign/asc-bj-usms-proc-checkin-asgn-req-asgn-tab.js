var assignDetailController = View.createController("assignDetailController", {
    //main tab object , used here for store some globle varible
    tabs: null,
    record: null,
    activityLogId: '',
    restriction: '',
    zzfcardId: '',
    bulidingName:'',
    parameters: null,
    ascBjUsmsProcAsgnCreateReqAddAttachmentsTabAttachmentForm_afterRefresh: function(){
        this.onStart();
    },
    onPrintAdmission:function(){
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
        var concatString=blIds+'-'+flIds +'-'+rmIds+'';
   	 	this.parameters={'tName':emName,'blInfo':concatString};
   	 	
   	 View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false,{
         width: 470,
         height: 200,
         xmlName: "houseCheckNotice",
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
    	 var blName=this.bulidingName;
         var flIds = panel.getFieldValue('sc_zzfcard.fl_id');
         var rmIds = panel.getFieldValue('sc_zzfcard.rm_id');
         var concatString='建筑物名称 : ['+blName+']  楼层 : ['+flIds +']  房间号 : ['+rmIds+']';
    	 this.parameters={'tName':emName,'blInfo':concatString};
    },
    onStart:function(){
        this.tabs = View.getControl('', 'assignTabs');
        //判断是否是教师 显示不同的panel
        this.selectBasicFormByRequestType();
        //数据加入
        this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabDestricptionForm.show(false);
        this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabAttachmentForm.show(true);
    },
    onBack: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        var tabName = "selectTab";
        var tab = this.tabs.findTab(tabName);
        this.tabs.selectTab(tabName);
        tab.loadView();
        tab.show(true);
    },
    selectBasicFormByRequestType: function(){
        if(this.tabs.em=='1'){
        	this.teacherForm.show(true);
        	this.nteacherForm.show(false);
        	this.teacherForm.refresh(this.tabs.restriction);
        	this.fillBlName('teacherForm');
        	this.init('teacherForm');
        }else{
        	this.teacherForm.show(false);
        	this.nteacherForm.show(true);
        	this.nteacherForm.refresh(this.tabs.restriction);
        	
        	this.fillBlName('nteacherForm');
        	this.init('nteacherForm');
        }
        this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabDestricptionForm.refresh(this.tabs.restriction);
    },
    fillBlName:function(panelName){
    	var fillblNamePanel=View.panels.get(panelName);
        var res=new Ab.view.Restriction();
        var blDs=View.dataSources.get('blDataSource');
        var blId=fillblNamePanel.getFieldValue('sc_zzfcard.bl_id');
        res.addClause('bl.bl_id',blId,'=');
    	var record=blDs.getRecord(res);
    	var name=record.getValue('bl.name');
    	this.bulidingName=name;
    	fillblNamePanel.setFieldValue('blName',name);
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
            xmlName: "houseContract",
            parameters: {
                'card_id':card_id,
                'despositPayoffUpper':despositPayoffUpper
            },
            closeButton: false
        });

	},
	teacherForm_afterRefresh: function(){
		var blId  = this.teacherForm.getFieldValue("sc_zzfcard.bl_id");
		var blName = GetEmName(blId);
		this.teacherForm.setFieldValue("sc_zzfcard.bl_id", blName);
    },
	nteacherForm_afterRefresh: function(){
		var blId  = this.nteacherForm.getFieldValue("sc_zzfcard.bl_id");
		var blName = GetEmName(blId);
		this.nteacherForm.setFieldValue("sc_zzfcard.bl_id", blName);
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

function GetEmName(blId){
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