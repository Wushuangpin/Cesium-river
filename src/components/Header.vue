<template>
  <div class="header">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
      id="head"
      router
    >
      <div class="headlogo">
        <img src="../assets/images/logo.png" class="img" />
        <span class="headtitle">{{prjname}}</span>
      </div>
       <el-menu-item index="/home">首页</el-menu-item>
      <el-menu-item index="/two">二维展示</el-menu-item>
      <el-menu-item index="2">三维展示</el-menu-item>
      <el-submenu index="3">
        <template slot="title">消息中心</template>
        <el-menu-item index="3-1">选项1</el-menu-item>
        <el-menu-item index="3-2">选项2</el-menu-item>
        <el-menu-item index="3-3">选项3</el-menu-item>
        <el-submenu index="3-4">
          <template slot="title">选项4</template>
          <el-menu-item index="3-4-1">选项1</el-menu-item>
          <el-menu-item index="3-4-2">选项2</el-menu-item>
          <el-menu-item index="3-4-3">选项3</el-menu-item>
        </el-submenu>
      </el-submenu>
      <el-menu-item index="/sql">数据库</el-menu-item>
    </el-menu>
    <!-- <router-view></router-view> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      prjname: "闽江流域虚拟地理环境系统",
      activeIndex: "1",
      activeIndex2: "1"
    };
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    }
  }
};
</script>
<style scoped>
.headtitle {
  font-family: STKaiti;
  font-size: 2rem;
  color: black;
  vertical-align: middle;
}
.item-text {
  color: white;
}
.headlogo {
  float: left;
  margin-left: 10px;
  margin-right: 350px;
}
.img {
  height: 55px;
  width: auto;
  margin-top: 2px;
  margin-right: 2rem;
  vertical-align: middle;
}
#head {
  background-image: url(../assets/images/bg.jpg);
  background-repeat: no-repeat;
  background-size: 100% 100%;
  -moz-background-size: 100% 100%;
}
</style>