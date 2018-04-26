
var caDefEqController = View.createController('caDefEq', {
	
    
    crtRow: null,
   
    restriction: null,
   
    isNew: true,
   
    consoleRestriction: null,
    firstLevelFilterPanel:null,
    afterViewLoad: function(){
         this.firstLevelFilterPanel= this.sc_zzfcard_Grid;
    },
    /**
     * restrict list to user selection
     */
    sc_zzfcard_Form_onShow: function(){

        var panel = View.panels.get('sc_zzfcard_Form');
        var emName = panel.getFieldValue('sc_zzfcard.em_name');
        var identiCode = panel.getFieldValue('sc_zzfcard.identi_code');
        var emId = panel.getFieldValue('sc_zzfcard.em_id');
        var paymentMethod = panel.getFieldValue('sc_zzfcard.payment_to');
     
        var consoleRestriction = new Ab.view.Restriction();
        
        if (emName != '') {
            consoleRestriction.addClause('sc_zzfcard.em_name', emName, '=');
        }
        if (identiCode!= '') {
            consoleRestriction.addClause('sc_zzfcard.identi_code', identiCode, '=');
        }
        if (emId != '') {
            consoleRestriction.addClause('sc_zzfcard.em_id', emId, '=');
        }
        if (paymentMethod !='') {
        	consoleRestriction.addClause('sc_zzfcard.payment_to', paymentMethod, '=')
        }
        this.sc_zzfcard_Grid.refresh(consoleRestriction); 
        this.firstLevelFilterPanel.show(true);
        if (this.firstLevelFilterPanel.rows.length == 0) {
        	this.sc_zzfrent_details_Grid_Finance.show(false);
        	return;
        }
    },
   
   
 onClickShowDetail: function(){
	 	var grid = View.panels.get("sc_zzfcard_Grid");
 		var row = grid.rows[grid.selectedRowIndex];
 		var card_id = row["sc_zzfcard.card_id"];
 		var paymentMethod=row["sc_zzfcard.payment_to"]
         var restriction = new Ab.view.Restriction();
 	     restriction.addClause('sc_zzfrent_details.card_id', card_id, '=');
 	     if(paymentMethod=='财务处代扣'){
 	    	 this.sc_zzfrent_details_Grid_House.show(false);
 	    	this.sc_zzfrent_details_Grid_Finance.refresh(restriction);
 	     }else{
 	    	 this.sc_zzfrent_details_Grid_Finance.show(false);
 	    	 this.sc_zzfrent_details_Grid_House.refresh(restriction);
 	     }
    },
    
    onClickShowYear: function(){
    	var grid = View.panels.get("sc_zzfrent_details_Year");
    	var row = grid.rows[grid.selectedRowIndex];
    	var card_id = row["sc_zzfrent_details.year"];
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('sc_zzfrent_details.year', year, '=');
    	this.sc_zzfrent_details_Grid.refresh(restriction);
    	
    }


})