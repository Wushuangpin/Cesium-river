<template>
  <div id="viewDiv">
    <h1>{{qxdata.city}}</h1>
    <h2>{{qxdata.air_pm25}}</h2>
    <h2>{{qxdata.wea_img}}</h2>
    <img v-bind:src="qxdata.wea_img" />
    <iframe
      scrolling="no"
      src="https://tianqiapi.com/api.php?style=ta&skin=pitaya"
      frameborder="0"
      width="400"
      height="24"
      allowtransparency="true"
      cityid="101230101"
    ></iframe>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      qxdata: []
    };
  },
  mounted() {
    axios
      .get(
        "https://www.tianqiapi.com/api/?version=v6&cityid=101230101&appid=91169885&appsecret=lA5coWNy"
      )
      .then(res => {
        console.log(res.data);
        this.qxdata = res.data;
      });
  },
  methods: {}
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