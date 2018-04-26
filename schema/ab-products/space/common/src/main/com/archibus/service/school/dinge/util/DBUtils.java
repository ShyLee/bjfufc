package com.archibus.service.school.dinge.util;

import java.math.*;

public class DBUtils {
    /**
     * 加法运算
     * 
     * @param d1
     * @param d2
     * @return
     */
    public static double add(double d1, double d2) {
        BigDecimal b1 = new BigDecimal(d1);
        BigDecimal b2 = new BigDecimal(d2);
        return b1.add(b2).doubleValue();
    }
    
    /**
     * 减法运算
     * 
     * @param d1
     * @param d2
     * @return
     */
    public static double sub(double d1, double d2) {
        BigDecimal b1 = new BigDecimal(d1);
        BigDecimal b2 = new BigDecimal(d2);
        return b1.subtract(b2).doubleValue();
    }
    
    /**
     * 乘法运算
     * 
     * @param d1
     * @param d2
     * @return
     */
    public static double mul(double d1, double d2) {
        BigDecimal b1 = new BigDecimal(d1);
        BigDecimal b2 = new BigDecimal(d2);
        return b1.multiply(b2).doubleValue();
    }
    
    /**
     * 除法运算
     * 
     * @param d1
     * @param d2
     * @return
     */
    public double div(double d1, double d2) {
        MathContext mc = new MathContext(6, RoundingMode.HALF_DOWN);
        BigDecimal b1 = new BigDecimal(d1);
        BigDecimal b2 = new BigDecimal(d2);
        return b1.divide(b2, mc).doubleValue();
    }
    
}
