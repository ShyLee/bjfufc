/**
 * @author Keven.xi
 */
View.createController('ascBjUsmsDashRmStatbyDpWholeController', {
	
	afterViewLoad:function(){
		this.ascBjUsmsDashRmStatbyDpWholeTeachChtPie.addParameter('buIdRes','教学机构');
		this.ascBjUsmsDashRmStatbyDpWholeMangeChtPie.addParameter('buIdRes','行政部门');
		this.ascBjUsmsDashRmStatbyDpWhole_teachDvSumGrid.addParameter('buIdRes','教学机构');
		this.ascBjUsmsDashRmStatbyDpWhole_manageDvSumGrid.addParameter('buIdRes','行政部门');
	},
	
	ascBjUsmsDashRmStatbyDpWhole_siteBasicGrid_onShowSiteImage:function(){
		View.openDialog('asc-bj-usms-overall-site-image.axvw', null, false, {width:550, height:600, closeButton:false,siteId:this.siteId});
		
	}
	
});


