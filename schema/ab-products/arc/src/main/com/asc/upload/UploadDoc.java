package com.asc.upload;

import java.io.*;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.Date;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.sql.DataSource;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.*;

import com.alibaba.fastjson.JSONObject;
import com.archibus.utility.ExceptionBase;
import com.asc.data.DbUtils;

public class UploadDoc extends HttpServlet {
    private String baseDir = null;
    
    String realPath = null;
    
    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        this.baseDir = File.separator + "upload" + File.separator + "doc";
        this.realPath = getServletContext().getRealPath(this.baseDir);
        
    }
    
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        PrintWriter out = response.getWriter();
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
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("text/html; charset=utf-8");
        
        String method = request.getParameter("method");
        
        if (method.equals("getTreeNode")) {
            try {
                this.getTreeNode(request, response);
            } catch (SQLException e) {
                e.printStackTrace();
            } catch (Exception e) {
            }
        }
        
        if (method.equals("addFolder")) {
            try {
                this.addFolder(request, response);
            } catch (Exception e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            } finally {
                
            }
        }
    }
    
    public void getTreeNode(HttpServletRequest request, HttpServletResponse response)
            throws SQLException, Exception {
        
        DataSource ds = DbUtils.getDataSource();
        QueryRunner query = new QueryRunner(ds);
        /**
         * type=0 在数据库中表示一个文件夹 、 1 表示文件
         */
        String restriction = "where pid='root' and type=0";
        String id = request.getParameter("id");
        if (id != null && !"".equals(id)) {
            restriction = "where pid = '" + id + "' and type=0";
        }
        
        List<TreeItem> lists =
                query.query("select id,pid,name,type  from sc_doc_center " + restriction,
                    new BeanListHandler<TreeItem>(TreeItem.class));
        
        for (TreeItem item : lists) {
            item.setIsParent("true");
        }
        String json = JSONObject.toJSON(lists).toString();
        PrintWriter writer = response.getWriter();
        writer.write(json);
    }
    
    public void addFolder(HttpServletRequest request, HttpServletResponse response)
            throws Exception {
        String name = request.getParameter("name");
        String pid = request.getParameter("pid");
        Connection conn = DbUtils.getConnection();
        QueryRunner query = new QueryRunner();
        String id = DocUtils.generateId();
        String url = "";
        if (!"".equals(pid)) {
            String purl = getParentURL(pid);
            url = purl + File.separator + id;
        } else {
            pid = "root";
            url = File.separator + id;
        }
        
        String sql = "insert into sc_doc_center(id,pid,type,name,url) values(?,?,?,?,?)";
        
        query.update(conn, sql, id, pid, 0, name, url);
        conn.commit();
        conn.close();
        this.makeDir(url);
        PrintWriter writer = response.getWriter();
        writer.write(id);
    }
    
    private String makeDir(String subFolder) {
        String path = this.realPath + subFolder;
        final File logFile = new File(path);
        if (!logFile.exists()) {
            try {
                logFile.mkdirs();
            } catch (final SecurityException e) {
                throw new ExceptionBase(null, e.getMessage(), e);
            }
        }
        return path;
    }
    

    
    private String getParentURL(String pid) throws SQLException {
        DataSource ds = DbUtils.getDataSource();
        QueryRunner query = new QueryRunner(ds);
        
        Map map =
                query.query("select url from sc_doc_center  where id = '" + pid + "'",
                    new MapHandler());
        String url = (String) map.get("url");
        if (url == null) {
            return "";
        }
        return url;
    }
}
