
var ascZzfJfApproveController = View.createController('ascZzfJfApproveController', {
	hisAddr:null,//已选择的房间，用于退房操作。
	wfrId: 'AbSpaceRoomInventoryBAR-iReportHandler-PmreReport',
	
	afterInitialDataFetch:function(){
		//我们可以查询归档状态下的积分记录
		var restriction = " 1=1 ";
        var parameters = {
            tableName: 'sczzf_jfxf_log',
            fieldNames: toJSON(['sczzf_jfxf_log.batch_gd']),
            sortValues: toJSON([{'fieldName': 'sczzf_jfxf_log.batch_gd', 'sortOrder':2}]),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        var htmlStr = '<select id="selectYear" onchange="ascZzfJfApproveController.changeSelectYear()">'
        	 +  '<option value="未归档列表">未归档列表</option>';
        if (result.data.records.length > 0) {
        	
        	for(var i = 0; i<result.data.records.length; i++){
        		var batch_gd = result.data.records[i]['sczzf_jfxf_log.batch_gd'];
        		htmlStr += '<option value="' + batch_gd + '">' + batch_gd + '</option>';
        	}
        	htmlStr += '</select>';
        }
        $('selectYear').outerHTML = htmlStr;
        
        var res = new Ab.view.Restriction();
        res.addClause("bjfu_zzf_jf.date_gd",'', 'IS NULL');
        this.applyInfoGrid.refresh(res);
        
        this.applyInfoGrid.setTitle("排名表");
	},
	
	changeSelectYear: function(){
		var selectedName =  $('selectYear').options[$('selectYear').selectedIndex].value;
	
		if(selectedName == "未归档列表"){
			var res = new Ab.view.Restriction();
	        res.addClause("bjfu_zzf_jf.batch_gd",'','is null');
	        this.applyInfoGrid.refresh(res);
	        
	        this.applyInfoGrid.setTitle("排名表");
		}else{
			this.applyInfoGrid.restriction= " bjfu_zzf_jf.batch_gd = '" + selectedName + "'";
	        this.applyInfoGrid.refresh();
	        
	        this.applyInfoGrid.setTitle(selectedName + "--分房详情");
		}
	},
	
	/**
     * 线性缴费项序号
     * */
	applyInfoGrid_afterRefresh: function(){
    	var items = this.applyInfoGrid.gridRows.items;
    	for(var i=0; i<items.length; i++){
    		items[i].setFieldValue('Num',i+1);
    	}
    	
    	
    },
    applyInfoGrid_onDeal:function(){
    	
    	var grid =this.applyInfoGrid;
		var selectedRecordList=grid.getSelectedRecords();
		if(selectedRecordList.length==0){
			View.alert('请选择要操作的数据');
			return;
		}else if(selectedRecordList.length > 1){
			View.alert('您只能处理一条数据');
			return;
		}
    	
    	
		var rowRecord=selectedRecordList[0];
		var id = rowRecord.getValue('bjfu_zzf_jf.id');
    	
    	var restriction = new Ab.view.Restriction(); 
    	restriction.addClause("bjfu_zzf_jf.id",id,"=");
    	this.dealForm.refresh(restriction,false);
    	
    	this.dealForm.showInWindow({
    		title:'分房详情',
    		x: 100,
    		y: 100,
			closeButton: false,
	        width: 1000,
	        height: 230
	    });
    	this.dealForm.show(true);
    	
    	//1;已归档;2;未归档
    	var gd_status = rowRecord.getValue('bjfu_zzf_jf.gd_status');
    	$('dealForm_head').style.display="none";
    	if(gd_status == '1'){
    		 this.dealForm.actions.get('save').show(false);
    		 this.dealForm.actions.get('save').show(false);
    	}else{
    		 this.dealForm.actions.get('save').show(true);
    		 this.dealForm.actions.get('save').show(true);
    	}
    	
    	this.dealForm.setFieldValue("bjfu_zzf_jf.date_approve",new Date());
    	this.dealForm.setFieldValue("bjfu_zzf_jf.status",'yff');
    	
    	this.hisAddr = this.dealForm.getFieldValue("bjfu_zzf_jf.xf_addr");
    },
    dealForm_onReturn: function(){
    	this.dealForm.closeWindow();
    	this.dealForm.show(false);
    },
    dealForm_onSave: function(){
    	if(!this.dealForm.canSave()){
    		return;
    	}
    	
    	//腾退已入住的周转房信息
    	var rm_addr = this.dealForm.getFieldValue("bjfu_zzf_jf.rm_addr");
    	var zf_type_name = this.dealForm.getFieldValue("bjfu_zzf_jf.zf_type_name");
    	var date_tz = this.dealForm.getFieldValue("bjfu_zzf_jf.date_tz");
    	if(zf_type_name == '周转房'){
    		if(!valueExistsNotEmpty(date_tz)){
    			View.showMessage("预计腾退日期不能为空");
    			return;
    		}
    		addr = rm_addr.split("|");
    		this.tzZZF(addr[0],date_tz);
    	}
    	
    	this.dealForm.save();
    	if(valueExistsNotEmpty(this.hisAddr)){//让出已选房间
    		var addr2 = this.hisAddr.split("~");
    		
    		var restriction = new Ab.view.Restriction(); 
        	restriction.addClause("bjfu_zzf_jfxf.bl_id",addr2[0],"=");
        	restriction.addClause("bjfu_zzf_jfxf.fl_id",addr2[1],"=");
        	restriction.addClause("bjfu_zzf_jfxf.rm_id",addr2[2],"=");
        	var record = this.zzfJfxfDs.getRecord(restriction);
        	record.setValue("bjfu_zzf_jfxf.status",'2');
        	this.zzfJfxfDs.saveRecord(record);
    	}
    	var status = this.dealForm.getFieldValue("bjfu_zzf_jf.status");
    	
    	if(status == 'yff'){//分房状态下才分房间
    		// 选择房间
        	var xf_addr = this.dealForm.getFieldValue("bjfu_zzf_jf.xf_addr");
        	var addr = xf_addr.split("~");
        	
        	var restriction = new Ab.view.Restriction(); 
        	restriction.addClause("bjfu_zzf_jfxf.bl_id",addr[0],"=");
        	restriction.addClause("bjfu_zzf_jfxf.fl_id",addr[1],"=");
        	restriction.addClause("bjfu_zzf_jfxf.rm_id",addr[2],"=");
        	var records = this.zzfJfxfDs.getRecords(restriction);
        	if(records.length > 0){
        		var record = records[0];
        		record.isNew = false;
        		record.setValue("bjfu_zzf_jfxf.status",'1');
            	this.zzfJfxfDs.saveRecord(record);
        	}
        	
    	}
    	
    	this.applyInfoGrid.refresh();
    },
    /**
     * 腾退已入住的周转房信息
     * 
     * */
    tzZZF: function(addr,date_tz){
    	var rmStr = addr.split("~");
    	var bl_id = rmStr[0];
    	var fl_id = rmStr[1];
    	var rm_id = rmStr[2];
    	
    	var restriction = new Ab.view.Restriction(); 
    	restriction.addClause("rm.bl_id",bl_id,"=");
    	restriction.addClause("rm.fl_id",fl_id,"=");
    	restriction.addClause("rm.rm_id",rm_id,"=");
    	var record = this.rmDetail.getRecord(restriction);
    	
    	var res2 = new Ab.view.Restriction(); 
    	res2.addClause("bjfu_zzf_jfxf.bl_id",bl_id,"=");
    	res2.addClause("bjfu_zzf_jfxf.fl_id",fl_id,"=");
    	res2.addClause("bjfu_zzf_jfxf.rm_id",rm_id,"=");
    	var records = this.zzfJfxfDs.getRecords(res2);
    	if(records.length == 0){
    		var rm_type = record.getValue("rm.rm_type");
    		
    		var rec = new Ab.data.Record();
            rec.setValue("bjfu_zzf_jfxf.bl_id", bl_id);
            rec.setValue("bjfu_zzf_jfxf.bl_name", record.getValue("bl.name"));
            rec.setValue("bjfu_zzf_jfxf.fl_id", fl_id);
            rec.setValue("bjfu_zzf_jfxf.rm_id", rm_id);
            rec.setValue("bjfu_zzf_jfxf.area_jianzhu", record.getValue("rm.area_jianzhu"));
            rec.setValue("bjfu_zzf_jfxf.huxing", record.getValue("rm.huxing"));
            rec.setValue("bjfu_zzf_jfxf.area_yt", record.getValue("rm.area_yangtai"));
            rec.setValue("bjfu_zzf_jfxf.date_rz", date_tz);
            rec.setValue("bjfu_zzf_jfxf.status", "2");
            
            if(rm_type == '30602'){//B类周转房才能加到选择列表里面
            	this.zzfJfxfDs.saveRecord(rec);
   		 	}
    	}
    },
    dealForm_onPrint: function(){
    	View.clearDialogParameters();
//    	View.clearPanelRestrictions();

    	var id = this.dealForm.getFieldValue("bjfu_zzf_jf.id");
    	
        var xmlName= "sczzf_jfxf";
        var parameters= {
    		'pId': id
        };
    	try {
            var result = Workflow.callMethod(this.wfrId, xmlName, 0, parameters);
            if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
                result.data = eval('(' + result.jsonExpression + ')');
                this.jobId = result.data.jobId;
                var url = 'ab-ireport-example.axvw?jobId=' + this.jobId;
                window.open(url);
            }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    },
    applyInfoGrid_onFile: function(){
    	var grid =this.applyInfoGrid;
		var selectedRecordList=grid.getSelectedRecords();
		if(selectedRecordList.length==0){
			View.alert('请选择要操作的数据');
			return;
		}
		var controller = this;
	    View.prompt('归档', '输入归档批次', function(button, text) {
		   if(button!='cancel' && text==''){
			   View.alert('请输入归档批次');
				return; 
		   }
           if (button == 'ok') {
				for(var i=0;i<selectedRecordList.length;i++){
					var rowRecord=selectedRecordList[i];
					
					var id = rowRecord.getValue('bjfu_zzf_jf.id');
	            	var restriction = new Ab.view.Restriction(); 
	            	restriction.addClause("bjfu_zzf_jf.id",id,"=");
	            	var record = controller.zzfJfDs.getRecord(restriction);
	            	
	            	var xf_addr = record.getValue('bjfu_zzf_jf.xf_addr');
	            	var status = record.getValue('bjfu_zzf_jf.status');
	            	if(status == 'yff'){
	            		controller.doDelteTRm(xf_addr);//选房并归档，删除选房信息
	            	}
	            	
	            	record.setValue("bjfu_zzf_jf.gd_status",'1');
	            	record.setValue("bjfu_zzf_jf.date_gd",new Date());
	            	record.setValue("bjfu_zzf_jf.batch_gd",text);
	            	controller.zzfJfDs.saveRecord(record);
	            	
	            	controller.applyInfoGrid.refresh();
				}
            }
           grid.refresh();
        });
    },
    /**
     * 选房并归档，删除选房信息
     * */
    doDelteTRm: function(xf_addr){
    	var rmStr = xf_addr.split("~");
    	var bl_id = rmStr[0];
    	var fl_id = rmStr[1];
    	var rm_id = rmStr[2];
    	
    	var restriction = new Ab.view.Restriction(); 
    	restriction.addClause("bjfu_zzf_jfxf.bl_id",bl_id,"=");
    	restriction.addClause("bjfu_zzf_jfxf.fl_id",fl_id,"=");
    	restriction.addClause("bjfu_zzf_jfxf.rm_id",rm_id,"=");
    	var record = this.zzfJfxfDs.getRecord(restriction);
    	
    	this.zzfJfxfDs.deleteRecord(record);
    }

});
/***
 * 选房
 * 根据主键拼出地址
 * 
 * */
function selectRm(fieldName,selectedValue,previousValue){
	if(fieldName=='bjfu_zzf_jf.xf_addr'){
		var restriction = "bjfu_zzf_jfxf.id ='" + selectedValue + "'";
        var parameters = {
            tableName: 'bjfu_zzf_jfxf',
            fieldNames: toJSON(['bjfu_zzf_jfxf.bl_id', 'bjfu_zzf_jfxf.fl_id', 'bjfu_zzf_jfxf.rm_id']),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.data.records.length > 0) {
        	var bl_id = result.data.records[0]['bjfu_zzf_jfxf.bl_id'];
 	        var	fl_id = result.data.records[0]['bjfu_zzf_jfxf.fl_id'];
 	        var	rm_id = result.data.records[0]['bjfu_zzf_jfxf.rm_id'];
 	        
 	        var xf_addr = bl_id + "~" + fl_id + "~" + rm_id;
 	       ascZzfJfApproveController.dealForm.setFieldValue("bjfu_zzf_jf.xf_addr",xf_addr);
        }
        return false;
	}
}
