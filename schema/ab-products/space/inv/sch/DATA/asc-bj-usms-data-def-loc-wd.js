function jsImport(path) {
 var i;
 var ss = document.getElementsByTagName("script");
 for (i = 0; i < ss.length; i++) {
  if (ss[i].src && ss[i].src.indexOf(path) != -1) {
   return;
  }
 }
 var s = document.createElement("script");
 s.type = "text/javascript";
 s.src = path;
 var head = document.getElementsByTagName("head")[0];
 head.appendChild(s);
}

jQuery().ready(function() {
  var hrefLocation = window.location.protocol + "//" + window.location.host + "\/archibus";
  jsImport(hrefLocation + "/dwr/interface" + "/FileUpload.js");
   jQuery("#startUpload").attr("value","提交");
   jQuery("#startUpload").bind("click",function(){
    if(defineLocRMController.site_detail.getFieldValue("site.site_id") != ""){
        var uploadFile = dwr.util.getValue("uploadFile"); 
        if(uploadFile.value != ""){
            var filename = defineLocRMController.site_detail.getFieldValue("site.site_id") + ".jpg";  
            var url = "site";
            FileUpload.uploadFile(uploadFile,filename,url,function(imageURL){  
                 alert(imageURL);  
                 dwr.util.setValue('uploadFile', "");  
            });
        }else{
            alert("请先选择校区照片");
        } 
    }else{
        alert("请先输入校区编码");
    }
   });
   
   jQuery("#startUploadRm").attr("value","提交");
   jQuery("#startUploadRm").bind("click",function(){
    if(defineLocRMController.rm_detail.getFieldValue("rm.rm_id") != ""){
        var uploadFile = dwr.util.getValue("uploadFileRm"); 
        if(uploadFile.value != ""){
			var blId=defineLocRMController.rm_detail.getFieldValue("rm.bl_id");
			var flId=defineLocRMController.rm_detail.getFieldValue("rm.fl_id");
			var rmId=defineLocRMController.rm_detail.getFieldValue("rm.rm_id");
            var filename = blId+"~"+flId+"~"+rmId + ".jpg";  
            var url = "rm";
            FileUpload.uploadFile(uploadFile,filename,url,function(imageURL){  
                var addr=imageURL+"?id="+new Date().getTime();
                dwr.util.setValue('uploadFileRm', "");  
                jQuery.ajax({
                    url: addr,
                    success: function(){
                        jQuery("#rm_photo").removeAttr("src");
                        jQuery("#rm_photo").attr("src",addr);

                    },
                    error:function(e){
                       jQuery("#rm_photo").removeAttr("src");
                       jQuery("#rm_photo").attr("display","none");
                    }
                });
            });
        }else{
            alert("请先选择房间照片");
        } 
    }else{
        alert("请先输入房间号");
    }
   }); 
   
   jQuery("#startUploadBl").attr("value","提交");
   jQuery("#startUploadBl").bind("click",function(){
    if(defineLocRMController.bl_detail.getFieldValue("bl.bl_id") != ""){
        var uploadFile = dwr.util.getValue("uploadFileBl"); 
        if(uploadFile.value != ""){
            var filename = defineLocRMController.bl_detail.getFieldValue("bl.bl_id") + ".jpg";  
            var url = "bl";
            FileUpload.uploadFile(uploadFile,filename,url,function(imageURL){  
                var addr=imageURL+"?id="+new Date().getTime();
                dwr.util.setValue('uploadFileBl', "");  
                jQuery.ajax({
                    url: addr,
                    success: function(){
                        jQuery("#bl_photo").removeAttr("src");
                        jQuery("#bl_photo").attr("src",addr);

                    },
                    error:function(e){
                       jQuery("#bl_photo").removeAttr("src");
                       jQuery("#bl_photo").attr("display","none");
                    }
                });
            });
        }else{
            alert("请先选择建筑物照片");
        } 
    }else{
        alert("请先输入建筑物 编码");
    }
   }); 
   
   jQuery("#rm_detail input[class*='inputValueChg']").on("input",function(e){
       var eventSrc=e.target.id;
       if(jQuery(this).val().trim()==''){
           
           switch(eventSrc)
           {
           case 'rm_detail_rmuse.rmuse_name':
               jQuery("#rm_detail_rm\\.rm_use").val('');
                 break;
           case 'rm_detail_rmcat.rmcat_name':
               jQuery("#rm_detail_rm\\.rm_cat").val('');
             break;
           case 'rm_detail_rmtype.rmtype_name':
               jQuery("#rm_detail_rm\\.rm_type").val('');
             break;
           case 'rm_detail_dv.dv_name':
               jQuery("#rm_detail_rm\\.dv_id").val('');
                 break;
           case 'rm_detail_dp.dp_name':
               jQuery("#rm_detail_rm\\.dp_id").val('');
                 break;
                
           default:
            
           }
       }
   });
   
});



var defineLocRMController = View.createController('defineLocationRM', {

    //Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    //Operation Type // "INSERT", "UPDATE", "DELETE"
    operType: "",
    
    //Operaton Data Type //'SITE','PROPERTY','BUILDING','FLOOR','ROOM'
    operDataType: "",
    
    blFlRm: "",
    
    exitRmPhoto: true,
    //siteCode changed
    siteCodeChanged: false,
    
    //----------------event handle--------------------
    afterViewLoad: function(){
    
        this.site_tree.createRestrictionForLevel = createRestrictionForLevel;
    },
    
//    rm_detail_afterRefresh: function(){
//        var bld = this.rm_detail.getFieldValue("rm.bl_id");
//        var fld = this.rm_detail.getFieldValue("rm.fl_id");
//        var rmd = this.rm_detail.getFieldValue("rm.rm_id");
//        this.blFlRm = bld + fld + rmd;
//        var restriction = new Ab.view.Restriction();
//        restriction.addClause('sc_rmphotodoc.blflrm', this.blFlRm, '=');
//        var records = View.dataSources.get('ds_ab-sp-def-loc-rm_form_rm_photo').getRecords(restriction);
//        if (records.length == 0) {
//            this.exitRmPhoto = false;
//        }
//        this.rmphoto.refresh(restriction);
//        this.rmphoto.show(true);
//        //consoleCountEm();
//    },
    
    rm_detail_afterRefresh: function(){
        showRmPhoto();
        var flId = this.rm_detail.getFieldValue("rm.fl_id");
        var blId = this.rm_detail.getFieldValue("rm.bl_id");
        var rmId = this.rm_detail.getFieldValue("rm.rm_id");
        
        var restriction = "1=1 and fl_id='" + flId + "' and bl_id='"+ blId +"' and rm_id='"+ rmId +"'";
        
        var parameters = {
            tableName: 'sc_zf_cq',
            fieldNames: toJSON(['rm_id',"bl_id","fl_id","xm"]),
            restriction: toJSON(restriction)
        };
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        
        if ( result.data.records.length > 0 ) {
        	var xm = result.data.records[0]["sc_zf_cq.xm"];
        	this.rm_detail.setFieldValue("rm.name",xm);
        }
    },
    
	 bl_detail_afterRefresh: function(){
        showDistinctPhoto();
    },
	
    site_detail_afterRefresh: function(){
        showSitePhoto();
        
    },
    
    afterInitialDataFetch: function(){
        var titleObj = Ext.get('addNew');
        titleObj.on('click', this.showMenu, this, null);
        this.treeview = View.panels.get('site_tree');
    },
    
    sbfFilterPanel_onShow: function(){
        this.queryTreeview("AND");
        this.site_detail.show(false);
        this.pr_detail.show(false);
        this.bl_detail.show(false);
        this.fl_detail.show(false);
        this.rm_detail.show(false);
    },
	
	sbfFilterPanel_onClear:function(){
        this.site_tree.refreshClearAllFilters();
    },
    
    site_tree_onUpdate: function(){
        updateStaticFieldAboutEmOrRm();
        
    },
    
    showMenu: function(e, item){
        var menuItems = [];
        var menutitle_newSite = getMessage("site");
        var menutitle_newProperty = '片区';
        var menutitle_newBuilding = getMessage("building");
        var menutitle_newFloor = getMessage("floor");
        var menutitle_newRoom = getMessage("room");
        
        menuItems.push({
            text: menutitle_newSite,
            handler: this.onAddNewButtonPush.createDelegate(this, ['SITE'])
        });
        menuItems.push({
            text: menutitle_newProperty,
            handler: this.onAddNewButtonPush.createDelegate(this, ['PROPERTY'])
        });
        menuItems.push({
            text: menutitle_newBuilding,
            handler: this.onAddNewButtonPush.createDelegate(this, ['BUILDING'])
        });
        menuItems.push({
            text: menutitle_newFloor,
            handler: this.onAddNewButtonPush.createDelegate(this, ['FLOOR'])
        });
        
        menuItems.push({
            text: menutitle_newRoom,
            handler: this.onAddNewButtonPush.createDelegate(this, ['ROOM'])
        });
        
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
        
    },
    
    onAddNewButtonPush: function(menuItemId){
        var siteId = "";
        var propertyId = "";
        var buildingId = "";
        var floorId = "";
        var nodeLevelIndex = -1;
        if (this.curTreeNode) {
            nodeLevelIndex = this.curTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0: //site
                    siteId = this.curTreeNode.data["site.site_id"];
                    break;
                case 1: //pr
                    siteId = this.curTreeNode.data["property.site_id"];
                    propertyId = this.curTreeNode.data["property.pr_id"];
                    break;
                case 2: //bl
                    siteId = this.curTreeNode.data["bl.site_id"];
                    propertyId = this.curTreeNode.data["bl.pr_id"];
                    buildingId = this.curTreeNode.data["bl.bl_id"];
                    break;
                case 3: //fl
                    siteId = this.curTreeNode.data["bl.site_id"];
                    propertyId = this.curTreeNode.data["bl.pr_id"];
                    buildingId = this.curTreeNode.data["fl.bl_id"];
                    floorId = this.curTreeNode.data["fl.fl_id"];
                    break;
                case 4: //rm
                    siteId = this.curTreeNode.data["bl.site_id"];
                    propertyId = this.curTreeNode.data["bl.pr_id"];
                    buildingId = this.curTreeNode.data["rm.bl_id"];
                    floorId = this.curTreeNode.data["rm.fl_id"];
                    break;
            }
        }
        var regnId = "";
        if (valueExistsNotEmpty(siteId)) {
            var ds = View.dataSources.get('ds_ab-sp-def-loc-rm_form_site');
            var rec = ds.getRecord(new Ab.view.Restriction({
                'site.site_id': siteId
            }));
            regnId = rec.getValue('site.regn_id');
        }
        
        var restriction = new Ab.view.Restriction();
        switch (menuItemId) {
            case "SITE":
                this.sbfDetailTabs.selectTab("siteTab", null, true, false, false);
                break;
            case "PROPERTY":
                restriction.addClause("property.site_id", siteId, '=');
                restriction.addClause("property.regn_id", regnId, '=');
                this.sbfDetailTabs.selectTab("prTab", restriction, true, false, false);
                break;
            case "BUILDING":
                if (nodeLevelIndex == 0 || nodeLevelIndex == -1) {
                    View.showMessage('请选择片区');
                    return;
                }
                restriction.addClause("bl.site_id", siteId, '=');
                restriction.addClause("bl.pr_id", propertyId, '=');
                restriction.addClause("bl.regn_id", regnId, '=');
                this.sbfDetailTabs.selectTab("blTab", restriction, true, false, false);
				var res = new Ab.view.Restriction();
				res.addClause("asset_source.bl_id","",'=');
				this.assetGrid.refresh(res);
                break;
            case "FLOOR":
                if (nodeLevelIndex == 0 || nodeLevelIndex == 1 || nodeLevelIndex == -1) {
                    View.showMessage(getMessage("errorSelectBuilding"));
                    return;
                }
                restriction.addClause("fl.bl_id", buildingId, '=');
                this.sbfDetailTabs.selectTab("flTab", restriction, true, false, false);
                
                break;
            case "ROOM":
                if (nodeLevelIndex == 0 || nodeLevelIndex == 1 || nodeLevelIndex == 2 || nodeLevelIndex == -1) {
                    View.showMessage(getMessage("errorSelectFloor"));
                    return;
                }
                restriction.addClause("rm.bl_id", buildingId, '=');
                restriction.addClause("rm.fl_id", floorId, '=');
                this.sbfDetailTabs.selectTab("rmTab", restriction, true, false, false);
                break;
        }
    },
    
    
    
    site_detail_onDelete: function(){
        this.operDataType = "SITE";
        this.AUSC_commonDelete("ds_ab-sp-def-loc-rm_form_site", "site_detail", "site.site_id");
    },
    pr_detail_onDelete: function(){
        this.operDataType = "PROPERTY";
        this.AUSC_commonDelete("ds_ab-sp-def-loc-rm_form_pr", "pr_detail", "property.pr_id");
    },
    bl_detail_onDelete: function(){
        this.operDataType = "BUILDING";
        this.AUSC_commonDelete("ds_ab-sp-def-loc-rm_form_bl", "bl_detail", "bl.bl_id");
    },
    fl_detail_onDelete: function(){
        this.operDataType = "FLOOR";
        this.AUSC_commonDelete("ds_ab-sp-def-loc-rm_form_fl", "fl_detail", "fl.fl_id");
    },
    rm_detail_onDelete: function(){
        this.operDataType = "ROOM";
        this.AUSC_commonDelete("ds_ab-sp-def-loc-rm_form_rm", "rm_detail", "rm.rm_id");
        //this.rmphoto.show(false);
    },
    
    AUSC_commonDelete: function(dataSourceID, formPanelID, primaryFieldFullName){
        this.operType = "DELETE";
        var dataSource = View.dataSources.get(dataSourceID);
        var formPanel = View.panels.get(formPanelID);
        var record = formPanel.getRecord();
        var primaryFieldValue = record.getValue(primaryFieldFullName);
        if (!primaryFieldValue) {
            return;
        }
        var controller = this;
        var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', primaryFieldValue);
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                } 
                catch (e) {
                    var errMessage = getMessage("errorDelete").replace('{0}', primaryFieldValue);
                    View.showMessage('error', errMessage, e.message, e.data);
                    return;
                }
                controller.refreshTreePanelAfterUpdate(formPanel);
                formPanel.show(false);
                
            }
        })
    },
    site_detail_onSave: function(){
        this.operDataType = "SITE";
        this.commonSave("site_detail");
    },
    pr_detail_onSave: function(){
        this.operDataType = "PROPERTY";
        this.commonSave("pr_detail");
    },
    bl_detail_onSave: function(){
    	var type = this.bl_detail.getFieldValue('bl.acc_type');
		var date = this.bl_detail.getFieldValue('bl.date_use');
		if('yrz' == type){
			if('' == date.trim()){
				View.showMessage("请输入入账日期");
				return;
			}
		}
    	
        this.operDataType = "BUILDING";
        this.commonSave("bl_detail");
    },
    fl_detail_onSave: function(){
        this.operDataType = "FLOOR";
        this.commonSave("fl_detail");
    },
    rm_detail_onSave: function(){
        this.operDataType = "ROOM";
        
        if (!this.checkBeforeSaveRm()) {
            return;
        }
        
//        if (!this.exitRmPhoto) {
//            this.rmphoto.setFieldValue('sc_rmphotodoc.blflrm', this.blFlRm, '=');
//        }
        
        //Workflow.callMethod('AbSpaceRoomInventoryBAR-SchoolHandler-updateRoomUse');
        
        //this.rmphoto.save();
       // this.rmphoto.refresh();
        this.commonSave("rm_detail");
    },
    /**
     *
     */
    checkBeforeSaveRm: function(){
        var checkSuccessed = true;
        return checkSuccessed;
    },
    
    /**
     *
     * @param {Object} formPanelID
     */
    commonSave: function(formPanelID){
        var formPanel = View.panels.get(formPanelID);
        this.siteCodeChanged = this.hasChanged(formPanel);
        if (!formPanel.newRecord) {
            this.operType = "UPDATE";
        }
        else {
            this.operType = "INSERT";
        }
        if (formPanel.save()) {
            formPanel.refresh();
            //refresh tree panel and edit panel
            this.onRefreshPanelsAfterSave(formPanel);
            //get message from view file			 
            var message = getMessage('formSaved');
            //show text message in the form				
            this.showInformationInForm(this, formPanel, message);
        }
        
    },
    /**
     * 更改清华更新面积 使用 手输面积
     */
    bl_detail_onUpdateStatic: function(){
       // updateStaticFieldAboutEmOrRm();
    	this.updateByManual();
    },
   

    
    bl_detail_onEnterRmcatArea: function(){
        var blId = this.bl_detail.getFieldValue("bl.bl_id");
        var thisController = this;
        
        var restriction = new Ab.view.Restriction();
        restriction.addClause("sc_bl_rmcat.bl_id", blId, "=");
        View.openDialog('asc-bj-usms-data-def-bl-rmcat.axvw', restriction, false, {
            width: 800,
            height: 600,
            closeButton: false,
            blId: blId,
            
            afterViewLoad: function(dialogView){
                var dialogController = dialogView.controllers.get('ascBjUsmsDataDefBlRmcatController');
                dialogController.onClose = thisController.dialog_onClose.createDelegate(thisController);
            }
        });
    },
    
    dialog_onClose: function(dialogController){
        this.bl_detail.refresh();
    },
    
    bl_detail_onXiaZhang: function(){
        var form = View.panels.get("bl_detail");
        var blId = form.getFieldValue('bl.bl_id');
        var page = "asc-bj-usms-data-bl-xiazhang-wd.axvw";
        var thisController = this;
        var confirmMessage = ("确定要将建筑物：[" + blId + "] 下账？");
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                var dialog = View.openDialog(page, null, true, {
                    width: 600,
                    height: 450,
                    closeButton: false,
                    blId: blId,
                    
                    afterViewLoad: function(dialogView){
                        // access the dialog controller
                        var dialogController = dialogView.controllers.get('ascBjUsmsDataBlXiazhangWd');
                        // set the dialog controller onClose callback
                        dialogController.onClose = thisController.dialog2_onClose.createDelegate(thisController);
                    }
                });
            }
        });
    },
    
    dialog2_onClose: function(dialogController){
        View.log('defineLocationRM');
        var blController = View.controllers.get('defineLocationRM');
        blController.operDataType = "BUILDING";
        //blController.commonDeleteNoHint("ds_ab-sp-def-loc-rm_form_bl", "bl_detail", "bl.bl_id");
		this.refreshAfterXiaZhang();
    },
	
	refreshAfterXiaZhang:function(){
		var formPanel = View.panels.get('bl_detail');
		this.refreshTreePanelAfterUpdate(formPanel);
		//更新汇总数据
        //  updateStaticFieldAboutEmOrRm();
		this.updateByManual();
		View.showMessage("建筑物：[" + primaryFieldValue + "] 已被移至下账表，下账成功!");
		
	},
    
    
    /**
     * show message in the top row of this form
     * @param {string} message
     */
    showInformationInForm: function(controller, panel, message){
        var messageCell = panel.getMessageCell();
        messageCell.dom.innerHTML = "";
        
        var messageElement = Ext.DomHelper.append(messageCell, '<p>' + message + '</p>', true);
        messageElement.addClass('formMessage');
        messageElement.setVisible(true, {
            duration: 1
        });
        messageElement.setHeight(20, {
            duration: 1
        });
        if (message) {
            panel.dismissMessage.defer(3000, controller, [messageElement]);
        }
    },
    
    /**
     * refresh tree panel after save
     * @param {Object} curEditPanel
     */
    onRefreshPanelsAfterSave: function(curEditPanel){
        if (this.siteCodeChanged) {
            this.site_tree.refresh();
        	this.curTreeNode = null;
        }
        else {
            //refresh the tree panel
            this.refreshTreePanelAfterUpdate(curEditPanel);
        }
    },
    
    /**
     * refersh tree panel after save or delete
     * @param {Object} curEditPanel
     */
    refreshTreePanelAfterUpdate: function(curEditPanel){
        var parentNode = this.getParentNode(curEditPanel);
        if (parentNode.isRoot()) {
            this.site_tree.refresh();
        	this.curTreeNode = null;
        }
        else {
            this.treeview.refreshNode(parentNode);
            if (parentNode.parent) {
                parentNode.parent.expand();
            }
            parentNode.expand();
        }
        //reset the global variable :curTreeNode
        this.setCurTreeNodeAfterUpdate(curEditPanel, parentNode);
    },
    
    /**
     * prepare the parentNode parameter for calling refreshNode function
     */
    getParentNode: function(curEditFormPanel){
        var rootNode = this.treeview.treeView.getRoot();
        var levelIndex = -1;
        if (this.curTreeNode) {
            levelIndex = this.curTreeNode.level.levelIndex;
        }
        if ("SITE" == this.operDataType) {
            return rootNode;
        }
        else 
            //PROPERTY
            if ("PROPERTY" == this.operDataType) {
                switch (levelIndex) {
                    case 0:
                        return this.curTreeNode;
                        break;
                    case 1:
                        return this.curTreeNode.parent;
                        break;
                    case 2:
                        return this.curTreeNode.parent.parent;
                        break;
                    case 3:
                        return this.curTreeNode.parent.parent.parent;
                        break;
                    case 4:
                        return this.curTreeNode.parent.parent.parent.parent;
                        break;
                    default:
                        return rootNode;
                        break;
                }
            }
            else 
                //BUILDING
                if ("BUILDING" == this.operDataType) {
                    switch (levelIndex) {
                        case 1:
                            return this.curTreeNode;
                            break;
                        case 2:
                            return this.curTreeNode.parent;
                            break;
                        case 3:
                            return this.curTreeNode.parent.parent;
                            break;
                        case 4:
                            return this.curTreeNode.parent.parent.parent;
                            break;
                        default:
                            View.showMessage("请选择片区");
                            break;
                    }
                }
                else 
                    if ("FLOOR" == this.operDataType) {
                        //FLOOR
                        switch (levelIndex) {
                            case 2:
                                return this.curTreeNode;
                                break;
                            case 3:
                                return this.curTreeNode.parent;
                                break;
                            case 4:
                                return this.curTreeNode.parent.parent;
                                break;
                            default:
                                View.showMessage(getMessage("errorSelectBuilding"));
                                break;
                        }
                    }
                    else {
                        //ROOM
                        switch (levelIndex) {
                            case 3:
                                return this.curTreeNode;
                                break;
                            case 4:
                                return this.curTreeNode.parent;
                                break;
                            default:
                                View.showMessage(getMessage("errorSelectFloor"));
                                break;
                        }
                    }
    },
    
    /**
     * reset the curTreeNode variable after operation
     * @param {Object} curEditPanel : current edit form
     * @param {Object} parentNode
     */
    setCurTreeNodeAfterUpdate: function(curEditPanel, parentNode){
        if (this.operType == "DELETE") {
            this.curTreeNode = null;
        }
        else {
            switch (this.operDataType) {
                case "SITE":
                    var pkFieldName = "site.site_id";
                    break;
                case "PROPERTY":
                    var pkFieldName = "property.pr_id";
                    break;
                case "BUILDING":
                    var pkFieldName = "bl.bl_id";
                    break;
                case "FLOOR":
                    var pkFieldName = "fl.fl_id";
                    break;
                case "ROOM":
                    var pkFieldName = "rm.rm_id";
                    break;
            }
            this.curTreeNode = this.getTreeNodeByCurEditData(curEditPanel, pkFieldName, parentNode);
        }
    },
    
    /**
     * check the curEditFormPanel.getRecord
     *
     * @param {Object} curEditFormPanel
     * return -- true means the user has changed the site code field
     */
    hasChanged: function(curEditFormPanel){
        if (curEditFormPanel.id == "bl_detail") {
            var oleSiteCode = curEditFormPanel.record.oldValues["bl.site_id"];
            if (curEditFormPanel.getFieldValue("bl.site_id") == oleSiteCode) {
                return false;
            }
            else {
                return true;
            }
        }
    },
    /**
     * get the treeNode according to the current edit from,
     * for example :
     * if current edit form is floor(operation is insert), but the current selected treeNode is building,
     * so need to make the two consistent ,by current edit form
     * @param {Object} curEditForm
     * @param {Object} parentNode
     */
    getTreeNodeByCurEditData: function(curEditForm, pkFieldName, parentNode){
        var pkFieldValue = curEditForm.getFieldValue(pkFieldName);
        for (var i = 0; i < parentNode.children.length; i++) {
            var node = parentNode.children[i];
            if (node.data[pkFieldName] == pkFieldValue) {
                return node;
            }
        }
        return null;
    },
    
    queryTreeview: function(){
        var consolePanel = this.sbfFilterPanel;
        
        var siteId = consolePanel.getFieldValue('bl.site_id');
        if (siteId) {
            this.site_tree.addParameter('siteId', "  ='" + siteId + "'");
        }
        else {
            this.site_tree.addParameter('siteId', " IS NOT NULL ");
        }
        
        var propertyId = consolePanel.getFieldValue('bl.pr_id');
        if (propertyId) {
            this.site_tree.addParameter('prId', " = '" + propertyId + "'");
        }
        else {
            this.site_tree.addParameter('prId', " IS NOT NULL ");
        }
        
        var buildingId = consolePanel.getFieldValue('bl.bl_id');
        if (buildingId) {
            this.site_tree.addParameter('blId', " = '" + buildingId + "'");
        }
        else {
            this.site_tree.addParameter('blId', "IS NOT NULL");
        }
        
        
        var blUse1 = consolePanel.getFieldValue('bl.use1');
        if (blUse1) {
            this.site_tree.addParameter('blUseFor', " = '" + blUse1 + "'");
        }
        else {
            this.site_tree.addParameter('blUseFor', "IS NOT NULL");
        }
        
		if (siteId == "" && propertyId =="" && buildingId=="" && blUse1 == ""){
			this.site_tree.addParameter('orand', " OR ");
		}else{
			this.site_tree.addParameter('orand', " AND ");
		}
		
		
        this.site_tree.refresh();
        this.curTreeNode = null;
    }
})



function onClickTreeNode(){
	var curNode = View.panels.get("site_tree").lastNodeClicked;
    defineLocRMController.curTreeNode = curNode;
	if (curNode.level.levelIndex == 2){
	    var blId = curNode.data['bl.bl_id'];
		
	}
}

function onClickSiteNode(){
    var curTreeNode = View.panels.get("site_tree").lastNodeClicked;
    var siteId = curTreeNode.data['site.site_id'];
    View.controllers.get('defineLocationRM').curTreeNode = curTreeNode;
    if (!siteId) {
        View.panels.get("site_detail").show(false);
        View.panels.get("pr_detail").show(false);
        View.panels.get("bl_detail").show(false);
        View.panels.get("fl_detail").show(false);
        View.panels.get("rm_detail").show(false);
    }
    else {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("site.site_id", siteId, '=');
        View.panels.get('sbfDetailTabs').selectTab("siteTab", restriction, false, false, false);
    }
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'site_tree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
        var siteCode = treeNode.data['site.site_id'];
        if (!siteCode) {
            labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + getMessage("noSite") + "</span> ";
            treeNode.setUpLabel(labelText1);
        }
    }
    if (treeNode.level.levelIndex == 1) {
        var propertyName = treeNode.data['property.name'];
        var propertyId = treeNode.data['property.pr_id'];
//        var noBldgs = treeNode.data['property.qty_no_bldgs_calc'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + propertyId + "</span> ";
        labelText2 = "<span class='" + treeNode.level.cssClassName + "'>" + propertyName + "</span> ";
        labelText1 = labelText1 + labelText2;// + "[" + noBldgs + "]";
  
        treeNode.setUpLabel(labelText1);
    }
    
    if (treeNode.level.levelIndex == 2) {
        var buildingName = treeNode.data['bl.name'];
        var buildingId = treeNode.data['bl.bl_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + buildingName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 3) {
        var floorId = treeNode.data['fl.fl_id'];
        var floorName = treeNode.data['fl.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + floorId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 4) {
        var roomId = treeNode.data['rm.rm_id'];
        var roomName = treeNode.data['rm.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + roomId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (parentNode.data) {
        if (level == 1) {
            var siteId = parentNode.data['site.site_id'];
            if (!siteId) {
                restriction = new Ab.view.Restriction();
                restriction.addClause('property.site_id', '', 'IS NULL', 'AND', true);
            }
        }
        if (level == 2) {
            var propertyId = parentNode.data['property.pr_id'];
            if (!propertyId) {
                restriction = new Ab.view.Restriction();
                restriction.addClause('bl.pr_id', '', 'IS NULL', 'AND', true);
            }
        }
    }
    return restriction;
}

function showDistinctPhoto(){
    var distinctPanel = View.panels.get('bl_detail');
	var blid = distinctPanel.getFieldValue('bl.bl_id');
    var addr=View.project.projectGraphicsFolder + '/bl/' + blid+'.jpg';
        jQuery.ajax({
              url: addr,
              success: function(){
                  jQuery("#bl_photo").attr("src",addr);

              },
              error:function(e){
                  jQuery("#bl_photo").removeAttr("src");
                  jQuery("#bl_photo").attr("display","none");
              }});
	
//    var bldg_photo = distinctPanel.getFieldValue('bl.bldg_photo').toLowerCase();
//    var bl_id = distinctPanel.getFieldValue('bl.bl_id');
//    
//    if (valueExistsNotEmpty(bldg_photo)) {
//        distinctPanel.showImageDoc('image_field', 'bl.bl_id', 'bl.bldg_photo');
//    }
//    else {
//        distinctPanel.fields.get('image_field').dom.src = null;
//        distinctPanel.fields.get('image_field').dom.alt = getMessage('noImage');
//    }
}


function showRmPhoto(){
    var distinctPanel = View.panels.get('rm_detail');
	var blid = distinctPanel.getFieldValue('rm.bl_id');
	var flid = distinctPanel.getFieldValue('rm.fl_id');
	var rmid = distinctPanel.getFieldValue('rm.rm_id');
	var addr=View.project.projectGraphicsFolder + "/rm/" + blid+"~"+flid+"~" +rmid+ ".jpg";
        jQuery.ajax({
              url: addr,
              success: function(){
                  jQuery("#rm_photo").attr("src",addr);

              },
              error:function(e){
                  jQuery("#rm_photo").removeAttr("src");
                  jQuery("#rm_photo").attr("display","none");
              }});
    
//    var em_photo = distinctPanel.getFieldValue('sc_rmphotodoc.rm_photo').toLowerCase();
//    var em_id = distinctPanel.getFieldValue('sc_rmphotodoc.blflrm');
//    
//    if (valueExistsNotEmpty(em_photo)) {
//        distinctPanel.showImageDoc('image_field', 'sc_rmphotodoc.blflrm', 'sc_rmphotodoc.rm_photo');
//    }
//    else {
//        distinctPanel.fields.get('image_field').dom.src = null;
//        distinctPanel.fields.get('image_field').dom.alt = getMessage('noImage');
//    }
}

function showSitePhoto(){
    var distinctPanel = View.panels.get('site_detail');
    
    var em_photo = distinctPanel.getFieldValue('site.site_image').toLowerCase();
    var em_id = distinctPanel.getFieldValue('site.site_id');
    
    if (valueExistsNotEmpty(em_photo)) {
        distinctPanel.showImageDoc('image_field', 'site.site_id', 'site.site_image');
    }
    else {
        distinctPanel.fields.get('image_field').dom.src = null;
        distinctPanel.fields.get('image_field').dom.alt = getMessage('noImage');
    }
}

function onchangeBlCat(){
    var blPanel = View.panels.get('bl_detail');
    var building_cat = blPanel.getFieldValue("bl.building_cat");
    if (building_cat) {
        blPanel.enableField("bl.count_rm_keyong", true);
        blPanel.actions.get("enterRmcatArea").enabled = false;
    }
    else {
        blPanel.enableField("bl.count_rm_keyong", false);
        blPanel.actions.get("enterRmcatArea").enabled = true;
    }
    
}







