var monthBaoPanController = View.createController('monthBaoPanController', {
    
	afterViewLoad: function(){
        this.financeFeesPanel.addParameter("descBefore", "'代缴 ['");
        this.financeFeesPanel.addParameter("descAfter", "'] 的房租'");
    },
	
    afterInitialDataFetch: function(){
    	var curDate	= new Date();
    	var year	= curDate.getFullYear();
    	var month	= curDate.getMonth()+ 1;
    	
    	View.setTitle(year + "年-" + month + "月   应缴房租列表");
    },
    showDetail: function(panelName){
    	var panel = View.panels.get(panelName);
    	var card_id = panel.rows[panel.selectedRowIndex]["sc_zzf_fee.card_id"];
        View.openDialog("asc-bj-usms-house-view-all-pro-detail-dialog.axvw", null, false,{
 			  title:'详细信息',
 			  width:1000,
 			  height:800,
 			  cardId:card_id,
 			  closeButton: false});
    }
});
