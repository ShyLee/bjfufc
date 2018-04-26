/*
 * @author : HuangMuLiang
 * @date   : 2012-11-01
 */

var controller = View.createController('soumap', {
	makerArray:new Array(),
	map:'',
	afterViewLoad:function() {
		var records=getBuildingRecords("","");
		initialize(records);
	},

	console_onShow:function(){
		
		var bl_id = this.console.getFieldValue("bl.bl_id");
		var dv_use = this.console.getFieldValue("bl.dv_use");
		var use1 = this.console.getFieldValue("bl.use1");
		var records=getBuildingRecords(bl_id,use1,dv_use);
		//重新绘图
		showBl(records);
	}

});

/**
 * Get building records by console value
 * @param bl_id
 * @param use1
 * @returns {String}
 */
function getBuildingRecords(bl_id,use1,dv_use){
	  var restriction=new Ab.view.Restriction();
	
	var records="";
	if(valueExistsNotEmpty(bl_id)){
		 restriction.addClause("bl.bl_id",bl_id,"=");
		records=controller.blDS.getRecords(restriction);
	}else if(use1){
		restriction.addClause("bl.use1",use1,"=");
		records=controller.blDS.getRecords(restriction);
	}else if(valueExistsNotEmpty(dv_use)){
		restriction.addClause("bl.dv_use",dv_use,"=");
		records=controller.blDS.getRecords(restriction);
	}
	else{
		var  resLatlon = "bl.latsou is not null and bl.lonsou is not null";
		  
		records=controller.blDS.getRecords(resLatlon);
	}
	return records;
}


//初始化地图，画出校园范围
function initialize(records) {

	 var latLng = new sogou.maps.Point(12949661.79, 4836223.2);
	  var myOptions = {
	    'zoom': 16,
	    'center': latLng,
	    'mapTypeId': sogou.maps.MapTypeId.EDUSHIMAP  // 加载三维图像
	   
	  }
	 var  map = new sogou.maps.Map(document.getElementById("map_canvas"), myOptions);
	        controller.map=map;
    		//addMakeForMap(map,records);
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
			 
			  str_url_link_bl = '<a href="#" onclick=\'showBlInfo("'+bl_id+'")\'>'+getMessage("<建筑物房产信息摘要>")+'</a>';
			  str_url_link_fl = '<a href="#" onclick=\'showBlFlRmCatInfo("'+bl_id+'")\'>'+getMessage("<楼层房屋类别叠堆图>")+'</a>';
			  str_url_link_mov = ""
			  if (bl_id == "逸夫科研楼")
			  {
			  	str_url_link_mov = "<a href='"+View.project.projectGraphicsFolder+"/mov.flv'>3D漫游</a>";
			  }
			  
			  
		  var html="<div id='info'><p>"+getMessage("大楼名")+":"+bl_id+" </p><p> "+getMessage('大楼用途')+":"+use1+"</p><p>"+getMessage("建筑面积")+":"+area_building_manual+"平米"+" </p><p> "+
				getMessage("使用面积")+":"+area_rm+"平米"+" </p><p> "+str_url_link_bl+" </p><p> "+str_url_link_fl+"</p> <p> "+str_url_link_mov+"</p></div>";	
			
			var head=bl_id;
			
			infowindow.setContent(html);
			infowindow.setTitle(head);
			infowindow.open(map,marker);
	  });
	  
	}


