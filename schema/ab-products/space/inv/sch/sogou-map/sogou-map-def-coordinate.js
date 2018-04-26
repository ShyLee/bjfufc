var sougouDefController = View.createController('sougouDefController', {
    pointMarker: null,
	map:null,
    afterViewLoad: function(){
        this.initialize();
        var cForm = sougouDefController.formPanel;
        cForm.clear();
    },
    gridPanel_onShowNoPosition: function(){
        var a = View.getWindow();
        var restriction = new Ab.view.Restriction();
        restriction.addClause("bl.latsou", "", "IS NULL");
        restriction.addClause("bl.lonsou", "", "IS NULL");
        this.gridPanel.refresh(restriction);
    },
    gridPanel_onShowAll: function(){
    	var re = new Ab.view.Restriction();
    	this.gridPanel.refresh(res,true);
       
    },
    showPointOnMap: function(row){
		 var row = this.gridPanel.gridRows.get(this.gridPanel.selectedRowIndex);
        var bl_id = row.getFieldValue("bl.bl_id");
        this.pointMarker.setTitle(bl_id);
        var lat = row.getFieldValue("bl.latsou");
        var lon = row.getFieldValue("bl.lonsou");
        if (valueExistsNotEmpty(lat) && valueExistsNotEmpty(lon)) {
            var myPoint = new sogou.maps.Point(lat, lon);
			this.map.setZoom(18);
            this.pointMarker.setPosition(myPoint);
            this.pointMarker.setVisible(true);
        }
        else {
            this.pointMarker.setVisible(false);
        }
    },
    initialize: function(){
    
        var myLatlng = new sogou.maps.Point(12949661.79, 4836223.2);
        
        var myOptions = {
            zoom: 16,
            center: myLatlng,
            mapTypeId: sogou.maps.MapTypeId.EDUSHIMAP
        }
        var map = new sogou.maps.Map(document.getElementById("map_canvas"), myOptions);
		this.map=map;
	var myPoint = new sogou.maps.Point(12960307.02,4834991.78);
     var img = View.contextPath+'/schema/ab-products/space/inv/sch/sogou-map/'+"point.png";
      this.pointMarker = new sogou.maps.Marker({
    	position: myPoint,
     	title:'',
   		label:{visible:true,align:"BOTTOM"},
     		map: map,
     		icon: img,
        	//styleId:"S1891",
       		draggable:true,
       		visible: false
       	});

        new sogou.maps.event.addListener(map, 'dblclick', this.mapDbClick);
       // new sogou.maps.event.addListener(this.pointMarker, "dragend", this.markerdragend);
    },
    
    mapDbClick: function(event){
     
        var cForm = View.panels.get('formPanel');
        cForm.clear();
		cForm.refresh(null,true);
        cForm.setFieldValue("bl.latsou", event.point.x);
        cForm.setFieldValue("bl.lonsou", event.point.y);
    },
    
    markerdragend: function(mouseEvent){
        //get click location x y
        var consolePanel = sougouDefController.consolePanel;
        var cForm = sougouDefController.formPanel;
        cForm.clear();
        
        //get click location x y
        consolePanel.setFieldValue("bl.latsou", mouseEvent.point.x);
        consolePanel.setFieldValue("bl.lonsou", mouseEvent.point.y);
        
        
        var bl_id = consolePanel.getFieldValue("bl.bl_id");
        if (valueExistsNotEmpty(bl_id)) {
            sougouDefController.pointMarker.setTitle(bl_id);
        }
        else {
            sougouDefController.pointMarker.setTitle(mouseEvent.point.x + ':' + mouseEvent.point.y);
        }
        
        //get click location x y
        cForm.setFieldValue("bl.latsou", mouseEvent.point.x);
        cForm.setFieldValue("bl.lonsou", mouseEvent.point.y);
    },
	formPanel_onSave:function(){
		var blId=this.formPanel.getFieldValue("bl.bl_id");
		var lasouPoint=this.formPanel.getFieldValue("bl.latsou");
		var lonsouPoint=this.formPanel.getFieldValue("bl.lonsou");
		if(!valueExistsNotEmpty(blId)){
			View.showMessage("请选择大厦");
		}
		
		var record=this.blDS.getRecord({'bl.bl_id':blId});
		record.setValue('bl.latsou',lasouPoint);
		record.setValue('bl.lonsou',lonsouPoint);	
		
		this.blDS.saveRecord(record);
		
		this.gridPanel.refresh();
		View.showMessage("保存成功");
	}
    
});

function showPointOnMap(row){
	alert( sougouDefController);
	sougouDefController.showPointOnMap(row)
}

//
//function setBuilding(){
//    var consolePanel = sougouDefController.consolePanel;
//    
//    var cForm = sougouDefController.formPanel;
//    var restriction = new Ab.view.Restriction();
//    var blId = consolePanel.getFieldValue("bl.bl_id");
//    var latsou = consolePanel.getFieldValue("bl.latsou");
//    var lonsou = consolePanel.getFieldValue("bl.lonsou");
//    
//    restriction.addClause("bl.bl_id", blId, "=");
//    cForm.refresh(restriction);
//    
//    //get click location x y
//    cForm.setFieldValue("bl.latsou", consolePanel.getFieldValue("bl.latsou"));
//    cForm.setFieldValue("bl.lonsou", consolePanel.getFieldValue("bl.lonsou"));
//    
//    cForm.save();
//    sougouDefController.gridPanel.refresh();
//    
//}
