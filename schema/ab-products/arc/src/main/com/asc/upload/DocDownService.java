package com.asc.upload;

import java.io.*;
import java.net.URLEncoder;
import java.sql.*;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.*;
import javax.sql.DataSource;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.MapHandler;
import org.apache.tools.zip.*;

import com.asc.data.DbUtils;

public class DocDownService extends HttpServlet{
    
    private static final long serialVersionUID = 1L;
//    String path = null;
    UploadDoc doc = new UploadDoc();
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
            IOException {
        // TODO Auto-generated method stub
        resp.setContentType("text/html;charset=UTF-8");
        final PrintWriter out = resp.getWriter();
        out.println("<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\">");
        out.println("<HTML>");
        out.println("  <HEAD><TITLE>A Servlet</TITLE></HEAD>");
        out.println("  <BODY>");
        out.print("不支持get上传");
        out.println("  </BODY>");
        out.println("</HTML>");
        out.flush();
        out.close();
    }
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        // TODO Auto-generated method stub
        req.setCharacterEncoding("UTF-8");
        resp.setCharacterEncoding("UTF-8");
        resp.reset();//可以加也可以不加
        String method = req.getParameter("method");
        if(method.equals("downOneFile")){
            try {
                this.downOneFile(req, resp);
            } catch (Exception e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        if(method.equals("downZipFile")){
            try {
                this.downZipFile(req, resp);
            } catch (Exception e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        if(method.equals("delete")){
            try {
                this.delete(req, resp);
            } catch (Exception e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        if(method.equals("deleteAll")){
            try {
                this.deleteAll(req, resp);
            } catch (Exception e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
    }
    
    public void downOneFile(HttpServletRequest req, HttpServletResponse resp) throws Exception{
        String path = req.getContextPath();
        String basePath = req.getScheme() + "://"
                + req.getServerName() + ":" + req.getServerPort()
                + path + "/";
        String name = req.getParameter("name");
        String url=req.getParameter("url");
        
        String filedownload =req.getRealPath("/upload/doc"+url);
        String extName=name.substring(name.lastIndexOf(".") + 1);
        
        resp.setContentType("application/octet-stream");
        
        String filedisplay=URLEncoder.encode(name, "UTF-8");
        if(req.getHeader("USER-AGENT").toLowerCase().indexOf("firefox")>=0){
            String local=req.getLocale().toString();
            filedisplay=new String(name.getBytes("UTF-8"),"ISO8859-1");
        }
        resp.addHeader("Content-Disposition", "attachment;filename="
                + filedisplay );
        java.io.OutputStream outp = null;
        java.io.FileInputStream in = null;
        try {
            outp = resp.getOutputStream();
            in = new FileInputStream(filedownload);

            byte[] b = new byte[1024];
            int i = 0;

            while ((i = in.read(b)) > 0) {
                outp.write(b, 0, i);
            }
            outp.flush();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (in != null) {
                in.close();
                in = null;
            }
        }
    }
    
    public void down(HttpServletRequest req, HttpServletResponse resp,String filePath,String name) throws Exception{
        String filedownload =filePath;
        resp.setContentType("application/octet-stream");
        String filedisplay=URLEncoder.encode(name, "UTF-8");
        if(req.getHeader("USER-AGENT").toLowerCase().indexOf("firefox")>=0){
            String local=req.getLocale().toString();
            filedisplay=new String(name.getBytes("UTF-8"),"ISO8859-1");
        }
        resp.addHeader("Content-Disposition", "attachment;filename="
                + filedisplay );
        java.io.OutputStream outp = null;
        java.io.FileInputStream in = null;
        try {
            outp = resp.getOutputStream();
            in = new FileInputStream(filedownload);

            byte[] b = new byte[1024];
            int i = 0;

            while ((i = in.read(b)) > 0) {
                outp.write(b, 0, i);
            }
            outp.flush();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (in != null) {
                in.close();
                in = null;
            }
        }
    }
    
    public void downZipFile(HttpServletRequest req, HttpServletResponse resp) throws SQLException{
        String name = req.getParameter("name");
        String zipFileId = req.getParameter("id");
        String zipFileURL = getURL(zipFileId);
        byte[] buffer = new byte[1024];    
        try { 
            String path="upload"+File.separator+"doc"+zipFileURL;
            String realPath=req.getRealPath(path);
            
            File inputFile=new File(realPath);
            String zipFileName=req.getRealPath("upload"+File.separator+"doc")+File.separator+"temp"+File.separator+name+".zip";
            org.apache.tools.zip.ZipOutputStream out = new org.apache.tools.zip.ZipOutputStream(new FileOutputStream(zipFileName));  
            zip(out, inputFile,"");  
            out.close();    
            this.down(req, resp, zipFileName, name+".zip");
       
        } catch (Exception e) {    
        }    
    } 
    
    private void zip(org.apache.tools.zip.ZipOutputStream out, File f, String base) throws Exception {  
        if (f.isDirectory()) {  
                   zipDirectory(out, f, base);
                   
               }else{
                   zipFile(out, f, base);
               }
    }  
    private void zipDirectory(org.apache.tools.zip.ZipOutputStream out, File dir, String basedir) throws Exception {
        // TODO Auto-generated method stub
        if (!dir.exists()){  
            return;    
       }  
            
       File[] files = dir.listFiles();    
       for (int i = 0; i < files.length; i++) {    
           /* 递归 */    
           zip(out, files[i], basedir + dir.getName() + "/");    
       }    
    }
    private void zipFile(org.apache.tools.zip.ZipOutputStream out, File file, String base) throws IOException {
        ZipEntry entry = new  org.apache.tools.zip.ZipEntry(base + file.getName());
        out.putNextEntry(entry);
        InputStream is = new FileInputStream(file);
        int BUFFERSIZE = 2 << 10;
        int length = 0; 
        byte[] buffer = new byte[BUFFERSIZE];
        while ((length = is.read(buffer, 0, BUFFERSIZE)) >= 0) {
                     out.write(buffer, 0, length);
       }
        out.flush();
        out.closeEntry();
        is.close();
    }
    private String getURL(String id) throws SQLException {
        DataSource ds = DbUtils.getDataSource();
        QueryRunner query = new QueryRunner(ds);
        
        Map map =
                query.query("select url from sc_doc_center  where id = '" + id + "'",
                    new MapHandler());
        String url = (String) map.get("url");
        if (url == null) {
            return "";
        }
        return url;
    }
    public void delete(HttpServletRequest req, HttpServletResponse resp) throws Exception{
        String name = req.getParameter("name");
        String id = req.getParameter("id");
        String fileURL = req.getParameter("fileURL");
        String path="upload"+File.separator+"doc"+fileURL;
        String realPath=req.getRealPath(path);
        File file = new File(realPath);
        if (file.isFile() && file.exists()) {  
            file.delete();  
        }
        Connection conn = DbUtils.getConnection();
        QueryRunner query = new QueryRunner(); 
        String sql = "delete from sc_doc_center where id =" + id;
        query.update(conn, sql);
        conn.commit();
        conn.close();
    }
    public void deleteAll(HttpServletRequest req, HttpServletResponse resp) throws Exception{
        String id = req.getParameter("id");
        String name = req.getParameter("name");
        String url = getURL(id);
        String path = "upload"+File.separator+"doc"+url;
        String realPath = req.getRealPath(path);
        File dirFile = new File(realPath);
        File[] files = dirFile.listFiles();  
        if(files.length != 0 ){
            PrintWriter writer = resp.getWriter();
            writer.write("error");
            return;
        }else{
            dirFile.delete();
//            doc.getTreeNode(req, resp);
            Connection conn = DbUtils.getConnection();
            QueryRunner query = new QueryRunner(); 
            String sql = "delete from sc_doc_center where id =" + id;
            query.update(conn, sql);
            conn.commit();
            conn.close();
        }
      
    }
}
