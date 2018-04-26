package com.archibus.service.space.notification;

import com.archibus.datasource.SqlUtils;

public class ExpirationNotification {
    final String ZZF_FEE = "bh_zzf_fees";
    
    public void invoke() {
        this.zzfNotification();
    }
    
    private void zzfNotification() {
        // --到期提醒sql trunc(end_date-sysdate) <=0 合同超期 <=30和快到期
        final String sql1 =
                "update bh_zzf_fees "
                        + "set color=(case when trunc(should_fees_date-sysdate)<=0 then '14 0 1 16711680'"
                        + "when  trunc(should_fees_date-sysdate)<=30 then '14 0 7 16763955'"
                        + "else '' end)";
        // --到期提醒sql 合同到期, 此处并未判断合同是否到期
        final String sql2 =
                "update bh_zzf_fees set color = '14 0 5 255'"
                        + " where bh_zzf_fees.protocal_id in ("
                        + " select protocal_id from bh_zzf_protocal where bh_zzf_protocal.date_end < sysdate)";
        
        SqlUtils.executeUpdate(this.ZZF_FEE, sql1);
        SqlUtils.executeUpdate(this.ZZF_FEE, sql2);
    }
    
}
