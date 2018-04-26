var buildingAbstractController = View.createController('viewBuildingAbstracts', {

    blId: "",
    blName: "",
    
    openBlId: null,
    
    /**
     * Initializes the view.
     */
    afterViewLoad: function(){
    
        //this.site_tree.addParameter('sitetIdSql', "");
        //this.site_tree.addParameter('blId', "IS NOT NULL");
        this.site_tree.createRestrictionForLevel = createRestrictionForLevel;
    },
    
    afterInitialDataFetch: function(){
        if (this.view.parameters) {
            this.openBlId = this.view.parameters['openBlId'];
            
            if (this.openBlId) {
                this.onClickBlNode();
            }
        }
        this.abScBlBasicInfoTabs.disableTab('tabStructureInfo');
        this.abScBlBasicInfoTabs.disableTab('tabRepairsInfo');
        this.abScBlBasicInfoTabs.disableTab('tabBuildInfo');
        this.abScBlBasicInfoTabs.disableTab('tabPropertyInfo');
        this.abScBlBasicInfoTabs.disableTab('tabAssetsInfo');
        this.abScBlBasicInfoTabs.disableTab('tabRoomInfo');
        this.abScBlBasicInfoTabs.disableTab('tabUserInfo');
//        this.abScBlBasicInfoTabs.disableTab('tabEqInfo');
//        this.abScBlBasicInfoTabs.disableTab('tabTaInfo');
        
    },
    /**
     * Event handler for property photo and map image click.
     */
    onClickImage: function(){
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
        var fentanlv = this.structure_info.getFieldValue("bl.share_serv_rate");
        if (fentanlv) {
            fentanlv = fentanlv * 100;
            fentanlv = fentanlv.toFixed(2);
            document.getElementById("structure_info_bl.share_serv_rate").innerHTML = fentanlv +
            "%";
        }
        
    },
    
    /**
     *
     */
    buildingPhotos_afterRefresh: function(){

        var title = String.format(getMessage('imagePanelTitle'), this.blName);
        this.buildingPhotos.setTitle(title);

    },
    /**
     * show building photo and map when user select building
     *
     * @param {Object}
     *            curBlNode
     */
//    showDistinctPhoto: function(blId){
//        var restriction = new Ab.view.Restriction();
//        restriction.addClause("bl.bl_id", this.blId, "=");
//        var record = this.ds_asc_bj_usms_bl_summary_info_tree_bl.getRecord(restriction);
//        
//        this.buildingPhotos.refresh(restriction);
//        
//    },
    sbfFilterPanel_onShow: function(){
    
        this.refreshTreeview();
        
        this.buildingPhotos.show(false);
        this.abScBlBasicInfoForm.show(false); 
        var tabs=this.abScBlBasicInfoTabs;
        /*this.abScBlBasicInfoTabs.disableTab('tabStructureInfo');
        this.abScBlBasicInfoTabs.disableTab('tabBuildInfo');
        this.abScBlBasicInfoTabs.disableTab('tabAssetsInfo');
        this.abScBlBasicInfoTabs.disableTab('tabPropertyInfo');
        this.abScBlBasicInfoTabs.disableTab('tabUserInfo');*/
        
        this.structure_info.show(false);
        this.repairs_info.show(false);
        this.build_info.show(false);
        this.property_info.show(false);
        this.assets_info.show(false);
        this.roomInfoGrid.show(false);
        this.dvInfoGrid.show(false);
//        this.ascBjUsmsBlRmEqDetails.show(false);
//        this.taInfoGrid.show(false);
    },
    refreshTreeview: function(){
        var consolePanel = this.sbfFilterPanel;
        
        var propertyId = consolePanel.getFieldValue('bl.pr_id');
        if (propertyId) {
            this.site_tree.addParameter('prId', " like'" + propertyId + "%'");
        }
        else {
            this.site_tree.addParameter('prId', " IS NOT NULL ");
        }
        
        var buildingId = consolePanel.getFieldValue('bl.bl_id');
        if (buildingId) {
            this.site_tree.addParameter('blId', " like '" + buildingId + "%'");
        }
        else {
            this.site_tree.addParameter('blId', "IS NOT NULL");
        }
        
        var bl_use = consolePanel.getFieldValue('bl.use1');
        if (bl_use) {
            this.site_tree.addParameter('blUseFor', " = '" + bl_use + "'");
        }
        else {
            this.site_tree.addParameter('blUseFor', "IS NOT NULL");
        }
        
        var siteId = consolePanel.getFieldValue('bl.old_bl_name');
        if (siteId) {
            this.site_tree.addParameter('oldBlName', "bl.old_bl_name like '" + siteId + "%'");
        }
        else {
            this.site_tree.addParameter('oldBlName', " 1=1 ");
        }
        this.site_tree.refresh();
    },
    
    onClickBlNode: function (){
        var currentNode = this.site_tree.lastNodeClicked;
        var blId = "";
        if (currentNode) {
            var siteName = currentNode.parent.parent.data['site.name'];
            var title = String.format(getMessage('treeTitle'), siteName);
            setPanelTitle('site_tree', title);
            
            blId = currentNode.data['bl.bl_id'];
            blName = currentNode.data['bl.name'];
        }
         
        if (this.openBlId) {
            blId = this.openBlId;
        }
        
        this.abScBlBasicInfoForm.addParameter('blIdRes', blId);
        this.abScBlBasicInfoForm.refresh();
        
        //刷新tab（建筑物信息） 
        this.structure_info.addParameter('blIdRes', blId);
        this.structure_info.refresh();
        
        //刷新tab（修缮信息） 
        this.repairs_info.addParameter('blIdRes', blId);
	    this.repairs_info.refresh();
        
        //刷新tab（建设信息） 
	    this.build_info.addParameter('blIdRes', blId);
	    this.build_info.refresh();
        
        //刷新tab(资产信息)
        this.assets_info.addParameter('blIdRes', blId);
        this.assets_info.refresh();
        
        //刷新tab（产权信息） 
        this.property_info.addParameter('blIdRes', blId);
        this.property_info.refresh();
        
        
        this.roomInfoGrid.addParameter('blIdRes', blId);
        this.roomInfoGrid.refresh();
//        this.ascBjUsmsBlRmEqDetails.addParameter('blIdRes', blId);
//        this.ascBjUsmsBlRmEqDetails.refresh();
        
//        this.taInfoGrid.addParameter('blIdRes', blId);
//        this.taInfoGrid.refresh();
        
        //刷新tab（使用人信息） 
        this.dvInfoGrid.addParameter('blId', blId);
        this.dvInfoGrid.refresh();
	    
	    this.abScBlBasicInfoTabs.enableTab('tabStructureInfo');
        this.abScBlBasicInfoTabs.enableTab('tabRepairsInfo');
        this.abScBlBasicInfoTabs.enableTab('tabBuildInfo');
        this.abScBlBasicInfoTabs.enableTab('tabPropertyInfo');
        this.abScBlBasicInfoTabs.enableTab('tabAssetsInfo');
        this.abScBlBasicInfoTabs.enableTab('tabRoomInfo');
        this.abScBlBasicInfoTabs.enableTab('tabUserInfo');
//        this.abScBlBasicInfoTabs.enableTab('tabEqInfo');
//        this.abScBlBasicInfoTabs.enableTab('tabTaInfo');
	    
        this.blId = blId;
        this.blName = blName;
        this.buildingPhotos.show(true);
        this.showDistinctPhoto();
    },
    
    showDistinctPhoto:function(){
        
        var addr=View.project.projectGraphicsFolder + '/bl/' + this.blId+'.jpg';
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
    },
    sbfFilterPanel_onClear:function(){
    	this.site_tree.refreshClearAllFilters();
    }
    
});

//function showBldgPhoto(){
//	var distinctPanel = View.panels.get('buildingPhotos');
//	var blId = distinctPanel.getFieldValue('bl.bl_id');
//	var restriction = new Ab.view.Restriction();
//    restriction.addClause('bl.bl_id', blId, '=');
//	var photoPanel =  View.panels.get("buildingPhotos");
////	photoPanel.refresh(restriction);
//	var land_photo = photoPanel.getFieldValue('bl.image_file').toLowerCase();
//	if (valueExistsNotEmpty(land_photo)) {
//        photoPanel.showImageDoc('image_file', 'bl.bl_id', 'bl.image_file');
//        photoPanel.fields.get('image_file').dom.alt = "";
//    }
//    else {
//        photoPanel.fields.get('image_file').dom.src = null;
//        photoPanel.fields.get('image_file').dom.alt = "此建筑物照片不存在！";
//    }
//	//photoPanel.setTitle("宗地："+ parcelland_address);
//}
//function showBldgPhoto(){
//	 var distinctPanel = View.panels.get('buildingPhotos');
//	    //var bl_photo = distinctPanel.getFieldValue('bl.image_file').toLowerCase();
//	   // var blId = distinctPanel.getFieldValue('bl.bl_id');
//     var bl_photo = distinctPanel.getFieldValue('bl.bl_id');
//     var bl_photoImg = Ext.get('bl_photo');   
//     if (valueExistsNotEmpty(bl_photo)) {
//    	bl_photoImg.setVisible(true);
//		var h = bl_photoImg.dom.src = View.project.projectGraphicsFolder + '/bl/' + bl_photo+'.jpg';
//		bl_photoImg.dom.alt = "";
//     } 
//     else {
//    	bl_photoImg.setVisible(false);
//		bl_photoImg.dom.src = null;
//		bl_photoImg.dom.alt = "此建筑物照片不存在！";
//     }
//}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'site_tree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
        var siteCode = treeNode.data['site.site_id'];
        if (!siteCode) {
            labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" +
            getMessage("noSite") +
            "</span> ";
            treeNode.setUpLabel(labelText1);
        }
    }
    if (treeNode.level.levelIndex == 1) {
        var prId = treeNode.data['property.pr_id'];
        var prName = treeNode.data['property.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" +
        prId +
        "</span> ";
		labelText2 = "<span class='" + treeNode.level.cssClassName + "'>" +
        prName +
        "</span> ";
        treeNode.setUpLabel(labelText1 + labelText2);
    }
    if (treeNode.level.levelIndex == 2) {
        var buildingId = treeNode.data['bl.bl_id'];
        var buildingName = treeNode.data['bl.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" +
        buildingName +
        "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (parentNode.data) {
        var siteId = parentNode.data['site.site_id'];
        if (!siteId && level == 1) {
            restriction = new Ab.view.Restriction();
            restriction.addClause('property.site_id', '', 'IS NULL', 'AND', true);
        }
        var prId = parentNode.data['property.pr_id'];
        if (level == 2) {
            restriction = new Ab.view.Restriction();
            restriction.addClause('bl.pr_id', prId, '=', 'AND', true);
        }
    }
    return restriction;
}
