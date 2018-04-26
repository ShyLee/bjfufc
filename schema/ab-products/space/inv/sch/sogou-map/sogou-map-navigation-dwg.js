
/*
 * @author : HuangMuLiang
 * @date   : 2012-11-01
 */

var controller = View.createController('soumap', {
	makerArray:new Array(),
	map:'',
	afterViewLoad:function() {
		var records=this.blDS.getRecords(" bl.latsou is not null and bl.lonsou is not null");
		initialize(records);
		
		 this.flGrid.addEventListener('onMultipleSelectionChange', function(row){
		        
	            var highlightResc = "";
	                highlightResc += " AND rm.dv_id IS NOT NULL";
	           
	            View.panels.get('abSpHlRmByDp_DrawingPanel').addDrawing(row, null);
	           
	        });
		this.hideDwgPanel();
	},

	console_onShow:function(){
		this.hideDwgPanel();
		if(this.abSpHlRmByDp_DrawingPanel.initialized){
			this.abSpHlRmByDp_DrawingPanel.clear();
		}
		//this.view.layoutManagers[1].setRegionSize("east",0);
		this.flGrid.show(false);
		//重新绘图	
		var res = this.console.getFieldRestriction();
		this.blGrid.refresh(res);
		var records = this.blDS.getRecords(res);
		showBl(records);
	},
	blGrid_bl_id_onClick: function(row){

		var restriction=new Ab.view.Restriction();
		var bl_id = row.getFieldValue("bl.bl_id");
		restriction.addClause("rm.bl_id",bl_id,"=");
		controller.flGrid.refresh(restriction);
		//this.blGrid.show(false);
		
		this.showDwgPanel();
		this.abSpHlRmByDp_DrawingPanel.setTitle(bl_id);
		
	},
	hideDwgPanel: function(){
		this.view.getLayoutManager("rightLayout").setRegionSize("west",500);
		this.view.getLayoutManager("gridPanelLayout").collapseRegion("south");
	},
	
	showDwgPanel: function(){
		this.view.getLayoutManager("rightLayout").setRegionSize("west",150);
		this.view.getLayoutManager("gridPanelLayout").expandRegion("south");
		
		//var width =  document.body.clientWidth;
		//this.view.layoutManagers[1].setRegionSize("east",300);
	}

});




//初始化地图，画出校园范围
function initialize(records) {

	  var latLng = new sogou.maps.Point(12949804.01,4836468.03);
	  var myOptions = {
	    'zoom': 16,
	    'center': latLng,
	    'mapTypeId': sogou.maps.MapTypeId.EDUSHIMAP  // 加载三维图像
	   
	  }
	 var  map = new sogou.maps.Map(document.getElementById("map_canvas"), myOptions);
	        controller.map=map;
    		addMakeForMap(map,records);
	 var triangleCoords = [
		           		                      new sogou.maps.Point(12949566.95,4836080.08),
		           		                      new sogou.maps.Point(12950175.36,4836116.92),
		           		                      new sogou.maps.Point(12950042.65,4837058.79),
		           		                      new sogou.maps.Point(12949521.08,4837039.58),
		           		                      new sogou.maps.Point(12949566.95,4836080.08)
		           		                      ];

		           		// create polygon 
		           		bermudaTriangle = new sogou.maps.Polyline({
		           			paths: triangleCoords,
		           			strokeColor: "#FF0000",
		           			strokeOpacity: 0.8,
		           			strokeWeight: 6
		           		});
		           	     map.clearAll();
		           		bermudaTriangle.setMap(map);
}


//初始化地图，画出校园范围
function showBl(records) {
	    var map=controller.map;
    		addMakeForMap(map,records);
}


//标记所有建筑
function addMakeForMap(map,records){
	
	 for(var j=0;j<controller.makerArray.length;j++){
		 controller.makerArray[j].setMap(null);
		}
	 
	for(var i=0;i<records.length;i++){
			var record=records[i];
			var lat=record.getValue("bl.latsou");
			var lon=record.getValue("bl.lonsou");
			var blId=record.getValue("bl.bl_id");
			var location="";
			
			if(!isNaN(lat)){
			 location = new sogou.maps.Point(parseFloat(lat), parseFloat(lon));
			}else{
				
				continue;
			}
			  
    	    var marker = new sogou.maps.Marker({
    	        position: location,
    	        map: map,
    	        //设置信息窗上方标题栏的文字
    	        title: blId
    	    });
    	
    	 controller.makerArray[controller.makerArray.length]=marker;
    	 attachSecretMessage(map,marker);
    }
	    	
}

//显示房产信息摘要
function showBlInfo(blId){
	//this.blId = row.record['bl.bl_id'];
	View.openDialog('asc-bj-usms-bl-pracelland-summary-info.axvw', null, false, {
        width: 800,
        height: 600,
        closeButton: false,
		openBlId:blId
    });
}

//显示楼层房屋类别叠堆图
function showBlFlRmCatInfo(blId){
	View.openDialog('asc-bj-usms-bl-type-cht-stack-sogou.axvw', null, false, {
        width: 800,
        height: 600,
        closeButton: false,
        blId:blId
    });
}

//建筑高亮热点监听
function attachSecretMessage(map,marker) {
	  var infowindow = new sogou.maps.InfoWindow(
	      { content: "" ,
	    	title: "" 
	      });
	  //添加单击监听事件
	  sogou.maps.event.addListener(marker, 'click', function() {
		  var lat=marker.getPosition().x;
		  var lon=marker.getPosition().y;
		  var records=controller.blDS.getRecords("bl.latsou='"+lat+"' and bl.lonsou='"+lon+"'");
		  var restriction=new Ab.view.Restriction();
		  var bl_id=records[0].getValue("bl.bl_id");		  
		  var use1=records[0].getValue("bl.use1");
		  var area_building_manual=records[0].getValue("bl.area_building_manual");
		  var area_rm=records[0].getValue("bl.area_rm");
		  restriction.addClause("rm.bl_id",bl_id,"=");
			  controller.flGrid.refresh(restriction);
			  controller.blGrid.show(false);
			controller.showDwgPanel();
			controller.abSpHlRmByDp_DrawingPanel.clear();
			controller.abSpHlRmByDp_DrawingPanel.setTitle(bl_id);
			  str_url_link_bl = '<a href="#" onclick=\'showBlInfo("'+bl_id+'")\'>'+getMessage("<建筑物房产信息摘要>")+'</a>';
			  str_url_link_fl = '<a href="#" onclick=\'showBlFlRmCatInfo("'+bl_id+'")\'>'+getMessage("<楼层房屋类别叠堆图>")+'</a>';
		  var html="<div id='info'>"+getMessage("大楼名")+":"+bl_id+" <br> "+getMessage('大楼用途')+":"+use1+"<br>"+getMessage("建筑面积")+":"+area_building_manual+"平米"+" <br> "+
				getMessage("使用面积")+":"+area_rm+"平米"+" <br> "+str_url_link_bl+" <br> "+str_url_link_fl+"</br> </div>";	
			
		  var head=bl_id;
			
			infowindow.setContent(html);
			infowindow.setTitle(head);
			infowindow.open(map,marker);
	  });
	  
	}



