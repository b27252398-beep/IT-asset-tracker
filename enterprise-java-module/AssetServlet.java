package com.assettracker.servlets;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/assets")
public class AssetServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Authenticate user session
        if (request.getSession().getAttribute("userRole") == null) {
            response.sendRedirect("login.jsp");
            return;
        }

        List<String> assets = new ArrayList<>();
        try {
            Connection conn = DBConnection.getConnection();
            String sql = "SELECT name, status, assignedTo FROM Assets";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                assets.add(rs.getString("name") + " - " + rs.getString("status"));
            }
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        request.setAttribute("assetList", assets);
        request.getRequestDispatcher("assets.jsp").forward(request, response);
    }
}
