package com.archibus.service.school.house;

import java.net.*;
import java.security.*;
import java.util.Random;

/**
 * @author JX_NET
 */
public class RandomGUID extends Object {
    
    public String valueBeforeMD5 = "";
    
    public String valueAfterMD5 = "";
    
    private static Random myRand;
    
    private static SecureRandom mySecureRand;
    
    private static String s_id;
    
    /*
     * Static block to take care of one time secureRandom seed. It takes a few seconds to initialize
     * SecureRandom. You might want to consider removing this static block or replacing it with a
     * "time since first loaded" seed to reduce this time. This block will run only once per JVM
     * instance.
     */

    static {
        mySecureRand = new SecureRandom();
        final long secureInitializer = mySecureRand.nextLong();
        myRand = new Random(secureInitializer);
        try {
            s_id = InetAddress.getLocalHost().toString();
        } catch (final UnknownHostException e) {
            e.printStackTrace();
        }
        
    }
    
    /*
     * Default constructor. With no specification of security option, this constructor defaults to
     * lower security, high performance.
     */
    public RandomGUID() {
        getRandomGUID(false);
    }
    
    /*
     * Constructor with security option. Setting secure true enables each random number generated to
     * be cryptographically strong. Secure false defaults to the standard Random function seeded
     * with a single cryptographically strong random number.
     */
    public RandomGUID(final boolean secure) {
        getRandomGUID(secure);
    }
    
    /*
     * 随机生成GUID码
     */
    private void getRandomGUID(final boolean secure) {
        MessageDigest md5 = null;
        final StringBuffer sbValueBeforeMD5 = new StringBuffer();
        
        try {
            md5 = MessageDigest.getInstance("MD5");
        } catch (final NoSuchAlgorithmException e) {
            System.out.println("Error: " + e);
        }
        
        try {
            final long time = System.currentTimeMillis();
            long rand = 0;
            
            if (secure) {
                rand = mySecureRand.nextLong();
            } else {
                rand = myRand.nextLong();
            }
            
            // This StringBuffer can be a long as you need; the MD5
            // hash will always return 128 bits. You can change
            // the seed to include anything you want here.
            // You could even stream a file through the MD5 making
            // the odds of guessing it at least as great as that
            // of guessing the contents of the file!
            sbValueBeforeMD5.append(s_id);
            sbValueBeforeMD5.append(":");
            sbValueBeforeMD5.append(Long.toString(time));
            sbValueBeforeMD5.append(":");
            sbValueBeforeMD5.append(Long.toString(rand));
            
            this.valueBeforeMD5 = sbValueBeforeMD5.toString();
            md5.update(this.valueBeforeMD5.getBytes());
            
            final byte[] array = md5.digest();
            final StringBuffer sb = new StringBuffer();
            for (int j = 0; j < array.length; ++j) {
                final int b = array[j] & 0xFF;
                if (b < 0x10) {
                    sb.append('0');
                }
                sb.append(Integer.toHexString(b));
            }
            
            this.valueAfterMD5 = sb.toString();
            
        } catch (final Exception e) {
            System.out.println("Error:" + e);
        }
    }
    
    /*
     * 转换成标准的GUID码例如: C2FEEEAC-CFCD-11D1-8B05-00600806D9B6
     */
    @Override
    public String toString() {
        final String raw = this.valueAfterMD5.toUpperCase();
        final StringBuffer sb = new StringBuffer();
        /*
         * sb.append(raw.substring(0, 8)); sb.append("-"); sb.append(raw.substring(8, 12));
         * sb.append("-"); sb.append(raw.substring(12, 16)); sb.append("-");
         * sb.append(raw.substring(16, 20)); sb.append("-"); sb.append(raw.substring(20));
         */
        sb.append(raw);
        return sb.toString();
    }
    
}