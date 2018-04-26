
var editUser = View.createController('editUser', {

    emId: "",
    
    afterInitialDataFetch: function(){
        //this.user.getFieldElement('afm_users.user_pwd').disabled = true;
    },
    
    user_afterRefresh: function(){
        var email = this.user.getFieldValue('afm_users.email');
		var username = this.user.getFieldValue('afm_users.user_name');
        onSetEmId(email,username);
        
        this.user.getFieldElement('afm_users.user_pwd').disabled = true;
        var isAdd = (username === '');
        var title = isAdd ? getMessage('addUserTitle') : getMessage('editUserTitle');
        this.user.setTitle(title);
        var passwordField = this.user.getFieldElement('afm_users.user_pwd');
        var passwordRow = Ext.get(passwordField.parentNode.parentNode);
        passwordRow.setDisplayed(!isAdd);
    },
    getMailUrl: function(){
        var ds = this.scSchoolMailUrlDs;
        var restriction = new Ab.view.Restriction();
        restriction.addClause("sc_school.sch_id", '1', '=');
        var record = ds.getRecord(restriction);
        var web_url = record.getValue('sc_school.web_url');
        if (valueExistsNotEmpty(web_url)) {
            web_url = '@' + web_url.substr(4, web_url.length - 3);
            
        }
        else {
            web_url = '@temp.edu.cn';
        }
        return web_url;
    },
    
    user_onSave: function(){
        var username = this.user.getFieldValue('afm_users.user_name');
		if (username == ""){
			alert("请输入用户名");
			return;
		}
		var email = this.user.getFieldValue('afm_users.email');
		if (!valueExistsNotEmpty(email)) {//如果页面上邮箱为空(也就是从em表中得到的邮箱为空)，自动生成一个
			
			email = this.emId + this.getMailUrl();
			//alert("生成邮箱成功:" + email);
            this.user.setFieldValue('afm_users.email', email);
            
        }
        if (!this.checkEmail(email)) {
            View.showMessage("此邮箱已经被用户注册过，请更改邮箱!");
            return ;
        }
        if (this.checkBeforeSaveEm()) {
            if (this.user.save()) {
            	//alert("save Ok");
            	//更新em中的邮箱
                this.updateEmailOfEm(email);
                this.users.refresh();
            }
        }
    },
    /**
     * return false, cann't save
     */
    checkBeforeSaveEm: function(){
    	//alert(this.emId);
        var res = new Ab.view.Restriction();
        res.addClause("em.em_id", this.emId, "=");
        var record = View.dataSources.get("consoleDs").getRecord(res);
        var em_id = record.getValue("em.em_id");
        var dv_id = record.getValue("em.dv_id");
        if (em_id == undefined) {
            alert("新增的用户没有关联的教职工，请选择已有教职工或增加教职工！");
            return false;
        }
        if (dv_id == null || dv_id == "") {
            alert("该用户关联的教职工没有所属单位，请为该教职工选择所属单位！");
            return false;
        }
        
        return true;
    },
    /**
     * update email of em
     * @param {Object} email
     */
    updateEmailOfEm: function(email){
        var record = null;
        var restriction = new Ab.view.Restriction();
        restriction.addClause('em.em_id', this.emId);
        var records = this.employeeDs.getRecords(restriction);
        if (records.length > 0) {
            record = records[0];
            record.setValue('em.email', email);
            record.isNew = false;
            try {
                this.employeeDs.saveRecord(record);
            } 
            catch (e) {
                View.showException(e, '保存教职工信息失败！');
                return;
            }
            
        }
    },
    /**
     *
     * @param {Object} email
     */
    checkEmail: function(email){
        //1获取除了当前职工，是否还有其他职工使用该邮箱
        var parameters = {
            tableName: 'em',
            fieldNames: toJSON(['em.em_id', 'em.email']),
            restriction: toJSON("em.email = '" + email + "'" + " and em.em_id!='" + this.emId + "'")
        };
        var em_length;
        var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
        if (result.code == 'executed') {
            em_length = result.data.records.length;
        }
        else {
            Ab.workflow.Workflow.handleError(result);
            return null;
        }
        
        //2获取除了当前用户，是否还有其他用户使用该邮箱
        var oldUserName = this.user.getOldFieldValues()[("afm_users.user_name")];
		if (oldUserName == "") oldUserName = this.user.getFieldValue("afm_users.user_name");
        var users_parameters = {
            tableName: 'afm_users',
            fieldNames: toJSON(['afm_users.user_name', 'afm_users.email']),
            restriction: toJSON("afm_users.email = '" + email + "'" + " and afm_users.user_name!='" + oldUserName + "'")
        };
        
        var users_length;
        var users_result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', users_parameters);
        if (users_result.code == 'executed') {
            users_length = users_result.data.records.length;
        }
        else {
            Ab.workflow.Workflow.handleError(users_result);
            return null;
        }
        
        //3如果有其他职工 或 其他用户使用该邮箱，则返回提醒
        if (users_length >= 1 || em_length >= 1) {
            return false;
        }
        return true;
    },
    
    consolePanel_onShow: function(){
        var emName = this.consolePanel.getFieldValue("em.name");
        var dvId = this.consolePanel.getFieldValue("em.dv_id");
        var parameter = " and 1 = 1 ";
        if (emName != "") {
            parameter += " and em.name like '%" + emName + "%' ";
        }
        if (dvId != "") {
            parameter += " and em.dv_id like '%" + dvId + "%' ";
        }
        this.users.addParameter('emName', parameter);
        this.users.refresh();
    }
    
});

function selectUserName(){

    View.selectValue({
        formId: 'user',
        title: '从教职工表选择用户名称',
        fieldNames: ['afm_users.user_name', 'afm_users.email', 'afm_users.user_xingMing'],
        selectTableName: 'em',
        selectFieldNames: ['em.em_id', 'em.email', 'em.name'],
        visibleFieldNames: ['em.em_id', 'em.name', 'em.dv_id', 'em.zw_id', 'em.email'],
		restriction : 'not exists ( SELECT email FROM afm_users where afm_users.email=em.email)',
        actionListener: 'afterSelectEmployee',
        width: 600,
        height: 500
    });
}

/**
 *
 * @param {Object} email
 */
function getEmIdByEmail(email){
    var em_id = "";
    var res = new Ab.view.Restriction();
    res.addClause("em.email", email, "=");
    var records = View.dataSources.get("employeeDs").getRecords(res);
    if (records.length > 0) {
        em_id = records[0].getValue("em.em_id");
    }
    
    return em_id;
}

function afterSelectEmployee(fieldName, selectedValue, previousValue){
    if (fieldName == 'afm_users.user_name') {
        $('em_name_text_input').value = selectedValue;
		editUser.emId = selectedValue;
    }
    
    return true;
}

/**
 * after click the grid item, set the em_id value into users panel
 * @param {Object} email
 */
function onSetEmId(email, username){
    var emId = '';
    if (email) {
        emId = getEmIdByEmail(email);
    }
    else {//此种情况运用到在grid中（users）里面有记录（但记录中没有邮箱的情况下），又因为user的数据源是按照邮箱进行查找的，里面肯定有邮箱的值，所以没意义
    	  //而点击新增按钮，username的值为空，也没意义
        emId = username;
    }
    if (!View.panels.get('users').newRecord) {
        $('em_name_text_input').value = emId;
    }
    else {
        $('em_name_text_input').value = '';
    }
	
    editUser.emId = emId;
}
