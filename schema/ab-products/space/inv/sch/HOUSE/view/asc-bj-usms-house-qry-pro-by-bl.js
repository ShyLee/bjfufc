var ascBjUsmsHouseQryRm = View.createController('ascBjUsmsHouseQryRm', {
	
	afterInitialDataFetch: function(){
		var rmtype = "('30601','30602','30603','30604','30605','30606')";
//		var rmtype = "('30401','30402','30403','30404')";
		this.blTree.addParameter('rm_type',rmtype);
		this.blTree.refresh();
		this.blTree.show("true");
    },
	queryCondition_onShow: function(){
		
    	var restriction = this.queryCondition.getFieldRestriction();
		this.blTree.refresh(restriction);
    },


    showRecord : function (){

    	var curTreeNode = View.panels.get("blTree").lastNodeClicked;
        var blId = curTreeNode.data['rm.bl_id'];
        var flId = curTreeNode.data['rm.fl_id'];
        var rmId = curTreeNode.data['rm.rm_id'];
        
        // show history
        var restriction = new Ab.view.Restriction();
        restriction.addClause("sc_zzfcard.bl_id", blId, '=');
        restriction.addClause("sc_zzfcard.fl_id", flId, '=');
        
        restriction.addClause("sc_zzfcard.rm_id", rmId, '=');
        restriction.addClause("sc_zzfcard.card_status", 'ytz', '=');
        
        var hisGrid = View.panels.get("abScZzfRmUseHistoryGrid");
        hisGrid.refresh(restriction);
        
        // show em detail info
        var emDetailInfoPanel = View.panels.get("abScZzfEmDetailInfoPanel");
        restriction = new Ab.view.Restriction();
        restriction.addClause("sc_zzfcard.bl_id", blId, '=');
        restriction.addClause("sc_zzfcard.fl_id", flId, '=');
        restriction.addClause("sc_zzfcard.rm_id", rmId, '=');
        restriction.addClause("sc_zzfcard.card_status", 'yrz', '=');
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
