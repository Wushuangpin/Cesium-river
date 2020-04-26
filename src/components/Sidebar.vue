<template>
  <div>
    <div>
      <!-- 导航栏 -->
      <el-menu
        default-active="/page1"
        class="el-menu-vertical-demo"
        :collapse="isCollapse"
        style="float:left;height: calc(100vh - 72px);"
        router
      >
        <el-submenu index="1">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span slot="title">导航一</span>
          </template>
          <el-menu-item-group>
            <span slot="title">分组一</span>
            <el-menu-item index="/page1">页面一</el-menu-item>
            <el-menu-item index="1-2">页面2</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group title="分组2">
            <el-menu-item index="1-3">选项3</el-menu-item>
          </el-menu-item-group>
          <el-submenu index="1-4">
            <span slot="title">选项4</span>
            <el-menu-item index="1-4-1">选项1</el-menu-item>
          </el-submenu>
        </el-submenu>
        <el-menu-item index="/page2">
          <i class="el-icon-menu"></i>
          <span slot="title">页面二</span>
        </el-menu-item>
        <el-menu-item index="/page3">
          <i class="el-icon-document"></i>
          <span slot="title">导航三</span>
        </el-menu-item>
        <el-menu-item index="/page4">
          <i class="el-icon-setting"></i>
          <span slot="title">导航四</span>
        </el-menu-item>
        <div class="toggle">
          <el-radio-group v-model="isCollapse" style="margin: 5px;" size="medium">
            <el-radio :label="false">展开</el-radio>
            <el-radio :label="true">收起</el-radio>
          </el-radio-group>
        </div>
      </el-menu>
      <el-main class="main">
        <router-view></router-view>
      </el-main>
    </div>
  </div>
</template>
<style scoped>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}

.main {
  margin-left: 1px;
  margin-right: 1px;
  padding: 0;
  border: 1px solid gray;
  width: auto;
  height: calc(100vh - 72px);
}
#view {
  height: 100%;
  width: 100%;
}
</style>

<script>
export default {
  data() {
    return {
      radio: "1",
      isCollapse: true
    };
  },
  methods: {}
};
</script>