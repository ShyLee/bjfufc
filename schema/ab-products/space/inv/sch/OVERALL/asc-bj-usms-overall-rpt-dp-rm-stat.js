var rplmBuildingController = View.createController('rplmBuilding010', {

    rplmBuildingForm_onGenerate: function(){
    
        var txlspdf = getSelectedRadioButton("lock");
        
        var parameters = {};
        try {
            //var result = Workflow.callMethod('AbSolutionsWorkflow-iReportHandler-PmreReport','ireport_dv-rmcat-total03',txlspdf,parameters);
            var result = Workflow.callMethod('AbSolutionsWorkflow-iReportHandler-PmreReport', 'dpReport', txlspdf, parameters);
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
