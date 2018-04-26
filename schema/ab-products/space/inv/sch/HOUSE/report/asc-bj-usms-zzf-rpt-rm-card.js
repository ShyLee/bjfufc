/**
 *@kevenin
 */
var abScZZFCardRptController = View.createController('abScZZFCardRpt', {

    cardId: "",
    mainTabs: null,
    
    afterViewLoad: function(){
        this.mainTabs = View.getControl('', 'ruzhuTabs');
        this.cardId = this.mainTabs.currentCardId;
        
        //restriction : Main Campus
        this.abScZzfRuZhuCardForm.addParameter('cardIdRes', this.cardId);
    },
    
    abScZzfRuZhuCardForm_afterRefresh: function(){
    	var date_ought_checkout = this.abScZzfRuZhuCardForm.getFieldValue("date_check_ought");
    	if (checkChaoqi()) {
    		$('chaoqi').value = "超期";
    	}else{
    		$('chaoqi').value = "未超期";
    	}
    }
    
})
function checkChaoqi(){
	var cardInfoPanel = View.panels.get("abScZzfRuZhuCardForm");
	var endDate = cardInfoPanel.getFieldValue("sc_zzfcard.date_checkout_ought");
	var currDate =  AUSC_getCurrentDateInISOFormat();
	var numMon = AUSC_DateDiff(endDate,currDate);
	if (numMon > 0){
		return true;
	}else{
		return false;
	}
}




