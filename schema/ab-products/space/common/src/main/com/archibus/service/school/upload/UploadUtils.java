package com.archibus.service.school.upload;

import java.io.File;

import com.archibus.context.ContextStore;

public class UploadUtils {

    public UploadUtils() {
        
    }
    
    public  String getGraphicsFolderFullPath() {
        String graphicsFolder = ContextStore.get().getProject().getEnterpriseGraphicsFolder();
        return graphicsFolder;
    }
}
