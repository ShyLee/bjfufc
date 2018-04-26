
var setting = { 
		showLine: true,   
	    checkable: true  ,
	    async: {
			enable: true,
			url:"/archibus/docUploadServlet.do?method=getTreeNode",
			autoParam:["id","name"],
			dataType:"text"
		},
	    callback:{
	    	onExpand:function(){
	    	},
			onAsyncSuccess :function(){
			},
			onAsyncError:function(){
			},
			onClick: function(event, treeId, treeNode, clickFlag) {
				docController.currentSelectedId=treeNode.id;
				var res = new Ab.view.Restriction();
				res.addClause('sc_doc_center.pid',treeNode.id,'=');
				docController.downloadPanel.refresh(res);
			}	
	    },
	    data: {
			simpleData: {
				idKey:"id",
				pIdKey:"pid", 
				enable: true
			},
			key : {
				name : "name",
				title: "name"
			},
			keep:{
				parent:true
			}
		}			
};

jQuery(document).ready(function(){

	jQuery.fn.zTree.init(jQuery("#treeDemo"), setting);		
	window.treeObj=jQuery.fn.zTree.getZTreeObj("treeDemo")

	jQuery("#uploadify").uploadify({ 
	    swf: '/archibus/schema/ab-core/libraries/uploadify/uploadify.swf',  
		uploader: '/archibus/DocUploadService.do;jsessionid=${pageContext.session.id}',  
	    buttonImg: '/archibus/schema/ab-core/libraries/uploadify/cancel.png',  
	    cancelImg: '/archibus/schema/ab-core/libraries/uploadify/cancel.png',  
	    auto: true, 
	    fileSizeLimit:0,
	    queueID: 'fileQueue',  
	    queueSizeLimit: 100,  
	    fileTypeDesc: '请上传*.zip; *.xls; *.doc; *.pdf; *.rar; *.txt',  
	    fileTypeExts:  '*.zip; *.xls; *.doc; *.pdf; *.rar; *.txt;*.png;*.jpg;*.bmp;*.docx;*.xlsx',  
	    method: 'get',  
	        multi: true,  
	 //       uploadLimit: 100,  
	    buttonText: '选择要上传的文件' ,
	   // formData: { 'defaultUploadFolder':defaultUploadFolder},
	    onUploadStart: function(file) {
	    	var nodes = treeObj.getSelectedNodes();
	    	if(nodes.length == 0){
	    		var allNodes=treeObj.getNodes();
	    		if(allNodes.length>0){
	    			jQuery("#uploadify").uploadify("settings", 'formData',  { 'selectedNode':allNodes[0].id});
	    		}else{
	    			View.alert(" 请先建立文件夹 ");
	    			return;
	    		}
	    		
	    	}else{
	    		jQuery("#uploadify").uploadify("settings", 'formData',  { 'selectedNode':docController.currentSelectedId});
	    	}
	    },
	    onUploadSuccess : function(file, data, response) {
	    	//jQuery('#uploadMessage').text("成功上传图片").fadeTo('slow',0.35).fadeOut(600);       
	    	docController.downloadPanel.refresh();
	    },onQueueComplete:function(){
	    	//jQuery('#uploadify').uploadify('destroy');
	    }
	});  

});

var docController = View.createController('docController', {
	currentSelectedId:null,
	canDelDoc:false,
	afterViewLoad:function(){
		this.canDelDoc=this.ifDelDocGroup(View.user.groups);
		if(this.canDelDoc==false){
			this.treePanel.actions.get('delete').forceHidden();
		}
	},
	ifDelDocGroup:function(arr){
		for(var el in arr){
			if(arr[el]=="DELDOC"){
				return true;
			};
		}
		return false;
	},
	downloadPanel_afterRefresh:function(){
		if(this.canDelDoc==false){
			jQuery("#downloadPanel :button").each(function(){
				jQuery(this).hide();
			});
		}else{
			jQuery("#downloadPanel :button").each(function(){
				jQuery(this).show();
			});
		}
	},
	treePanel_onAdd: function(){
		var title="新建文件夹"
		var text="请输入文件夹名称";
		controller=this;
		View.prompt(title, text, function(button, text) {
            if (button == 'ok') {
            	var nodes = treeObj.getSelectedNodes();
            	var pid="";
            	if(nodes.length>0){
            		var pid = nodes[0].id;
            	}
            	controller.addFolder(text,pid);
            }
        });
	},
	addFolder:function(name,pid){
		jQuery.ajax({
            type: "POST",
            async: false,
            url: "/archibus/docUploadServlet.do?method=addFolder",
            data:{name:name,pid:pid},
            success:function(data){
            	var nodes = treeObj.getSelectedNodes();
            	treeObj.reAsyncChildNodes(nodes[0], "refresh");
                treeObj.expandAll(true);
            }
        });
	},
	linkDown:function(){
		var selectedIndex = this.downloadPanel.selectedRowIndex;
		var id = this.downloadPanel.rows[selectedIndex]["sc_doc_center.id"];
		var name = this.downloadPanel.rows[selectedIndex]["sc_doc_center.name"];
		var url = this.downloadPanel.rows[selectedIndex]["sc_doc_center.url"];
   		 var param = {
   		      'url': url,
   		      'name': name
   		  	};
   		 	 this.download(param,"downOneFile");
	   },
	    download:function(param,method){
	    	var iframe = document.createElement("iframe");
	    	iframe.style.display="none";
	    	iframe.name="hiddentAreaForDownLoad";
	    	iframe.id="hiddentAreaForDownLoad";
	    	var downForm = document.createElement("form");
	    	
	    	downForm.style.display="none";
	    	downForm.action = "/archibus/DocDownService.do?method="+method;
	    	downForm.target="hiddentAreaForDownLoad";
	    	downForm.method="post";
	    	downForm.id="downloadForm";
	    	downForm.name="downloadForm";
	    	
	    	var fileName = document.createElement("input");
	    	fileName.value = param.name;
	    	fileName.name = "name";
	    	
	    	var fileDownLink = document.createElement("input");
	    	fileDownLink.value = param.url;
	    	fileDownLink.name = "url";
	    	
	      	var idParam = document.createElement("input");
	      	idParam.value = param.id;
	      	idParam.name = "id";
	    	downForm.appendChild(fileName);
	    	downForm.appendChild(fileDownLink);
	    	downForm.appendChild(idParam);
	    	
	    	document.body.appendChild(iframe);
	    	document.body.appendChild(downForm);
	    	
	    	//主要解决IE请求链接在新窗口打开问题
	    	document.getElementById('hiddentAreaForDownLoad').contentWindow.name = 'hiddentAreaForDownLoad'; 
	    	downForm.submit();
	    },
	    downloadPanel_onAllDownload:function(){
	    	var nodes = treeObj.getSelectedNodes();
	    	var  name = nodes[0].name;
	    	var  id = nodes[0].id;
	    	var param = {
	   		        'id': id,
	   		        'name': name
	   		};
	   		 this.download(param,"downZipFile");
	    },
	    downloadPanel_onDelete:function(){
	    	var selectedIndex = this.downloadPanel.selectedRowIndex;
	    	var id = this.downloadPanel.rows[selectedIndex]["sc_doc_center.id"];
			var name = this.downloadPanel.rows[selectedIndex]["sc_doc_center.name"];
			var fileURL = this.downloadPanel.rows[selectedIndex]["sc_doc_center.url"];
	    	jQuery.ajax({
	            type: "POST",
	            async: false,
	            url: "/archibus/DocDownService.do?method=delete",
	            data:{name:name,id:id,fileURL:fileURL},
	            success:function(data){
	            	docController.downloadPanel.refresh();
	            }
	        });
	    },
	    treePanel_onDelete:function(){
	    	var nodes = treeObj.getSelectedNodes();
	    	var id = nodes[0].id;
	    	var pid=nodes[0].pid;
	    	var pNode=nodes[0].getParentNode();
	    	var name = nodes[0].name;
	    	
	    	jQuery.ajax({
	            type: "POST",
	            async: false,
	            url: "/archibus/DocDownService.do?method=deleteAll",
	            data:{name:name,id:id},
	            success:function(data){
	            	
	            if(arguments[2].responseText=="error"){
	            	View.alert("请先删除文件夹下的文件");
	            	return;
	            }	
	            if(pNode!=null)
	            {
	            	
	            		treeObj.reAsyncChildNodes(pNode, "refresh");
	            }else{
	            	    treeObj.reAsyncChildNodes("", "refresh");
	            }		
	            
//	            	treeObj.refresh();
//	                treeObj.expandAll(true);
	            },
	            error:function(){
	            	alert("该档案下存有文件");
	            }
	        });
	    }
});


