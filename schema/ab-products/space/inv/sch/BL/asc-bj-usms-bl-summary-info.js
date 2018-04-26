var buildingAbstractController = View.createController('viewBuildingAbstracts', {

	blId:"",
	
	openBlId:null,
	
	/**
	 * Initializes the view.
	 */
    afterViewLoad: function(){
        
    },
	
	afterInitialDataFetch: function(){
		if (this.view.parameters){
        	this.openBlId = this.view.parameters['openBlId'];
		
			if (this.openBlId) {
				this.blId=this.openBlId;
				this.defaultDisplayFromLink(this.openBlId);
	    	}
		}
    },
    defaultDisplayFromLink: function(blId) {
    	
    		var restriction = new Ab.view.Restriction();
    		restriction.addClause("bl.bl_id",blId,"=");
    	    this.abScBlInfoColumnReport.refresh(restriction);
    		this.abScBlBasicInfoForm.refresh(restriction);
    		this.showDistinctPhoto(blId);
	},	
	/**
	 * Event handler for property photo and map image click.
	 */
	onClickImage: function() {
		View.openDialog(this.dom.src);
	},
	
	abScBlInfoColumnReport_afterRefresh:function(){
		var gongtanlv = this.abScBlInfoColumnReport.getFieldValue("bl.gongtanlv");
		if (gongtanlv){
			gongtanlv = gongtanlv*100;
			gongtanlv = gongtanlv.toFixed(2);
			document.getElementById("abScBlInfoColumnReport_bl.gongtanlv").innerHTML = gongtanlv+"%";
		}
		
	},
	
	/**
	 * 
	 */
	buildingPhotos_afterRefresh:function(){
		var title = String.format(getMessage('imagePanelTitle'), this.blId);
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
        var record = this.abScBasic_tree_blDS.getRecord(restriction);
		
		this.buildingPhotos.refresh(restriction);
	}
});


function onClickBlNode(){
	
    var currentNode = View.panels.get("site_tree").lastNodeClicked;
	var blId = "";
	if (currentNode) {
		var siteName = currentNode.parent.data['site.name'];
		var title = String.format(getMessage('treeTitle'), siteName);
		setPanelTitle('site_tree', title);
	
		blId = currentNode.data['bl.bl_id'];
	}
	
	var restriction = new Ab.view.Restriction();
	    restriction.addClause("bl.bl_id",blId,"=");
	
    var blForm = View.panels.get('abScBlInfoColumnReport');
    blForm.refresh(restriction);
	
	var blBasicForm = View.panels.get('abScBlBasicInfoForm');
    blBasicForm.refresh(restriction);
	
	buildingAbstractController.blId = blId;
	buildingAbstractController.showDistinctPhoto(blId);
}

function showBldgPhoto(){
    var distinctPanel = View.panels.get('buildingPhotos');
    //var bl_photo = distinctPanel.getFieldValue('bl.image_file').toLowerCase();
    //var blId = distinctPanel.getFieldValue('bl.bl_id');
    var bl_photo = distinctPanel.getFieldValue('bl.bl_id');
    var bl_photoImg = Ext.get('bl_photo');   
    if (valueExistsNotEmpty(bl_photo)) {   	
    	bl_photoImg.setVisible(true);
		bl_photoImg.dom.src = View.project.projectGraphicsFolder + '/bl/' + bl_photo+'.jpg';
		bl_photoImg.dom.alt = "";
    }
    else {
    	bl_photoImg.setVisible(false);
		bl_photoImg.dom.src = null;
		bl_photoImg.dom.alt = "此建筑物照片不存在！";

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
        var buildingId = treeNode.data['bl.bl_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + buildingId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}
