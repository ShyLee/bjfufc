var asgnCreateReqBasicInputTabController = View.createController("AsgnCreateBasicInputTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    rmcatOrType: "",
    rmcat:"",
	
    afterInitialDataFetch: function(){
       this.onStart();
    },
	
    afterSelect:function(){

		this.onStart();
	},
	
	onStart:function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
		//this.tabs = View.getControl('', 'createRequestTabs');
        //set the selected value of activity_log.activity_type
        this.ascBjUsmsProcAsgnCreateReqBasicInputTabDestricptionForm.setFieldValue('activity_log.activity_type', "房屋分配-办公用房");
        this.ascBjUsmsProcAsgnCreateReqBasicInputTabDestricptionForm.setFieldValue('activity_log.prob_type', this.tabs.requestType);
		this.ascBjUsmsProcAsgnCreateReqBasicInputTabDestricptionForm.show(true);
		this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.show(true);
        var dateRequested = USMS_getCurrentDate();
        this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.setFieldValue("activity_log.date_required", dateRequested);
        
	},
    
    onBack: function(){
        View.getWindow('parent').View.setTitle("房屋分配-办公用房");
        var tabName = 'selectTab';
        var tab = this.tabs.findTab(tabName);
        //tab.loadView();
        this.tabs.selectTab(tabName);
        
    },
    ascBjUsmsProcAsgnCreateReqBasicInputTabForm1_onSubmit: function(){

        if (this.checkInputFields()) {
            //get request record
            var record = this.getRecord();
            //submit request
            var restriction = this.submitRequest(record);
            if (restriction) {
                this.selectNextTab(restriction);
            }
        }
    },
    checkInputFields:function(){
    	   var rmType = this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.getFieldValue("activity_log.rm_type");
    	   var dvId = this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.getFieldValue("activity_log.dv_id");
    	   var description = this.ascBjUsmsProcAsgnCreateReqBasicInputTabDestricptionForm.getFieldValue("activity_log.description");
    	   var comments = this.ascBjUsmsProcAsgnCreateReqBasicInputTabDestricptionForm.getFieldValue("activity_log.comments");
    	   if(rmType==""){
    		   View.alert("房屋类型不能为空")
    		   return false;
    	   }
    	   if(dvId==""){
    		   View.alert("申请单位不能为空")
    		   return false;
    	   }
    	   if(description==""){
    		   View.alert("请填写申请原因")
    		   return false;
    	   }
    	   if(comments==""){
    		   View.alert("请填写申请房间信息")
    		   return false;
    	   }
    	   return true
    },
    getRecord: function(){
        var record = {};
        var ds = this.ascBjUsmsProcAsgnCreateReqBasicInputTabFormDS;
        var panel = View.panels.get("ascBjUsmsProcAsgnCreateReqBasicInputTabForm1");
        if (!panel.visible) {
            panel = View.panels.get("ascBjUsmsProcAsgnCreateReqBasicInputTabForm2");
        }
        for (var i = 0; i < ds.fieldDefs.items.length; i++) {
        
            var fieldId = ds.fieldDefs.items[i].id;
            if (panel.containsField(fieldId)) {
                record[fieldId] = panel.getFieldValue(fieldId);
            }
            else {
                record[fieldId] = this.ascBjUsmsProcAsgnCreateReqBasicInputTabDestricptionForm.getFieldValue(fieldId);
            }
        }
        
        return record;
    },
    
    submitRequest: function(record){
        try {
            result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', 0, record);
            if (result.code == 'executed') {
                //get activity_log_id from result and create restriction 
                var restriction = new Ab.view.Restriction();
                restriction.addClause('activity_log.activity_log_id', eval('(' + result.jsonExpression + ')').activity_log_id, '=');
                return restriction;
            }
            else {
                return null;
            }
        } 
        catch (e) {
            Workflow.handleError(e);
            return null;
        }
        
    },
    
    selectNextTab: function(restriction){
        //select next tab and reload the tab view
        this.tabs.restriction = restriction;
        var nextTabName = 'attachTab';
        
        this.tabs.selectTab(nextTabName);
    },
    
    getRmCatOrTypeOfAssign: function(requestType){
        var tempArr = requestType.split("-");
        return tempArr[1];
    }
});

//function selectRequestRmType(ob){
//    var bu_id = AUSC_getEmployeeDivisionIdByEmId(View.user.name).organization.dvType;
//    var res = new Ab.view.Restriction();
//	if (asgnCreateReqBasicInputTabController.rmcat != '教室' && asgnCreateReqBasicInputTabController.rmcat != '实验室') {
//		res.addClause("rmtype.rm_cat", "教室", "!=");
//		res.addClause("rmtype.rm_cat", "实验室", "!=");
//	}	
//	//if (ascBjUsmsProcAsgnCreateReqBasicInputTabController.rmcat == '办公室' ) {
//	//	res.addClause("rmtype.rm_type", "%办公%", "like");
//	//}
//    if (ascBjUsmsConstantControl.AUSC_DvIsJXKY(bu_id)) {
//        res.addClause("rmtype.rmtype_bu",['JX','JXJG'],"IN");
//    }
//    else {
//    	res.addClause("rmtype.rmtype_bu",['JG','JXJG'],"IN");
//    }
//    View.selectValue(ob.parentPanelId, '房屋类型', ['activity_log.rm_cat', 'activity_log.rm_type'], 'rmtype', ['rmtype.rm_cat', 'rmtype.rm_type'], ['rmtype.rm_cat', 'rmtype.rm_type'], res, 'afterSelectRmType', true, ['activity_log.rm_cat'],true, '', 400, 600, 'grid', 0, toJSON([{
//        fieldName: 'rmtype.rm_cat',
//        sortOrder: 1
//    }]));
//}
function afterSelectRmType(fieldName, selectedValue, previousValue){
	var panel = View.panels.get("ascBjUsmsProcAsgnCreateReqBasicInputTabForm1");
    if (!panel.visible) {
        panel = View.panels.get("ascBjUsmsProcAsgnCreateReqBasicInputTabForm2");
    }
	
	panel.setFieldValue(fieldName,selectedValue);
}
function afterSelectRmUser(fieldName, selectedValue, previousValue){
    var panel = View.panels.get("ascBjUsmsProcAsgnCreateReqBasicInputTabForm1");
    if (!panel.visible) {
        panel = View.panels.get("ascBjUsmsProcAsgnCreateReqBasicInputTabForm2");
    }
    if (fieldName != undefined && selectedValue != undefined) {
        panel.setFieldValue("activity_log.rm_user", selectedValue);
    }
    
    var rmUser = panel.getFieldValue("activity_log.rm_user");
    var emObject = USMS_getEmInfo(rmUser);
    var zhiwu = emObject.zhiwu;
    var zhicheng = emObject.zhicheng;
    
    panel.setFieldValue('activity_log.zhiwu', zhiwu);
    panel.setFieldValue('activity_log.zhicheng', zhicheng);
    
    //only request one room for teacher
    
    if (rmUser) {
        panel.setFieldValue('activity_log.count_rm', "1");
        panel.enableField('activity_log.count_rm', false);
    }
    else {
        panel.enableField('activity_log.count_rm', true);
    }
    
}

function afterSelectProjectGoup(fieldName, selectedValue, previousValue){
    var panel = View.panels.get("ascBjUsmsProcAsgnCreateReqBasicInputTabForm2");
    if (fieldName != undefined && selectedValue != undefined) {
        panel.setFieldValue("activity_log.project_gp_id", selectedValue);
    }
    
    var projectGroup = panel.getFieldValue("activity_log.project_gp_id");
    var projectObject = USMS_getProjectInfo(projectGroup);
    var projectXingzhi = projectObject.projectXingzhi;
    var projectLeader = projectObject.projectLeader;
    
    panel.setFieldValue('activity_log.projectxz_id', projectXingzhi);
    panel.setFieldValue('activity_log.project_manager', projectLeader);
}
