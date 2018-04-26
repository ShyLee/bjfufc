
jQuery().ready(function() {
	
		 //给页面上 <field >设置了 cssClass 的字段 注册事件
		 jQuery("#emForm input[class*='inputValueChg']").on("change",function(e){
			   var eventSrc=e.target.id;

			   if(jQuery(this).val().trim()==''){
				   
				   switch(eventSrc)
				   {
				   case 'emForm_sc_zf_em.zw_name': //判断当前的事件源 是哪一个文本框 case里面写的是 当前文本框的id
					   jQuery("#emForm_sc_zf_em\\.zw_id").val('');
					     break;
					     
					     
				   case 'emForm_sc_zf_em.zc_name':
					   jQuery("#emForm_sc_zf_em\\.zc_id").val('');
					   break;
					   
				   case 'emForm_sc_zf_em.zc_jb_name':
					   jQuery("#emForm_sc_zf_em\\.zc_id").val('');
					   jQuery("#emForm_sc_zf_em\\.zc_name").val('');
					   jQuery("#emForm_sc_zf_em\\.zc_jb_id").val('');
					   
					   autoGetBtArea();//职称级别变了，注意更新面积
					   break;
					   
				   case 'emForm_sc_zf_em.zw_jb_name':
					   jQuery("#emForm_sc_zf_em\\.zw_id").val('');
					   jQuery("#emForm_sc_zf_em\\.zw_name").val('');
					   jQuery("#emForm_sc_zf_em\\.zw_jb_id").val('');
					   
					   autoGetBtArea();//职务级别变了，注意更新面积
					   break;
					   
				   default:
				    
				   }
			   }
		 });
		 
		//给页面上 <field >设置了 cssClass 的字段 注册事件
		 jQuery("#poForm input[class*='inputValueChg']").on("change",function(e){
			   var eventSrc=e.target.id;

			   if(jQuery(this).val().trim()==''){
				   
				   switch(eventSrc)
				   {
				   case 'poForm_sc_zf_em_po.zw_name': //判断当前的事件源 是哪一个文本框 case里面写的是 当前文本框的id
					   jQuery("#poForm_sc_zf_em_po\\.zw_id").val('');
					     break;
				   case 'poForm_sc_zf_em_po.zc_name':
					   jQuery("#poForm_sc_zf_em_po\\.zc_id").val('');
					   break;
					    
				   case 'poForm_sc_zf_em_po.zw_jb_name':
					   jQuery("#poForm_sc_zf_em_po\\.zw_id").val('');
					   jQuery("#poForm_sc_zf_em_po\\.zw_name").val('');
					   jQuery("#poForm_sc_zf_em_po\\.zw_jb_id").val('');
					   
					   autoGetBtAreaPo();//职务级别变了，注意更新面积
					   break;
					   
				   case 'poForm_sc_zf_em_po.zc_jb_name':
					   jQuery("#poForm_sc_zf_em_po\\.zc_id").val('');
					   jQuery("#poForm_sc_zf_em_po\\.zc_name").val('');
					   jQuery("#poForm_sc_zf_em_po\\.zc_jb_id").val('');
					   
					   autoGetBtAreaPo();//职称级别变了，注意更新面积
					   break;
					   
				   case 'poForm_sc_zf_em_po.dv_name':
					   jQuery("#poForm_sc_zf_em_po\\.dv_id").val('');
					   break;
					   
				   default:
				    
				   }
			   }
		 });
});




var defZFemController = View.createController('defZFemController', {
	ARCHIVE_ID: null,
	EM_ID: null,
	afterViewLoad:function(){
		   this.detailTabs.addEventListener('afterTabChange', this.onTabsChange);
	},
	onTabsChange:function(tabPanel, selectedTabName, newTabName){
//		console.log(tabPanel);
//		console.log(selectedTabName);
//		console.log(newTabName);
		var currentTab=tabPanel.findTab(selectedTabName);
		currentTab.loadView();
	},
	afterInitialDataFetch:function(){
		this.detailTabs.disable();
		this.detailTabs.disableTab("partnerTab");
		this.detailTabs.disableTab("personalTab");
		
		this.emForm.getFieldElement("sc_zf_em.zw_jb_name").disabled = true;
		this.emForm.getFieldElement("sc_zf_em.zw_name").disabled = true;
		this.emForm.getFieldElement("sc_zf_em.zw_get_date").disabled = true;
		this.emForm.getFieldElement("sc_zf_em.zc_jb_name").disabled = true;
		this.emForm.getFieldElement("sc_zf_em.zc_name").disabled = true;
		this.emForm.getFieldElement("sc_zf_em.zc_get_date").disabled = true;
		this.emForm.getFieldElement("sc_zf_em.area_jz_std").disabled = true;
		this.emForm.getFieldElement("sc_zf_em.money_std").disabled = true;
	},
	
	GridForm_onAdd: function(){
		this.detailTabs.enable();
		this.detailTabs.disableTab("partnerTab");
		this.detailTabs.disableTab("personalTab");
		
		this.emForm.refresh({},true);
		this.changeEmType();
		this.changeMarryStatus();
	},
	/**
	 * 验证系统是否存在当前身份证号的用户
	 * 
	 */
	validateSfzhExsit:function(){
		var archive_id = this.emForm.getFieldValue("sc_zf_em.archive_id");
		var sfzh = this.emForm.getFieldValue("sc_zf_em.sfzh");
		
		var res=new Ab.view.Restriction();
		res.addClause('sc_zf_em.sfzh',sfzh,'=');
		if(valueExistsNotEmpty(archive_id)){//更新数据时
			res.addClause('sc_zf_em.archive_id',archive_id,'!=');
		}
		var record=this.scZfEmDs.getRecord(res);
		if(record.isNew){
			return false;
		}else{
			View.showMessage("已有其他人登记此身份证号码");
			return true;
		}
	},
	emForm_onSave: function(){
		if(!this.emForm.canSave()){
			return;
		}
		var exist = this.validateSfzhExsit();//验证系统是否存在当前身份证号的用户
		if(exist){
			return;
		}else{
			//根据当前用户的类型判断档案编号的生成策略
			//如果为在职员工则必须输入工号，根据工号自动生成档案编号
			var emType=this.emForm.getFieldValue("sc_zf_em.em_type");
			if(emType=="11"){
				var archiveId="";
				var emId=this.emForm.getFieldValue("sc_zf_em.em_id");
				if(valueExistsNotEmpty(emId)){
					try{
						var result=Workflow.callMethod('AbSpaceRoomInventoryBAR-getArchiveIdByEmId-getZfEmId', emId);
						if(result.code="executed"){
							archive_id=result.message;
							if(!valueExistsNotEmpty(archive_id)){
								View.alert("根据工号生成档案编码失败!请重新生成!");
								return;
							}
							View.panels.get("emForm").setFieldValue("sc_zf_em.archive_id",archive_id);
							this.emForm.save();
						}
					}catch(e){
						Workflow.handleError(e);
					}
				}else{
					View.alert("在职员工必须输入工号");
					return;
				}
				
			}else{
				//非在职员工需要在档案编号框中输入四位以上字符
				var headArchiveId=this.emForm.getFieldValue("sc_zf_em.archive_id");
				if(valueExistsNotEmpty(headArchiveId)){
					if(headArchiveId.length<4){
						View.alert("档案编号的前缀长度必须为4");
						return;
					}
					try{
						var result=Workflow.callMethod('AbSpaceRoomInventoryBAR-getArchiveIdByEmId-getZfEmId', headArchiveId);
						if(result.code="executed"){
							archive_id=result.message;
							if(!valueExistsNotEmpty(archive_id)){
								View.alert("生成档案编码失败!请重新生成!");
								return;
							}
							View.panels.get("emForm").setFieldValue("sc_zf_em.archive_id",archive_id);
							this.emForm.save();
						}
					}catch(e){
						Workflow.handleError(e);
					}
					
				}else{
					View.alert("非在职员工请在档案编号中输入四位前缀!");
					return;
				}
			}
			
		}
		this.ARCHIVE_ID = this.emForm.getFieldValue("sc_zf_em.archive_id");
		this.EM_ID = this.emForm.getFieldValue("sc_zf_em.em_id");
		
		//如果此时员工的婚姻状态变为离异，配偶的状态同步变为离异
		 //目前只提供由正常变为离异的状态，同步把配偶的状态由正常变为离异
        //[1;未婚;2;已婚;3;离异]
		var status_married = this.emForm.getFieldValue("sc_zf_em.status_married");
        if(status_married == "3"){
        	var res = new Ab.view.Restriction();
    		res.addClause("sc_zf_em_po.archive_id",this.ARCHIVE_ID,"=");
    		res.addClause("sc_zf_em_po.status",'1',"=");//[1;正常;2;离异;3;已故]
    		var record = this.scZfPoDs.getRecord(res);
    		
    		if(valueExistsNotEmpty(record)){
    			record.setValue("sc_zf_em_po.status",'2');
    			this.scZfPoDs.saveRecord(record);
    		}
        }
		
		
	    var res = new Ab.view.Restriction();
        res.addClause("sc_zf_em_po.archive_id", this.ARCHIVE_ID, "=");
        this.poGrid.refresh(res);
        this.poForm.show(false);
        this.detailTabs.enableTab("partnerTab");
        this.detailTabs.enableTab("personalTab");
        
        this.detailTabs.findTab("personalTab").loadView();
        this.GridForm.refresh();
	},
	//
	emForm_onDelete: function(){
		var controller = this;
		this.ARCHIVE_ID = this.emForm.getFieldValue("sc_zf_em.archive_id");
		var name = this.emForm.getFieldValue("sc_zf_em.xm");
		View.confirm("您确定要删除【" + name + "】的信息?", function(button){
			if(button == "yes"){
				//根据约束会删除所有依赖于此员工的数据
				controller.emForm.deleteRecord();
				controller.detailTabs.disable();
				controller.GridForm.refresh();
				View.showMessage("删除成功!");
			}
		});
	},
	
	linkToTabs: function(){
		this.detailTabs.SuperController = this;//作为全局变量在tab之间传值
		this.detailTabs.enable();
		this.detailTabs.enableTab("partnerTab");
		this.detailTabs.enableTab("personalTab");
		
		var selectedIndex = this.GridForm.selectedRowIndex;
	    this.ARCHIVE_ID = this.GridForm.rows[selectedIndex]["sc_zf_em.archive_id"];
	    this.EM_ID = this.GridForm.rows[selectedIndex]["sc_zf_em.em_id"];
	    
	    var res = new Ab.view.Restriction();
        res.addClause("sc_zf_em_po.archive_id", this.ARCHIVE_ID, "=");
        this.emForm.refresh(res,false);
        this.poGrid.refresh(res);
        this.poForm.show(false);
        
        this.detailTabs.findTab("personalTab").loadView();
        var status_em = this.emForm.getFieldValue("sc_zf_em.status_em");
       
        this.changeEmType();
		//重新载入职工状态的值
		this.emForm.setFieldValue("sc_zf_em.status_em",status_em);
		
		//默认显示个人信息
		this.detailTabs.selectTab("emTab");
	},
	
	
	
	
	/**------------------------------员工tab-----------------------------------------**/
	
	/**
	 * 验证身份证号是否有效
	 * */
	verifyIdCard: function(){
		var idCard = this.emForm.getFieldValue("sc_zf_em.sfzh");
		if(!IdCardValidate(idCard)){
			View.showMessage("身份证号[" + idCard + "]无效!请重新填写!");
			this.emForm.setFieldValue("sc_zf_em.sfzh","");
			Ext.fly(this.emForm.getFieldElement("sc_zf_em.sfzh").parentNode).addClass('formError');
			return false;
		}else{
			Ext.fly(this.emForm.getFieldElement("sc_zf_em.sfzh").parentNode).removeClass('formError');
			return true;
		}
	},
	/**
	 * 验证邮箱是否有效
	 * */
	verifyEmail: function(){
		var email = this.emForm.getFieldValue("sc_zf_em.email");
		if(!checkEmail(email)){
			View.showMessage("邮箱[" + email + "]无效!请重新填写!");
			this.emForm.setFieldValue("sc_zf_em.email","");
			Ext.fly(this.emForm.getFieldElement("sc_zf_em.email").parentNode).addClass('formError');
			return false;
		}else{
			Ext.fly(this.emForm.getFieldElement("sc_zf_em.email").parentNode).removeClass('formError');
			return true;
		}
	},
	/**
	 * 同步维护 人员类别与职工状态/并验证是否一致(如果不一致,要求填写一致)
	 * 
	 * 		录入在校人员 - 人员类别 (在职人员) 、职工状态(正常、暂停工资)
	 * 		录入校外人员 - 人员类别 (校外人员) 、职工状态(无)
	 * 	退休 – 人员类别 (离退人员) 、职工状态(正常、暂停工资)、离退时间
	 *		调离 – 人员类别 (调离人员)、职工状态(调离)、调离时间
	 *		去世 – 人员类别 (已故人员)、职工状态(已故)
	 * */
	changeEmType: function(){
		// {11:在职人员;98:离退人员;05:调离人员;xw:校外人员;03:已故人员}
		var em_type = this.emForm.getFieldValue("sc_zf_em.em_type");
	
		if(em_type == "11"){
			var element = this.emForm.getFieldElement("sc_zf_em.status_em");
			//先恢复到最初状态
			recoveryAllStatusEm(element);
			element.remove("2");
			element.remove("2");
			element.remove("2");
			
			//离退时间非必填
			var element = this.emForm.getFieldElement("sc_zf_em.date_retired");
			element.required = false;
			element.disabled = true;
			//调离时间非必填
			var element = this.emForm.getFieldElement("sc_zf_em.date_leaved");
			element.required = false;
			element.disabled = true;
		}
		
		if(em_type == "98"){
			var element = this.emForm.getFieldElement("sc_zf_em.status_em");
			//先恢复到最初状态
			recoveryAllStatusEm(element);
			element.remove("2");
			element.remove("2");
			element.remove("2");
			
			//调离时间非必填
			var element = this.emForm.getFieldElement("sc_zf_em.date_leaved");
			element.required = false;
			element.disabled = true;
			//离退时间为必填
			var element = this.emForm.getFieldElement("sc_zf_em.date_retired");
			element.required = true;
			element.disabled = false;
		}
		
		if(em_type == "05"){
			var element = this.emForm.getFieldElement("sc_zf_em.status_em");
			//先恢复到最初状态
			recoveryAllStatusEm(element);
			element.remove("0");
			element.remove("0");
			element.remove("1");
			element.remove("1");
			
			//离退时间非必填
			var element = this.emForm.getFieldElement("sc_zf_em.date_retired");
			element.required = false;
			element.disabled = true;
			//调离时间为必填
			var element = this.emForm.getFieldElement("sc_zf_em.date_leaved");
			element.required = true;
			element.disabled = false;
		}
		
		if(em_type == "xw"){
			var element = this.emForm.getFieldElement("sc_zf_em.status_em");
			//先恢复到最初状态
			recoveryAllStatusEm(element);
			element.remove("0");
			element.remove("0");
			element.remove("0");
			element.remove("0");
			
			//离退时间非必填
			var element = this.emForm.getFieldElement("sc_zf_em.date_retired");
			element.required = false;
			element.disabled = true;
			//调离时间非必填
			var element = this.emForm.getFieldElement("sc_zf_em.date_leaved");
			element.required = false;
			element.disabled = true;
		}
		
		if(em_type == "03"){
			var element = this.emForm.getFieldElement("sc_zf_em.status_em");
			//先恢复到最初状态
			recoveryAllStatusEm(element);
			element.remove("0");
			element.remove("0");
			element.remove("0");
			element.remove("1");
			
			//离退时间非必填
			var element = this.emForm.getFieldElement("sc_zf_em.date_retired");
			element.required = false;
			element.disabled = true;
			//调离时间非必填
			var element = this.emForm.getFieldElement("sc_zf_em.date_leaved");
			element.required = false;
			element.disabled = true;
		}
		
		//确定是否显示配偶信息
//		this.isShowPoInfo();
	},
	/**
	 * 	婚姻状况、是否双职工要维护一致，即不能出现 婚姻状态为 未婚 或 离异，是双职工的数据。
	 *    已婚的是否为双职工，系统可自动判断（根据配偶表的身份证号，在住房人员表查找，是否为本校职工,如果有em_id为本校教职工）。
	 * */
	changeMarryStatus: function(){
		//[1;未婚;2;已婚;3;离异]
		var status_married = this.emForm.getFieldValue("sc_zf_em.status_married");
		if(status_married != "2"){
			var element = this.emForm.getFieldElement("sc_zf_em.is_sworker");
			element.remove("0");
		}else{
			var archive_id = this.emForm.getFieldValue("sc_zf_em.sc_zf_em");
			var em_id = this.emForm.getFieldValue("sc_zf_em.em_id");
			var element = this.emForm.getFieldElement("sc_zf_em.is_sworker");
			recoveryAllIsSworker(element);
			//如果 此人存在工号，并且其配偶也在住房人员表中存在并且有工号，则认定他为双职工
			if(valueExistsNotEmpty(em_id) && this.poIsBxyg(archive_id)){
				element.remove("1");
			}else{
				element.remove("0");
			}
		}
	},
	
	/**
     * （根据配偶表的身份证号，在住房人员表查找，是否为本校职工）
     * 
     * */
    poIsBxyg: function(archive_id){
    	var restriction = "sc_zf_em_po.archive_id = '" + archive_id + "' and sc_zf_em_po.status = '1'";
        var parameters = {
            tableName: 'sc_zf_em_po',
            fieldNames: toJSON(['sc_zf_em_po.sfzh']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
            var sfzh = result.data.records[0]['sc_zf_em_po.sfzh'];
            
            var restriction = "sc_zf_em.sfzh = '" + sfzh + "'";
            var parameters = {
                tableName: 'sc_zf_em',
                fieldNames: toJSON(['sc_zf_em.em_id']),
                restriction: toJSON(restriction)
            };
            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
            if (result.data.records.length > 0) {
            	var em_id = result.data.records[0]['sc_zf_em.em_id'];
            	if(valueExistsNotEmpty(em_id)){//存在工号
            		return true;
            	}else{
            		return false;
            	}
            }else{
            	return false;
            }
        }else{
        	return false;
        }
    },
	
    checkDateCome: function(){
    	var date_begin_work =  this.emForm.getFieldValue("sc_zf_em.date_begin_work");
    	var date_come_sch =  this.emForm.getFieldValue("sc_zf_em.date_come_sch");
    	if(!valueExistsNotEmpty(date_begin_work)){
    		this.emForm.setFieldValue("sc_zf_em.date_come_sch","");
    		this.emForm.setFieldValue("sc_zf_em.date_first_gjj","");
    		View.showMessage("请先选择参加工作时间");
    		return;
    	}
    	if(getFormatDate(date_come_sch).getTime() < getFormatDate(date_begin_work).getTime()){
    		this.emForm.setFieldValue("sc_zf_em.date_come_sch","");
    		View.showMessage("来校时间不能早于参加工作时间");
    		return;
    	}
    },
    
    checkDateGjj: function(){
    	var date_begin_work =  this.emForm.getFieldValue("sc_zf_em.date_begin_work");
    	var date_first_gjj =  this.emForm.getFieldValue("sc_zf_em.date_first_gjj");
    	if(!valueExistsNotEmpty(date_begin_work)){
    		this.emForm.setFieldValue("sc_zf_em.date_first_gjj","");
    		View.showMessage("请先选择参加工作时间");
    		return;
    	}
    	if(getFormatDate(date_first_gjj).getTime() < getFormatDate(date_begin_work).getTime()){
    		this.emForm.setFieldValue("sc_zf_em.date_first_gjj","");
    		View.showMessage("首次建立公积金时间不能早于参加工作时间");
    		return;
    	}
    },
	
	/**------------------------------员工配偶tab-----------------------------------------**/
	poGrid_onAdd: function(){
		var res = new Ab.view.Restriction();
		var xb = this.emForm.getFieldValue("sc_zf_em.xb");
		if(xb == 1){
			xb = 2;
		}else{
			xb = 1;
		}
		
		res.addClause("sc_zf_em_po.archive_id", this.ARCHIVE_ID, "=");
		res.addClause("sc_zf_em_po.xb", xb, "=");
	    this.poForm.refresh(res,true);
	    this.poForm.setFieldValue("sc_zf_em_po.change_time", new Date());
	},
	/**
	 * 验证身份证号是否有效
	 * */
	verifyIdCardForPO: function(){
		var idCard = this.poForm.getFieldValue("sc_zf_em_po.sfzh");
		if(!IdCardValidate(idCard)){
			View.showMessage("身份证号[" + idCard + "]无效!请重新填写!");
			this.poForm.setFieldValue("sc_zf_em_po.sfzh","");
			Ext.fly(this.poForm.getFieldElement("sc_zf_em_po.sfzh").parentNode).addClass('formError');
			return false;
		}else{
			Ext.fly(this.poForm.getFieldElement("sc_zf_em_po.sfzh").parentNode).removeClass('formError');
			return true;
		}
	},
	/***
	 * 1.若当前配偶信息为新增记录，且配偶为本校员工,则配偶的配偶也新增记录并维护其婚姻状态和是否双职工状态
	 * 
	 * 2.若当前配偶记录未现存记录，且配偶为本校员工,则根据配偶记录的配偶现状同步维护当前用户与配偶的婚姻状态和是否双职工状态
	 * 
	 * 婚姻状态[1;未婚;2;已婚;3;离异] 是否双职工 [1;是;2;否]
	 * 配偶现状[1;正常;2;离异;3;已故]
	 * */
	poForm_onSave: function(){
		if(!this.poForm.canSave()){
			return;
		}
		var curRecord = this.poForm.getRecord();
		var sfzh = this.poForm.getFieldValue('sc_zf_em_po.sfzh');
		//配偶现状[1;正常;2;离异;3;已故]
		var status = this.poForm.getFieldValue('sc_zf_em_po.status');
		var archive_id = this.poForm.getFieldValue('sc_zf_em_po.archive_id');
		var change_time = this.poForm.getFieldValue('sc_zf_em_po.change_time');
		var date_married = this.poForm.getFieldValue('sc_zf_em_po.date_married');
		if(curRecord.isNew){//新增配偶记录
		    
		  //before，获取当前员工配偶的人员档案信息
			var res = new Ab.view.Restriction();
		    res.addClause("sc_zf_em.sfzh", sfzh, "=");
//		    res.addClause("sc_zf_em.em_id","","is not null");
		    var poEmRecord = this.scZfEmDs.getRecord(res);
		    
		    //before，获取当前员工的人员档案信息
		    var res = new Ab.view.Restriction();
		    res.addClause("sc_zf_em.archive_id", archive_id, "=");
		    var curEmRecord = this.scZfEmDs.getRecord(res);
		    
		    
			if(!poEmRecord.isNew){//存在配偶档案信息
				if(status == '1'){
					//检查当前是否存在正常的配偶信息
					var res = new Ab.view.Restriction();
				    res.addClause("sc_zf_em_po.archive_id", archive_id, "=");
				    res.addClause("sc_zf_em_po.status", '1', "=");
				    var curEmPoRecord = this.scZfPoDs.getRecord(res);
					if(!curEmPoRecord.isNew){
						View.showMessage("只能同时存在一个正常状态下的配偶,如果要新增正常状态的配偶,请先把其他配偶状态改为非正常状态");
						return ;
					}
					//检查当前配偶是否存在其他正常的配偶信息
					var res = new Ab.view.Restriction();
				    res.addClause("sc_zf_em_po.archive_id", poEmRecord.getValue("sc_zf_em.archive_id"), "=");
				    res.addClause("sc_zf_em_po.status", '1', "=");
				    res.addClause("sc_zf_em_po.sfzh", curEmRecord.getValue("sc_zf_em.sfzh"), "!=");
				    var curEmPoRecord = this.scZfPoDs.getRecord(res);
					if(!curEmPoRecord.isNew){
						View.showMessage("配偶档案中已存在一个正常状态下的配偶,如果要新增正常状态的配偶,请先把其他配偶状态改为非正常状态");
						return ;
					}
					
					
					//a.维护配偶状态信息
					poEmRecord.setValue("sc_zf_em.status_married", '2');
					if(valueExistsNotEmpty(poEmRecord.getValue("sc_zf_em.em_id"))){//检查配偶是不是本校教职工
						poEmRecord.setValue("sc_zf_em.is_sworker", '1');
					}else{
						poEmRecord.setValue("sc_zf_em.is_sworker", '2');
					}
					
					this.scZfEmDs.saveRecord(poEmRecord);
					//b.把当前人员增加的配偶的配偶记录中
				    var po_archive_id = poEmRecord.getValue('sc_zf_em.archive_id');
					this.poAddPoRecord(po_archive_id, curEmRecord, '1', change_time,date_married);
				    //c.维护自己的状态信息
					curEmRecord.setValue("sc_zf_em.status_married", '2');
					if(valueExistsNotEmpty(poEmRecord.getValue("sc_zf_em.em_id"))){//检查配偶是不是本校教职工
						curEmRecord.setValue("sc_zf_em.is_sworker", '1');
					}else{
						curEmRecord.setValue("sc_zf_em.is_sworker", '2');
					}
					this.scZfEmDs.saveRecord(curEmRecord);
					
				}else if(status == '2'){
					//a.维护配偶状态信息
					poEmRecord.setValue("sc_zf_em.status_married", '3');
					poEmRecord.setValue("sc_zf_em.is_sworker", '2');
					this.scZfEmDs.saveRecord(poEmRecord);
					//b.把当前人员增加的配偶的配偶记录中
				    var po_archive_id = poEmRecord.getValue('sc_zf_em.archive_id');
					this.poAddPoRecord(po_archive_id, curEmRecord, '2', change_time,date_married);
				    //c.维护自己的状态信息
					curEmRecord.setValue("sc_zf_em.status_married", '3');
					curEmRecord.setValue("sc_zf_em.is_sworker", '2');
					this.scZfEmDs.saveRecord(curEmRecord);
					
				}else if(status == '3'){//不考虑配偶的员工状态
					//a.维护配偶状态信息
					poEmRecord.setValue("sc_zf_em.status_married", '3');
					poEmRecord.setValue("sc_zf_em.is_sworker", '2');
					this.scZfEmDs.saveRecord(poEmRecord);
					//b.把当前人员增加的配偶的配偶记录中
				    var po_archive_id = poEmRecord.getValue('sc_zf_em.archive_id');
					this.poAddPoRecord(po_archive_id, curEmRecord, '3', change_time,date_married);
				    //c.维护自己的状态信息
					curEmRecord.setValue("sc_zf_em.status_married", '3');
					curEmRecord.setValue("sc_zf_em.is_sworker", '2');
					this.scZfEmDs.saveRecord(curEmRecord);
				}
			}else{//不存在配偶档案信息
				 //c.维护自己的婚姻状态信息
				if(status == '1'){
					curEmRecord.setValue("sc_zf_em.status_married", '2');
					this.scZfEmDs.saveRecord(curEmRecord);
				}else if(status == '2'){
					curEmRecord.setValue("sc_zf_em.status_married", '3');
					this.scZfEmDs.saveRecord(curEmRecord);
				}else if(status == '3'){
					curEmRecord.setValue("sc_zf_em.status_married", '3');
					this.scZfEmDs.saveRecord(curEmRecord);
				}
			}
		}else{//更新配偶记录
			
			//before，获取当前员工配偶的人员档案信息
			var res = new Ab.view.Restriction();
		    res.addClause("sc_zf_em.sfzh", sfzh, "=");
//		    res.addClause("sc_zf_em.em_id","","is not null");
		    var poEmRecord = this.scZfEmDs.getRecord(res);
		    
		    //before，获取当前员工的人员档案信息
		    var res = new Ab.view.Restriction();
		    res.addClause("sc_zf_em.archive_id", archive_id, "=");
		    var curEmRecord = this.scZfEmDs.getRecord(res);
		    
		    if(!poEmRecord.isNew){//存在配偶记录
		    	if(status == '1'){
					//检查当前是否存在其他正常的配偶信息
					var res = new Ab.view.Restriction();
				    res.addClause("sc_zf_em_po.archive_id", archive_id, "=");
				    res.addClause("sc_zf_em_po.status", '1', "=");
				    res.addClause("sc_zf_em_po.sfzh", sfzh, "!=");
				    var curEmPoRecord = this.scZfPoDs.getRecord(res);
					if(!curEmPoRecord.isNew){
						View.showMessage("只能同时存在一个正常状态下的配偶,如果要修改此配偶状态为正常状态,请先把其他配偶状态改为非正常状态");
						return ;
					}
					//检查当前配偶是否存在其他正常的配偶信息
					var res = new Ab.view.Restriction();
				    res.addClause("sc_zf_em_po.archive_id", poEmRecord.getValue("sc_zf_em.archive_id"), "=");
				    res.addClause("sc_zf_em_po.status", '1', "=");
				    res.addClause("sc_zf_em_po.sfzh", curEmRecord.getValue("sc_zf_em.sfzh"), "!=");
				    var curEmPoRecord = this.scZfPoDs.getRecord(res);
					if(!curEmPoRecord.isNew){
						View.showMessage("配偶档案中已存在一个正常状态下的配偶,如果要修改此配偶状态为正常状态,请先把其他配偶状态改为非正常状态");
						return ;
					}
					
					//a.维护配偶状态信息
					poEmRecord.setValue("sc_zf_em.status_married", '2');
					if(valueExistsNotEmpty(poEmRecord.getValue("sc_zf_em.em_id"))){//检查配偶是不是本校教职工
						poEmRecord.setValue("sc_zf_em.is_sworker", '1');
					}else{
						poEmRecord.setValue("sc_zf_em.is_sworker", '2');
					}
					this.scZfEmDs.saveRecord(poEmRecord);
					//b.维护配偶的配偶[自己]的状态信息
					var res = new Ab.view.Restriction();
				    res.addClause("sc_zf_em_po.archive_id", poEmRecord.getValue("sc_zf_em.archive_id"), "=");
				    res.addClause("sc_zf_em_po.sfzh", curEmRecord.getValue("sc_zf_em.sfzh"), "=");
				    var curEmPoPoRecord = this.scZfPoDs.getRecord(res);
				    if(!curEmPoPoRecord.isNew){
				    	curEmPoPoRecord.setValue("sc_zf_em_po.status", '1');
				    	curEmPoPoRecord.setValue("sc_zf_em_po.change_time", change_time);
						this.scZfPoDs.saveRecord(curEmPoPoRecord);
					}
				    //c.维护自己的状态信息
					curEmRecord.setValue("sc_zf_em.status_married", '2');
					if(valueExistsNotEmpty(poEmRecord.getValue("sc_zf_em.em_id"))){//检查配偶是不是本校教职工
						curEmRecord.setValue("sc_zf_em.is_sworker", '1');
					}else{
						curEmRecord.setValue("sc_zf_em.is_sworker", '2');
					}
					this.scZfEmDs.saveRecord(curEmRecord);
					
				}else if(status == '2'){
					//a.维护配偶状态信息
					poEmRecord.setValue("sc_zf_em.status_married", '3');
					poEmRecord.setValue("sc_zf_em.is_sworker", '2');
					this.scZfEmDs.saveRecord(poEmRecord);
					//b.维护配偶的配偶[自己]的状态信息
					var res = new Ab.view.Restriction();
				    res.addClause("sc_zf_em_po.archive_id", poEmRecord.getValue("sc_zf_em.archive_id"), "=");
				    res.addClause("sc_zf_em_po.sfzh", curEmRecord.getValue("sc_zf_em.sfzh"), "=");
				    var curEmPoPoRecord = this.scZfPoDs.getRecord(res);
				    if(!curEmPoPoRecord.isNew){
				    	curEmPoPoRecord.setValue("sc_zf_em_po.status", '2');
				    	curEmPoPoRecord.setValue("sc_zf_em_po.change_time", change_time);
						this.scZfPoDs.saveRecord(curEmPoPoRecord);
					}
				    //c.维护自己的状态信息
					curEmRecord.setValue("sc_zf_em.status_married", '3');
					curEmRecord.setValue("sc_zf_em.is_sworker", '2');
					this.scZfEmDs.saveRecord(curEmRecord);
					
				}else if(status == '3'){//不考虑配偶的员工状态
					//a.维护配偶状态信息
					poEmRecord.setValue("sc_zf_em.status_married", '3');
					poEmRecord.setValue("sc_zf_em.is_sworker", '2');
					this.scZfEmDs.saveRecord(poEmRecord);
					//b.维护配偶的配偶[自己]的状态信息
					var res = new Ab.view.Restriction();
				    res.addClause("sc_zf_em_po.archive_id", poEmRecord.getValue("sc_zf_em.archive_id"), "=");
				    res.addClause("sc_zf_em_po.sfzh", curEmRecord.getValue("sc_zf_em.sfzh"), "=");
				    var curEmPoPoRecord = this.scZfPoDs.getRecord(res);
				    if(!curEmPoPoRecord.isNew){
				    	curEmPoPoRecord.setValue("sc_zf_em_po.status", '3');
				    	curEmPoPoRecord.setValue("sc_zf_em_po.change_time", change_time);
						this.scZfPoDs.saveRecord(curEmPoPoRecord);
					}
				    //c.维护自己的状态信息
					curEmRecord.setValue("sc_zf_em.status_married", '3');
					curEmRecord.setValue("sc_zf_em.is_sworker", '2');
					this.scZfEmDs.saveRecord(curEmRecord);
				}
		    }else{//不存在配偶档案信息
					 //c.维护自己的婚姻状态信息
					if(status == '1'){
						curEmRecord.setValue("sc_zf_em.status_married", '2');
						this.scZfEmDs.saveRecord(curEmRecord);
					}else if(status == '2'){
						curEmRecord.setValue("sc_zf_em.status_married", '3');
						this.scZfEmDs.saveRecord(curEmRecord);
					}else if(status == '3'){
						curEmRecord.setValue("sc_zf_em.status_married", '3');
						this.scZfEmDs.saveRecord(curEmRecord);
					}
		    }
		}
		this.scZfPoDs.saveRecord(curRecord);
//		this.poForm.save();
		this.poForm.show(false);
		var res = new Ab.view.Restriction();
		res.addClause("sc_zf_em_po.archive_id", this.ARCHIVE_ID, "=");
		this.poGrid.refresh(res);
		
	},
	//配偶添加配偶信息
	poAddPoRecord: function(po_archive_id,curEmRecord,status,change_time,date_married){
		var recored = new Ab.data.Record();
		recored.setValue("sc_zf_em_po.archive_id", po_archive_id);
		recored.setValue("sc_zf_em_po.xm", curEmRecord.getValue('sc_zf_em.xm'));
		recored.setValue("sc_zf_em_po.sfzh", curEmRecord.getValue('sc_zf_em.sfzh'));
		recored.setValue("sc_zf_em_po.xb", curEmRecord.getValue('sc_zf_em.xb'));
		//没有单位信息
//		recored.setValue("sc_zf_em_po.dv_id", curEmRecord.getValue('sc_zf_em.dv_id'));
//		recored.setValue("sc_zf_em_po.dv_name", curEmRecord.getValue('sc_zf_em.dv_name'));
//		recored.setValue("sc_zf_em_po.dv_xz", curEmRecord.getValue('sc_zf_em.dv_xz'));
		if(valueExistsNotEmpty(curEmRecord.getValue('sc_zf_em.date_first_gjj'))){
			recored.setValue("sc_zf_em_po.date_first_gjj", curEmRecord.getValue('sc_zf_em.date_first_gjj'));
		}
		if(valueExistsNotEmpty(curEmRecord.getValue('sc_zf_em.date_begin_work'))){
			recored.setValue("sc_zf_em_po.date_begin_work", curEmRecord.getValue('sc_zf_em.date_begin_work'));
		}
		if(valueExistsNotEmpty(curEmRecord.getValue('sc_zf_em.date_retired'))){
			recored.setValue("sc_zf_em_po.date_retired", curEmRecord.getValue('sc_zf_em.date_retired'));
		}
		recored.setValue("sc_zf_em_po.zw_jb_id", curEmRecord.getValue('sc_zf_em.zw_jb_id'));
		recored.setValue("sc_zf_em_po.zw_jb_name", curEmRecord.getValue('sc_zf_em.zw_jb_name'));
		recored.setValue("sc_zf_em_po.zw_id", curEmRecord.getValue('sc_zf_em.zw_id'));
		recored.setValue("sc_zf_em_po.zw_name", curEmRecord.getValue('sc_zf_em.zw_name'));
		recored.setValue("sc_zf_em_po.zc_jb_id", curEmRecord.getValue('sc_zf_em.zc_jb_id'));
		recored.setValue("sc_zf_em_po.zc_jb_name", curEmRecord.getValue('sc_zf_em.zc_jb_name'));
		recored.setValue("sc_zf_em_po.zc_id", curEmRecord.getValue('sc_zf_em.zc_id'));
		recored.setValue("sc_zf_em_po.zc_name", curEmRecord.getValue('sc_zf_em.zc_name'));
		//购房补贴建筑面积
//		recored.setValue("sc_zf_em_po.area_jz_std", curEmRecord.getValue('sc_zf_em.area_jz_std'));
		
		recored.setValue("sc_zf_em_po.status", status);
		recored.setValue("sc_zf_em_po.change_time", change_time);
		recored.setValue("sc_zf_em_po.date_married", date_married);
		
		this.scZfPoDs.saveRecord(recored);
	},
	
	
	linkToPoDetail: function(){
		var selectedIndex = this.poGrid.selectedRowIndex;
	    var archive_id = this.poGrid.rows[selectedIndex]["sc_zf_em_po.archive_id"];
	    var sfzh = this.poGrid.rows[selectedIndex]["sc_zf_em_po.sfzh"];
	    
	    var res = new Ab.view.Restriction();
        res.addClause("sc_zf_em_po.archive_id", archive_id, "=");
        res.addClause("sc_zf_em_po.sfzh", sfzh, "=");
        this.poForm.refresh(res,false);
        this.poForm.show(true);
	},
	/**
	 * 删除配偶
	 * 
	 * 如果当前配偶状态为非正常，删除此配偶信息，并同时删除配偶的相对配偶信息【员工】的记录，不用维护状态
	 * 
	 * 如果当前配偶状态为正常，先删除双方的配偶信息，并维护双方的婚姻状态和是否双职工状态
	 * 
	 * 婚姻状态[1;未婚;2;已婚;3;离异] 是否双职工 [1;是;2;否]
	 * 配偶现状[1;正常;2;离异;3;已故]
	 * 
	 * */
	poForm_onDelete: function(){
		var controller = this;
		View.confirm("您确定要删除此配偶记录?", function(button){
			if(button == "yes"){
				var status = controller.poForm.getFieldValue("sc_zf_em_po.status");
				var archive_id = controller.poForm.getFieldValue("sc_zf_em_po.archive_id");
				var sfzh = controller.poForm.getFieldValue("sc_zf_em_po.sfzh");
				
				//before，获取当前员工配偶的人员档案信息
				var res = new Ab.view.Restriction();
			    res.addClause("sc_zf_em.sfzh", sfzh, "=");
			    var poEmRecord = controller.scZfEmDs.getRecord(res);
			    
			    //before，获取当前员工的人员档案信息
			    var res = new Ab.view.Restriction();
			    res.addClause("sc_zf_em.archive_id", archive_id, "=");
			    var curEmRecord = controller.scZfEmDs.getRecord(res);
				
			    if(!poEmRecord.isNew){//存在配偶记录
			    	if(status == '1'){//正常状态
						//删除配偶信息
						controller.poForm.deleteRecord();
						//更新员工状态
						var res = new Ab.view.Restriction();
					    res.addClause("sc_zf_em_po.archive_id", archive_id, "=");
					    res.addClause("sc_zf_em_po.sfzh", sfzh, "!=");
					    var curEmOtherPoRecords = controller.scZfPoDs.getRecords(res);
						if(curEmOtherPoRecords.length>0){
							curEmRecord.setValue("sc_zf_em.status_married", '3');
						}else{
							curEmRecord.setValue("sc_zf_em.status_married", '1');
						}
						curEmRecord.setValue("sc_zf_em.is_sworker", '2');
						controller.scZfEmDs.saveRecord(curEmRecord);
						//删除配偶的配偶信息
						var res = new Ab.view.Restriction();
					    res.addClause("sc_zf_em_po.archive_id", poEmRecord.getValue("sc_zf_em.archive_id"), "=");
					    res.addClause("sc_zf_em_po.sfzh", curEmRecord.getValue("sc_zf_em.sfzh"), "=");
					    var curPoPoRecord = controller.scZfPoDs.getRecord(res);
					    controller.scZfPoDs.deleteRecord(curPoPoRecord);
						//更新配偶的状态
					    var res = new Ab.view.Restriction();
					    res.addClause("sc_zf_em_po.archive_id", poEmRecord.getValue("sc_zf_em.archive_id"), "=");
					    var curPoOtherPoRecords = controller.scZfPoDs.getRecords(res);
						if(curPoOtherPoRecords.length>0){
							poEmRecord.setValue("sc_zf_em.status_married", '3');
						}else{
							poEmRecord.setValue("sc_zf_em.status_married", '1');
						}
						poEmRecord.setValue("sc_zf_em.is_sworker", '2');
						controller.scZfEmDs.saveRecord(poEmRecord);
					}else{//非正常状态
						//删除配偶信息
						controller.poForm.deleteRecord();
						//更新员工状态
						
						var res = new Ab.view.Restriction();
					    res.addClause("sc_zf_em_po.archive_id", archive_id, "=");
					    res.addClause("sc_zf_em_po.sfzh", sfzh, "!=");
					    var curEmOtherPoRecords = controller.scZfPoDs.getRecords(res);
						if(curEmOtherPoRecords.length>0){
							curEmRecord.setValue("sc_zf_em.status_married", '3');
						}else{
							curEmRecord.setValue("sc_zf_em.status_married", '1');
						}
						curEmRecord.setValue("sc_zf_em.is_sworker", '2');
						controller.scZfEmDs.saveRecord(curEmRecord);
						//删除配偶的配偶信息
						var res = new Ab.view.Restriction();
					    res.addClause("sc_zf_em_po.archive_id", poEmRecord.getValue("sc_zf_em.archive_id"), "=");
					    res.addClause("sc_zf_em_po.sfzh", curEmRecord.getValue("sc_zf_em.sfzh"), "=");
					    var curPoPoRecord = controller.scZfPoDs.getRecord(res);
					    controller.scZfPoDs.deleteRecord(curPoPoRecord);
					    //更新配偶的状态
					    var res = new Ab.view.Restriction();
					    res.addClause("sc_zf_em_po.archive_id", poEmRecord.getValue("sc_zf_em.archive_id"), "=");
					    res.addClause("sc_zf_em_po.status", '1', "=");
					    res.addClause("sc_zf_em_po.sfzh", sfzh, "!=");
					    var curEmPoRecord = controller.scZfPoDs.getRecord(res);
						if(!curEmPoRecord.isNew){//证明他有正常状态下的配偶，无需更改配偶档案状态
							
						}else{
						    var res = new Ab.view.Restriction();
						    res.addClause("sc_zf_em_po.archive_id", poEmRecord.getValue("sc_zf_em.archive_id"), "=");
						    var curPoOtherPoRecords = controller.scZfPoDs.getRecords(res);
							if(curPoOtherPoRecords.length>0){
								poEmRecord.setValue("sc_zf_em.status_married", '3');
							}else{
								poEmRecord.setValue("sc_zf_em.status_married", '1');
							}
							poEmRecord.setValue("sc_zf_em.is_sworker", '2');
							controller.scZfEmDs.saveRecord(poEmRecord);
						}
					}
			    }else{//不存在配偶信息
					//删除配偶信息
					controller.poForm.deleteRecord();
					//更新员工状态
					var res = new Ab.view.Restriction();
				    res.addClause("sc_zf_em_po.archive_id", archive_id, "=");
				    res.addClause("sc_zf_em_po.sfzh", sfzh, "!=");
				    var curEmOtherPoRecords = controller.scZfPoDs.getRecords(res);
					if(curEmOtherPoRecords.length>0){
						curEmRecord.setValue("sc_zf_em.status_married", '3');
					}else{
						curEmRecord.setValue("sc_zf_em.status_married", '1');
					}
					controller.scZfEmDs.saveRecord(curEmRecord);
			    }
				
				
				controller.poForm.show(false);
				controller.poGrid.refresh();
			}
		});
	}
	
	
});

/***
 * 字段(sc_zf_em。is_sworker) 下的恢复最初状态
 *    [1;是;2;否]
 * 
 * */
function recoveryAllIsSworker(element){
	//1.全部删除
	element.remove("0");
	element.remove("0");
	
	//2.装载最初值
	var opt = document.createElement('option');  
	opt.appendChild(document.createTextNode("是"));  
	opt.setAttribute("value","1");  
	element.appendChild(opt);  
	
	var opt = document.createElement('option');  
	opt.appendChild(document.createTextNode("否"));  
	opt.setAttribute("value","2");  
	element.appendChild(opt);  
}

/***
 * 字段(sc_zf_em。status_em) 下的恢复最初状态
 *    [1;正常;2;暂停工资;3;调离;4;已故]
 * 
 * */
function recoveryAllStatusEm(element){
	//1.全部删除
	element.remove("0");
	element.remove("0");
	element.remove("0");
	element.remove("0");
	element.remove("0");
	
	//2.装载最初值
	var opt = document.createElement('option');  
	opt.appendChild(document.createTextNode("正常"));  
	opt.setAttribute("value","1");  
	element.appendChild(opt);  
	
	var opt = document.createElement('option');  
	opt.appendChild(document.createTextNode("暂停工资"));  
	opt.setAttribute("value","2");  
	element.appendChild(opt);  
	
	var opt = document.createElement('option');  
	opt.appendChild(document.createTextNode("调离"));  
	opt.setAttribute("value","3");  
	element.appendChild(opt);  
	
	var opt = document.createElement('option');  
	opt.appendChild(document.createTextNode("已故"));  
	opt.setAttribute("value","4");  
	element.appendChild(opt);  
	
	var opt = document.createElement('option');  
	opt.appendChild(document.createTextNode("无"));  
	opt.setAttribute("value","09");  
	element.appendChild(opt);  
}




/**
 * 当职务职称发生变化后，根据级别自动带出最大值存入字段【住房补贴建筑面积标准】中
 * 
 * */
function autoGetBtArea(){
	var zw_jb_id = defZFemController.emForm.getFieldValue("sc_zf_em.zw_jb_id");
	var zc_jb_id = defZFemController.emForm.getFieldValue("sc_zf_em.zc_jb_id");
	
	var area = getMaxBtArea(zw_jb_id,zc_jb_id);
	defZFemController.emForm.setFieldValue("sc_zf_em.area_jz_std",area);
}

function autoGetBtAreaPo(){
	var zw_jb_id = defZFemController.poForm.getFieldValue("sc_zf_em_po.zw_jb_id");
	var zc_jb_id = defZFemController.poForm.getFieldValue("sc_zf_em_po.zc_jb_id");
	
	var area = getMaxBtArea(zw_jb_id,zc_jb_id);
	defZFemController.poForm.setFieldValue("sc_zf_em_po.area_jz_std",area);
}

function getMaxBtArea(zw_jb_id,zc_jb_id){
	zwjbArea = 0;
	zcjbArea = 0;
	
	if(valueExistsNotEmpty(zw_jb_id)){
		var restriction = "sc_zw_jb.zw_jb_id='" + zw_jb_id + "'";
        var parameters = {
            tableName: 'sc_zw_jb',
            fieldNames: toJSON(['sc_zw_jb.zw_jb_id', 'sc_zw_jb.area_zf_std']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
        	zwjbArea = result.data.records[0]['sc_zw_jb.area_zf_std'];
        	//去除长数字（自动加的逗号）
        	zwjbArea = zwjbArea.replace(/,/,'');
        }
	}
	if(valueExistsNotEmpty(zc_jb_id)){
		var restriction = "sc_zc_jb.zc_jb_id='" + zc_jb_id + "'";
        var parameters = {
            tableName: 'sc_zc_jb',
            fieldNames: toJSON(['sc_zc_jb.zc_jb_id', 'sc_zc_jb.area_zf_std']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
        	zcjbArea = result.data.records[0]['sc_zc_jb.area_zf_std'];
        	//去除长数字（自动加的逗号）
        	zcjbArea = zcjbArea.replace(/,/,'');
        }
	}
	if(parseFloat(zwjbArea) > parseFloat(zcjbArea)){
		return zwjbArea;
	}else{
		return zcjbArea;
	}
}

/***
 * 自动选填充配偶信息
 * */
function afterSelectPo(fieldName, selectedValue, previousValue){
	//1;男;2;女
	if (fieldName === "sc_zf_em.xb") {
		if(selectedValue == "男"){
			defZFemController.poForm.setFieldValue("sc_zf_em_po.xb",1);
		}else{
			defZFemController.poForm.setFieldValue("sc_zf_em_po.xb",2);
		}
		return true;
	}
//	if (fieldName === "sc_zf_em.dv_id") {
//		if(selectedValue == "" || selectedValue == null){
//			return false;
//		}
//		var restriction = "dv.dv_id='" + selectedValue + "'";
//        var parameters = {
//            tableName: 'dv',
//            fieldNames: toJSON(['dv.dv_id', 'dv.dv_name']),
//            restriction: toJSON(restriction)
//        };
//        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
//        if (result.data.records.length > 0) {
//        	defZFemController.poForm.setFieldValue("sc_zf_em_po.dv_name",result.data.records[0]['dv.dv_name']);
//        }
//        
//		return false;
//	}
	
}

















