var buildingAbstractController = View.createController('viewBuildingAbstracts', {

	blId:"",
	blName:"",
	openBlId:null,
	
	afterInitialDataFetch: function(){
		if (this.view.parameters){
        	this.openBlId = this.view.parameters['openBlId'];
        	//this.blId=this.view.parameters['openBlId'];
        	if (this.openBlId) {
				this.refreshBlBaseInfo();
	    	}
		}
    },
	/**
	 * Event handler for property photo and map image click.
	 */
	onClickImage: function() {
		View.openDialog(this.dom.src);
	},
	
	structure_info_afterRefresh: function(){
	        var gongtanlv = this.structure_info.getFieldValue("bl.gongtanlv");
	        if (gongtanlv) {
	            gongtanlv = gongtanlv * 100;
	            gongtanlv = gongtanlv.toFixed(2);
	            document.getElementById("structure_info_bl.gongtanlv").innerHTML = gongtanlv +
	            "%";
	        }
	        
	},
	
	/**
	 * 
	 */
	buildingPhotos_afterRefresh:function(){
		this.blName = this.abScBlBasicInfoForm.getFieldValue("bl.name");
		var title = String.format(getMessage('imagePanelTitle'), this.blName);
		this.buildingPhotos.setTitle(title);
		showBldgPhoto();
	},
	/**
	 * show building photo and map when user select building
	 * @param {Object} curBlNode
	 */
	showDistinctPhoto:function(blId){
		var restriction = new Ab.view.Restriction();
		restriction.addClause("bl.bl_id",this.blId,"=");
       // var record = this.ds_asc_bj_usms_bl_summary_info_tree_bl.getRecord(restriction);
		
		this.buildingPhotos.refresh(restriction);
		
	},
	refreshBlBaseInfo: function(){
		
		if (this.openBlId){
			blId = this.openBlId;
		}
	    
	    var blBasicForm = View.panels.get('abScBlBasicInfoForm');
	    blBasicForm.addParameter('blIdRes', blId);
	    blBasicForm.refresh();
		
	    //刷新tab（建筑物信息） 
	    this.structure_info.addParameter('blIdRes', blId);
	    this.structure_info.refresh();
	    
	    //刷新tab（建设信息） 
	    this.build_info.addParameter('blIdRes', blId);
	    this.build_info.refresh();
	    
	    //刷新tab（资产信息） 
	    this.assets_info.addParameter('blIdRes', blId);
	    this.assets_info.refresh();
	    
	    //刷新tab（产权信息） 
	    this.property_info.addParameter('blIdRes', blId);
	    this.property_info.refresh();
	    
	    //刷新tab（使用人信息） 
	    this.user_info.addParameter('blIdRes', blId);
	    this.user_info.refresh();
	    
//	    this.abScBlBasicInfoTabs.enableTab('tabStructureInfo');
//	    this.abScBlBasicInfoTabs.enableTab('tabBuildInfo');
//	    this.abScBlBasicInfoTabs.enableTab('tabAssetsInfo');
//	    this.abScBlBasicInfoTabs.enableTab('tabPropertyInfo');
//	    this.abScBlBasicInfoTabs.enableTab('tabUserInfo');
	    
		this.blId = blId;
		this.showDistinctPhoto(blId);
	}
	
});



function showBldgPhoto(){
	 var distinctPanel = View.panels.get('buildingPhotos');
	    //var bl_photo = distinctPanel.getFieldValue('bl.image_file').toLowerCase();
	   // var blId = distinctPanel.getFieldValue('bl.bl_id');
    var bl_photo = distinctPanel.getFieldValue('bl.bl_id');
    var bl_photoImg = Ext.get('bl_photo');   
    if (valueExistsNotEmpty(bl_photo)) {
   	bl_photoImg.setVisible(true);
		var h = bl_photoImg.dom.src = View.project.projectGraphicsFolder + '/bl/' + bl_photo+'.jpg';
		bl_photoImg.dom.alt = "";
    } 
    else {
   	bl_photoImg.setVisible(false);
		bl_photoImg.dom.src = null;
		bl_photoImg.dom.alt = "此建筑物照片不存在！";
    }
}

  /**
 *根据建筑物ID获取建筑屋名称
 * @param emId
 * @returns
 */
	function GetEmName(emId){
		var parameters = {
	 			tableName: 'em',
	 			fieldNames: toJSON(['em.name']),
	 			restriction: "em.em_id ='" + emId + "'"
	 		};
	 		
	 		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	 		var dataList=[];
	 		if (result.data.records.length > 0) {
	 			var emName = result.data.records[0]['em.name'];
	 			dataList.push(emName);
	 			return dataList;
	 		}else{
	 			return null;
	 		}
	}


