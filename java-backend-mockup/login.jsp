<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*" %>
<!DOCTYPE html>
<html>
<head>
    <title>IT Asset Tracker - Login</title>
</head>
<body>
    <div class="login-box">
        <h2>System Login (Enterprise Java)</h2>
        <% 
            String errorMsg = (String) request.getAttribute("error");
            if (errorMsg != null) { 
        %>
            <p style="color:red;"><%= errorMsg %></p>
        <% } %>
        
        <form action="authenticate.jsp" method="post">
            <label>Username:</label>
            <input type="text" name="username" required />
            <br/>
            <label>Password:</label>
            <input type="password" name="password" required />
            <br/>
            <input type="submit" value="Login to IT Asset Tracker" />
        </form>
    </div>
</body>
</html>
