<?php

session_start();

if (!isset($_SESSION['account_loggedin'])) {
    header('Location: index.php');
    exit;
}
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,minimum-scale=1">
        <title>Playgground</title>
        <link href="style.css" rel="stylesheet" type="text/css">
        <link href="https://cdn.boxicons.com/fonts/basic/boxicons.min.css" rel="stylesheet">
    </head>
    <body>

        <header class="header">

            <div class="wrapper">

                <h1>KAVN Playground</h1>
                
                <nav class="menu">
                    <a href="home.php">Home</a>
                    <a href="logout.php">
                        <i class="bxr  bx-arrow-out-right-square-half"  ></i> 
                        Logout
                    </a>
                </nav>

            </div>

        </header>

        <div class="content">

            <div class="page-title">
                <div class="wrap">
                    <h2>Home</h2>
                    <p>Welcome back, <?=htmlspecialchars($_SESSION['account_name'], ENT_QUOTES)?>!</p>
                </div>
            </div>

            <div class="block">

                <p>You are logged in!</p>

            </div>
            
        </div>

    </body>
</html>