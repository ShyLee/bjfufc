var ascViewWarnController = View.createController("ascViewWarnController", {

    afterViewLoad: function(){
        var tabPanel = View.panels.get('warnTabs');
        tabPanel.selectTab('zijiaoTab');
		tabPanel.enableTab('daikouTab');
    }
});
