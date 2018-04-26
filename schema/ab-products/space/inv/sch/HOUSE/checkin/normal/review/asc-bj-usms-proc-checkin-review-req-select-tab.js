var ascBjUsmsProcAsgnReviewReqSelectTabController = View.createController("ascBjUsmsProcAsgnReviewReqSelectTabController", {
    //main tab object , used here for store some globle varible
    tabs: null,
    activityType:null,
    afterViewLoad: function(){
    	this.activityType = slaConstantController.LX_LEASE_RM_CHECK_IN;
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
		},
	afterInitialDataFetch: function(){
		
		this.ascBjUsmsProcCheckinReviewReqSelectTabConsole.setFieldValue('activity_log.activity_type',this.activityType);
        this.ascBjUsmsProcCheckinReviewReqSelectTabGrid.addParameter('activityType',this.activityType);
		this.ascBjUsmsProcCheckinReviewReqSelectTabGrid.refresh();
    },
    ascBjUsmsProcCheckinReviewReqSelectTabConsole_onFilter:function(){
		var status = this.ascBjUsmsProcCheckinReviewReqSelectTabConsole.getFieldValue('activity_log.status');
		var is_em = this.ascBjUsmsProcCheckinReviewReqSelectTabConsole.getFieldValue('sc_zzfcard.is_em');
		var date_start = this.ascBjUsmsProcCheckinReviewReqSelectTabConsole.getFieldValue('activity_log_hactivity_log.date_requested.from');
		var date_end = this.ascBjUsmsProcCheckinReviewReqSelectTabConsole.getFieldValue('activity_log_hactivity_log.date_requested.to');
		
		var res = new Ab.view.Restriction();
		
		if(date_start != ""){
			res.addClause('activity_log.date_requested' , date_start ,'&gt;=');
		}
		if(date_end != ""){
			res.addClause('activity_log.date_requested' , date_end ,'&lt;=');
		}
		if(is_em != ""){
			res.addClause('sc_zzfcard.is_em' , is_em ,'=');
		}
//		if(status != ""){
//			res.addClause('activity_log.status' , status ,'=');
//		}
		this.ascBjUsmsProcCheckinReviewReqSelectTabGrid.refresh(res);
    },
    
    ascBjUsmsProcCheckinReviewReqSelectTabConsole_onClear:function(){

		var console = this.ascBjUsmsProcCheckinReviewReqSelectTabConsole;
    	console.clear();
    	console.setFieldValue('activity_log.activity_type',this.activityType);
    }
});
function selectNextTab(activityLogId){
    var restriction = new Ab.view.Restriction();
    var grid =View.panels.get("ascBjUsmsProcCheckinReviewReqSelectTabGrid");
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var isEm = selectedRow["sc_zzfcard.is_em"];
    var card= selectedRow["sc_zzfcard.card_id"];
    restriction.addClause('activity_log_id',activityLogId, '=');

    //set the globle request type to tabs object
    var tabs = ascBjUsmsProcAsgnReviewReqSelectTabController.tabs;
    tabs.restriction = restriction;
    if(isEm=='否'){
    	tabs.em='0';
    }else{
    	tabs.em='1';
    }
    

    var nextTabName = 'requestDetailsTab';
 	tabs.activityLogId=activityLogId;
    tabs.cardId=card;
	
	var restrictiona = new Ab.view.Restriction();
        restrictiona.addClause("activity_log.activity_log_id", activityLogId, "=");
        restrictiona.addClause("activity_log.zzfcard_id", card, "=");
			
		tabs.findTab(nextTabName).show(true);
		tabs.selectTab(nextTabName,restrictiona,false,true,false);

}
