var ascSchDefSchoolInfoController = View.createController('ascSchDefSchoolInfoController', {
	init:function(){
		var restriction={'sc_school.sch_id':1};
		this.abScDefSchForm.refresh(restriction);
	},
	afterInitialDataFetch:function(){
		this.init();
	},
	abScDefSchForm_onSave:function(){
		var record=this.abScDefSchForm.getRecord();
		record.setValue("sc_school.sch_id",1);
		this.abScDefSchoolDS.saveRecord(record);
        var result={"message":"成功保存记录","detailedMessage":"成功保存记录"}
		this.abScDefSchForm.displayValidationResult(result);
	}
});



