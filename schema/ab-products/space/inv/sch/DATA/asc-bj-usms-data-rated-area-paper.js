/**
 *@author kevenxi
 *
 */
View.createController('abScUsmsDefStudentPaperArea', {

    afterInitialDataFetch: function(){
        this.abScUsmsDataDefAreaGrid.addParameter('buId', " = '"+ascBjUsmsConstantControl.dvType_Jxky+"'");
        this.abScUsmsDataDefAreaGrid.refresh();
    },
	
	abScUsmsDataDefAreaForm_onSave:function(){
		AUSC_countEmpAndStudent(this.abScUsmsDataDefAreaForm);
		this.abScUsmsDataDefAreaForm.save();
	},
	
    abScUsmsDataDefAreaGrid_onUpdate: function(){
        updateStaticFieldAboutEmOrRm();
        
    }
})

