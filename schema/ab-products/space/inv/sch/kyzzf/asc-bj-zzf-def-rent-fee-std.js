var abSpDefRmStd_Control = View.createController('abSpDefRmStd_Control', {
	editTable:null,
	editTbody:null,
	srcRentStd:null,
	srcStdRecords:null,
	afterInitialDataFetch:function(){
		this.editTable=document.getElementById("editRentTable");
        this.editTbody=this.editTable.getElementsByTagName("tbody")[0];
		this.editTable.ondblclick=function  (e) {
			 var ev=e||window.event;
			 var target=ev.target||ev.srcElement;
			 if(target.nodeName=="TD"){
			   var oldv=target.innerHTML;
               target.innerHTML="";
			   var input=document.createElement("input");
			   input.type="text";
			   input.value=oldv;
			   input.size=20;
			   input.style.width=120;
			   target.appendChild(input);
			   input.onblur=function  () {
			     var newv=input.value;
				 target.removeChild(this);
				 target.innerHTML=newv;
			   }
			 }
			}
	},
    detailsPanel_onEdit: function(){
        var RentStd=this.detailsPanel.getFieldValue("bh_zzf_rent_std.rent_std");
		this.srcRentStd=RentStd;
	    var res = new Ab.view.Restriction();
		res.addClause("bh_zzf_rent_std_detail.rent_std", RentStd, '=');
		var Records=this.rent_std_detail_ds.getRecords(res);
		this.srcStdRecords=Records;
			this.removeAllRows();
		for(var i=0;i<Records.length;i++){
			 var tr=document.createElement("tr");
		     var str="";
			 str+="<td height='20'>"+Records[i].getValue("bh_zzf_rent_std_detail.area_begin")+"</td>"
			 +"<td height='20'>"+Records[i].getValue("bh_zzf_rent_std_detail.area_end")+"</td>"+
			 "<td height='20'>"+Records[i].getValue("bh_zzf_rent_std_detail.fee")+"</td>";
		 	 tr.innerHTML=str;
			 this.editTbody.appendChild(tr);
		}
		this.rentDetailEditForm.showInWindow({
        width: 500,
        height: 300
    });
    },
	rentDetailEditForm_onAdd:function(){
		 var tr=document.createElement("tr");
		 var str="";
			  for (var i=0; i<3; i++) {
			   str+="<td height='20'></td>"
			  }
			  tr.innerHTML=str;
		 this.editTbody.appendChild(tr);
		
	},
	rentDetailEditForm_onDelete:function(){
		var trs=this.editTbody.getElementsByTagName("tr");
		  if(trs.length!=1){
				this.editTbody.removeChild( trs[trs.length-1]);
		   }
	},
	removeAllRows:function(){
				var trs=this.editTbody.getElementsByTagName("tr");
		  if (trs.length != 1) {
		  	for (var i = trs.length; i > 1; i--) {
		  		this.editTbody.removeChild(trs[i - 1]);
		  	}
		  }
	},
	rentDetailEditForm_onSave:function(){
		var trs=this.editTbody.getElementsByTagName("tr");
		var ALevelArray=new Array(trs.length-1);
		for(var i=1;i<trs.length;i++){
			ALevelArray[i-1]=new Array(3)
			var tds=trs[i].getElementsByTagName("td");
			for(var j=0;j<tds.length;j++){
				ALevelArray[i-1][j]=tds[j].innerHTML;
			}
		}
	
		if(ALevelArray[0][0]!="0"){
			View.alert('面积参数应 以0开始');
			return;
		}
		var index //行标志
		//todo 末尾以999999验证 需要后期添加
		for(var i=0;i<ALevelArray.length;i++){
			var BArray=ALevelArray[i];
			var CArray=ALevelArray[i+1];
	        if(typeof CArray == "undefined" ){
				break;
			}
			if (BArray[1] == CArray[0]) {
				continue;
			}
			else {
				index = i;
				break;
			}
			
		}
		for(var i=0;i<trs.length;i++){
				trs[i].style.backgroundColor="#FFF"
		}
		if(valueExistsNotEmpty(index)){
			trs[index+2].style.backgroundColor="#F00";
			return;
		}
		
		if(this.srcStdRecords!=null){
			for(var i=0;i<this.srcStdRecords.length;i++){
				this.rent_std_detail_ds.deleteRecord(this.srcStdRecords[i]);
			}
			this.srcStdRecords=null;
		}
		
		for(var i=0;i<ALevelArray.length;i++){
		       var tempArray=ALevelArray[i];
			var record =  new Ab.data.Record();
			record.setValue('bh_zzf_rent_std_detail.rent_std',this.srcRentStd);
			record.setValue('bh_zzf_rent_std_detail.area_begin', parseInt(tempArray[0]));
			record.setValue('bh_zzf_rent_std_detail.area_end',  parseInt(tempArray[1]));
			record.setValue('bh_zzf_rent_std_detail.fee',  parseInt(tempArray[2]));
			this.rent_std_detail_ds.saveRecord(record);
		}
		this.removeAllRows();
		var res = new Ab.view.Restriction();
		res.addClause("bh_zzf_rent_std_detail.rent_std", this.srcRentStd, '='); 
		this.rentDetailGrid.refresh(res);
		this.rentDetailEditForm.closeWindow();	
		
	}
});