<template>
  <div id="viewDiv"></div>
</template>

<script>
import { loadModules } from "esri-loader";

export default {
  methods: {
    //创建地图
    _createMapView: function() {
      /* const _self = this; //定义一个_self防止后续操作中this丢失 */
      const option = {
        //定义一个包含有JS API中js开发包和css样式文件的对象
        url: "http://localhost/arcgis_4.9/init.js",
        css: "http://localhost/arcgis_4.9/esri/css/main.css"
      };

      //通过loadModules来做衔接
      loadModules(
        ["esri/Map", "esri/views/MapView", "esri/widgets/BasemapToggle"],
        option
      ).then(([Map, MapView, BasemapToggle]) => {
        //业务代码在此处编写
        const map = new Map({
          basemap: "topo"
        });

        const view = new MapView({
          //实例化地图视图
          container: "viewDiv",
          map: map,
          zoom: 13,
          center: [119.39842, 26.004367]
        });

        const toggle = new BasemapToggle({
          // 2 - Set properties
          view: view, // view that provides access to the map's 'topo' basemap
          nextBasemap: "hybrid" // allows for toggling to the 'hybrid' basemap
        });
        view.ui.add(toggle, "top-right");
      });
    }
  },
  mounted: function() {
    this._createMapView();
  }
};
</script>

<style scoped>
#viewDiv {
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
}
</style>