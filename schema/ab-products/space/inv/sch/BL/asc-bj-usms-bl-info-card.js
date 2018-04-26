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
		this.showDistinctPhoto();
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
			var share_rate = this.structure_info.getFieldValue("bl.share_serv_rate");
            if (share_rate) {
                share_rate = share_rate * 100;
                share_rate = share_rate.toFixed(2);
                document.getElementById("structure_info_bl.share_serv_rate").innerHTML = share_rate +
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
		
	    //刷新tab（修缮信息） 
	    this.repairs_info.addParameter('blIdRes', blId);
	    this.repairs_info.refresh();
	    
	    //刷新tab（建设信息） 
	    this.build_info.addParameter('blIdRes', blId);
	    this.build_info.refresh();
	    
	    //刷新tab（资产信息） 
	    this.assetGrid.addParameter('blIdRes', blId);
	    this.assetGrid.refresh();
	    
	    //刷新tab（产权信息） 
	    this.property_info.addParameter('blIdRes', blId);
	    this.property_info.refresh();
		
	    this.roomInfoGrid.addParameter('blIdRes', blId);
	    this.roomInfoGrid.refresh();
//	    this.ascBjUsmsBlRmEqDetails.addParameter('blIdRes', blId);
//	    this.ascBjUsmsBlRmEqDetails.refresh();
		
//	    this.taInfoGrid.addParameter('blIdRes', blId);
//	    this.taInfoGrid.refresh();
	    
	    //刷新tab（使用人信息） 
	    this.dvInfoGrid.addParameter('blId', blId);
	    this.dvInfoGrid.refresh(); 
	    
//	    this.abScBlBasicInfoTabs.enableTab('tabStructureInfo');
//	    this.abScBlBasicInfoTabs.enableTab('tabBuildInfo');
//	    this.abScBlBasicInfoTabs.enableTab('tabAssetsInfo');
//	    this.abScBlBasicInfoTabs.enableTab('tabPropertyInfo');
//	    this.abScBlBasicInfoTabs.enableTab('tabUserInfo');
	    
		this.blId = blId;
	}
	,showDistinctPhoto:function(){
            this.buildingPhotos.show(true);
            var addr=View.project.projectGraphicsFolder + '/bl/' + this.openBlId+'.jpg';
            jQuery.ajax({
                  url: addr,
                  success: function(){
                      jQuery("#bl_photo").attr("src",addr);
    
                  },
                  error:function(e){
                      jQuery("#bl_photo").removeAttr("src");
                      jQuery("#bl_photo").attr("display","none");
                  }
        });
    }
});

      



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


