var ascViewWarnController = View.createController("ascViewWarnController", {

    afterViewLoad: function(){
        var tabPanel = View.panels.get('warnTabs');
        tabPanel.selectTab('zwjbTab');
		tabPanel.enableTab('zwTab');
		tabPanel.enableTab('zcjbTab');
		tabPanel.enableTab('zcTab');
    }
});