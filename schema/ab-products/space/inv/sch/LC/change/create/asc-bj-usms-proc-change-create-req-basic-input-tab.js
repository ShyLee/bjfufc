var ascBjUsmsProcChangeCreateReqBasicInputTabController = View.createController("ascBjUsmsProcChangeCreateReqBasicInputTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
    
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        //set the selected value of activity_log.activity_type
        this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.setFieldValue('activity_log.activity_type', "SERVICE DESK - 房屋用途变更");
		this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.setFieldValue('activity_log.prob_type', this.tabs.requestType);
    },
    
	onBack: function(){
        View.getWindow('parent').View.setTitle("房屋用途变更-申请");
        var tabName = 'selectTab';
        var tab = this.tabs.findTab(tabName);
        tab.loadView();
        this.tabs.selectTab(tabName);
        
    },
	
    ascBjUsmsProcChangeCreateReqBasicInputTabForm_onSubmit: function(){
    
        //If all inputs are validate, create service request and show Attachment panel
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
    
    checkInputFields: function(){
        this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.clearValidationResult();
        this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.clearValidationResult();
        if (this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.validateFields() &&
        this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.validateFields()) {
            var requestType = this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.getFieldValue("activity_log.prob_type");
            var rmCatFrom = this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue("activity_log.rm_cat");
            var rmCatTo = this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue("activity_log.rm_cat_after");
            var rmTypeFrom = this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue("activity_log.rm_type");
            var rmTypeTo = this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue("activity_log.rm_type_after");
            if (requestType == "房屋变更-用途") {
                if (!rmCatFrom || !rmCatTo || !rmTypeFrom || !rmTypeTo) {
                    View.alert(getMessage('noRoomType'));
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    },
    
    
    getRecord: function(){
        var record = {};
        var ds = this.ascBjUsmsProcChangeCreateReqBasicInputTabFormDS;
        
        for (var i = 0; i < ds.fieldDefs.items.length; i++) {
        
            var fieldId = ds.fieldDefs.items[i].id;
            if (this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.containsField(fieldId)) {
                record[fieldId] = this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue(fieldId);
            }
            else {
                record[fieldId] = this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.getFieldValue(fieldId);
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
        var nextTab = this.tabs.findTab(nextTabName);
        nextTab.loadView();
        this.tabs.selectTab(nextTabName);
    }
});

function selectSubRequestType(){
    //get request type
    var requestType = ascBjUsmsProcChangeCreateReqBasicInputTabController.tabs.requestType;
    
    //create restriction
    var restriction = new Ab.view.Restriction();
    restriction.addClause('probtype.prob_type', requestType.replace(/SERVICE DESK - /g, '') + "%", 'LIKE');
    
    //open select value window using restriction
    View.selectValue({
        formId: 'ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm',
        title: '',
        fieldNames: ['activity_log.prob_type'],
        selectTableName: 'probtype',
        selectFieldNames: ['probtype.prob_type'],
        visibleFieldNames: ['probtype.prob_type', 'probtype.description'],
        restriction: restriction,
        sortValues: toJSON([{
            'fieldName': 'probtype.prob_type',
            'sortOrder': 0
        }])
    });
}
