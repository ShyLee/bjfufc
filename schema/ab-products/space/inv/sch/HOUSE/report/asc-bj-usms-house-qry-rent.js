var ascBjUsmsHouseQryRmPerson = View.createController('ascBjUsmsHouseQryRmPerson', {
	
	queryCondition_onShow: function(){
    	var restriction = this.queryCondition.getFieldRestriction();
		this.scZzfcardGrid.refresh(restriction);
    },
    showRecord : function (){
    	
		var selectedIndex = this.scZzfcardGrid.selectedRowIndex;
		
		var cardId = this.scZzfcardGrid.rows[selectedIndex]["sc_zzfcard.card_id"];
        var blId = this.scZzfcardGrid.rows[selectedIndex]["sc_zzfcard.bl_id"];
        var flId = this.scZzfcardGrid.rows[selectedIndex]["sc_zzfcard.fl_id"];
        var rmId = this.scZzfcardGrid.rows[selectedIndex]["sc_zzfcard.rm_id"];
        
        // show history
        var restriction = new Ab.view.Restriction();
        restriction.addClause("sc_zzfcard.bl_id", blId, '=');
        restriction.addClause("sc_zzfcard.fl_id", flId, '=');
        restriction.addClause("sc_zzfcard.rm_id", rmId, '=');
        restriction.addClause("sc_zzfcard.card_status", '0', '=');
        
        var hisGrid = View.panels.get("abScZzfRmUseHistoryGrid");
        hisGrid.refresh(restriction);
        
        
        
        // show em detail info
        var emDetailInfoPanel = View.panels.get("abScZzfEmDetailInfoPanel");
        restriction = new Ab.view.Restriction();
        restriction.addClause("sc_zzfcard.card_id", cardId, '=');
        emDetailInfoPanel.refresh(restriction);
        
        //show rm detail info
        var rmDetailInfoPanel = View.panels.get("abScZzfRmDetailInfoPanel");
        restriction = new Ab.view.Restriction();
        restriction.addClause("rm.bl_id", blId, '=');
        restriction.addClause("rm.fl_id", flId, '=');
        restriction.addClause("rm.rm_id", rmId, '=');
        rmDetailInfoPanel.refresh(restriction);
    }
    
});
