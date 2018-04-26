var tsPropComplaintControlller = View.createController('tsPropComplaintControlller', {
	prop_code:"",
	prop_name:"",
	cp_status:"",
	date_comp:"",
	consoleClear: function(){
		this.propCompanyConsole.setFieldValue('ts_prop_company.prop_name',"");
		this.propCompanyConsole.setFieldValue('ts_prop_complaint.cp_status',"");
		this.propCompanyConsole.setFieldValue('ts_prop_complaint.date_comp',"");
		this.prop_code = "";
		this.prop_name = "";
		this.cp_status = "";
		this.date_comp = "";
	},
	filter :function(){
		var prop_name = this.propCompanyConsole.getFieldValue('ts_prop_company.prop_name');
		var cp_status = this.propCompanyConsole.getFieldValue('ts_prop_complaint.cp_status');
		var date_comp = this.propCompanyConsole.getFieldValue('ts_prop_complaint.date_comp');
		var consoleRestriction = new Ab.view.Restriction();
		if(prop_name != "" || cp_status != "" || date_comp != ""){
			var restriction = new Ab.view.Restriction();
			if(prop_name != ""){
				restriction.addClause('ts_prop_company.prop_name', prop_name, '=');
			}
			if(cp_status != ""){
				restriction.addClause('ts_prop_complaint.cp_status', cp_status, '=');
				this.cp_status = cp_status;
			}
			if(date_comp != ""){
				restriction.addClause('ts_prop_complaint.date_comp', date_comp, '=');
				this.date_comp = date_comp;
			}
			var records = this.complaintManagement_DS.getRecords(restriction);
			if(records.length > 0){
				for(var i = 0; i < records.length; i++){
					var prop_name2 = records[i].getValue('ts_prop_company.prop_name');
					consoleRestriction.addClause('ts_prop_company.prop_name', prop_name2, '=', "OR");
				}
			}else{
				consoleRestriction.addClause('ts_prop_company.prop_name', null, '=', "OR");
			}
			
		}else{
			
		}
		this.propCompanyGrid.refresh(consoleRestriction);
		this.complaintGrid.show(false);
		this.complaintForm.show(false);
		
	},
	showComplaintGrid: function(){
		var selectedIndex = this.propCompanyGrid.selectedRowIndex;
		this.prop_code = this.propCompanyGrid.rows[selectedIndex]["ts_prop_company.prop_code"];
		this.prop_name = this.propCompanyGrid.rows[selectedIndex]["ts_prop_company.prop_name"];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ts_prop_company.prop_code', this.prop_code, '=');
		if(this.cp_status != ""){
			restriction.addClause('ts_prop_complaint.cp_status', this.cp_status, '=');
			//this.cp_status = cp_status;
		}
		if(this.date_comp != ""){
			restriction.addClause('ts_prop_complaint.date_comp', this.date_comp, '=');
			//this.date_comp = date_comp;
		}
		this.complaintGrid.refresh(restriction);
		this.complaintGrid.show();
	},
	
	propCompanyGrid_onAdd: function(){
			this.complaintForm.refresh(null,true);
	//		this.complaintForm.setFieldValue('ts_prop_complaint.cp_prop_code', this.prop_code);
			this.complaintForm.setFieldValue('ts_prop_complaint.cp_em_id', View.user.employee.id);
	//    	this.complaintForm.setFieldValue('ts_prop_company.prop_name', this.prop_name);
			this.complaintForm.setFieldValue('ts_prop_complaint.cp_dv_id', View.user.employee.organization.divisionId);
			this.complaintForm.setFieldValue('ts_prop_complaint.cp_dp_id', View.user.employee.organization.departmentId);
			this.complaintForm.setFieldValue('ts_prop_complaint.date_comp', new Date());
			this.complaintForm.setTitle(getMessage('addComplaint'));
			this.complaintForm.actions.get('delete').enable(false);	
        
	},
	complaintForm_afterSave: function(){
		
		this.prop_code = this.complaintForm.getFieldValue('ts_prop_complaint.cp_prop_code');
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ts_prop_company.prop_code', this.prop_code, '=' ,"OR");
		this.propCompanyGrid.refresh(null,false);
		this.complaintGrid.refresh(restriction,false);
	},
	complaintForm_afterDelete: function(){
		this.propCompanyGrid.refresh(null,false);
		this.complaintGrid.refresh(null,false);
	},
	complaintGrid_afterRefresh:function(){
		AUSC_AddRowNum(this.complaintGrid);
	}
	
});

















