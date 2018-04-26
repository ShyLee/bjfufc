var ascDaikouBaopanController = View.createController('ascDaikouBaopanController', {
    year: null,
    month: null,
    
    afterViewLoad: function(){
        jQuery('#selectYear').get(0).options[0].selected = true;
        jQuery('#selectMonth').get(0).options[0].selected = true;
        this.zzf_fee_detail.addParameter("descBefore", "'代缴 '");
        this.zzf_fee_detail.addParameter("descAfter", "'的房租'");
        this.exportPanel.addParameter("descBefore", "'代缴 '");
        this.exportPanel.addParameter("descAfter", "'的房租'");
    },
 
    exportPanel_afterRefresh: function(){
        this.exportPanel.setTitle(this.year + "年-" + this.month + "月 房租交纳明细表");
        this.exportPanel.show(false);
    },
    console_panel_onShow: function(){
        var yearInput = jQuery('#selectYear option:selected').val();
        var monthInput = jQuery('#selectMonth option:selected').val();
        if (yearInput == "" || monthInput == "") {
            View.showMessage("请输入查询年月");
            return;
        }
        this.year = yearInput;
        this.month = monthInput;
        var restriction = new Ab.view.Restriction();
        if (trim(yearInput) != '' && trim(monthInput) != '') {
            restriction.addClause('sc_zzf_fee.year', yearInput);
            if (monthInput < 10) {
                monthInput = '0' + monthInput;
            }
            this.zzf_fee_detail.addParameter('cardYear',yearInput);
            this.zzf_fee_detail.addParameter('cardMonth',monthInput);
            restriction.addClause('sc_zzf_fee.month', monthInput);
            this.zzf_fee_detail.refresh(restriction);
            this.exportPanel.refresh(restriction);
            this.exportPanel.show(false);
        }
        else {
            this.zzf_fee_detail.refresh('1<>1');
            this.exportPanel.refresh('1<>1');
            this.exportPanel.refresh.show(false);
        }
    },
    console_panel_onClear: function(){
        jQuery('#selectYear').get(0).options[0].selected = true;
        jQuery('#selectMonth').get(0).options[0].selected = true;
        this.zzf_fee_detail.refresh('1<>1');
        this.zzf_fee_detail.show(false);
    }
    //获取到数据库里sc_zzfcard表
     
});

