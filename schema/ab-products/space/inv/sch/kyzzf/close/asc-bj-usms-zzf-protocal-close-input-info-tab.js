var ascBjUsmsProcAsgnApproveReqApproveTabController = View.createController("ascBjUsmsProcAsgnApproveReqApproveTabController", {

    tabs: null,
    activityLogId: null,
    record: null,
    protocal_id: null,
    afterInitialDataFetch: function(){
        //this.onStart();
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        var activity_log_id = this.tabs.activityLogId;
        //1.根据 activity_log_id 获取 协议ID protocal_id	
        var protocal_id = this.getProtocalId(activity_log_id);
        if (protocal_id == null) {
            alert("协议带出失败!");
        }
        else {
            //2.初始化协议信息
            this.initialProtoacl(protocal_id);
            //3.初始化该协议下的建筑物信息
            this.initialProtoaclRm(protocal_id);
			//4初始化缴费单
			this.initialProtoaclFees(protocal_id);
        }
    },
    
    /**
     * 根据 activity_log_id 获取 协议ID protocal_id
     * @Parameter
     * activity_log_id
     * @Return
     * protocal_id
     * */
    getProtocalId: function(activity_log_id){
        //  var protocal_id = null;
        var restriction = new Ab.view.Restriction();
        restriction.addClause('activity_log.activity_log_id', activity_log_id, '=');
        var record = this.activityLogDs.getRecord(restriction);
        this.protocal_id = record.getValue('activity_log.protocal_id');
        return this.protocal_id;
    },
    /**
     * 初始化协议信息
     * @Parameter
     * protocal_id
     *
     * */
    initialProtoacl: function(){
        var restriction = new Ab.view.Restriction();
        restriction.addClause('bh_zzf_protocal.protocal_id', this.protocal_id, '=');
        var record = this.zzf_protocol_ds.getRecord(restriction);
       // $('protocal_sq_id').value = record.getValue('bh_zzf_protocal.protocal_sq_id');
		
        this.closeRoomConsole.setFieldValue('bh_zzf_protocal.date_begin', this.dateToString(record.getValue('bh_zzf_protocal.date_begin')));
        this.closeRoomConsole.setFieldValue('bh_zzf_protocal.date_end', this.dateToString(record.getValue('bh_zzf_protocal.date_end')));
        this.closeRoomConsole.setFieldValue('bh_zzf_protocal.quit_date', record.getValue('bh_zzf_protocal.quit_date'));
        
        this.protocolInfo.setFieldValue('bh_zzf_protocal.protocal_sq_id', record.getValue('bh_zzf_protocal.protocal_sq_id'));
        this.protocolInfo.setFieldValue('bh_zzf_protocal.party_b_rep', record.getValue('bh_zzf_protocal.party_b_rep'));
        this.protocolInfo.setFieldValue('bh_zzf_protocal.party_b_rep_tel', record.getValue('bh_zzf_protocal.party_b_rep_tel'));
        this.protocolInfo.setFieldValue('bh_zzf_protocal.party_b_rep_dv', record.getValue('bh_zzf_protocal.party_b_rep_dv'));
        this.protocolInfo.setFieldValue('bh_zzf_protocal.party_b_rep_email', record.getValue('bh_zzf_protocal.party_b_rep_email'));
        this.protocolInfo.setFieldValue('bh_zzf_protocal.party_b_contacts', record.getValue('bh_zzf_protocal.party_b_contacts'));
        this.protocolInfo.setFieldValue('bh_zzf_protocal.party_b_con_tel', record.getValue('bh_zzf_protocal.party_b_con_tel'));
        this.protocolInfo.setFieldValue('bh_zzf_protocal.payment_type', record.getValue('bh_zzf_protocal.payment_type'));
        this.protocolInfo.setFieldValue('bh_zzf_protocal.payment_num', record.getValue('bh_zzf_protocal.payment_num'));
        
        this.protocolInfo.setFieldValue('bh_zzf_protocal.date_apply', this.dateToString(record.getValue('bh_zzf_protocal.date_apply')));
        this.protocolInfo.setFieldValue('bh_zzf_protocal.rm_use', record.getValue('bh_zzf_protocal.rm_use'));
        this.protocolInfo.setFieldValue('bh_zzf_protocal.rm_address', record.getValue('bh_zzf_protocal.rm_address'));
        this.protocolInfo.setFieldValue('bh_zzf_protocal.area_rent', record.getValue('bh_zzf_protocal.area_rent'));
        this.protocolInfo.setFieldValue('bh_zzf_protocal.area_protocal', record.getValue('bh_zzf_protocal.area_protocal'));
        this.protocolInfo.setFieldValue('bh_zzf_protocal.price_rent', record.getValue('bh_zzf_protocal.price_rent'));
        this.protocolInfo.setFieldValue('bh_zzf_protocal.price_rent_std', record.getValue('bh_zzf_protocal.price_rent_std'));
        this.protocolInfo.setFieldValue('bh_zzf_protocal.price_total_rent', record.getValue('bh_zzf_protocal.price_total_rent'));
        this.protocolInfo.setFieldValue('bh_zzf_protocal.preparer', record.getValue('bh_zzf_protocal.preparer'));
    },
    /**
     * 把date 类型的 转换为 "yyyy-mm-dd" 格式
     * */
    dateToString: function(date){
    
        return str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        
    },
    /**
     * 初始化协议建筑物信息
     * @Parameter
     * protocal_id
     * */
    initialProtoaclRm: function(){
        this.closeRoomProtocal.addParameter("protocalId", this.protocal_id);
        this.closeRoomProtocal.refresh();
    },
	
    /**
     * 初始化缴费单
     */
    initialProtoaclFees: function(){
        this.feesInfo.addParameter("activityLogId", this.protocal_id);
        this.feesInfo.refresh();
    },
    
    
    /**
     * 生成协议
     */
    protocolConsole_onProtocal: function(){
        View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
            width: 470,
            height: 200,
            xmlName: "protocol",
            closeButton: false
        });
    },
    
    /**
     * 保存租期
     */
    protocolConsole_onSave: function(){
        /**
         合并多个表单
         租期
         协议房
         协议房信息
         租金
         */
        //保存时合并多个表单
        var record = this.moreFormInfo();
        //验证是否有空记录
        var canSaveRrcord = this.checkRecord(record);
        //保存记录
        if (canSaveRrcord) {
            var controller = this;
            var confirmMessage = "是否保存用户信息？";
            View.confirm(confirmMessage, function(button){
                if (button == 'yes') {
                    try {
                        //保存职工信息
                        controller.zzf_protocol_ds.saveRecord(record);
                        //输入审批意见
                        controller.onShowApproveWindow();
                        //    View.showMessage("审批通过！");
                    } 
                    catch (e) {
                        View.showMessage("操作失败,请重新操作！");
                        return;
                    }
                }
            });
        }
        
    },
    /**
     * 合并表单
     */
    moreFormInfo: function(){
        var recordP1 = this.protocolConsole.getRecord();
        var recordP2 = this.protocolInfo.getRecord();
        var restriction = new Ab.view.Restriction();
        recordP1.setValue("bh_zzf_protocal.protocal_sq_id", recordP2.getValue("bh_zzf_protocal.protocal_sq_id"));
        recordP1.setValue("bh_zzf_protocal.party_b", recordP2.getValue("bh_zzf_protocal.party_b"));
        recordP1.setValue("bh_zzf_protocal.party_b_rep", recordP2.getValue("bh_zzf_protocal.party_b_rep"));
        recordP1.setValue("bh_zzf_protocal.party_b_rep_tel", recordP2.getValue("bh_zzf_protocal.party_b_rep_tel"));
        recordP1.setValue("bh_zzf_protocal.party_b_rep_dv", recordP2.getValue("bh_zzf_protocal.party_b_rep_dv"));
        recordP1.setValue("bh_zzf_protocal.party_b_rep_email", recordP2.getValue("bh_zzf_protocal.party_b_rep_email"));
        recordP1.setValue("bh_zzf_protocal.party_b_contacts", recordP2.getValue("bh_zzf_protocal.party_b_contacts"));
        recordP1.setValue("bh_zzf_protocal.party_b_con_tel", recordP2.getValue("bh_zzf_protocal.party_b_con_tel"));
        recordP1.setValue("bh_zzf_protocal.payment_type", recordP2.getValue("bh_zzf_protocal.payment_type"));
        recordP1.setValue("bh_zzf_protocal.payment_num", recordP2.getValue("bh_zzf_protocal.payment_num"));
        recordP1.setValue("bh_zzf_protocal.date_apply", recordP2.getValue("bh_zzf_protocal.date_apply"));
        recordP1.setValue("bh_zzf_protocal.rm_use", recordP2.getValue("bh_zzf_protocal.rm_use"));
        recordP1.setValue("bh_zzf_protocal.rm_address", recordP2.getValue("bh_zzf_protocal.rm_address"));
        recordP1.setValue("bh_zzf_protocal.area_rent", recordP2.getValue("bh_zzf_protocal.area_rent"));
        recordP1.setValue("bh_zzf_protocal.area_protocal", recordP2.getValue("bh_zzf_protocal.area_protocal"));
        recordP1.setValue("bh_zzf_protocal.price_rent", recordP2.getValue("bh_zzf_protocal.price_rent"));
        recordP1.setValue("bh_zzf_protocal.price_rent_std", recordP2.getValue("bh_zzf_protocal.price_rent_std"));
        recordP1.setValue("bh_zzf_protocal.price_total_rent", recordP2.getValue("bh_zzf_protocal.price_total_rent"));
        recordP1.setValue("bh_zzf_protocal.pay_period", recordP2.getValue("bh_zzf_protocal.pay_period"));
        recordP1.setValue("bh_zzf_protocal.party_a", recordP2.getValue("bh_zzf_protocal.party_a"));
        recordP1.setValue("bh_zzf_protocal.party_a_rep", recordP2.getValue("bh_zzf_protocal.party_a_rep"));
        recordP1.setValue("bh_zzf_protocal.party_a_rep_tel", recordP2.getValue("bh_zzf_protocal.party_a_rep_tel"));
        recordP1.setValue("bh_zzf_protocal.party_a_rep_dv", recordP2.getValue("bh_zzf_protocal.party_a_rep_dv"));
        recordP1.setValue("bh_zzf_protocal.party_a_rep_email", recordP2.getValue("bh_zzf_protocal.party_a_rep_email"));
        recordP1.setValue("bh_zzf_protocal.party_a_contacts", recordP2.getValue("bh_zzf_protocal.party_a_contacts"));
        recordP1.setValue("bh_zzf_protocal.party_a_con_tel", recordP2.getValue("bh_zzf_protocal.party_a_con_tel"));
        return recordP1;
    },
    /**
     * 验证是否有空记录
     * @param {Object} record
     */
    checkRecord: function(record){
        var date_begin = record.getValue("bh_zzf_protocal.date_begin");
        var date_end = record.getValue("bh_zzf_protocal.date_end");
        var live_time = record.getValue("bh_zzf_protocal.live_time");
        var time_pre = record.getValue("bh_zzf_protocal.time_pre");
        
        var party_b = record.getValue("bh_zzf_protocal.party_b");
        var party_b_rep = record.getValue("bh_zzf_protocal.party_b_rep");
        var party_b_rep_tel = record.getValue("bh_zzf_protocal.party_b_rep_tel");
        var party_b_rep_dv = record.getValue("bh_zzf_protocal.party_b_rep_dv");
        var party_b_rep_email = record.getValue("bh_zzf_protocal.party_b_rep_email");
        var party_b_contacts = record.getValue("bh_zzf_protocal.party_b_contacts");
        var party_b_con_tel = record.getValue("bh_zzf_protocal.party_b_con_tel");
        var payment_type = record.getValue("bh_zzf_protocal.payment_type");
        var payment_num = record.getValue("bh_zzf_protocal.payment_num");
        var date_apply = record.getValue("bh_zzf_protocal.date_apply");
        var rm_use = record.getValue("bh_zzf_protocal.rm_use");
        var rm_address = record.getValue("bh_zzf_protocal.rm_address");
        var area_rent = record.getValue("bh_zzf_protocal.area_rent");
        var area_protocal = record.getValue("bh_zzf_protocal.area_protocal");
        var price_rent = record.getValue("bh_zzf_protocal.price_rent");
        var price_rent_std = record.getValue("bh_zzf_protocal.price_rent_std");
        var price_total_rent = record.getValue("bh_zzf_protocal.price_total_rent");
        //甲方信息
        var pay_period = record.getValue("bh_zzf_protocal.pay_period");
        var party_a = record.getValue("bh_zzf_protocal.party_a");
        var party_a_rep = record.getValue("bh_zzf_protocal.party_a_rep");
        var party_a_rep_tel = record.getValue("bh_zzf_protocal.party_a_rep_tel");
        var party_a_rep_dv = record.getValue("bh_zzf_protocal.party_a_rep_dv");
        var party_a_rep_email = record.getValue("bh_zzf_protocal.party_a_rep_email");
        var party_a_contacts = record.getValue("bh_zzf_protocal.party_a_contacts");
        var party_a_con_tel = record.getValue("bh_zzf_protocal.party_a_con_tel");
        
        if (!valueExistsNotEmpty(time_pre)) {
            View.showMessage("准备期不能为空！");
            return false;
        }
        if (!valueExistsNotEmpty(party_a)) {
            View.showMessage("甲方信息不能为空！");
            return false;
        }
        if (!valueExistsNotEmpty(party_a_rep)) {
            View.showMessage("负责人信息不能为空！");
            return false;
        }
        if (!valueExistsNotEmpty(party_a_rep_tel)) {
            View.showMessage("负责人电话不能为空！");
            return false;
        }
        if (!valueExistsNotEmpty(party_a_rep_dv)) {
            View.showMessage("负责人院系不能为空！");
            return false;
        }
        if (!valueExistsNotEmpty(party_a_rep_email)) {
            View.showMessage("邮箱不能为空！");
            return false;
        }
        if (!valueExistsNotEmpty(party_a_contacts)) {
            View.showMessage("联系人信息不能为空！");
            return false;
        }
        if (!valueExistsNotEmpty(party_a_con_tel)) {
            View.showMessage("联系人电话不能为空！");
            return false;
        }
        return true;
    },
    /**
     * 保存缴费信息
     */
    feesInfoSave: function(){
    
    },
    
    
    /**
     * 审批意见
     */
    onShowApproveWindow: function(){
        $("comments").value = '';
        var role = View.user.role;
        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.save();
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.refresh(this.tabs.approveTabrestriction);
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.showInWindow({
            width: 600,
            height: 260
        });
    },
    /**
     * 审批
     */
    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onApprove: function(){
        var record = this.getRecord();
        var comments = $("comments").value;
        if (comments.length < 1) {
            View.showMessage("请输入审核批语!");
            return;
        }
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-approveRequest', record, comments);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        this.closeApproveWindow(false);
        if (result.code == 'executed' && View.user.role == 'UNV DIVISION HEAD') {
            //如果是二级院系领导审批完后则，给个提示
            var father = this;
            View.showMessage('message', "审批通过！", '', '', function(){
                father.onBack();
            });
        }
        
    },
    /**
     * 驳回
     */
    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onReject: function(){
        var record = this.getRecord();
        var comments = $("comments").value;
        
        if (comments.length < 1) {
            View.showMessage("请输入评语-驳回原因！");
            return;
        }
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-rejectRequest', record, comments);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        this.closeApproveWindow(true);
        if (result.code == 'executed' && View.user.role == 'UNV DIVISION HEAD') {
            //如果是二级院系领导审批完后则，给个提示
            var father = this;
            View.showMessage('message', "驳回成功！", '', '', function(){
                father.onBack();
            });
        }
    },
    
    /**
     * 返回
     */
    onBack: function(){
        View.getWindow('parent').View.setTitle("房屋分配-审批");
        var tabName = 'selectRequestTab';
        var tab = this.tabs.findTab(tabName);
        this.tabs.selectTab(tabName);
    },
    
    
   //筛选
	closeRoomConsole_onShow:function(){
	},
	 
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    afterSelect: function(){
        //this.onStart();
    },
    
    onStart: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        
        this.selectBasicFormByRequestType();
        
        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.setRecord(this.record);
        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.show(true);
        this.ascBjUsmsProcAsgnApproveReqApproveTabAttachmentForm.refresh(this.tabs.approveTabrestriction);
        this.showHistoryPanel('activity_log');
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldElement('activity_log.approved_by').disabled = true;
        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm_afterRefresh();
    },
    
    selectBasicFormByRequestType: function(){
        if (this.tabs.requestType != '房屋分配-办公用房申请') {
            this.ascBjUsmsProcAsgnApproveReqApproveTabForm2.show(false);
            this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.refresh(this.tabs.approveTabrestriction);
            this.record = this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.getRecord();
        }
        else {
            this.ascBjUsmsProcAsgnApproveReqApproveTabForm2.refresh(this.tabs.approveTabrestriction);
            this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.show(false);
            this.record = this.ascBjUsmsProcAsgnApproveReqApproveTabForm2.getRecord();
        }
    },
    ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm_afterRefresh: function(){
    },
    ascBjUsmsProcAsgnApproveReqApproveTabForm1_afterRefresh: function(){
        USMS_showBaseInfoOfUserOrProject(this.ascBjUsmsProcAsgnApproveReqApproveTabForm1, false);
    },
    
    ascBjUsmsProcAsgnApproveReqApproveTabForm2_afterRefresh: function(){
        USMS_showBaseInfoOfUserOrProject(this.ascBjUsmsProcAsgnApproveReqApproveTabForm2, true);
    },
    /**
     */
    ascBjUsmsProcAsgnApproveReqApproveTabHistoryPanel_afterRefresh: function(){
    
        reloadHistoryPanel(this.ascBjUsmsProcAsgnApproveReqApproveTabHistoryPanel);
    },
    
    showHistoryPanel: function(tableName){
        var panel = View.panels.get("ascBjUsmsProcAsgnApproveReqApproveTabForm1");
        if (!panel.visible) {
            panel = View.panels.get("ascBjUsmsProcAsgnApproveReqApproveTabForm2");
        }
        
        var historyPanel = this.ascBjUsmsProcAsgnApproveReqApproveTabHistoryPanel;
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation', tableName, 'activity_log_id', panel.getFieldValue('activity_log.activity_log_id'));
            
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
    
    onBack: function(){
        View.getWindow('parent').View.setTitle("房屋分配-审批");
        //select next tab and reload the tab view
        var tabName = 'selectRequestTab';
        var tab = this.tabs.findTab(tabName);
        //tab.loadView();
        this.tabs.selectTab(tabName);
    },
    
    
    
    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onForward: function(){
        var forwardTo = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue("activity_log.approved_by");
        if (!forwardTo) {
            View.alert(getMessage("请在 [审批转发给] 输入框后选择要转发的目标用户。"))
            return;
        }
        
        var record = this.getRecord();
        var comments = $("comments").value;
        
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-forwardApproval', record, comments, forwardTo);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        this.closeApproveWindow(false);
        if (result.code == 'executed' && View.user.role == 'UNV DIVISION HEAD') {
            //如果是二级院系领导审批完后则，给个提示
            var father = this;
            View.showMessage('message', "审批转发成功！", '', '', function(){
                father.onBack();
            });
        }
    },
    
    getRecord: function(){
        var record = {};
        record['activity_log.activity_log_id'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log.activity_log_id');
        record['activity_log.approved_by'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log.approved_by');
        record['activity_log_step_waiting.step_log_id'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log_step_waiting.step_log_id');
        return record;
    },
    
    closeApproveWindow: function(isReject){
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.closeWindow();
        if (isReject) {
            this.showHistoryPanel('hactivity_log');
        }
        else {
            this.showHistoryPanel('activity_log');
        }
        this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.actions.get('approve').enable(false);
        this.ascBjUsmsProcAsgnApproveReqApproveTabForm2.actions.get('approve').enable(false);
        
        
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



