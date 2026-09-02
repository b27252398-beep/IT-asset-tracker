<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.List" %>
<%
    // Ensure the user is logged in
    String userRole = (String) session.getAttribute("userRole");
    if (userRole == null) {
        response.sendRedirect("login.jsp");
        return;
    }
%>
<!DOCTYPE html>
<html>
<head>
    <title>Enterprise Dashboard</title>
    <link rel="stylesheet" type="text/css" href="styles.css">
</head>
<body>
    <div class="header">
        <h1>Welcome back, <%= session.getAttribute("username") %>!</h1>
        <p>Current Role: <%= userRole %></p>
    </div>

    <div class="content">
        <h2>Your System Overview</h2>
        <% if ("ADMIN".equals(userRole)) { %>
            <div class="admin-panel">
                <h3>Admin Controls</h3>
                <ul>
                    <li><a href="AssetServlet">Manage All Assets</a></li>
                    <li><a href="EmployeeServlet">Manage Employees</a></li>
                    <li><a href="report.jsp">Generate Financial Reports</a></li>
                </ul>
            </div>
        <% } else { %>
            <div class="staff-panel">
                <h3>Staff Quick Actions</h3>
                <a href="reportIssue.jsp">Report New Issue</a>
            </div>
        <% } %>
    </div>
</body>
</html>
