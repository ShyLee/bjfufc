var ascZfAuditFcController = View.createController('ascZfAuditFcController', {

	consoleForm_onShow: function(){
		var xm = this.consoleForm.getFieldValue("sc_zf_em.xm");
		var archive_id = this.consoleForm.getFieldValue("sc_zf_em.archive_id");
		
		var res1 = new Ab.view.Restriction();
		var res2 = new Ab.view.Restriction();
		if(valueExistsNotEmpty(xm)){
			res1.addClause("sc_zf_cq.xm", xm, "=");
			res2.addClause("sc_zf_hcq.xm", xm, "=");
		}
		
		if(valueExistsNotEmpty(archive_id)){
			res1.addClause("sc_zf_cq.archive_id", archive_id, "=");
			res2.addClause("sc_zf_hcq.archive_id", archive_id, "=");
		}
		  
	    this.cqfGrid.refresh(res1);
	    this.hcqfGrid.refresh(res2);
	},
	showCqfForm: function(){
		var selectedIndex = this.cqfGrid.selectedRowIndex;
		var auto_id = this.cqfGrid.rows[selectedIndex]["sc_zf_cq.auto_id"];
		
		var res = new Ab.view.Restriction();
		res.addClause("sc_zf_cq.auto_id", auto_id, "=");
		this.cqfForm.refresh(res,false);
		this.cqfForm.showInWindow({
			title: "现住产权房详情",
			width: 1000,
			height: 600
		});
	},
	showHcqfForm: function(){
		var selectedIndex = this.hcqfGrid.selectedRowIndex;
		var auto_id = this.hcqfGrid.rows[selectedIndex]["sc_zf_hcq.auto_id"];
		
		var res = new Ab.view.Restriction();
		res.addClause("sc_zf_hcq.auto_id", auto_id, "=");
		this.hcqfForm.refresh(res,false);
		this.hcqfForm.showInWindow({
			title: "曾住产权房详情",
			width: 1000,
			height: 600
		});
	},
	cqfGrid_onAudit: function(){
		var selectedRecordList = this.cqfGrid.getSelectedRecords();
		if(selectedRecordList.length == 0){
			View.alert('请选择要操作的数据');
			return;
		}
		var controller = this;
		View.confirm("您确定此记录已审核通过", function(button){
			if(button == "yes"){
				for(var i = 0; i < selectedRecordList.length; i++){
					var record = selectedRecordList[i];
					var auto_id = record.getValue('sc_zf_cq.auto_id');
					var res = new Ab.view.Restriction();
					res.addClause("sc_zf_cq.auto_id",auto_id,"=");
					var record = controller.scZfcqDs.getRecord(res);
					record.setValue("sc_zf_cq.is_audit_admin","1");
					controller.scZfcqDs.saveRecord(record);
					
					controller.cqfGrid.refresh();
				}
			}
		});
	},
	hcqfGrid_onAudit: function(){
		var selectedRecordList = this.hcqfGrid.getSelectedRecords();
		if(selectedRecordList.length == 0){
			View.alert('请选择要操作的数据');
			return;
		}
		var controller = this;
		View.confirm("您确定此记录已审核通过", function(button){
			if(button == "yes"){
				for(var i = 0; i < selectedRecordList.length; i++){
					var record = selectedRecordList[i];
					var auto_id = record.getValue('sc_zf_hcq.auto_id');
					var res = new Ab.view.Restriction();
					res.addClause("sc_zf_hcq.auto_id",auto_id,"=");
					var record = controller.scZfhcqDs.getRecord(res);
					record.setValue("sc_zf_hcq.is_audit_admin","1");
					controller.scZfhcqDs.saveRecord(record);
					
					controller.hcqfGrid.refresh();
				}
			}
		});
	}
	
});









