<template>
  <div>
    <div v-html="message"></div>
  </div>
</template>
<script>
import axios from "axios";
export default {
  name: "your-component",
  data() {
    return {
      message:"",
    };
  },

  mounted() {},
  created() {
    this.getData();
  },
  methods: {
    getData() {
       let _this = this;
      axios
        .get("/login")
        .then(function(response) {
          console.log(response);
           _this.message = response.data;
          //response.data是返回请求的json对象
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }
};
</script>