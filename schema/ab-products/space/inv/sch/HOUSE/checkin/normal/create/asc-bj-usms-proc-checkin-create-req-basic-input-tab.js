var asgnCreateReqBasicInputTabController = View.createController("AsgnCreateBasicInputTabController", {
    tabs: null,
    activityLogId: '',
    cardId:null,
    tflag: 'teacher',
    curr_user: '',
    
    afterInitialDataFetch: function(){
    	this.curr_user = View.user.name;
    	this.tabs = View.getControlsByType(parent, 'tabs')[0];
    	
    	// 判断此员工是否承诺永不租房
    	if(this.isNeverRent(this.curr_user)){
    		 this.teacherInfoForm.actions.get('submit').enable(false);
	  		  this.enablePage();
	  		  View.showMessage("用户:" + this.curr_user +　"已承诺永不租赁周转房并享有补贴,不能再去申请！");
	  		  return;
    	}
    	
    	var nums = this.getApprovingNum(this.curr_user);
	  	if(nums > 0){
	  		  this.teacherInfoForm.actions.get('submit').enable(false);
	  		  this.enablePage();
	  		  View.showMessage("用户:" + this.curr_user +　"已有[" + nums +"]套房产在申请中,不能再去申请！");
	  		  return;
	  	}
	  	
	  	nums = this.getApprovedNum(this.curr_user);
	  	if(nums >= 2){
	  		  this.teacherInfoForm.actions.get('submit').enable(false);
	  		  this.enablePage();
	  		  View.showMessage("用户:" + this.curr_user +　"已申请或入住[" + nums +"]套房产,不能再去申请！"); 
	  		  return;
	  	}
    	
        this.antoGetEmInfo(this.curr_user);
        
        nums = this.getApprovingHistoryNum(this.curr_user);
	  	if(nums > 0){
	  		this.descForm.setFieldValue("sc_zzfcard.rent_type",'ZLTZ');
	  	}else{
	  		this.descForm.setFieldValue("sc_zzfcard.rent_type",'CCSQ');
	  	}
        
    },
    /**
     *  判断此员工是否承诺永不租房
     * 
     * */
    isNeverRent: function(em_id){
    	var restriction = "em.em_id = '" + em_id + "'";
        var parameters = {
            tableName: 'em',
            fieldNames: toJSON(['em.em_id', 'em.zzf_able']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
            var zzf_able = result.data.records[0]['em.zzf_able'];
            if(zzf_able == "不租赁周转房"){
            	return true;
            }else{
            	return false;
            }
        }
    },
    /**
     * 不适合申请条件的人员，页面变得不可编辑
     * */
    enablePage: function(){
    	jQuery('#teacherInfoForm input').attr("disabled","disabled");
     	jQuery('#teacherInfoForm textarea').attr("disabled","disabled");
     	jQuery('#teacherInfoForm select').attr("disabled","disabled");
         
         jQuery('#descForm input').attr("disabled","disabled");
     	jQuery('#descForm textarea').attr("disabled","disabled");
     	jQuery('#descForm select').attr("disabled","disabled");
    },
    
    /**
     * 判断 申请人名下存在“已申请”状态下的周转房
     * 
     * 	   只要在入住登记之前，不能再次进行申请周转房
     * 
     **/
    getApprovingNum: function(emId){
    	var restriction = "sc_zzfcard.em_id = '" + emId + "' and (sc_zzfcard.card_status = 'ysq' or sc_zzfcard.card_status = 'ysp')";
        var parameters = {
            tableName: 'sc_zzfcard',
            fieldNames: toJSON(['sc_zzfcard.bl_id', 'sc_zzfcard.fl_id', 'sc_zzfcard.rm_id','sc_zzfcard.em_id']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    	return result.data.records.length;
    },
    /**
     * 判断 申请人名下存在有效的card记录个数
     **/
    getApprovedNum: function(emId){
    	var restriction = "sc_zzfcard.em_id = '" + emId + "' and (sc_zzfcard.card_status = 'ysq' or sc_zzfcard.card_status = 'ysp' or sc_zzfcard.card_status = 'yrz' or sc_zzfcard.card_status = 'yxq')";
        var parameters = {
            tableName: 'sc_zzfcard',
            fieldNames: toJSON(['sc_zzfcard.bl_id', 'sc_zzfcard.fl_id', 'sc_zzfcard.rm_id','sc_zzfcard.em_id']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    	return result.data.records.length;
    },
    /**
     * 判断 申请人名下存在“已入住”或“已续签”或“已退住”的租赁历史时
     **/
    getApprovingHistoryNum: function(emId){
    	var restriction = "sc_zzfcard.em_id = '" + emId + "' and (sc_zzfcard.card_status = 'yrz' or sc_zzfcard.card_status = 'yxq' or sc_zzfcard.card_status = 'ytz')";
        var parameters = {
            tableName: 'sc_zzfcard',
            fieldNames: toJSON(['sc_zzfcard.bl_id', 'sc_zzfcard.fl_id', 'sc_zzfcard.rm_id','sc_zzfcard.em_id']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    	return result.data.records.length;
    },
    /**
     * 输入职工号，自动获取相关信息
     */
    antoGetEmInfo: function(em_id){
        var emId = em_id;
        var restriction = "em.em_id='" + emId + "'";
        var parameters = {
            tableName: 'em',
            fieldNames: toJSON(['em.em_id', 'em.name', 'em.sex', 'em.identi_code', 'em.phone', 'em.email', 'em.dv_id', 'em.date_work_begin', 'em.is_working_parents', 'em.married', 'em.po_name', 'em.po_dv_id', 'em.po_em_id', 'em.po_identi_code', 'em.address_emjt','em.zhiw_id','em.zhic_id']),
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
            var emDvId = result.data.records[0]['em.dv_id'];
            var dateJoinWork = result.data.records[0]['em.date_work_begin'];
            
            var isWorkIngParents = result.data.records[0]['em.is_working_parents'];
            
            var married = result.data.records[0]['em.married'];
            var poName = result.data.records[0]['em.po_name'];
            var poDvId = result.data.records[0]['em.po_dv_id'];
            var poEmId = result.data.records[0]['em.po_em_id'];
            var poIdentiCode = result.data.records[0]['em.po_identi_code'];
            var addressEmjt = result.data.records[0]['em.address_emjt'];
            var zhiwId = result.data.records[0]['em.zhiw_id'];
            var zhicId = result.data.records[0]['em.zhic_id'];
            if(married=='未婚'){
            	married="F"
            }else{
            	married="T"
            }
            if(emSex=='男'){
            	emSex="mal"
            }else{
            	emSex="fe"
            }
            if(isWorkIngParents=='是'){
            	isWorkIngParents="T"
            }else if(isWorkIngParents=='否'){
            	isWorkIngParents="F"
            }else if(isWorkIngParents=='外户'){
            	isWorkIngParents="WH"
            }else if(isWorkIngParents=='博士后进站'){
            	isWorkIngParents="BSH"
            }else if(isWorkIngParents=='合同工'){
            	isWorkIngParents="HTG"
            }else if(isWorkIngParents=='遗属'){
            	isWorkIngParents="YS"
            }else if(isWorkIngParents=='大集体'){
            	isWorkIngParents="DJT"
            }
            var formPanel = View.panels.get('teacherInfoForm');
            formPanel.setFieldValue('sc_zzfcard.em_id', emId);
            formPanel.setFieldValue('sc_zzfcard.em_name', emName);
            formPanel.setFieldValue('sc_zzfcard.sex', emSex);
            if(valueExistsNotEmpty(identiCode)){
            	formPanel.setFieldValue('sc_zzfcard.identi_code', identiCode);
            	formPanel.enableField('sc_zzfcard.identi_code', false);
            }
            
            formPanel.setFieldValue('sc_zzfcard.phone', emPhone);
            formPanel.setFieldValue('sc_zzfcard.email', emEmail);
            formPanel.setFieldValue('sc_zzfcard.dv_name', emDvId);
            formPanel.setFieldValue('sc_zzfcard.date_work_begin', dateJoinWork);
            formPanel.setFieldValue('sc_zzfcard.is_working_parents', isWorkIngParents);
            formPanel.setFieldValue('sc_zzfcard.marriage_stat', married);
            formPanel.setFieldValue('sc_zzfcard.po_name', poName);
            formPanel.setFieldValue('sc_zzfcard.po_dv_id', poDvId);
            formPanel.setFieldValue('sc_zzfcard.po_em_id', poEmId);
            formPanel.setFieldValue('sc_zzfcard.po_identi_code', poIdentiCode);
            formPanel.setFieldValue('sc_zzfcard.curr_addr', addressEmjt);
            formPanel.setFieldValue('sc_zzfcard.zhiw_id', zhiwId);
            formPanel.setFieldValue('sc_zzfcard.zhic_id', zhicId);
        }
    },
    
    onBack: function(){
        var tabName = 'selectTab';
        var tab = this.tabs.findTab(tabName);
        this.tabs.selectTab(tabName).loadView();
        this.tabs.selectTab(tabName).show(true);
    },
    /***
     * 提交申请
     * 
     * 1.保存card信息
     * 
     * 2.提交流程申请
     * 
     * 3.刷新结果
     * */
    onSubmit: function(){
        if(this.teacherInfoForm.canSave() && this.descForm.canSave()){
        	var result = this.saveZZFCard();
        	if(result){
            	this.cardId = this.teacherInfoForm.getFieldValue('sc_zzfcard.card_id');
            	
            	var restriction = new Ab.view.Restriction();
                restriction.addClause("sc_zzfcard.card_id", this.cardId, "=");
                this.descForm.refresh(restriction,false);
            }else{
            	return;
            }
        }else{
        	return;
        }
        
        var record = this.getActivityLogRecord();
        try {
            result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', 0, record);
            if (result.code == 'executed') {
                //get activity_log_id from result and create restriction 
            	var activityLogId = eval('(' + result.jsonExpression + ')').activity_log_id;
            	this.teacherInfoForm.actions.get('submit').enable(false);
            	View.showMessage("申请成功");
            }
            else {
                return;
            }
        } 
        catch (e) {
            Workflow.handleError(e);
            return;
        }
    },
    saveZZFCard: function(){
    	var rent_type = this.descForm.getFieldValue('sc_zzfcard.rent_type');
    	var yxhx = this.descForm.getFieldValue('sc_zzfcard.yxhx');
    	var apply_reason = this.descForm.getFieldValue('sc_zzfcard.apply_reason');
    	var apply_beizhu = this.descForm.getFieldValue('sc_zzfcard.apply_beizhu');
    	
    	this.teacherInfoForm.setFieldValue('sc_zzfcard.rent_type',rent_type);
    	this.teacherInfoForm.setFieldValue('sc_zzfcard.yxhx',yxhx);
    	this.teacherInfoForm.setFieldValue('sc_zzfcard.apply_reason',apply_reason);
    	this.teacherInfoForm.setFieldValue('sc_zzfcard.apply_beizhu',apply_beizhu);
    	
    	var result = this.teacherInfoForm.save();
    	return result;
    },
    getActivityLogRecord: function(){
        var record = {};
        record['activity_log.requestor'] = this.teacherInfoForm.getFieldValue('sc_zzfcard.em_id');
        record['activity_log.requestor_name'] = this.teacherInfoForm.getFieldValue('sc_zzfcard.em_name');
        record['activity_log.prob_type'] = this.tabs.probType;
        record['activity_log.activity_type'] = this.tabs.activityType;
        record['activity_log.zzfcard_id'] = this.cardId;
        return record;
    }
    
  
    
});



