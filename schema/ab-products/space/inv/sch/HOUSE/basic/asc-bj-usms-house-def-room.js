function jsImport(path){
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

jQuery().ready(function(){
    var hrefLocation = window.location.protocol + "//" + window.location.host + "\/archibus";
    jsImport(hrefLocation + "/dwr/interface" + "/FileUpload.js");
    jQuery("#startUploadRm").attr('value', "上传");
    jQuery("#startUploadRm").bind("click", function(){
        if (defZzfRoomController.rm_detail.getFieldValue("rm.rm_id") != "") {
            var uploadFile = dwr.util.getValue("uploadFileRm");
            
            if (uploadFile.value != "") {
                var blId = defZzfRoomController.rm_detail.getFieldValue("rm.bl_id");
                var flId = defZzfRoomController.rm_detail.getFieldValue("rm.fl_id");
                var rmId = defZzfRoomController.rm_detail.getFieldValue("rm.rm_id");
                var filename = blId + "~" + flId + "~" + rmId + ".jpg";
                var url = "rm";
                FileUpload.uploadFile(uploadFile, filename, url, function(imageURL){
                    var addr = imageURL + "?id=" + new Date().getTime();
                    dwr.util.setValue('uploadFileRm', "");
                    jQuery.ajax({
                        url: addr,
                        success: function(){
                            jQuery("#rm_photo").removeAttr("src");
                            jQuery("#rm_photo").attr("src", addr);
                            
                        },
                        error: function(e){
                            jQuery("#rm_photo").removeAttr("src");
                            jQuery("#rm_photo").attr("display", "none");
                        }
                    });
                });
            }
            else {
                alert("请先选择房间照片");
            }
        }
        else {
            alert("请先输入房间号");
        }
    });
});

var defZzfRoomController = View.createController('defZzfRoomController', {

	rm_detail_afterRefresh: function(){
	        showRmPhoto();
	        showHuxingTu();
	},
    afterViewLoad: function(){
        this.bl_tree.createRestrictionForLevel = createRestrictionForLevel;
        this.bl_tree.addParameter('rmType', " rm_type in ('30601','30602','30603','30604','30605','30606')");
        this.treeFlDS.addParameter('rmType', " rm_type in ('30601','30602','30603','30604','30605','30606')");
        this.treeRmDS.addParameter('rmType', " rm_type in ('30601','30602','30603','30604','30605','30606')");
    },
    
    onClickRmNode: function(){
        var currentNode = this.bl_tree.lastNodeClicked;
        var blId = currentNode.data['rm.bl_id'];
        var flId = currentNode.data['rm.fl_id'];
        var rmId = currentNode.data['rm.rm_id'];
        res1 = new Ab.view.Restriction();
        res1.addClause('rm.bl_id', blId);
        res1.addClause('rm.fl_id', flId);
        res1.addClause('rm.rm_id', rmId);
        this.rm_detail.refresh(res1, false);
    },
    
    sbfFilterPanel_onShow: function(){
        var siteid = this.sbfFilterPanel.getFieldValue("bl.site_id");
        var prId = this.sbfFilterPanel.getFieldValue("bl.pr_id");
        var blId = this.sbfFilterPanel.getFieldValue("bl.bl_id");
        var treeRes = new Ab.view.Restriction();
        if (siteid != "") {
            treeRes.addClause("bl.site_id", siteid, "=");
        }
        if (prId != "") {
            treeRes.addClause("bl.pr_id", prId, "=");
        }
        if (blId != "") {
            treeRes.addClause("bl.bl_id", blId, "=");
        }
        this.bl_tree.refresh(treeRes);
    },
    
    sbfFilterPanel_onClear: function(){
        this.sbfFilterPanel.clear();
    },
    
    changeRentNum: function(){
        var inputNum = jQuery('#priceNum').val();
        var type = jQuery('#selectDw').val();
        if (isNaN(inputNum)) {
            View.showMessage('租金标准请输入数字');
            jQuery('#priceNum').attr('value', '');
            return;
        }
        if (inputNum != '') {
            if (type == 'byTotal') {
            	this.rm_detail.setFieldValue('rm.rent_std', (inputNum + '(元/套)'));
            }
            else 
            if (type == 'byArea') {
            	this.rm_detail.setFieldValue('rm.rent_std', (inputNum + '(元/㎡)'));
            }
        }
        else {
            this.rm_detail.setFieldValue('rm.rent_std', '');
        }
    },
    
    rm_detail_afterRefresh: function(){
    	var rent_std = this.rm_detail.getFieldValue('rm.rent_std');
    	if(valueExistsNotEmpty(rent_std)){	
        	var array = rent_std.split("(");
        	
    		jQuery('#priceNum').val(parseInt(array[0]));
        	if( array[1] == "元/套)"){
        		jQuery('#selectDw').val("byTotal");
        	}else{
        		jQuery('#selectDw').val("byArea");
        	}
    	}else{//新增记录根据房屋类别添加默认值[月租金标准（单位为元/套和元/㎡，可选择，A类默认单位为元/套，B类默认单位为元/㎡）]
    		var rm_type = this.rm_detail.getFieldValue('rm.rm_type');
    		jQuery('#priceNum').val(0);
    		if(rm_type == "30601"){
    			jQuery('#selectDw').val("byTotal");
    		}else{
    			jQuery('#selectDw').val("byArea");
    		}
    	}
    },
    
    rm_detail_onSave: function(){
        this.rm_detail.save();
    },
    /**
     * 添加到积分选房
     * 
     * */
    rm_detail_onAdd: function(){
    	var bl_id = this.rm_detail.getFieldValue("rm.bl_id");
    	var bl_name = this.rm_detail.getFieldValue("bl.name");
    	var fl_id = this.rm_detail.getFieldValue("rm.fl_id");
    	var rm_id = this.rm_detail.getFieldValue("rm.rm_id");
    	var area_jianzhu = this.rm_detail.getFieldValue("rm.area_jianzhu");
    	var area_yt = this.rm_detail.getFieldValue("rm.area_yangtai");
    	var huxing = this.rm_detail.getFieldValue("rm.huxing");
    	
    	var restriction = new Ab.view.Restriction(); 
    	restriction.addClause("bjfu_zzf_jfxf.bl_id",bl_id,"=");
    	restriction.addClause("bjfu_zzf_jfxf.fl_id",fl_id,"=");
    	restriction.addClause("bjfu_zzf_jfxf.rm_id",rm_id,"=");
    	var records = this.zzfJfDs.getRecords(restriction);
    	if(records.length == 0){
    		restriction.addClause("bjfu_zzf_jfxf.bl_name",bl_name,"=");
        	restriction.addClause("bjfu_zzf_jfxf.area_jianzhu",area_jianzhu,"=");
        	restriction.addClause("bjfu_zzf_jfxf.area_yt",area_yt,"=");
        	restriction.addClause("bjfu_zzf_jfxf.huxing",huxing,"=");
        	this.dealForm.refresh(restriction,true);
    	}else{
    		this.dealForm.refresh(restriction,false);
    	}
    	
    	this.dealForm.showInWindow({
    		x: 100,
    		y: 100,
			closeButton: false,
	        width: 1000,
	        height: 280
	    });
    	this.dealForm.show(true);
    },
    dealForm_onReturn: function(){
    	this.dealForm.closeWindow();
    	this.dealForm.show(false);
    },
    dealForm_onSave: function(){
    	this.dealForm.save();
    	
    },
    dealForm_onDelete: function(){
    	this.dealForm.deleteRecord();
    	this.dealForm.closeWindow();
    	this.dealForm.show(false);
    }
    
});

function showBlPhoto(){
    var distinctPanel = View.panels.get('bl_detail');
    var blid = distinctPanel.getFieldValue('bl.bl_id');
    var addr = View.project.projectGraphicsFolder + '/bl/' + blid + '.jpg';
    jQuery.ajax({
        url: addr,
        success: function(){
            jQuery("#bl_photo").attr("src", addr);
        },
        error: function(e){
            jQuery("#bl_photo").removeAttr("src");
            jQuery("#bl_photo").attr("display", "none");
        }
    });
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
        rm_photoImg.dom.src = View.project.projectGraphicsFolder + "/rm/" + blid + "~" + flid + "~" + rmid + ".jpg";
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

function onSelectSite(){
    var controlPanel = View.panels.get('sbfFilterPanel');
    var res = "bl.acc_type !='yxz' and bl.bl_id in(select bl_id from rm where rm.rm_type in ('30601','30602','30603','30604','30605','30606')) ";
    
    View.selectValue({
        formId: 'sbfFilterPanel',
        title: "片区",
        fieldNames: ['bl.site_id'],
        selectTableName: 'bl',
        selectFieldNames: ['bl.site_id'],
        visibleFieldNames: ['bl.site_id', 'site.name'],
        sortFieldNames:'bl.site_id',
        restriction: res
    });
}

function onSelectPr(){
    var controlPanel = View.panels.get('sbfFilterPanel');
    var siteId = controlPanel.getFieldValue('bl.site_id');
    var res = "bl.acc_type !='yxz' and bl.bl_id in(select bl_id from rm where rm.rm_type in ('30601','30602','30603','30604','30605','30606')) "
    if (valueExistsNotEmpty(siteId)) {
        res += " and bl.site_id='" + siteId + "'";
    }
    
    View.selectValue({
        formId: 'sbfFilterPanel',
        title: "片区",
        fieldNames: ['bl.site_id', 'bl.pr_id'],
        selectTableName: 'bl',
        selectFieldNames: ['bl.site_id', 'bl.pr_id'],
        visibleFieldNames: ['bl.site_id', 'site.name', 'bl.pr_id', ],
        filterFieldNames: ['bl.site_id'],
        sortFieldNames:'bl.site_id',
        restriction: res
    });
}

function onSelectBl(){
    var controlPanel = View.panels.get('sbfFilterPanel');
    var siteId = controlPanel.getFieldValue('bl.site_id');
    var prId = controlPanel.getFieldValue('bl.pr_id');
    var res = "bl.acc_type !='yxz' and bl.bl_id in(select bl_id from rm where rm.rm_type in ('30601','30602','30603','30604','30605','30606'))"
    if (valueExistsNotEmpty(siteId)) {
        res += " and bl.site_id='" + siteId + "'";
    }
    if (valueExistsNotEmpty(prId)) {
        res += " and bl.pr_id='" + prId + "'";
    }
    
    View.selectValue({
        formId: 'sbfFilterPanel',
        title: "大厦",
        fieldNames: ['bl.site_id', 'bl.pr_id', 'bl.bl_id'],
        selectTableName: 'bl',
        selectFieldNames: ['bl.site_id', 'bl.pr_id', 'bl.bl_id'],
        visibleFieldNames: ['bl.site_id', 'site.name', 'bl.pr_id', 'bl.bl_id', 'bl.name'],
        filterFieldNames: ['bl.site_id', 'bl.pr_id'],
        sortFieldNames:'bl.site_id',
        restriction: res
    });
}

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (parentNode.data) {
        var blId = parentNode.data['bl.bl_id'];
        if (blId && level == 1) {
            restriction = new Ab.view.Restriction();
            restriction.addClause('bl.bl_id', blId);
        }
        if (level == 2) {
            var blId = parentNode.data['fl.bl_id'];
            var flId = parentNode.data['fl.fl_id'];
            restriction = new Ab.view.Restriction();
            restriction.addClause('fl.fl_id', flId);
            restriction.addClause('fl.bl_id', blId);
        }
    }
    return restriction;
}

function onSelectHx(){
    var blId = defZzfRoomController.rm_detail.getFieldValue('rm.bl_id');
    var res = "sc_bl_hx.bl_id = '"+blId+"'";
    
    View.selectValue({
        formId: 'rm_detail',
        title: "户型",
        fieldNames: ['rm.id','rm.huxing'],
        selectTableName: 'sc_bl_hx',
        selectFieldNames: ['sc_bl_hx.id','sc_bl_hx.huxing'],
        visibleFieldNames: ['sc_bl_hx.id','sc_bl_hx.huxing','sc_bl_hx.area_jianzhu','sc_bl_hx.bl_id'],
        restriction: res,
        actionListener:afterSelectRegloc
    });
}


function afterSelectRegloc(fieldName, selectedValue, previousValue){
    if(fieldName=="rm.id"){
//        var res="sc_bl_hx.id="+selectedValue;
//        var record=defineLocRMController.scBlHxDS.getRecord(res);
//        var id=record.getValue('sc_bl_hx.id');
		var form= defZzfRoomController.rm_detail;
	    DocumentService.getImage({id:selectedValue}, "sc_bl_hx", "photo", '1', true, {
            callback: function(image) {
                dwr.util.setValue(form.getFieldElementName("huxing_photo"), image);
                form.enable();
            },
            errorHandler: function(m, e) {
                Ab.view.View.showException(e);
                form.enable();
            }
        });
    }
}

function showHuxingTu(){
	var blId = defZzfRoomController.rm_detail.getFieldValue('rm.bl_id');
	var id = defZzfRoomController.rm_detail.getFieldValue('rm.id');
//	var res = "sc_bl_hx.bl_id='"+blId+"' and sc_bl_hx.huxing='"+huxing+"'";
//	var record = defineLocRMController.scBlHxDS.getRecord(res);
//	var id=record.getValue('sc_bl_hx.id');
	var form= defZzfRoomController.rm_detail;
	if(valueExistsNotEmpty(id)){
		DocumentService.getImage({id:id}, "sc_bl_hx", "photo", '1', true, {
	                callback: function(image) {
	                    dwr.util.setValue(form.getFieldElementName("huxing_photo"), image);
	                    form.enable();
	                },
	                errorHandler: function(m, e) {
	                    Ab.view.View.showException(e);
	                    form.enable();
	                }
	            });
	}
}

