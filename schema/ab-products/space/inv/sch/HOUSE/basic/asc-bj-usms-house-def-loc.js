/**
 * @author xi
 */
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
  jQuery("#startUploadBl").attr('value',"上传");
  jQuery("#startUploadRm").attr('value',"上传");
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
        alert("请先输入建筑物编码");
    }
   }); 
   
});
var defineLocRMController = View.createController('defineZZFLoc', {

    //Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    //Operation Type // "INSERT", "UPDATE", "DELETE"
    operType: "",
    
    //Operaton Data Type //'BUILDING','FLOOR','ROOM'
    operDataType: "",
    
    blFlRm: "",
    
    exitRmPhoto: true,
    
	rm_type: "",
	rm_cat:"",
    afterViewLoad: function(){	
		   this.site_bl.createRestrictionForLevel = createRestrictionForLevel;
	},
    //----------------event handle--------------------
    
    sbfFilterPanel_onShow: function(){
    	var siteid=this.sbfFilterPanel.getFieldValue("bl.site_id");
		var prId = this.sbfFilterPanel.getFieldValue("bl.pr_id");
		var blId = this.sbfFilterPanel.getFieldValue("bl.bl_id");
//		var blUse = $('bl.use1').value;
//		if(blUse=='ALL'){
//			blUse='';
//		}
		var treeRes = new Ab.view.Restriction();
		if(siteid!=""){
			treeRes.addClause("bl.site_id",siteid,"=");
		}
		if (prId != ""){
			treeRes.addClause("bl.pr_id",prId,"=");
		}
		if (blId != ""){
			treeRes.addClause("bl.bl_id",blId,"=");
		}
//		if (blUse != ""){
//		 	treeRes.addClause("bl.use1",blUse,"=");
//		}
//		
		
		this.site_bl.refresh(treeRes);
	},
	sbfFilterPanel_onClear: function(){
//		this.sbfFilterPanel.clear();
		this.sbfFilterPanel.setFieldValue("bl.site_id","");
		this.sbfFilterPanel.setFieldValue("bl.pr_id","");
		this.sbfFilterPanel.setFieldValue("bl.bl_id","");
//		$('bl.use1').value = "ALL";
	},

	  bl_detail_afterRefresh: function(){
	    	showBlPhoto();
	    },
    rm_detail_afterRefresh: function(){
        showRmPhoto();
    },
    
    afterInitialDataFetch: function(){
//        var titleObj = Ext.get('addNew');
//        titleObj.on('click', this.showMenu, this, null);
        this.treeview = View.panels.get('site_bl');
//        this.bl_detail.setFieldValue("bl.use1","教工住宅");
    },
    
    showMenu: function(e, item){
        var menuItems = [];
        var menutitle_newBuilding = getMessage("building");
        var menutitle_newFloor = getMessage("floor");
        var menutitle_newRoom = getMessage("room");
        
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
        var buildingId = "";
        var floorId = "";
        var nodeLevelIndex = -1;
        if (this.curTreeNode) {
            nodeLevelIndex = this.curTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0:
                    buildingId = this.curTreeNode.data["bl.bl_id"];
                    break;
                case 1:
                    buildingId = this.curTreeNode.data["fl.bl_id"];
                    floorId = this.curTreeNode.data["fl.fl_id"];
                    break;
                case 2:
                    buildingId = this.curTreeNode.data["rm.bl_id"];
                    floorId = this.curTreeNode.data["rm.fl_id"];
                    break;
            }
        }
        
        var restriction = new Ab.view.Restriction();
        switch (menuItemId) {
            case "BUILDING":
                this.sbfDetailTabs.selectTab("blTab", restriction, true, false, false);
//                this.bl_detail.refresh(restriction,true);
//                this.bl_detail.setFieldValue("bl.use1","教工住宅");
                
                break;
            case "FLOOR":
                if (nodeLevelIndex == -1) {
                    View.showMessage(getMessage("errorSelectBuilding"));
                    return;
                }
                restriction.addClause("fl.bl_id", buildingId, '=');
                this.sbfDetailTabs.selectTab("flTab", restriction, true, false, false);
                
                break;
            case "ROOM":
                if (nodeLevelIndex == 0 || nodeLevelIndex == -1) {
                    View.showMessage(getMessage("errorSelectFloor"));
                    return;
                }
                restriction.addClause("rm.bl_id", buildingId, '=');
                restriction.addClause("rm.fl_id", floorId, '=');
                this.sbfDetailTabs.selectTab("rmTab", restriction, true, false, false);
                break;
        }
    },
    
    bl_detail_onDelete: function(){
        this.operDataType = "BUILDING";
        this.commonDelete("ds_ab-sp-def-loc-rm_form_bl", "bl_detail", "bl.bl_id");
    },
    fl_detail_onDelete: function(){
        this.operDataType = "FLOOR";
        this.commonDelete("ds_ab-sp-def-loc-rm_form_fl", "fl_detail", "fl.fl_id");
    },
    rm_detail_onDelete: function(){
        this.operDataType = "ROOM";
        this.commonDelete("ds_ab-sp-def-loc-rm_form_rm", "rm_detail", "rm.rm_id");
        this.rmphoto.show(false);
    },
    
    commonDelete: function(dataSourceID, formPanelID, primaryFieldFullName){
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
    bl_detail_onSave: function(){
//        var useValue=$("blUser").value;
//        if(useValue=="JGZZ"){
//        	this.bl_detail.setFieldValue("bl.use1",'JGZZ');
//        }else if(useValue=="ZZF"){
//        	this.bl_detail.setFieldValue("bl.use1",'ZZF');
//        }
        this.operDataType = "BUILDING";
        this.commonSave("bl_detail");
		
    },
    fl_detail_onSave: function(){
        this.operDataType = "FLOOR";
        this.commonSave("fl_detail");
    },
    rm_detail_onSave: function(){
        this.operDataType = "ROOM";
        
 /* if (!this.checkBeforeSaveRm()) {
            return;
        }*/
        
//        if (!this.exitRmPhoto) {
//            this.rmphoto.setFieldValue('sc_rmphotodoc.blflrm', blFlRm, '=');
//        }
//        
//        this.rmphoto.save();
//        this.rmphoto.refresh();
        this.commonSave("rm_detail");
    },
    
    /**
     *
     * @param {Object} formPanelID
     */
    commonSave: function(formPanelID){
        var formPanel = View.panels.get(formPanelID);
        if (!formPanel.newRecord) {
            this.operType = "UPDATE";
        }
        else {
            this.operType = "INSERT";
        }
        if (formPanel.save()) {
            //formPanel.refresh();
            //refresh tree panel and edit panel
            this.onRefreshPanelsAfterSave(formPanel);
            //get message from view file			 
            var message = getMessage('formSaved');
            //show text message in the form				
            this.showInformationInForm(this, formPanel, message);
        }
        
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
        //refresh the tree panel
        this.refreshTreePanelAfterUpdate(curEditPanel);
    },
    
    /**
     * refersh tree panel after save or delete
     * @param {Object} curEditPanel
     */
    refreshTreePanelAfterUpdate: function(curEditPanel){
        var parentNode = this.getParentNode(curEditPanel);
        if (parentNode.isRoot()) {
            this.refreshTreeview();
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
        
        
        if ("BUILDING" == this.operDataType) {
            return rootNode;
        }
        else 
            if ("FLOOR" == this.operDataType) {
                //FLOOR
                switch (levelIndex) {
                    case 0:
                        return this.curTreeNode;
                        break;
                    case 1:
                        return this.curTreeNode.parent;
                        break;
                    default:
                        View.showMessage(getMessage("errorSelectBuilding"));
                        break;
                }
            }
            else {
                //ROOM
                switch (levelIndex) {
                    case 1:
                        return this.curTreeNode;
                        break;
                    case 2:
                        return this.curTreeNode.parent;
                        break;
                    default:
                        View.showMessage(getMessage("errorSelectFloor"));
                        break;
                }
            }
    },
    
    refreshTreeview: function(){
        var consolePanel = this.sbfFilterPanel;
        
        this.site_bl.refresh();
        this.curTreeNode = null;
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
    }
});


/*
 * set the global variable 'curTreeNode' in controller 'defineLocationRM'
 */
function onClickTreeNode(){
	defineLocRMController.curTreeNode = View.panels.get("site_bl").lastNodeClicked;
}

function onClickBlNode(){
    var curTreeNode = View.panels.get("site_bl").lastNodeClicked;
    var blId = curTreeNode.data['bl.bl_id'];
    defineLocRMController.curTreeNode = curTreeNode;
    if (!blId) {
        View.panels.get("bl_detail").show(false);
        View.panels.get("fl_detail").show(false);
        View.panels.get("rm_detail").show(false);
    }
    else {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("bl.bl_id", blId, '=');
        
        View.panels.get('sbfDetailTabs').selectTab("blTab", restriction, false, false, false);
       
        var blDetail=View.panels.get('bl_detail');
//        var useValue=blDetail.getFieldValue("bl.use1");
//        if (valueExistsNotEmpty(useValue)) {
////        	var s=$("blUser");
//	        if(useValue=="JGZZ"){
////	        	$("blUser")[1].selected=true;
//	        	$("blUser").selectedIndex=0;
//	        }
//	        if(useValue=="ZZF"){
//	        	$("blUser").selectedIndex=1;
//	        }
//		 }
    }
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'site_bl') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
        var buildingName = treeNode.data['bl.name'];
        var buildingId = treeNode.data['bl.bl_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + buildingId +"  "+buildingName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 1) {
        var floorId = treeNode.data['fl.fl_id'];
        var floorName = treeNode.data['fl.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + floorId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 2) {
        var roomId = treeNode.data['rm.rm_id'];
        var roomName = treeNode.data['rm.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + roomId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

function showBlPhoto(){
    var distinctPanel = View.panels.get('bl_detail');
    var blid = distinctPanel.getFieldValue('bl.bl_id');
    var addr = View.project.projectGraphicsFolder + '/bl/' + blid + '.jpg';
    jQuery.ajax({
    	url : addr,
    	success : function(){
    		jQuery("#bl_photo").attr("src",addr);
    	},
    	error : function(e){
    		jQuery("#bl_photo").removeAttr("src");
    		jQuery("#bl_photo").attr("display","none");
	}});
}



function showRmPhoto(){
     var distinctPanel = View.panels.get('rm_detail');
    var blid = distinctPanel.getFieldValue('rm.bl_id');
    var flid = distinctPanel.getFieldValue('rm.fl_id');
    var rmid = distinctPanel.getFieldValue('rm.rm_id');
    var rm_photoImg = Ext.get('rm_photo');   
    if (!rmid) {
        return;
    }
    if (valueExistsNotEmpty(rmid)) {
    	rm_photoImg.setVisible(true);
    	rm_photoImg.dom.src = View.project.projectGraphicsFolder + "/rm/" + blid+"~"+flid+"~" +rmid+ ".jpg";
    	rm_photoImg.dom.alt = "";
    }
    else {
    	rm_photoImg.setVisible(false);
    	rm_photoImg.dom.src = null;
    	rm_photoImg.dom.alt = getMessage('noImage');
    }
}

function getRmcatByType(type){
    var rm_cat = "";
    var parameters = {
        tableName: 'rmtype',
        fieldNames: toJSON(['rmtype.rm_cat', 'rmtype.rm_type']),
        restriction: toJSON({
            'rmtype.rm_type': type
        })
    };
    
    var result = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
    
    if (result.code == 'executed') {
        var record = result.data.records[0];
        var rm_cat = record['rmtype.rm_cat'];
    }
    else {
        Workflow.handleError(result);
    }
    return rm_cat;
}



function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (parentNode.data) {
        var blId = parentNode.data['bl.bl_id'];
        if (blId && level == 1) {
            restriction = new Ab.view.Restriction();
            restriction.addClause('bl.bl_id', blId);
        }
        if(level==2){
        	var blId=parentNode.data['fl.bl_id'];
            var flId=parentNode.data['fl.fl_id'];
            restriction=new Ab.view.Restriction();
        	restriction.addClause('fl.fl_id', flId);
        	restriction.addClause('fl.bl_id', blId);
        }
    }
    return restriction;
}
