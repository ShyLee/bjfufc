var ascZfEdFlInfoController = View.createController('ascZfEdFlInfoController', {
	SUPERCONTROLLER: null,
	IF_YCBCL:false,//当前用户是否已经做了超标处理,如果已经做了，个人和配偶均不做超标处理
	
	afterInitialDataFetch:function(){
		SUPERCONTROLLER = View.getControlsByType(parent, 'tabs')[0].SuperController;
		var res = new Ab.view.Restriction();
        res.addClause("sc_zf_em.archive_id", SUPERCONTROLLER.ARCHIVE_ID, "=");
        this.flInfoForm.refresh(res,false);
        
        var em_id = this.flInfoForm.getFieldValue("sc_zf_em.em_id");
        if(valueExistsNotEmpty(em_id)){
        	 //判断是否有福利房并返回福利房套数
            var flNum = this.getFamilyFlNum(SUPERCONTROLLER.ARCHIVE_ID);
            if(flNum > 0){
            	this.flInfoForm.setFieldValue("sc_zf_em.fl_num",flNum);
            	//1;有;2;无    默认2
            	this.flInfoForm.setFieldValue("sc_zf_em.has_fl","1");
            }
            //判断是否有周转房，设置周转房类型
            this.setZZFInfo(SUPERCONTROLLER.ARCHIVE_ID);
        	
            jQuery("#flInfoForm input").each(function(){
     			jQuery(this).attr("disabled","disabled");
     		});
        	jQuery("#flInfoForm select").each(function(){
     			jQuery(this).attr("disabled","disabled");
     		});
            
        	//判断是否为有房户，若无无房户他走无房月补贴业务了。[以个人角度信息计算]
            var personflRecords = this.getPersonFlInfo(SUPERCONTROLLER.ARCHIVE_ID);
            if(personflRecords.length <= 0){
            	this.flInfoForm.enableButton('save', false);
            }else{
				
            	this.flInfoForm.getFieldElement("sc_zf_em.area_bt_has").disabled = false;
                this.flInfoForm.getFieldElement("sc_zf_em.date_jc").disabled = false;
                //初始化超标处理信息
                this.initRmInfo(SUPERCONTROLLER.ARCHIVE_ID,personflRecords);
            	
            	if(typeof(BuTieService)!="undefined"){
        			//根据现职务职称所享受最大补贴面积
        			BuTieService.getBuTieByZj(em_id,{
        				   callback:function(data){
        					if(data!=''){
        						var obj=data.evalJSON();
        						ascZfEdFlInfoController.flInfoForm.setFieldValue("sc_zf_em.area_bt_should",obj['area']);
        			            var area_bt_has = ascZfEdFlInfoController.flInfoForm.getFieldValue('sc_zf_em.area_bt_has');
        			            var area_jc = obj['area'] - area_bt_has;
        			            ascZfEdFlInfoController.flInfoForm.setFieldValue("sc_zf_em.area_jc", area_jc);
        					}
        				   }
        			});
        		}
            }
            
        }else{
        	jQuery("#flInfoForm input").each(function(){
     			jQuery(this).attr("disabled","disabled");
     		});
        	jQuery("#flInfoForm select").each(function(){
     			jQuery(this).attr("disabled","disabled");
     		});
        	this.flInfoForm.enableButton('save', false);
        }
        
	},
	/****
	 * 获取个人的福利房信息
	 * 
	 * 福利房业务是跟个人走的。一个人享有了福利房就算离婚了，房子留个对方，也照样是有房户，并计算其福利面积，并且购房日期要大于结婚日期
	 * 
	 * 
	 * */
	getPersonFlInfo:function(archive_id){
		
		var restriction = "sc_zf_cq.is_audit_admin = '1' and sc_zf_cq.zf_type_name in (select zf_type_name from sc_zf_type where is_fl = '1')"
			+ " and (sc_zf_cq.archive_id='" + archive_id + "'"
			        + "or sc_zf_cq.archive_id in (select archive_id from sc_zf_em where sc_zf_em.sfzh in (select sfzh from sc_zf_em_po " 
			        + "   where sc_zf_em_po.archive_id ='" + archive_id + "' and sc_zf_em_po.date_married < sc_zf_cq.date_gf)))";
		
		
		var parameters = {
	            tableName: 'sc_zf_cq',
	            fieldNames: toJSON(['sc_zf_cq.area_hd','sc_zf_cq.zw_name','sc_zf_cq.p_zw_name','sc_zf_cq.zc_name','sc_zf_cq.p_zc_name','sc_zf_cq.date_gf']),
	            restriction: toJSON(restriction),
	            sortValues: toJSON([{'fieldName': 'sc_zf_cq.date_gf', 'sortOrder':1}]),
	        };
        var result1 = Workflow.call('AbCommonResources-getDataRecords', parameters);
        
        /**
         * 特殊处理已卖掉的福利房信息
         * 
         * */
        var restriction = "sc_zf_hcq.is_audit_admin = '1' and sc_zf_hcq.zf_type_name in (select zf_type_name from sc_zf_type where is_fl = '1')"
			+ " and (sc_zf_hcq.archive_id='" + archive_id + "'"
			        + "or sc_zf_hcq.archive_id in (select archive_id from sc_zf_em where sc_zf_em.sfzh in (select sfzh from sc_zf_em_po " 
			        + "   where sc_zf_em_po.archive_id ='" + archive_id + "' and sc_zf_em_po.date_married < sc_zf_hcq.date_gf)))";
		
		
		var parameters = {
	            tableName: 'sc_zf_hcq',
	            fieldNames: toJSON(['sc_zf_hcq.area_hd','sc_zf_hcq.zw_name','sc_zf_hcq.p_zw_name','sc_zf_hcq.zc_name','sc_zf_hcq.p_zc_name','sc_zf_hcq.date_gf']),
	            restriction: toJSON(restriction),
	            sortValues: toJSON([{'fieldName': 'sc_zf_hcq.date_gf', 'sortOrder':1}]),
	        };
        var result2 = Workflow.call('AbCommonResources-getDataRecords', parameters);
    	
        if(result2.data.records.length > 0){//有卖掉的福利房,把它处理为现住产权房的记录
        	if(result1.data.records.length > 0){//比较日期,取最近的哪个
        		var date_gf_cq = result1.data.records[0]['sc_zf_cq.date_gf'];
        		var date_gf_hcq = result2.data.records[0]['sc_zf_hcq.date_gf'];
        		if(getFormatDate(date_gf_cq).getTime() < getFormatDate(date_gf_hcq).getTime()){
        			result1.data.records[0]['sc_zf_cq.zw_name'] = result2.data.records[0]['sc_zf_hcq.zw_name'];
        			result1.data.records[0]['sc_zf_cq.p_zw_name'] = result2.data.records[0]['sc_zf_hcq.p_zw_name'];
        			result1.data.records[0]['sc_zf_cq.zc_name'] = result2.data.records[0]['sc_zf_hcq.zc_name'];
        			result1.data.records[0]['sc_zf_cq.p_zc_name'] = result2.data.records[0]['sc_zf_hcq.p_zc_name'];
        		}
        	}
        	
        	var cqNum = result1.data.records.length;
        	var newCqfRecord = null;
        	for(var i=0; i<result2.data.records.length; i++){
        		newCqfRecord = new Ab.data.Record({ 
				        	        'sc_zf_cq.area_hd': result2.data.records[i]['sc_zf_hcq.area_hd'],
				        	        'sc_zf_cq.zw_name': result2.data.records[i]['sc_zf_hcq.zw_name'],
				        	        'sc_zf_cq.p_zw_name': result2.data.records[i]['sc_zf_hcq.p_zw_name'],
				        	        'sc_zf_cq.zc_name': result2.data.records[i]['sc_zf_hcq.zc_name'],
				        	        'sc_zf_cq.p_zc_name': result2.data.records[i]['sc_zf_hcq.p_zc_name'],
				        	        'sc_zf_cq.date_gf': result2.data.records[i]['sc_zf_hcq.date_gf'],
				        	    }, false); 
        		result1.data.records[cqNum+i] = newCqfRecord.values;
        	}
        }
        
        return result1.data.records;//返回产权房信息
	},
	
	/**
	 * 保存修改值，
	 * 
	 * 同步维护夫妻双方的超标处理情况
	 * */
	flInfoForm_onSave: function(){
		this.flInfoForm.save();
		if(this.IF_YCBCL){//此用户已做过一个超标处理,此用户与配偶均不做处理
			return;
		}
		
		//同步维护夫妻双方的超标处理情况
		var cbcl = this.flInfoForm.getFieldValue("sc_zf_em.cbcl");
		var cbcl_date = this.flInfoForm.getFieldValue("sc_zf_em.cbcl_date");
		var money_cbcl_family = this.flInfoForm.getFieldValue("sc_zf_em.money_cbcl_family");
		
		if(cbcl == '1'){
			var poArchiveId = this.getEmPoArchiveId(SUPERCONTROLLER.ARCHIVE_ID);
			if(valueExistsNotEmpty(poArchiveId)){
				
				//获取配偶的超标处理信息,因为配偶的福利房信息与员工可能不一致
				var PoFlInfo = this.getPersonFlInfo(poArchiveId)
				var familyHdArea = 0;
		
		        if (PoFlInfo.length > 0) {
		        	for(var i=0; i<PoFlInfo.length; i++){
		        		familyHdArea += parseFloat(PoFlInfo[i]['sc_zf_cq.area_hd'].replace(/,/,''));
		        	}
		        }else{//配偶为无房户直接返回
		        	return;
		        }
		        
		        var res = new Ab.view.Restriction();
		        res.addClause("sc_zf_em.archive_id", poArchiveId, "=");
		        var record = this.scZfEmDs.getRecord(res);
		        
		        var po_cbcl = record.getValue("sc_zf_em.cbcl");
		        if(po_cbcl == "1"){//配偶已做过超标处理
		        	return;
		        }
		        
		        record.setValue("sc_zf_em.cbcl",cbcl);
		        record.setValue("sc_zf_em.cbcl_date",cbcl_date);
		        record.setValue("sc_zf_em.money_cbcl_family",money_cbcl_family);
		        record.setValue("sc_zf_em.area_hd_family",familyHdArea);//配偶个人核定面积
		        
		        //初始化购房时面积标准[夫妻双方职务职称最大值]
		        var emBtArea  = (this.getMaxAreaByZWZC(PoFlInfo[0]['sc_zf_cq.zw_name'],PoFlInfo[0]['sc_zf_cq.zc_name']))['maxArea'];
		        var poBtArea  = (this.getMaxAreaByZWZC(PoFlInfo[0]['sc_zf_cq.p_zw_name'],PoFlInfo[0]['sc_zf_cq.p_zc_name']))['maxArea'];
		        if(parseFloat(emBtArea) > parseFloat(poBtArea)){
		        	record.setValue("sc_zf_em.area_gfbz_family",emBtArea);//购房时面积标准,职务职称最近最大额
		        	record.setValue("sc_zf_em.area_cb_family",parseFloat(familyHdArea) - parseFloat(emBtArea));//超标面积
		        	record.setValue("sc_zf_em.area_bt_has",emBtArea);
				}else{
					record.setValue("sc_zf_em.area_gfbz_family",poBtArea);//购房时面积标准
					record.setValue("sc_zf_em.area_cb_family",parseFloat(familyHdArea) - parseFloat(poBtArea));//超标面积
					record.setValue("sc_zf_em.area_bt_has",poBtArea);//购房时面积标准,职务职称最近最大额
				}
				
		        this.scZfEmDs.saveRecord(record);
			}
		}
        
		View.showMessage("保存成功!");
	},
	/**
	 * 获取福利房套数[夫妻双方]
	 * */
	getFamilyFlNum: function(archive_id){
		var poArchiveId = this.getEmPoArchiveId(archive_id);
		var restriction = "";
		if(valueExistsNotEmpty(poArchiveId)){
			restriction = "sc_zf_cq.archive_id in ('" + archive_id + "', '" + poArchiveId + "')"  +
    		" and sc_zf_cq.is_audit_admin = '1' and sc_zf_cq.zf_type_name in (select zf_type_name from sc_zf_type where is_fl = '1')";
		}else{
			restriction = "sc_zf_cq.archive_id='" + archive_id + "' and sc_zf_cq.is_audit_admin = '1' and sc_zf_cq.zf_type_name in (select zf_type_name from sc_zf_type where is_fl = '1')";
		}
		
        var parameters = {
            tableName: 'sc_zf_cq',
            fieldNames: toJSON(['sc_zf_cq.area_hd']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    	
        return result.data.records.length;
	},
	/**
	 * 获取配偶档案号
	 * 
	 * */
	getEmPoArchiveId: function(archive_id){
		var restriction = "sc_zf_em.sfzh = (select sfzh from sc_zf_em_po where sc_zf_em_po.archive_id ='" + archive_id + "' and sc_zf_em_po.status='1')";
        var parameters = {
            tableName: 'sc_zf_em',
            fieldNames: toJSON(['sc_zf_em.archive_id']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        
        if(result.data.records.length > 0){
        	return result.data.records[0]["sc_zf_em.archive_id"];
        }else{
        	return null;
        }
	},
	
	/**
	 * 设置周转房类型[夫妻双方]
	 * */
	setZZFInfo: function(archive_id){
		var poArchiveId = this.getEmPoArchiveId(archive_id);
		var restriction = "";//房屋使用性质[1;产权;2;承租]
		if(valueExistsNotEmpty(poArchiveId)){
			restriction = "sc_zf_cq.archive_id in('" + archive_id + "', '" + poArchiveId + "') and sc_zf_cq.is_audit_admin = '1' and sc_zf_cq.super_type = '2'";
		}else{
			restriction = "sc_zf_cq.archive_id='" + archive_id + "' and sc_zf_cq.is_audit_admin = '1' and sc_zf_cq.super_type = '2'";
		}
        var parameters = {
            tableName: 'sc_zf_cq',
            fieldNames: toJSON(['sc_zf_cq.zf_type_name']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        
        if(result.data.records.length > 0){
        	//1;有;2;无    默认2
        	this.flInfoForm.setFieldValue("sc_zf_em.has_zzf","1");
        	
        	this.flInfoForm.setFieldValue("sc_zf_em.zzf_type",result.data.records[0]["sc_zf_cq.zf_type_name"]);
        }
	},
	/**
	 * 计算级差面积
	 * */
	changeJcArea: function(){
		var area_bt_should = this.flInfoForm.getFieldValue('sc_zf_em.area_bt_should');
		var area_bt_has = this.flInfoForm.getFieldValue('sc_zf_em.area_bt_has');
		 
		this.flInfoForm.setFieldValue("sc_zf_em.area_jc",(parseFloat(area_bt_should) - parseFloat(area_bt_has)));
	},
	/**
	 * 初始化超标处理信息
	 * 
	 * 核定面积仅仅计算是福利房的面积[个人福利房面积  福利房业务是跟个人走的。一个人享有了福利房就算离婚了，房子留个对方，也照样是有房户，并计算其福利面积，并且购房日期要大于结婚日期]
	 * 购房时面积标准[最近房产的夫妻双方职务职称补贴最大值]
	 * */
	initRmInfo: function(archive_id,personflRecords){
		var cbclEm = this.flInfoForm.getFieldValue("sc_zf_em.cbcl");
		var cbcl_date = this.flInfoForm.getFieldValue("sc_zf_em.cbcl_date");
		if(cbclEm=='1' && valueExistsNotEmpty(cbcl_date)){//已进行超标处理
			this.flInfoForm.getFieldElement("sc_zf_em.cbcl_date").disabled = false;
			this.flInfoForm.getFieldElement("sc_zf_em.money_cbcl_family").disabled = false;
			this.IF_YCBCL = true;
			return;
		}
		this.flInfoForm.getFieldElement("sc_zf_em.cbcl").disabled = false;
		this.flInfoForm.getFieldElement("sc_zf_em.cbcl_date").disabled = false;
		this.flInfoForm.getFieldElement("sc_zf_em.money_cbcl_family").disabled = false;
		
		var familyHdArea = 0;
		
        if (personflRecords.length > 0) {
        	for(var i=0; i<personflRecords.length; i++){
        		familyHdArea += parseFloat(personflRecords[i]['sc_zf_cq.area_hd'].replace(/,/,''));
        	}
        }
        //初始化家庭核定面积
        this.flInfoForm.setFieldValue("sc_zf_em.area_hd_family",familyHdArea);
        //初始化购房时面积标准[夫妻双方职务职称最大值]
        var emBtArea  = (this.getMaxAreaByZWZC(personflRecords[0]['sc_zf_cq.zw_name'],personflRecords[0]['sc_zf_cq.zc_name']))['maxArea'];
        var poBtArea  = (this.getMaxAreaByZWZC(personflRecords[0]['sc_zf_cq.p_zw_name'],personflRecords[0]['sc_zf_cq.p_zc_name']))['maxArea'];
        if(parseFloat(emBtArea) > parseFloat(poBtArea)){
        	this.flInfoForm.setFieldValue("sc_zf_em.area_gfbz_family",emBtArea);//购房时面积标准
        	this.flInfoForm.setFieldValue("sc_zf_em.area_cb_family",parseFloat(familyHdArea) - parseFloat(emBtArea));//超标面积
		}else{
			this.flInfoForm.setFieldValue("sc_zf_em.area_gfbz_family",poBtArea);//购房时面积标准
			this.flInfoForm.setFieldValue("sc_zf_em.area_cb_family",parseFloat(familyHdArea) - parseFloat(poBtArea));//超标面积
		}
        
        //没做超标处理时，已享受面积标准默认值为核定面积
        this.flInfoForm.setFieldValue("sc_zf_em.area_bt_has",familyHdArea);
	},
	/**
	 * 获取补贴面积最大值
	 * */
	getMaxAreaByZWZC: function(zhiw_name,zhic_name){
		var result = new Array();
		result['maxArea'] = 0;
		result['maxMoney'] = 0;
		zwjbArea = 0;
		zcjbArea = 0;
		
		zwjbMoney = 0;
		zcjbMoney = 0;
		
		if(valueExistsNotEmpty(zhiw_name)){
			var restriction = "sc_zw_jb.zw_jb_id = (select  zw_jb_id from sc_zw where sc_zw.zw_name='" + zhiw_name+ "')";
	        var parameters = {
	            tableName: 'sc_zw_jb',
	            fieldNames: toJSON(['sc_zw_jb.zw_jb_id', 'sc_zw_jb.area_zf_std', 'sc_zw_jb.amount_wf_std']),
	            restriction: toJSON(restriction)
	        };
	        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	        if (result.data.records.length > 0) {
	        	zwjbArea = result.data.records[0]['sc_zw_jb.area_zf_std'];
	        	zwjbMoney = result.data.records[0]['sc_zw_jb.amount_wf_std'];
	        	//去除长数字（自动加的逗号）
	        	zwjbArea = zwjbArea.replace(/,/,'');
	        	zwjbMoney = zwjbMoney.replace(/,/,'');
	        }
		}
		if(valueExistsNotEmpty(zhic_name)){
			var restriction = "sc_zc_jb.zc_jb_id = (select  zc_jb_id from sc_zc where sc_zc.zc_name='" + zhic_name+ "')";
	        var parameters = {
	            tableName: 'sc_zc_jb',
	            fieldNames: toJSON(['sc_zc_jb.zc_jb_id', 'sc_zc_jb.area_zf_std', 'sc_zc_jb.amount_wf_std']),
	            restriction: toJSON(restriction)
	        };
	        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	        if (result.data.records.length > 0) {
	        	zcjbArea = result.data.records[0]['sc_zc_jb.area_zf_std'];
	        	zcjbMoney = result.data.records[0]['sc_zc_jb.amount_wf_std'];
	        	//去除长数字（自动加的逗号）
	        	zcjbArea = zcjbArea.replace(/,/,'');
	        	zcjbMoney = zcjbMoney.replace(/,/,'');
	        }
		}
		if(parseFloat(zwjbArea) > parseFloat(zcjbArea)){
			result['maxArea'] = zwjbArea;
		}else{
			result['maxArea'] = zcjbArea;
		}
		if(parseFloat(zwjbMoney) > parseFloat(zcjbMoney)){
			result['maxMoney'] =  zwjbMoney;
		}else{
			result['maxMoney'] = zcjbMoney;
		}
		
		return result;
	},
	/**
	 * 进行超标处理
	 * 
	 */
	doCBCL: function(em_id){
		var cbcl = this.flInfoForm.getFieldValue("sc_zf_em.cbcl");
		if(cbcl=='1'){
			var area_gfbz_family = this.flInfoForm.getFieldValue("sc_zf_em.area_gfbz_family");
			this.flInfoForm.setFieldValue("sc_zf_em.area_bt_has",area_gfbz_family);//购房时面积标准
			//计算级差面积
			this.changeJcArea();
		}
	}
});






