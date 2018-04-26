jQuery(function() {
	var defaultUploadFolder = "employee";
	jQuery("input[name=fileType]:radio").bind("change", function() {
		defaultUploadFolder = jQuery(this).val();
	});
	jQuery("#uploadify").uploadify({
		swf : "/archibus/schema/ab-core/libraries/uploadify/uploadify.swf",
		uploader : "/archibus/PhotoUploadService.do",
		buttonImg : "/archibus/schema/ab-core/libraries/uploadify/cancel.png",
		cancelImg : "/archibus/schema/ab-core/libraries/uploadify/cancel.png",
		auto : true,
		fileSizeLimit : 2048,
		queueID : "fileQueue",
		queueSizeLimit : 100,
		fileTypeDesc : "请上传图片文件格式",
		fileTypeExts : "*.gif; *.jpg; *.png;*.bmp",
		method : "get",
		multi : true,
		buttonText : "选择要上传的图片",
		onUploadStart : function(file) {
			jQuery("#uploadify").uploadify("settings", "formData", {
				defaultUploadFolder : defaultUploadFolder
			});
		},
		onUploadSuccess : function(file, data, response) {
		},
		onQueueComplete : function() {
		}
	});
});