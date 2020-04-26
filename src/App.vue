<template>
  <div id="app">
    <appheader class="appheader"></appheader>
    <hr style="margin-top: 2px;margin-bottom: 2px;border-top: 2px solid rgb(226, 240, 243);" />
    <router-view></router-view>
    <!-- <mainbody class="mainbody"></mainbody> -->
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
export default {
  data() {
    return {};
  },
  name: "App",
  components: {
    appheader: Header,
    mainbody: Sidebar
  },
  methods: {}
};
</script>


<style scoped>

</style>