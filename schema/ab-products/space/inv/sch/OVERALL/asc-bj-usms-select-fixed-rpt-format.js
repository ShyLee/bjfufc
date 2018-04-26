View.createController('ascUsmsSelectFixedRpt', {

    wfrId: 'AbSpaceRoomInventoryBAR-iReportHandler-PmreReport',
    xmlName: "",
    parameters:{},
	
    
    afterViewLoad: function(){
       if (this.view.parameters['parameters']){
	   	 this.parameters = this.view.parameters['parameters'];
	   }
		this.xmlName = this.view.parameters['xmlName'];
    },
    
    rplmBuildingForm_onGenerate: function(){
        var txlspdf = getSelectedRadioButton("lock");
        try {
            var result = Workflow.callMethod(this.wfrId, this.xmlName, txlspdf, this.parameters);
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
        View.closeThisDialog();
    }
    
});

/**
 * Returns value of the selected radio button.
 * @param {name} Name attribute of the radio button HTML elements.
 */
function getSelectedRadioButton(name){
    var radioButtons = document.getElementsByName(name);
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked == 1) {
            return radioButtons[i].value;
        }
    }
    return "";
}
