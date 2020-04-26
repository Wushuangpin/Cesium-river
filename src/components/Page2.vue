<template>
  <div id="map">
    <cesium-draw ref="drawManager"></cesium-draw>
  </div>
</template>
<script>
import cesiumDrawViewer from "cesium-draw/dist/cesiumdrawViewer.umd";
import "cesium-draw/dist/theme/default.css";
//import 'cesium-draw/dist/theme/dark.css'
export default {
  name: "your-component",
  data() {
    return {
      viewer: null
    };
  },
  components: {
    "cesium-draw": cesiumDrawViewer
  },
  mounted() {
    Cesium.Ion.defaultAccessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNWI1NzljMC1kZGJhLTRkMjctYWU2Ny0wZTAxNjJkZjk5NWMiLCJpZCI6MjM1ODIsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1ODM2NjAyMTZ9.2_oIp9B-rlPPvgIBCJP3adv-AVBCf697M36h1m2QBGk";
    const viewer = new Cesium.Viewer("map");
    this.$refs.drawManager.init(viewer);
  }
};
</script>