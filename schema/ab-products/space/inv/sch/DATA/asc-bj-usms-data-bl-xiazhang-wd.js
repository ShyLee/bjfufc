/**
 * MuLiang
 */

function ASBT_getCurrentDate_Client()
{
	var returnedDate = "";
	var curDate = new Date();
	var temp_month = curDate.getMonth()+ 1;
	var month = temp_month<10?"0"+temp_month:temp_month;
	var temp_day = ""+curDate.getDate();
	var day	= temp_day<10?"0"+temp_day:temp_day;
	var year  = ""+curDate.getFullYear();
	returnedDate = year + "-" + month + "-" + day;
	return returnedDate;
}

var ascBjUsmsDataBlXiazhangWdController = View.createController('ascBjUsmsDataBlXiazhangWd', {
	blId: "",
	openerController:null,
	afterInitialDataFetch: function(){

		if (this.view.parameters){
        	this.blId = this.view.parameters['bl_id'];
		}
		var title="建筑物："+this.view.parameters['bl_name'];;
		this.openerController = this.view.parameters['openerController'];
		this.ascBjUsmsDataBlXiazhangWdForm.setTitle(title);
		var currentDate = ASBT_getCurrentDate_Client();
		this.ascBjUsmsDataBlXiazhangWdForm.setFieldValue('sc_bl_xz.date_xiazhang',currentDate)
    },
	ascBjUsmsDataBlXiazhangWdForm_onSave : function() {
		
		var form=this.ascBjUsmsDataBlXiazhangWdForm;
		form.setFieldValue("sc_bl_xz.bl_id",this.blId);
		if(!form.canSave()){
			return ;
		}
		 var record = ABHDC_getDataRecord2(form); 
		 var xzController=this;
		 var confirmMessage = ("是否要将建筑物："+this.blId+" 下账？");
	     controller=this;
	        View.confirm(confirmMessage, function(button){
	        	 
	            if (button == 'yes') {
	            	try {
	            		var	jobId = Workflow.startJob('AbSpaceRoomInventoryBAR-SchoolJobService-BuildingOutAcc',record);
	            		xzController.SetFormDisabel();
	            	
				            View.openJobProgressBar('建筑物下账-进度条', jobId, '', function(status) {
				            	if(status.jobFinished == true){

								controller.deleteBuildingRecord_onClose();
								                               }
						                                                                               });
	    			  }catch (e) {
	    				    Workflow.handleError(e);
	    		 	              }
	            }
	        });
	},
	SetFormDisabel: function() {
		
		var form=this.ascBjUsmsDataBlXiazhangWdForm;
		form.actions.get("save").enable(false);
		form.actions.get("cancel").enable(false);
		form.getFieldElement('sc_bl_xz.status').disabled = true;
		form.getFieldElement('sc_bl_xz.date_approved').disabled = true;
		form.getFieldElement('sc_bl_xz.approved_by').disabled = true;
		form.getFieldElement('sc_bl_xz.approved_dv').disabled = true;
		form.getFieldElement('sc_bl_xz.approved_doc').disabled = true;
		
		
	},
	deleteBuildingRecord_onClose: function() {
        View.log('ascBjUsmsDataBlXiazhangWd');
        if (this.onClose) {
            this.onClose(this);
        }
        View.closeThisDialog();
    },
    ascBjUsmsDataBlXiazhangWdForm_afterRefresh:function(){
        Ext.get("ascBjUsmsDataBlXiazhangWdForm_sc_bl_xz.approved_by").dom.readOnly=true;
        Ext.get("ascBjUsmsDataBlXiazhangWdForm_sc_bl_xz.approved_dv").dom.readOnly=true;
    }
});
