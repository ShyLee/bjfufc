var ascCheckinController = View.createController("ascCheckinController", {

    afterViewLoad: function(){
        jQuery('input:radio:first').attr('checked', 'true');
        this.radioChange();
    },
    
    radioChange: function(){
        var radioSelected = jQuery('input:radio:checked').val();
        var tabPanel = View.panels.get('assignTabs');
        if (radioSelected == "employee") {
            tabPanel.selectTab('yuangongTab');
//            tabPanel.showTab('detailTab', true);
            tabPanel.showTab('yuangongTab', true);
            tabPanel.showTab('wailaiTab', false);
            tabPanel.showTab('boshiTab', false);
        }
        else 
            if (radioSelected == "outside") {
                tabPanel.selectTab('wailaiTab');
                tabPanel.showTab('wailaiTab', true);
                tabPanel.showTab('yuangongTab', false);
                tabPanel.showTab('boshiTab', false);
//                tabPanel.showTab('detailTab', false);
            }
            else {
                tabPanel.selectTab('boshiTab');
                tabPanel.showTab('boshiTab', true);
                tabPanel.showTab('yuangongTab', false);
                tabPanel.showTab('wailaiTab', false);
//                tabPanel.showTab('detailTab', false);
            }
    }
});
