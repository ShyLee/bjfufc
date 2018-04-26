var abEstateController = View.createController('abEstateController',{
	
	afterInitialDataFetch: function(){
		 this.onCopiesClick(true);
	  },
	consolePanel_onShow:function(){
	   this.onCopiesClick(true);
	},
	copiesInfoPanel_onAddCopiesNew:function(){
		this.editCopiesPanel.showInWindow({
	    	closeButton: false,
	        width: 800,
	        height: 500
	    });
		var id=this.requestInfoPanel.getFieldValue("ts_papers_use_main.use_main_id");
		if(id!=""){
		   this.editCopiesPanel.refresh(null,true);
		   this.editCopiesPanel.setFieldValue("ts_papers_use_detail.use_main_id",id)
		}else{
		   this.editCopiesPanel.refresh(null,true);
		}
		var requestor=this.requestInfoPanel.getFieldValue("ts_papers_use_main.requestor");
		this.editCopiesPanel.setTitle("【"+requestor+"】房产证及测绘数据申请");
	},
	requestListInfoPanel_onNew:function(){
		this.requestInfoPanel.refresh(null,true);
		var restriction=new Ab.view.Restriction();
		restriction.addClause("ts_papers_use_detail.use_main_id", '', 'IS NULL', 'AND', true);
		this.copiesInfoPanel.refresh(restriction);
	},
	onCopiesClick:function(afterShow){
		if (this.requestListInfoPanel.rows.length == 0) {
			this.requestInfoPanel.show(false);
			this.copiesInfoPanel.show(false);
			 return;
		}else{
			var panel=this.requestListInfoPanel;
			var selectedIndex = -1;
			if (afterShow) {
				selectedIndex = 0;
			} else {
				selectedIndex = panel.selectedRowIndex;
			}
			
			var id = panel.rows[selectedIndex]["ts_papers_use_main.use_main_id"];
			var restriction=new Ab.view.Restriction();
			restriction.addClause("ts_papers_use_main.use_main_id", id, "=");
			this.requestInfoPanel.refresh(restriction,false);
			
			var restriction=new Ab.view.Restriction();
			restriction.addClause("ts_papers_use_detail.use_main_id", id,"=");
			this.copiesInfoPanel.refresh(restriction);
			
		   var requestor=this.requestInfoPanel.getFieldValue("ts_papers_use_main.requestor");
		   this.copiesInfoPanel.setTitle("【"+requestor+"】房产证及测绘数据申请记录");
		}
	},
	/**
	 * 删除主表信息
	 */
	requestInfoPanel_onDelete:function(){
		var id=this.requestInfoPanel.getFieldValue("ts_papers_use_main.use_main_id");
        //删除相关细表数据
		var dateSource = View.dataSources.get("ts_papers_use_detail_ds");
        var restriction = new Ab.view.Restriction();
        restriction.addClause("ts_papers_use_detail.use_main_id", id,"=");
        var record = dateSource.getRecords(restriction);
        AUSC_deleteRecord(dateSource, record);
        
        //删除主表数据
        var dateSource1 = View.dataSources.get("ts_papers_use_main_ds");
        var restriction1 = new Ab.view.Restriction();
        restriction1.addClause("ts_papers_use_detail.use_main_id", id,"=");
        var record1 = dateSource1.getRecords(restriction1);
        AUSC_deleteRecord(dateSource1, record1);
        
	},
	/**
	 * 删除细表信息
	 * 同时更新主表中的【申请张数】和【文件类型】
	 */
	editCopiesPanel_onDelete:function(){
		this.updateDetailCountAndType();
		
	},
	
	/**
	 * 添加主表信息
	 */
	requestInfoPanel_onSave:function(){
		var id=this.requestInfoPanel.getFieldValue("ts_papers_use_main.use_main_id");
		if(id==""){
			var id=this.insertPrimary();
		}
		this.requestInfoPanel.setFieldValue("ts_papers_use_main.use_main_id",id);
		var keyvalue=this.requestInfoPanel.getFieldValue("ts_papers_use_main.use_main_id");
		if (!this.requestInfoPanel.canSave()) {
            return false;
        }else{
        	this.requestInfoPanel.save();
        	this.requestListInfoPanel.refresh();
        }
	},
	/**
	 * 添加细表信息
	 */
	editCopiesPanel_onSave:function(){
		if (!this.editCopiesPanel.canSave()) {
            return false;
        }else{
        	var id=this.editCopiesPanel.getFieldValue("ts_papers_use_detail.use_main_id");
        	if(id==""){
        		this.requestInfoPanel_onSave();
        		var mainId=this.requestInfoPanel.getFieldValue("ts_papers_use_main.use_main_id");
        		this.editCopiesPanel.setFieldValue("ts_papers_use_detail.use_main_id",mainId)
        	}else{
        		this.editCopiesPanel.save();
        	}
        	var id=this.editCopiesPanel.getFieldValue("ts_papers_use_detail.use_main_id");
        	var restriction=new Ab.view.Restriction();
        	restriction.addClause("ts_papers_use_detail.use_main_id",id,"=");
        	this.copiesInfoPanel.refresh(restriction);
        	
        	this.updateDetailCountAndType();
        }
	},
	onCopieClick:function(row){
		this.editCopiesPanel.showInWindow({
	    	closeButton: false,
	        width: 800,
	        height: 1000
	    });
		var selectedIndex = this.copiesInfoPanel.selectedRowIndex;
	
		var id = this.copiesInfoPanel.rows[selectedIndex]["ts_papers_use_detail.use_detail_id"];
		var restriction=new Ab.view.Restriction();
		restriction.addClause("ts_papers_use_detail.use_detail_id", id, "=");
		this.editCopiesPanel.refresh(restriction,false);
		
		var requestor=this.requestInfoPanel.getFieldValue("ts_papers_use_main.requestor");
		this.editCopiesPanel.setTitle("【"+requestor+"】房产证及测绘数据申请");
	},
	/**
	 * 在保存、删除从表时更新主表中的【申请张数】和【文件类型】
	 * 
	 */
	updateDetailCountAndType:function(){
		
		var rows=this.copiesInfoPanel.rows;
    	var requestCount=rows.length;
    	var requestType="";
    	if(requestCount!=0){
    		var oneType=this.copiesInfoPanel.rows[0].row.getFieldValue("ts_papers_use_detail.file_type");
    		for(var i=0;i<rows.length;i++){
    			var nextType=this.copiesInfoPanel.rows[i].row.getFieldValue("ts_papers_use_detail.file_type");
    			if(oneType==nextType){
    				if(oneType==1){
    					requestType="原件";
    				}else if(oneType==2){
    					requestType="复印件";
    				}
    			}else{
    				requestType="原件/复印件";
    				break;
    			}
    		}
    	}
    	
    	//更新主表中的【申请张数】和【文件类型】
    	var id=this.editCopiesPanel.getFieldValue("ts_papers_use_detail.use_main_id");
    	var restriction=new Ab.view.Restriction();
    	restriction.addClause("ts_papers_use_main.use_main_id",id,"=" );
    	var account = View.dataSources.get("ts_papers_use_main_ds");
    	var record=account.getRecord(restriction);
    	
    	record.setValue("ts_papers_use_main.request_count",requestCount);
    	record.setValue("ts_papers_use_main.file_type",requestType);
    	account.saveRecord(record);
    	
    	this.editCopiesPanel.closeWindow();
    	
    	this.requestInfoPanel.refresh(restriction);
    	this.requestListInfoPanel.refresh();
	},
	/**
	 * 自增主键
	 */
	insertPrimary:function(){
		try{
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-CreateDealId-getUniquePKeyCode', "FC","ts_papers_use_main","use_main_id","DATE_SYS");
			var obj = eval("(" + result.jsonExpression + ")");
			var dealid=obj.dealID;
			return dealid;
			
		} catch (e) {
	        Workflow.handleError(e);
	        return null;
	    }
	},
	/**
	 * 添加序号
	 */
	requestListInfoPanel_afterRefresh:function(){
		AUSC_AddRowNum(this.requestListInfoPanel);
    },
    copiesInfoPanel_afterRefresh:function(){
    	AUSC_AddRowNum(this.copiesInfoPanel);
    }
});