/**
 * @author Keven.xi
 */


View.createController('ascBjUsmsDashRmStatbyDpMainController', {
	
	siteId:"",
	mainTabs : null,       
	 
	afterViewLoad:function(){
		this.mainTabs = View.getControl('', 'campusTabs');
		this.siteId = this.mainTabs.currentSiteId ;		
		
		this.ascBjUsmsDashRmStatbyDpMainTeachChtPie.addParameter('buIdRes','教学机构');
		this.ascBjUsmsDashRmStatbyDpMainTeachChtPie.addParameter('siteIdRes',this.siteId);
		
		this.ascBjUsmsDashRmStatbyDpMainMangeChtPie.addParameter('buIdRes','行政部门');
		this.ascBjUsmsDashRmStatbyDpMainMangeChtPie.addParameter('siteIdRes',this.siteId);
		
		this.ascBjUsmsDashRmStatbyDpMain_teachDvSumGrid.addParameter('buIdRes','教学机构');
		this.ascBjUsmsDashRmStatbyDpMain_teachDvSumGrid.addParameter('siteIdRes',this.siteId);
		
		this.ascBjUsmsDashRmStatbyDpMain_manageDvSumGrid.addParameter('buIdRes','行政部门');
		this.ascBjUsmsDashRmStatbyDpMain_manageDvSumGrid.addParameter('siteIdRes',this.siteId);
		
		this.ascBjUsmsDashRmStatbyDpMain_siteBasicGrid.addParameter('siteIdRes',this.siteId);
	},
	
	ascBjUsmsDashRmStatbyDpMain_siteBasicGrid_onShowSiteImage:function(){
		View.openDialog('asc-bj-usms-overall-site-image.axvw', null, false, {width:550, height:600, closeButton:false,siteId:this.siteId});
		
	}
	
	
	
});
