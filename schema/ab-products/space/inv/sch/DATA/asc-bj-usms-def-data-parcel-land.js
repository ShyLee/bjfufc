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
    if(View.panels.get('ascBjUsmsDefDataLandCatForm').getFieldValue("sc_parcelland.land_code") != ""){
        var uploadFile = dwr.util.getValue("uploadFile"); 
        if(uploadFile.value != ""){
            var filename = View.panels.get('ascBjUsmsDefDataLandCatForm').getFieldValue("sc_parcelland.land_code") + ".jpg";  
            var url = "land";
            FileUpload.uploadFile(uploadFile,filename,url,function(imageURL){  
                var addr=imageURL+"?id="+new Date().getTime();
                dwr.util.setValue('uploadFile', "");  
                jQuery.ajax({
                    url: addr,
                    success: function(){
                        jQuery("#land_photo").removeAttr("src");
                        jQuery("#land_photo").attr("src",addr);

                    },
                    error:function(e){
                       jQuery("#land_photo").removeAttr("src");
                       jQuery("#land_photo").attr("display","none");
                    }
                });
            });
        }else{
            alert("请先选择员工照片");
        } 
    }else{
        alert("请先输入员工 号");
    }
   });
});

var abScDefEmController = View.createController('abScDefEm', {
	ascBjUsmsDefDataLandCatGrid_onAddNew:function(){
       // this.ascBjUsmsDefDataLandCatGrid.refresh(null,true);
        //this.ascBjUsmsDefDataLandCatGrid.setFieldValue("em.dv_id","");
        jQuery("#land_photo").removeAttr("src");
        jQuery("#land_photo").attr("display","none");
    },
	
    ascBjUsmsDefDataLandCatGrid_onClickItem:function(row){
        this.showDistinctPhoto(row);
    },

    showDistinctPhoto:function(row){
        var landId= row.getFieldValue('sc_parcelland.land_code')
        var addr=View.project.projectGraphicsFolder + '/land/' + landId+'.jpg';
        jQuery.ajax({
              url: addr,
              success: function(){
                  jQuery("#land_photo").attr("src",addr);
              },
              error:function(e){
                  jQuery("#land_photo").removeAttr("src");
                  jQuery("#land_photo").attr("display","none");
              }});
    } 
});

function showFundsPanel(grid){
	var zdbh=grid.restriction["sc_parcelland.land_code"];
	var panel=View.panels.get('assetGrid');
	var restriction = new Ab.view.Restriction();
	restriction.addClause("asset_source.bl_id",zdbh,'=');
	panel.refresh(restriction);
}
	
function setPattern(){
    View.hpatternPanel = View.panels.get('ascBjUsmsDefDataLandCatForm');
    View.hpatternField = 'sc_parcelland.hpattern_acad';
    View.patternString = View.hpatternPanel.getFieldValue('sc_parcelland.hpattern_acad');
    View.openDialog('ab-hpattern-dialog.axvw', null, true, {
        width: 700,
        height: 530,
        closeButton: false
    });
}
 