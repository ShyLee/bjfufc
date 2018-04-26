var loggedInUsersController = View.createController('loggedInUsers', {

    afterInitialDataFetch : function() {
		this.loggedInUsersGrid_onRefresh();
		this.loggedInUsersGrid.removeSorting();
    },  

    loggedInUsersGrid_onRefresh : function() {
        var controller = this;
        AdminService.getAllUserSessions({
            callback: function(result) {
        		controller.displayUsers(result);
            },
            errorHandler: function(m, e) {
                View.showException(e);
            }
        });
    },
    
    displayUsers : function(result) {
		for (var i = 0; i < result.length; i++) {
			this.displayUser(result[i]);
		}
    	this.loggedInUsersGrid.update();
        this.loggedInUsersGrid.appendTitle(this.loggedInUsersGrid.gridRows.length);
    },
    
    displayUser : function(user) {
    	var user_name = user.name;
    	var role_name = user.role;
    	var email = user.email;
    	var location = user.employee.space.buildingId + '-' + user.employee.space.roomId + '-' + user.employee.space.floorId;
    	var division = user.employee.organization.divisionId;
    	var department = user.employee.organization.departmentId;
    	var employee_number = user.employee.number;
    	var record = new Ab.data.Record({
    	    'afm_users.user_name': user_name,
    	    'afm_users.role_name': role_name,
    	    'afm_users.email': email,
    	    'afm_users.location': location,
    	    'afm_users.division': division,
    	    'afm_users.department': department,
    	    'afm_users.employee_number': employee_number});
    	this.loggedInUsersGrid.addGridRow(record);
    }
});

