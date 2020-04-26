<?php

define('XIU_DB_HOST', 'localhost');
/**
 * 数据库用户名
 */
define('XIU_DB_USER', 'root');
/**
 * 数据库密码
 */
define('XIU_DB_PASS', '');
/**
 * 数据库名字
 */
define('XIU_DB_NAME', 'gucuo');

//给用户找一个箱子 (如果你之前有就用之前的，没有就找一个)
session_start();


function login()
{
  //1.接收检验
  //2.持久化
  //3.响应
  if (empty($_POST['email'])) {
    $GLOBALS['message'] = '请填写邮箱地址';
    return;
  }
  if (empty($_POST['password'])) {
    $GLOBALS['message'] = '请输入密码';
    return;
  }

  $email = $_POST['email'];
  $password = $_POST['password'];

  //当客户端提交过来的完整的表单信息就应该开始对其进行数据检验

  $conn = mysqli_connect(XIU_DB_HOST, XIU_DB_USER, XIU_DB_PASS, XIU_DB_NAME);
  if (!$conn) {
    exit('<h1>连接数据库失败</h1>');
  }
  $query = mysqli_query($conn, "select * from admin where email = '{$email}' limit 1 ;");
  if (!$query) {
    $GLOBALS['message'] = '登录失败，请重试';
    return;
  }
  $admin = mysqli_fetch_assoc($query);
  var_dump($admin);
  if (!$admin) {
    //用户名不存在
    $GLOBALS['message'] = '用户信息不存在';
    return;
  }
  //一般密码是加密处理的
  echo md5($password);
  if ($admin['password'] !== $password) {
    $GLOBALS['message'] = '邮箱与密码不匹配';
    return;
  }

  //把用户信息装在箱子
  $_SESSION['current_login_admin'] = $admin;
  header('Location: /manage.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  login();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'logout') {
  unset($_SESSION['current_login_admin']);
}

?>
<!DOCTYPE html>
<html lang="zh-CN">

<head>
  <meta charset="utf-8">
  <title>验证界面</title>
  <link rel="stylesheet" href="../assets/css/bootstrap.css">
  <link rel="stylesheet" href="../assets/css/admin.css">
  <link rel="stylesheet" href="../assets/css/animate.min.css">
  <script src="../assets/js/nprogress.js"></script>
  <script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
</head>

<body>
  <div class="login">
    <!-- 可以通过在 form 上添加 novalidate 浏览器自带的校验功能-->
    <form class="login-wrap<?php echo isset($message) ? ' shake animated' : '' ?>" action="<?php $_SERVER['PHP_SELF'] ?>" method="post" autocomplete="off" novalidate>
      <img class="avatar" src="/images/project-7.jpg">
      <!-- 有错误信息时展示 -->
      <?php if (isset($message)) : ?>
        <div class="alert alert-danger">
          <strong>错误！</strong> <?php echo $message ?>
        </div>
      <?php endif ?>
      <div class="form-group">
        <label for="email" class="sr-only">账号</label>
        <input id="email" name="email" value="<?php echo empty($_POST['email']) ? '' : $_POST['email'] ?>" type="email" class="form-control" placeholder="账号" autofocus>
      </div>
      <div class="form-group">
        <label for="password" class="sr-only">密码</label>
        <input id="password" name="password" type="password" class="form-control" placeholder="密码">
      </div>
      <button class="btn btn-primary btn-block">验证</button>
    </form>
  </div>
  <script>
    //头像回调
    $(function($) {
      var myemail = null;
      var emailFormat = /^[0-9a-zA-Z_.-]+[@][0-9a-zA-Z.-]+([.][a-zA-Z]+){1,2}$/
      $('#email').on('blur', function() {
        var value = $(this).val()
        if (!value || !emailFormat.test(value)) return
        if (myemail !== value) {
          $.get('./php/avatar.php', {
            email: value
          }, function(res) {
            $('.avatar').fadeOut(function() {
              $(this).on('load', function() {
                $(this).fadeIn()
                myemail = value
              }).attr('src', res)
            })
          })
        }
      })
    })
  </script>
  <script>
    // nprogress
    $(document)
      .ajaxStart(function() {
        NProgress.start()
      })
      .ajaxStop(function() {
        NProgress.done()
      })
  </script>
</body>

</html>