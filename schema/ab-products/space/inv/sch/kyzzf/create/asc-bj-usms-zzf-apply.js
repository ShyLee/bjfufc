var applyZZFController = View.createController("applyZZFController", {
    aprotocalRmRecords: null,
    dvId: null,
    activityLogId: null,
    afterInitialDataFetch: function(){
        this.initEmInfo();
    },
    applyForm_onCreateRequest: function(){
        if (this.applyForm.canSave()) {
            this.activityLogId = this.saveWorkFlow();
            
            if (this.activityLogId) {
                this.setActivityId();
                this.applyForm.save();
                this.setEditable();
                View.showMessage('message',"申请成功！");
            }
            
        };
            },
    setEditable: function(){
        jQuery('#applyForm input').attr("disabled", "disabled");
        jQuery('#applyForm textarea').attr("disabled", "disabled");
        jQuery('#applyForm select').attr("disabled", "disabled");
    },
    setActivityId: function(){
        var formPanel = View.panels.get('applyForm');
        formPanel.setFieldValue('bh_zzf_apply.activity_log_id', this.activityLogId);
    },
    saveWorkFlow: function(){
        var record = {};
        var ds = this.activityLogDs;
        
        record['activity_log.prob_type'] = ZZFCommonController.probType;
        record['activity_log.activity_type'] = ZZFCommonController.activityType;
        record['activity_log.requestor'] = View.user.name;
        record['activity_log.dv_id'] = this.dvId;
        var activityLogId = null;
        try {
            result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', 0, record);
            if (result.code == 'executed') {
                activityLogId = eval('(' + result.jsonExpression + ')').activity_log_id;
                return activityLogId;
            }
        } 
        catch (e) {
            Workflow.handleError(e);
            return;
        }
    },
    initEmInfo: function(){
        var emId = View.user.name;
        var restriction = "em.em_id='" + emId + "'";
        var parameters = {
            tableName: 'em',
            fieldNames: toJSON(['em.em_id', 'em.name', 'em.sex', 'em.identi_code', 'em.phone', 'em.email', 'em.dv_id']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
            var emId = result.data.records[0]['em.em_id'];
            var emName = result.data.records[0]['em.name'];
            var emSex = result.data.records[0]['em.sex'];
            var identiCode = result.data.records[0]['em.identi_code'];
            var emPhone = result.data.records[0]['em.phone'];
            var emEmail = result.data.records[0]['em.email'];
            this.dvId = result.data.records[0]['em.dv_id'];
            
            var formPanel = View.panels.get('applyForm');
            formPanel.setFieldValue('bh_zzf_apply.em_mobile', emPhone);
            formPanel.setFieldValue('bh_zzf_apply.em_email', emEmail);
            formPanel.setFieldValue('bh_zzf_apply.em_dv', this.dvId);
            var today = new Date();
            var uiValue = today.format(View.dateFormat);
            formPanel.setFieldValue('bh_zzf_apply.date_apply', uiValue);
        }
    }
});



