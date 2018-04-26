jQuery().ready(function(){
    jQuery('#jianzhuArea').val('大于等于').css("color", "#ccc");
    jQuery('#jianzhuArea2').val('小于等于').css("color", "#ccc");
    jQuery('#shiyongArea').val('大于等于').css("color", "#ccc");
    jQuery('#shiyongArea2').val('小于等于').css("color", "#ccc");
    jQuery('#ruzhangTime').val('大于等于').css("color", "#ccc");
    jQuery('#ruzhangTime2').val('小于等于').css("color", "#ccc");
});

View.createController('ascBjUsmsOverallBlWholeController', {

    blId: "",
    
    ascBjUsmsOverallBlRm_blGrid_onClickItem: function(row){
        this.blId = row.record['bl.bl_id'];
        var restriction = new Ab.view.Restriction();
        restriction.addClause('rm.bl_id', this.blId, '=');
        this.ascBjUsmsOverallBlRm_rmGrid.refresh(restriction);
    },
    
    locationFilter_onMoreOptions: function(panel, action){
        var action = this.locationFilter.actions.get("moreOptions");
        this.locationFilterOptions.toggleCollapsed();
        action.setTitle(this.locationFilterOptions.collapsed ? "更多选项" : "隐藏");
        this.ascBjUsmsOverallBlRm_blGrid.updateHeight();
        
        jQuery('#jianzhuArea').focus(function(){
            var value = jQuery('#jianzhuArea').val();
            if (value == '大于等于') {
                jQuery('#jianzhuArea').val('').css("color", "#000000");
            }
        });
        jQuery('#jianzhuArea').blur(function(){
            var value = jQuery('#jianzhuArea').val();
            if (value == '') {
                jQuery('#jianzhuArea').val('大于等于').css("color", "#ccc");
            }
        });
        jQuery('#jianzhuArea2').focus(function(){
            var value = jQuery('#jianzhuArea2').val();
            if (value == '小于等于') {
                jQuery('#jianzhuArea2').val('').css("color", "#000000");
            }
        });
        jQuery('#jianzhuArea2').blur(function(){
            var value = jQuery('#jianzhuArea2').val();
            if (value == '') {
                jQuery('#jianzhuArea2').val('小于等于').css("color", "#ccc");
            }
        });
        
        jQuery('#shiyongArea').focus(function(){
            var value = jQuery('#shiyongArea').val();
            if (value == '大于等于') {
                jQuery('#shiyongArea').val('').css("color", "#000000");
            }
        });
        jQuery('#shiyongArea').blur(function(){
            var value = jQuery('#shiyongArea').val();
            if (value == '') {
                jQuery('#shiyongArea').val('大于等于').css("color", "#ccc");
            }
        });
        jQuery('#shiyongArea2').focus(function(){
            var value = jQuery('#shiyongArea2').val();
            if (value == '小于等于') {
                jQuery('#shiyongArea2').val('').css("color", "#000000");
            }
        });
        jQuery('#shiyongArea2').blur(function(){
            var value = jQuery('#shiyongArea2').val();
            if (value == '') {
                jQuery('#shiyongArea2').val('小于等于').css("color", "#ccc");
            }
        });
        
        jQuery('#ruzhangTime').focus(function(){
            var value = jQuery('#ruzhangTime').val();
            if (value == '大于等于') {
                jQuery('#ruzhangTime').val('').css("color", "#000000");
            }
        });
        jQuery('#ruzhangTime').blur(function(){
            var value = jQuery('#ruzhangTime').val();
            if (value == '') {
                jQuery('#ruzhangTime').val('大于等于').css("color", "#ccc");
            }
        });
        jQuery('#ruzhangTime2').focus(function(){
            var value = jQuery('#ruzhangTime2').val();
            if (value == '小于等于') {
                jQuery('#ruzhangTime2').val('').css("color", "#000000");
            }
        });
        jQuery('#ruzhangTime2').blur(function(){
            var value = jQuery('#ruzhangTime2').val();
            if (value == '') {
                jQuery('#ruzhangTime2').val('小于等于').css("color", "#ccc");
            }
        })
    },
    
    locationFilter_onClearLocations: function(){
        this.locationFilter.clear();
        
        $('occupancyWithJianzhuArea').checked = false;
        $('occupancyWithShiyongArea').checked = false;
        $('occupancyWithRuzhangTime').checked = false;
        jQuery('#jianzhuArea').val('大于等于').css("color", "#ccc");
        jQuery('#jianzhuArea2').val('小于等于').css("color", "#ccc");
        jQuery('#shiyongArea').val('大于等于').css("color", "#ccc");
        jQuery('#shiyongArea2').val('小于等于').css("color", "#ccc");
        jQuery('#ruzhangTime').val('大于等于').css("color", "#ccc");
        jQuery('#ruzhangTime2').val('小于等于').css("color", "#ccc");
        
        var restriction = new Ab.view.Restriction();
        this.ascBjUsmsOverallBlRm_blGrid.refresh(restriction);
    },
    
    locationFilter_onFilterLocations: function(){
        var siteId = this.locationFilter.getFieldValue('bl.site_id');
        var blId = this.locationFilter.getFieldValue('bl.bl_id');
		var use = this.locationFilter.getFieldValue('bl.use1');
        var jzAreaMin = jQuery('#jianzhuArea').val();
        var jzAreaMax = jQuery('#jianzhuArea2').val();
        var syAreaMin = jQuery('#shiyongArea').val();
        var syAreaMax = jQuery('#shiyongArea2').val();
        var rzTimeMin = jQuery('#ruzhangTime').val();
        var rzTimeMax = jQuery('#ruzhangTime2').val();
        var restriction = new Ab.view.Restriction();
        
        if (siteId != '') {
            restriction.addClause('bl.site_id', siteId, '=');
        }
        if (blId != '') {
            restriction.addClause('bl.bl_id', blId, '=');
        }
        if (use != '') {
            restriction.addClause('bl.use1', blId, '=');
        }
        if ($('occupancyWithJianzhuArea').checked) {
            if (jzAreaMin != '' && jzAreaMin != '大于等于') {
                restriction.addClause('bl.area_building_manual', jzAreaMin, '&gt;=');
            }
            if (jzAreaMax != '' && jzAreaMax != '小于等于') {
                restriction.addClause('bl.area_building_manual', jzAreaMax, '&lt;=');
            }
        }
        if ($('occupancyWithShiyongArea').checked) {
        
            if (syAreaMin != '' && syAreaMin != '大于等于') {
                restriction.addClause('bl.area_rm', syAreaMin, '&gt;=');
            }
            if (syAreaMax != '' && syAreaMax != '小于等于') {
                restriction.addClause('bl.area_rm', syAreaMax, '&lt;=');
            }
        }
        if ($('occupancyWithRuzhangTime').checked) {
            if (rzTimeMin != '' && rzTimeMin != '大于等于') {
                restriction.addClause('bl.date_use', rzTimeMin + '-1-1', '&gt;=');
            }
            if (rzTimeMax != '' && rzTimeMax != '小于等于') {
                restriction.addClause('bl.date_use', rzTimeMax + '-12-31', '&lt;=');
            }
        }
        
        this.ascBjUsmsOverallBlRm_blGrid.refresh(restriction);
    },

});


