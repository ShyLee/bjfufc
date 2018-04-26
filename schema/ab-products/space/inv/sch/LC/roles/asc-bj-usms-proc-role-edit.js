var ascBjUsmsDefineApproveRoleController = View.createController("ascBjUsmsDefineApproveRoleController", {

    panel_roles_afterRefresh: function(){
        var role = this.panel_roles.getFieldValue('helpdesk_roles.role');
        if (!role) {
            this.panel_roles.setFieldValue('helpdesk_roles.step_type', 'approval');
            this.panel_roles.setFieldValue('helpdesk_roles.class', 'com.archibus.service.school.lc.RoleLookUp');
        }
        else {
            refreshEnployeeList();
        }
    },
    
    grid_roles_em_onAdd: function(){
        var role = this.panel_roles.getFieldValue('helpdesk_roles.role');
        if (role) {
            this.grid_em.addParameter('role', role);
            this.grid_em.refresh();
            this.grid_em.showInWindow({
                width: 1200,
                height: 600
            });
        }
        
    }
});

function addEmployee(){
    var records = ascBjUsmsDefineApproveRoleController.grid_em.getSelectedRecords();
    var role = ascBjUsmsDefineApproveRoleController.panel_roles.getFieldValue('helpdesk_roles.role');
    for (var i = 0; i < records.length; i++) {
        var newRcord = new Ab.data.Record();
        newRcord.setValue("sc_role_em.em_id", records[i].getValue('em.em_id'));
        newRcord.setValue("sc_role_em.role", role);
        newRcord.setValue("sc_role_em.dv_id", records[i].getValue('em.dv_id'));
        ascBjUsmsDefineApproveRoleController.grid_roles_em_DS.saveRecord(newRcord);
    }
    
    ascBjUsmsDefineApproveRoleController.grid_em.closeWindow();
    refreshEnployeeList();
}

function refreshEnployeeList(){
    var role = ascBjUsmsDefineApproveRoleController.panel_roles.getFieldValue('helpdesk_roles.role');
    var restriction = new Ab.view.Restriction();
    restriction.addClause('sc_role_em.role', role, '=');
    ascBjUsmsDefineApproveRoleController.grid_roles_em.refresh(restriction);
}
