

var buildingBaiscTabController = View.createController('buildingBaiscTabController', {
	blId:null,
	blName:null,
	openController:null,
	
    afterInitialDataFetch: function(){
    	var tabs = View.getControlsByType(parent, 'tabs')[0];
    	this.blId = tabs.blId;
    	this.blName = tabs.blName;
    	this.openController = tabs.openController;
    	var restriction = new Ab.view.Restriction();
        restriction.addClause('bl.bl_id',  this.blId, '=');
        this.blBasicInfoPanel.refresh(restriction);
        this.useStatuseInfoPanel.refresh(restriction);
        this.buildingPhotos.refresh(restriction);
        var photo = this.buildingPhotos.getFieldValue("bl.bldg_photo");
        if(photo){
        	$('message').hidden="true";
        	this.buildingPhotos.showImageDoc('bl_photo', 'bl.bl_id', 'bl.bldg_photo');
        }else{
        	$('message').value="没有图片信息!";
        }
    },
    buildingPhotos_onChartByDv:function(){
    	var openController = this.openController;
    	View.openDialog("asc-bj-usms-bl-dp-cht-stack-inline.axvw",'', false, {
            width: 900,
            height: 700,
            openController:openController
        });	
    	
    },
    buildingPhotos_onChartByType:function(){
    	var openController = this.openController;
       	View.openDialog("asc-bj-usms-bl-type-cht-stack-inline.axvw",'', false, {
            width: 900,
            height: 700,
            openController:openController
        });	
    },
    buildingPhotos_onRmDetailInfo:function(){
   	    var title = "建筑物:" + this.blName;
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause("rm.bl_id", this.blId, "=");
        this.bl_room_detail_info.refresh(restriction);
        this.bl_room_detail_info.setTitle(title);
        this.bl_room_detail_info.show(true);
    	this.bl_room_detail_info.showInWindow({
    		title:'房间明细列表',
            width: 900,
            height: 700,
			closeButton: true
        });
    }
    
   
});


