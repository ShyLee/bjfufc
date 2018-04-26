/**
 * @author MuLiang 
 */
var parcellandControl = View.createController('ascBjUsmsOverallParcellandWholeController', {
	
	blId:"",
	land_title :"",
	
	ascBjUsmsOverallParcellandBlMain_blGrid_showBlInfo_onClick: function(row){
		this.blId = row.record['bl.bl_id'];
		View.openDialog('asc-bj-usms-bl-info-card.axvw', null, false, {
            width: 800,
            height: 600,
            closeButton: false,
			openBlId:this.blId 
        });
    },
    ascBjUsmsOverallBlWhole_blGrid_showBlList_onClick: function(row){
    	var parcelland_address = row.record['sc_parcelland.land_code'];
    	var panel = View.panels.get('ascBjUsmsOverallParcellandBlMain_blGrid');
    	panel.addParameter('parcellandAddressRes', parcelland_address);
		panel.refresh();
		//panel.show(true);
		panel.showInWindow({
			width: 1300,
			height: 700,
			closeButton: false
		});
    },
	
	afterInitialDataFetch: function()
	{
		var ds=View.dataSources.get("asc-bj-usms-overall-parcelland-bl-whole_grid_parcelland");
        var records=ds.getRecords();
		var land_code;
		if(records.length!=0){
			land_code=records[0].getValue("sc_parcelland.land_code");
		};
		this.showDistinctPhoto(null,land_code);
	},
	
	ascBjUsmsOverallBlWhole_blGrid_onClickItem:function(row){
        this.showDistinctPhoto(row);
    },
	
	showDistinctPhoto:function(row,land_code){
		this.landPhoto.show(true);
		var landCode="";
		if(land_code){
			landCode=land_code;
		}else{
			  landCode= row.getFieldValue('sc_parcelland.land_code');
		}
        
        var addr=View.project.projectGraphicsFolder +"/land/"+ landCode+'.jpg';

        jQuery.ajax({
              url: addr,
              success: function(){
                  jQuery("#land_photo").attr("src",addr);

              },
              error:function(e){
                  jQuery("#land_photo").removeAttr("src");
                  jQuery("#land_photo").attr("display","none");
              }});
    },  
	
	ascBjUsmsOverallBlWhole_blGrid_onFixedExportland: function(){
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
			width: 470,
			height: 200,
			xmlName: "land",
			closeButton: false
		});
	},
	 
	　ascBjUsmsOverallBlWhole_blGrid_onFixedExportcaizheng: function(){
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
			width: 470,
			height: 200,
			xmlName: "caizheng",
			closeButton: false
		});
	}	
	
});


