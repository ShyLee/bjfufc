var abScDefEmController = View.createController('abScDefEm', {
    searchTeacherPanel_onSearch: function(){
		var   emName=this.searchTeacherPanel.getFieldValue("em.name");
		var   emId=this.searchTeacherPanel.getFieldValue("em.em_id");
		var   dpId=this.searchTeacherPanel.getFieldValue("em.dp_id");
		var   dvId=this.searchTeacherPanel.getFieldValue("em.dv_id");
		
		var consoleRestriction = new Ab.view.Restriction();
		if (emName != "") {
			consoleRestriction.addClause("em.name", emName, "like");
		}
		if (emId != "") {
			consoleRestriction.addClause("em.em_id", emId, "like");
		}
		if (dvId != "") {
			consoleRestriction.addClause("em.dv_id", dvId, "like");
		}
		this.abScDefEmGrid.refresh(consoleRestriction);
		
		if (this.abScDefEmGrid.rows.length == 0) {
			this.abScDefEmGrid.show(false);
			this.abScDefEmForm.show(false);
	    	 View.showMessage("没有符合条件的员工信息！");
			 return;
		}
	},
    abScDefEmForm_onSave: function(){
    	this.abScDefEmForm.save();
    	this.abScDefEmGrid.restriction=null;
		this.abScDefEmGrid.refresh("");
    },
	searchTeacherPanel_onShow:function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClause("em.area_dinge", '', 'IS NULL');
//		restriction.addClause("em.area_dinge", '', 'IS NULL', 'AND', true);
		this.abScDefEmGrid.refresh(restriction);
	},
	abScDefEmGrid_onUpdate:function(){
		 try {
			 var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-VerifyDingeHandler-updateDingeJiBie');
			 if(result.code="executed"){
				 this.abScDefEmGrid.refresh();
				 View.showMessage("更新成功!！");
				 return;
			 }
		 }catch (e) {
	         Workflow.handleError(e);
	      }
	}
});


