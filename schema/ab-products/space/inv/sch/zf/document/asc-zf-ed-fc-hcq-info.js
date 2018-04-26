
jQuery().ready(function() {
         //给页面上 <field >设置了 cssClass 的字段 注册事件
         jQuery("#hcqfForm input[class*='inputValueChg']").on("change",function(e){
               var eventSrc=e.target.id;
               
               if(eventSrc == "hcqfForm_sc_zf_hcq.rm_id" || eventSrc == "hcqfForm_sc_zf_hcq.bl_name" ){
                   var p = "init";
                   
                   if(jQuery(this).val().trim()=='')
                       p = "clear";
                   ascZfEdFcHcqController.initialRmInfo(p);
               }
               
               if(jQuery(this).val().trim()==''){
                   
                   switch(eventSrc)
                   {
                   case 'hcqfForm_sc_zf_cq.community': //判断当前的事件源 是哪一个文本框 case里面写的是 当前文本框的id
                       jQuery("#hcqfForm_sc_zf_cq\\.bl_id").val('');
                       jQuery("#hcqfForm_sc_zf_cq\\.bl_name").val('');
                       jQuery("#hcqfForm_sc_zf_cq\\.fl_id").val('');
                       jQuery("#hcqfForm_sc_zf_cq\\.rm_id").val('');
                       
                         break;
                   case 'hcqfForm_sc_zf_hcq.bl_name': //判断当前的事件源 是哪一个文本框 case里面写的是 当前文本框的id
                       jQuery("#hcqfForm_sc_zf_hcq\\.bl_id").val('');
                       jQuery("#hcqfForm_sc_zf_hcq\\.fl_id").val('');
                       jQuery("#hcqfForm_sc_zf_hcq\\.rm_id").val('');
                       
                         break;
                   case 'hcqfForm_sc_zf_hcq.rm_id':
                       jQuery("#hcqfForm_sc_zf_hcq\\.fl_id").val('');
                       
                       break;
                       
                   case 'hcqfForm_sc_zf_hcq.zf_type_name':
                       jQuery("#hcqfForm_sc_zf_hcq\\.zf_type_id").val('');
                       break;
                       
                   case 'hcqfForm_sc_zf_hcq.zw_name': //判断当前的事件源 是哪一个文本框 case里面写的是 当前文本框的id
                       jQuery("#hcqfForm_sc_zf_hcq\\.zw_id").val('');
                       jQuery("#hcqfForm_sc_zf_hcq\\.zw_jb_name").val('');
                       jQuery("#hcqfForm_sc_zf_hcq\\.zw_jb_id").val('');
                         break;
                   case 'hcqfForm_sc_zf_hcq.zc_name':
                       jQuery("#hcqfForm_sc_zf_hcq\\.zc_id").val('');
                       jQuery("#hcqfForm_sc_zf_hcq\\.zc_jb_name").val('');
                       jQuery("#hcqfForm_sc_zf_hcq\\.zc_jb_id").val('');
                       break;
                       
                   case 'hcqfForm_sc_zf_hcq.p_zw_name': //判断当前的事件源 是哪一个文本框 case里面写的是 当前文本框的id
                       jQuery("#hcqfForm_sc_zf_hcq\\.p_zw_id").val('');
                       jQuery("#hcqfForm_sc_zf_hcq\\.p_zw_jb_name").val('');
                       jQuery("#hcqfForm_sc_zf_hcq\\.p_zw_jb_id").val('');
                         break;
                   case 'hcqfForm_sc_zf_hcq.p_zc_name':
                       jQuery("#hcqfForm_sc_zf_hcq\\.p_zc_id").val('');
                       jQuery("#hcqfForm_sc_zf_hcq\\.p_zc_jb_name").val('');
                       jQuery("#hcqfForm_sc_zf_hcq\\.p_zc_jb_id").val('');
                       break;
                       
                   default:
                    
                   }
               }
               
               
         });
         
         jQuery("#owners").on('change',function(e){
             ascZfEdFcHcqController.hcqfForm.setFieldValue("sc_zf_hcq.owner_names",jQuery("#owners").val());
         }); 
         
});


var ascZfEdFcHcqController = View.createController('ascZfEdFcHcqController', {
    SUPERCONTROLLER: null,
    
    afterInitialDataFetch:function(){
        SUPERCONTROLLER = View.getControlsByType(parent, 'tabs')[0].SuperController;
        
        //历史产权房要显示为夫妻双方的
		var restriction = "sc_zf_hcq.archive_id = '" + SUPERCONTROLLER.ARCHIVE_ID 
				+ "' or sc_zf_hcq.archive_id in ( select archive_id from sc_zf_em  where sfzh = (select sfzh from sc_zf_em_po where sc_zf_em_po.archive_id ='" + SUPERCONTROLLER.ARCHIVE_ID + "' and sc_zf_em_po.status='1'))" ;
		this.hcqfGrid.restriction = restriction;
        this.hcqfGrid.refresh();
    },
    hcqfGrid_onAdd: function(){
		this.hcqfForm.actions.get('save').show(true);
		this.hcqfForm.actions.get('delete').show(true);
		
		if(SUPERCONTROLLER.IS_ADMIN_ACCOUNT == false){//如果是非管理员用户
			this.hcqfForm.getFieldElement("sc_zf_hcq.bl_name").disabled = true;
			this.hcqfForm.getFieldElement("sc_zf_hcq.rm_id").disabled = true;
		}
    	
        var res = new Ab.view.Restriction();
        res.addClause("sc_zf_hcq.archive_id", SUPERCONTROLLER.ARCHIVE_ID, "=");
        this.hcqfForm.refresh(res,true);
        
        this.initialhcqfForm();
    },
	
	
	
	
    //初始化员工信息
    initialhcqfForm: function(){
        this.hcqfForm.setFieldValue("sc_zf_hcq.em_id",SUPERCONTROLLER.emForm.getFieldValue("sc_zf_em.em_id"));
        this.hcqfForm.setFieldValue("sc_zf_hcq.xm",SUPERCONTROLLER.emForm.getFieldValue("sc_zf_em.xm"));
        
        var po_name = this.getCurrentHFpo();
        var xm = SUPERCONTROLLER.emForm.getFieldValue("sc_zf_em.xm");
        
        $('owners').options.add(new Option(xm,xm));
        if(valueExistsNotEmpty(po_name)){
            var owners = xm + "/" + po_name;
            $('owners').options.add(new Option(po_name,po_name));
            $('owners').options.add(new Option(owners,owners));
        }
        
        this.hcqfForm.setFieldValue("sc_zf_hcq.owner_names",xm);
    },
    /**
     * 返回当前合法配偶
     * */
    getCurrentHFpo: function(){
         var restriction = "sc_zf_em_po.archive_id = '" + SUPERCONTROLLER.ARCHIVE_ID + "' and sc_zf_em_po.status = '1'";
         var parameters = {
             tableName: 'sc_zf_em_po',
             fieldNames: toJSON(['sc_zf_em_po.xm']),
             restriction: toJSON(restriction)
         };
         var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
         if (result.data.records.length > 0) {
            var xm = result.data.records[0]['sc_zf_em_po.xm'];
            return xm;
         }else{
             return null;
         }
    },
    /**
     * 选择完房间后，自动带出房间信息
     * 
     * 有两个地方调用：
     *   1.系统selectvalue 的actionListener调用
     *   
     *   2.另一个是jquery注册的清除事件
     * 
     * */
    initialRmInfo: function(p){
        if(p == "clear"){
             this.hcqfForm.setFieldValue("sc_zf_hcq.date_building_end","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.area_jianzhu","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.ytys","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.area_yt","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.area_sy","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.area_hd","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.chaoxiang","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.huxing","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.bl_type","1");
             return;
        }
        var bl_id = this.hcqfForm.getFieldValue("sc_zf_hcq.bl_id");
        var fl_id = this.hcqfForm.getFieldValue("sc_zf_hcq.fl_id");
        var rm_id = this.hcqfForm.getFieldValue("sc_zf_hcq.rm_id");
        
         var restriction = "bl.bl_id = '" + bl_id + "'";
         var parameters = {
             tableName: 'bl',
             fieldNames: toJSON(['bl.date_building_end','bl.bl_type']),
             restriction: toJSON(restriction)
         };
         var result1 = Workflow.call('AbCommonResources-getDataRecords', parameters);
         if (result1.data.records.length > 0) {
             this.hcqfForm.setFieldValue("sc_zf_hcq.date_building_end",result1.data.records[0]['bl.date_building_end']);
             //;;1;单元式楼房;2;简易楼;3;平房;9;其他
             if(result1.data.records[0]['bl.bl_type'] == "单元式楼房"){
                 this.hcqfForm.setFieldValue("sc_zf_hcq.bl_type","1");
             }else if(result1.data.records[0]['bl.bl_type'] == "简易楼"){
                 this.hcqfForm.setFieldValue("sc_zf_hcq.bl_type","2");
             }else if(result1.data.records[0]['bl.bl_type'] == "平房"){
                 this.hcqfForm.setFieldValue("sc_zf_hcq.bl_type","3");
             }else{
                 this.hcqfForm.setFieldValue("sc_zf_hcq.bl_type","9");
             }
         }else{
             this.hcqfForm.setFieldValue("sc_zf_hcq.date_building_end","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.area_jianzhu","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.ytys","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.area_yt","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.area_sy","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.area_hd","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.chaoxiang","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.huxing","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.bl_type","1");
             return;
         }
         
         var restriction = "rm.bl_id = '" + bl_id + "' and rm.fl_id = '" + fl_id + "' and rm.rm_id = '" + rm_id + "'";
         var parameters = {
             tableName: 'rm',
             fieldNames: toJSON(['rm.area_jianzhu','rm.ytys','rm.area_yt','rm.area_sy','rm.area_hd','rm.chaoxiang','rm.huxing']),
             restriction: toJSON(restriction)
         };
         var result2 = Workflow.call('AbCommonResources-getDataRecords', parameters);
         if (result2.data.records.length > 0) {
             this.hcqfForm.setFieldValue("sc_zf_hcq.area_jianzhu",result2.data.records[0]['rm.area_jianzhu']);
             //;;1;封闭阳台;2;未封闭阳台
        	 if(result2.data.records[0]['rm.ytys'] == ""){
        		 this.hcqfForm.setFieldValue("sc_zf_hcq.ytys","");
        	 }else if(result2.data.records[0]['rm.ytys'] == "封闭阳台"){
        		 this.hcqfForm.setFieldValue("sc_zf_hcq.ytys","1");
        	 }else if(result2.data.records[0]['rm.ytys'] == "未封闭阳台"){
        		 this.hcqfForm.setFieldValue("sc_zf_hcq.ytys","2")
        	 }
             
             this.hcqfForm.setFieldValue("sc_zf_hcq.area_yt",result2.data.records[0]['rm.area_yt']);
             this.hcqfForm.setFieldValue("sc_zf_hcq.area_sy",result2.data.records[0]['rm.area_sy']);
             this.hcqfForm.setFieldValue("sc_zf_hcq.area_hd",result2.data.records[0]['rm.area_hd']);
             this.hcqfForm.setFieldValue("sc_zf_hcq.chaoxiang",result2.data.records[0]['rm.chaoxiang']);
             this.hcqfForm.setFieldValue("sc_zf_hcq.huxing",result2.data.records[0]['rm.huxing']);
         }else{
             
             this.hcqfForm.setFieldValue("sc_zf_hcq.area_jianzhu","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.ytys","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.area_yt","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.area_sy","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.area_hd","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.chaoxiang","");
             this.hcqfForm.setFieldValue("sc_zf_hcq.huxing","");
             
             return;
         }
    },
    hcqfForm_onSave: function(){
        if(!this.hcqfForm.canSave()){
            return;
        }
        
        if(SUPERCONTROLLER.IS_ADMIN_ACCOUNT == true){//如果是管理员界面
            this.hcqfForm.setFieldValue("sc_zf_hcq.is_audit_admin","1");
        }
        
        this.hcqfForm.save();
        this.hcqfForm.show(false);
        this.hcqfGrid.refresh();
    },
    showHcqfForm: function(){
		this.hcqfForm.actions.get('save').show(true);
		this.hcqfForm.actions.get('delete').show(true);
    	
        var selectedIndex = this.hcqfGrid.selectedRowIndex;
        var auto_id = this.hcqfGrid.rows[selectedIndex]["sc_zf_hcq.auto_id"];
        
        var res = new Ab.view.Restriction();
        res.addClause("sc_zf_hcq.auto_id", auto_id, "=");
        this.hcqfForm.refresh(res,false);
		
		//初始化配偶信息选择框
        var po_name = this.getCurrentHFpo();
        var xm = SUPERCONTROLLER.emForm.getFieldValue("sc_zf_em.xm");
        
        $('owners').options.length = 0;
        $('owners').options.add(new Option(xm,xm));
        if(valueExistsNotEmpty(po_name)){
            var owners = xm + "/" + po_name;
            $('owners').options.add(new Option(po_name,po_name));
            $('owners').options.add(new Option(owners,owners));
        }
        //点击链接查看是维护虚拟字段与隐藏实体字段的值相同
        jQuery("#owners").val(this.hcqfForm.getFieldValue("sc_zf_hcq.owner_names"));
        
        if(SUPERCONTROLLER.IS_ADMIN_ACCOUNT == false){//如果是非管理员用户
			this.hcqfForm.getFieldElement("sc_zf_hcq.bl_name").disabled = true;
			this.hcqfForm.getFieldElement("sc_zf_hcq.rm_id").disabled = true;
			
			var is_audit_admin = this.hcqfForm.getFieldValue("sc_zf_hcq.is_audit_admin");
			if(is_audit_admin == '1'){//通过管理员验证
				this.hcqfForm.actions.get('save').show(false);
				this.hcqfForm.actions.get('delete').show(false);
			}
		}
        
    },
    hcqfForm_onDelete: function(){
        var controller = this;
        View.confirm("您确定要删除此产权房记录?", function(button){
            if(button == "yes"){
                controller.hcqfForm.deleteRecord();
                controller.hcqfForm.show(false);
                controller.hcqfGrid.refresh();
            }
        });
    },
    /****
	 * 
	 * 添加核定面积计算功能
	 * 
	 * 福利房的房间信息可以不是学校自己的房子
	 * 从别的单位分的福利房也算面积
	 * 
	 * */
	showArea:function(){
    	//;;1;单元式楼房;2;简易楼;3;平房;9;其他
    	//;;1;封闭阳台;2;未封闭阳台
    	var area_sy;
    	var area_hd;
    	var rm_area=View.panels.get("hcqfForm");
    	var ytys = rm_area.getFieldValue("sc_zf_hcq.ytys");
    	var area_jz = rm_area.getFieldValue("sc_zf_hcq.area_jianzhu");
    	var area_yt = rm_area.getFieldValue("sc_zf_hcq.area_yt");
    	var bl_type = rm_area.getFieldValue("sc_zf_hcq.bl_type");//查询房间所在建筑物的房屋类别
    	
    	if(bl_type=="3"){
    		area_sy=(area_jz/1.21);
    		var area_sy_new=area_sy.toFixed(2);
    		rm_area.setFieldValue("sc_zf_hcq.area_sy",area_sy_new,"=");
    	}else{
    		area_sy=(area_jz/1.333);
    		var area_sy_new=area_sy.toFixed(2);
    		rm_area.setFieldValue("sc_zf_hcq.area_sy",area_sy_new,"=");
    	}

    	if(ytys=="1"){
			area_hd=(area_jz-area_yt)+(area_yt*0.5);
			var area_hd_new=area_hd.toFixed(2);
			rm_area.setFieldValue("sc_zf_hcq.area_hd",area_hd_new,"=");
		}else if(ytys=="2"){
			area_hd=(area_jz-area_yt)+(area_yt*0.7);
			var area_hd_new=area_hd.toFixed(2);
			rm_area.setFieldValue("sc_zf_hcq.area_hd",area_hd_new,"=");
		}
    }
    
});

function afterSelectRm(fieldName, newValue, oldValue){
    if(fieldName == 'sc_zf_hcq.rm_id'){
        //因为在后面要读取这个值，所以提前set
        ascZfEdFcHcqController.hcqfForm.setFieldValue("sc_zf_hcq.rm_id",newValue);
        ascZfEdFcHcqController.initialRmInfo("init");
        return false;
    }
    if(fieldName == 'sc_zf_hcq.community'){
        dealWith('hcqfForm', fieldName, newValue);
        return false;
    }
}

function afterSelectBl(fieldName, newValue, oldValue){
    //1;校内东西家属区;2;柏儒苑小区;3;静淑苑小区;4;育新花园;5;望京花园;6;田园风光;7;亚运村;8;安慧北里;9;其他
    if(fieldName == 'sc_zf_hcq.community'){
        dealWith('hcqfForm', fieldName, newValue);
         
        //建筑物变了，清空房间的一切信息 
        if(newValue != oldValue){
            ascZfEdFcHcqController.hcqfForm.setFieldValue("sc_zf_hcq.fl_id","");
            ascZfEdFcHcqController.hcqfForm.setFieldValue("sc_zf_hcq.rm_id","");
            ascZfEdFcHcqController.initialRmInfo("clear");
        }
        return false;
    }
}

/*
 * 代码处理 下拉列表不能被填充值
 */
function afterSelectTypeName(fieldName, selectedValue, previousValue){
    if (fieldName == 'sc_zf_hcq.super_type') {
        dealWith('hcqfForm', fieldName, selectedValue);
        return false;
    }
}

function dealWith(panelId, fieldName, selectedValue){
    var panel = View.panels.get(panelId);
    var listOptions = panel.getFieldElement(fieldName);
    
    if (typeof listOptions == 'undefined' || !listOptions) 
        return;
    
    var nCount = listOptions.options.length;
    for (var nIdx = 0; nIdx < nCount; nIdx++) {
        var optionsValue = listOptions.options[nIdx].innerHTML;
        if (optionsValue == selectedValue) {
            listOptions.selectedIndex = nIdx;
            break;
        }
    }
}




