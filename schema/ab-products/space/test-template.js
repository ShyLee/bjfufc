var controller = View.createController('abSpEnableRmtransController', {
		
	/**
	 * @inherit
	 */
	panel_abMoEditReviewEm_moForm_onSaveButton: function(){
		
		try{
		Workflow.callMethod('AbSpaceRoomInventoryBAR-CalculateDingEService-calculate',"2014");

		}catch(e){
			Workflow.handleError(e);
		}
	
	}
});
