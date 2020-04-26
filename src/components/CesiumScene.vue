<template>
  <div id="cesiumContainer">
    <cesium-draw ref="drawManager" class="draw" :extendMarkerImage="images"></cesium-draw>
    <div class="icon-warp">
      <transition name="fade">
        <i class="el-icon-arrow-left" @click="back()"></i>
      </transition>
    </div>
    <el-cascader
      :options="options"
      :show-all-levels="false"
      clearable
      class="cascader"
      placeholder="工具箱"
      v-model="selectedOptions"
      @change="select"
      size="medium"
      collapse-tags
      :props="props"
      filterable
    ></el-cascader>
    <div class="position">
      中心经度：{{lon_center}}°
      中心纬度：{{lat_center}}°
      指针经度：{{lon_mouse}}°
      指针纬度：{{lat_mouse}}°
      当前视角高：{{alti_mouse}} km
      <button
        @click="move()"
      >move</button>
    </div>
  </div>
</template>

<script>
import { kkk } from "../assets/js/ex.js"; //注意路径
import cesiumDrawViewer from "cesium-draw/dist/cesiumdrawViewer.umd";
import "cesium-draw/dist/theme/default.css";
export default {
  name: "your-component",
  data() {
    return {
      viewer: null,
      images: [
        "../assets/images/home.png",
        "../assets/images/paper.png",
        "../assets/images/news.png",
        "../assets/images/index.png"
      ],
      measureIds: [],
      selectedOptions: "",
      options: [
        {
          value: "measure",
          label: "测量工具",
          children: [
            {
              value: "distance",
              label: "距离测量"
            },
            {
              value: "area",
              label: "面积测量",
              children: [
                {
                  value: "rectangular",
                  label: "矩形"
                },
                {
                  value: "polygon",
                  label: "多边形"
                },
                {
                  value: "circle",
                  label: "圆形"
                }
              ]
            },
            {
              value: "clear",
              label: "清除结果"
            }
          ]
        }
      ],
      props: {
        expandTrigger: "hover"
      },
      lon_center: 0,
      lat_center: 0,
      lon_mouse: 0,
      lat_mouse: 0,
      alti_mouse: 0
    };
  },
  components: {
    "cesium-draw": cesiumDrawViewer
  },
  methods: {
    move() {
      this.dis_measure();
    },
    back() {
      if (window.history.length <= 1) {
        this.$router.push({ path: "/" });
        return false;
      } else {
        this.$router.go(-1);
      }
    },
    select(evt) {
      console.log(evt);
      //alert(this.selectedOptions);
      if (evt[0] == "measure") {
        if (evt[1] == "distance") {
          this.dis_measure();
        }
        if (evt[1] == "area") {
          if (evt[2] == "rectangular") {
            alert("开始矩形面积测量");
          }
          if (evt[2] == "polygon") {
            this.area_measure();
          }
          if (evt[2] == "circle") {
            alert("开始圆面积测量");
          }
        }
        if (evt[1] == "clear") {
          this.clear();
        }
      }
    }
  },
  mounted() {
    const Cesium = window.Cesium;
    const _this = this;

    Cesium.Ion.defaultAccessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNWI1NzljMC1kZGJhLTRkMjctYWU2Ny0wZTAxNjJkZjk5NWMiLCJpZCI6MjM1ODIsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1ODM2NjAyMTZ9.2_oIp9B-rlPPvgIBCJP3adv-AVBCf697M36h1m2QBGk";

    const viewer = new Cesium.Viewer("cesiumContainer", {
      geocoder: false, //是否显示geocoder小器件，右上角查询按钮
      navigationHelpButton: false, //是否显示右上角的帮助按钮
      homeButton: false,
      baseLayerPicker:false,
      sceneModePicker: false,
      selectionIndicator: false,
      fullscreenElement: "cesiumContainer",
      /* imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
        url:
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
      }), */
      imageryProvider: new Cesium.UrlTemplateImageryProvider({
        url: "http://www.google.cn/maps/vt?lyrs=s@800&x={x}&y={y}&z={z}",
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        minimumLevel: 1,
        maximumLevel: 20
      }),
      terrainProvider: Cesium.createWorldTerrain()
      /* terrainProvider: new Cesium.CesiumTerrainProvider({
        url: Cesium.IonResource.fromAssetId(1),
        requestVertexNormals: true, //增加光线
        requestWaterMask: true // 增加水文
      }) */
    });
    this.$refs.drawManager.init(viewer);
    viewer._cesiumWidget._creditContainer.style.display = "none";

    //设置初始视角
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(119.2065, 26.0344, 2000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-50),
        roll: Cesium.Math.toRadians(0)
      }
    });

    //鼠标位置经纬度\视角高度实时显示
    var canvas = viewer.scene.canvas;
    var ellipsoid = viewer.scene.globe.ellipsoid;
    var handler = new Cesium.ScreenSpaceEventHandler(canvas);
    handler.setInputAction(function(movement) {
      //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标，返回球体表面的点
      var cartesian = viewer.camera.pickEllipsoid(
        movement.endPosition,
        ellipsoid
      );
      if (cartesian) {
        //将笛卡尔三维坐标转为地图坐标（弧度）
        var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(
          cartesian
        );
        //将地图坐标（弧度）转为十进制的度数
        var lat_String = Cesium.Math.toDegrees(cartographic.latitude).toFixed(
          5
        );
        var log_String = Cesium.Math.toDegrees(cartographic.longitude).toFixed(
          5
        );
        // 获取相机的海拔高度作为视角高度/km
        var alti_String = (
          viewer.camera.positionCartographic.height / 1000
        ).toFixed(2);

        _this.lon_mouse = log_String;
        _this.lat_mouse = lat_String;
        _this.alti_mouse = alti_String;
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    //中心点位置实时显示
    function viewchange() {
      var direction = viewer.camera._direction;
      var x = Cesium.Math.toDegrees(direction.x);
      var y = Cesium.Math.toDegrees(direction.y);
      var z = Cesium.Math.toDegrees(direction.z);

      var rectangle = viewer.camera.computeViewRectangle();
      var west = (rectangle.west / Math.PI) * 180;
      var north = (rectangle.north / Math.PI) * 180;
      var east = (rectangle.east / Math.PI) * 180;
      var south = (rectangle.south / Math.PI) * 180;
      var centerx = (west + east) / 2;
      var cnetery = (north + south) / 2;

      // 鉴于高德、leaflet获取的边界都是southwest和northeast字段来表示，本例保持一致性
      _this.lon_center = centerx.toFixed(5);
      _this.lat_center = cnetery.toFixed(5);
    }
    viewchange();
    // 禁止相机翻转到地下end
    var minPitch = -Cesium.Math.PI_OVER_TWO;
    var maxPitch = 0;
    var minHeight = 200;
    viewer.camera.changed.addEventListener(function() {
      viewchange();

      if (
        viewer.camera._suspendTerrainAdjustment &&
        viewer.scene.mode === Cesium.SceneMode.SCENE3D
      ) {
        viewer.camera._suspendTerrainAdjustment = false;
        viewer.camera._adjustHeightForTerrain();
      }

      // Keep camera in a reasonable pitch range
      var pitch = viewer.camera.pitch;
      if (pitch > maxPitch || pitch < minPitch) {
        viewer.scene.screenSpaceCameraController.enableTilt = false;
        // clamp the pitch
        if (pitch > maxPitch) {
          pitch = maxPitch;
        } else if (pitch < minPitch) {
          pitch = minPitch;
        }

        var destination = Cesium.Cartesian3.fromRadians(
          viewer.camera.positionCartographic.longitude,
          viewer.camera.positionCartographic.latitude,
          Math.max(viewer.camera.positionCartographic.height, minHeight)
        );
        viewer.camera.setView({
          destination: destination,
          orientation: { pitch: pitch }
        });
        viewer.scene.screenSpaceCameraController.enableTilt = true;
      }
    });

    this.dis_measure = function dis_measure() {
      viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
      );

      var handler = new Cesium.ScreenSpaceEventHandler(
        viewer.scene._imageryLayerCollection
      );
      var positions = [];
      var poly = null;
      var distance = 0;
      var cartesian = null;
      var floatingPoint;
      var labelPt;

      handler.setInputAction(function(movement) {
        let ray = viewer.camera.getPickRay(movement.endPosition);
        cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (!Cesium.defined(cartesian))
          //跳出地球时异常
          return;
        if (positions.length >= 2) {
          if (!Cesium.defined(poly)) {
            poly = new PolyLinePrimitive(positions);
          } else {
            positions.pop();
            positions.push(cartesian);
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      handler.setInputAction(function(movement) {
        let ray = viewer.camera.getPickRay(movement.position);
        cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (!Cesium.defined(cartesian))
          //跳出地球时异常
          return;

        if (positions.length == 0) {
          positions.push(cartesian.clone());
        }
        positions.push(cartesian);
        //记录鼠标单击时的节点位置，异步计算贴地距离
        labelPt = positions[positions.length - 1];

        if (positions.length > 2) {
          getSpaceDistance(positions);
        } else if (positions.length == 2) {
          //在三维场景中添加Label
          floatingPoint = viewer.entities.add({
            name: "空间距离",
            position: labelPt,
            point: {
              pixelSize: 5,
              color: Cesium.Color.RED,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2
            }
          });
          _this.measureIds.push(floatingPoint.id);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      handler.setInputAction(function(movement) {
        handler.destroy(); //关闭事件句柄
        handler = undefined;
        positions.pop(); //最后一个点无效
        if (positions.length == 1) viewer.entities.remove(floatingPoint);
        //记录测量工具状态
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

      var PolyLinePrimitive = (function() {
        function _(positions) {
          this.options = {
            name: "直线",
            polyline: {
              show: true,
              positions: [],
              material: Cesium.Color.CHARTREUSE,
              width: 5,
              clampToGround: true
            }
          };
          this.positions = positions;
          this._init();
        }

        _.prototype._init = function() {
          var _self = this;
          var _update = function() {
            return _self.positions;
          };
          //实时更新polyline.positions
          this.options.polyline.positions = new Cesium.CallbackProperty(
            _update,
            false
          );
          var addedEntity = viewer.entities.add(this.options);
          _this.measureIds.push(addedEntity.id);
        };

        return _;
      })();

      //空间两点距离计算函数
      function getSpaceDistance(positions) {
        //只计算最后一截，与前面累加
        //因move和鼠标左击事件，最后两个点坐标重复
        var i = positions.length - 3;
        var point1cartographic = Cesium.Cartographic.fromCartesian(
          positions[i]
        );
        var point2cartographic = Cesium.Cartographic.fromCartesian(
          positions[i + 1]
        );
        getTerrainDistance(point1cartographic, point2cartographic);
      }

      function getTerrainDistance(point1cartographic, point2cartographic) {
        var geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(point1cartographic, point2cartographic);
        var s = geodesic.surfaceDistance;
        var cartoPts = [point1cartographic];
        for (var jj = 1000; jj < s; jj += 1000) {
          //分段采样计算距离
          var cartoPt = geodesic.interpolateUsingSurfaceDistance(jj);
          //                console.log(cartoPt);
          cartoPts.push(cartoPt);
        }
        cartoPts.push(point2cartographic);
        //返回两点之间的距离
        var promise = Cesium.sampleTerrain(viewer.terrainProvider, 8, cartoPts);
        Cesium.when(promise, function(updatedPositions) {
          // positions height have been updated.
          // updatedPositions is just a reference to positions.
          for (var jj = 0; jj < updatedPositions.length - 1; jj++) {
            var geoD = new Cesium.EllipsoidGeodesic();
            geoD.setEndPoints(updatedPositions[jj], updatedPositions[jj + 1]);
            var innerS = geoD.surfaceDistance;
            innerS = Math.sqrt(
              Math.pow(innerS, 2) +
                Math.pow(
                  updatedPositions[jj + 1].height - updatedPositions[jj].height,
                  2
                )
            );
            distance += innerS;
          }

          //在三维场景中添加Label
          var textDisance = distance.toFixed(2) + "米";
          //console.log(labelPt.x+","+labelPt.y)
          if (distance > 10000)
            textDisance = (distance / 1000.0).toFixed(2) + "千米";
          floatingPoint = viewer.entities.add({
            name: "贴地距离",
            position: labelPt,
            point: {
              pixelSize: 5,
              color: Cesium.Color.RED,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2
            },
            label: {
              text: textDisance,
              font: "18px sans-serif",
              fillColor: Cesium.Color.GOLD,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(20, -20)
            }
          });
          _this.measureIds.push(floatingPoint.id);
        });
        return distance;
      }
    };
    this.area_measure = function area_measure() {
      // 取消双击事件-追踪该位置
      viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
      );
      // 鼠标事件
      handler = new Cesium.ScreenSpaceEventHandler(
        viewer.scene._imageryLayerCollection
      );
      var positions = [];
      var tempPoints = [];
      var polygon = null;
      // var tooltip = document.getElementById("toolTip");
      var cartesian = null;
      var floatingPoint; //浮动点
      // tooltip.style.display = "block";

      handler.setInputAction(function(movement) {
        // tooltip.style.left = movement.endPosition.x + 3 + "px";
        // tooltip.style.top = movement.endPosition.y - 25 + "px";
        // tooltip.innerHTML ='<p>单击开始，右击结束</p>';
        // cartesian = viewer.scene.pickPosition(movement.endPosition);
        let ray = viewer.camera.getPickRay(movement.endPosition);
        cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
        if (positions.length >= 2) {
          if (!Cesium.defined(polygon)) {
            polygon = new PolygonPrimitive(positions);
          } else {
            positions.pop();
            // cartesian.y += (1 + Math.random());
            positions.push(cartesian);
          }
          // tooltip.innerHTML='<p>'+distance+'米</p>';
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      handler.setInputAction(function(movement) {
        // tooltip.style.display = "none";
        // cartesian = viewer.scene.pickPosition(movement.position);
        let ray = viewer.camera.getPickRay(movement.position);
        cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        // cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
        if (positions.length == 0) {
          positions.push(cartesian.clone());
        }
        //positions.pop();
        positions.push(cartesian);
        //在三维场景中添加点
        var cartographic = Cesium.Cartographic.fromCartesian(
          positions[positions.length - 1]
        );
        var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
        var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
        var heightString = cartographic.height;
        tempPoints.push({
          lon: longitudeString,
          lat: latitudeString,
          hei: heightString
        });
        floatingPoint = viewer.entities.add({
          name: "多边形面积",
          position: positions[positions.length - 1],
          point: {
            pixelSize: 5,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          }
        });
        _this.measureIds.push(floatingPoint.id);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      handler.setInputAction(function(movement) {
        handler.destroy();
        positions.pop();
        //tempPoints.pop();
        // viewer.entities.remove(floatingPoint);
        // tooltip.style.display = "none";
        //在三维场景中添加点
        // var cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
        // var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
        // var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
        // var heightString = cartographic.height;
        // tempPoints.push({ lon: longitudeString, lat: latitudeString ,hei:heightString});

        var textArea = getArea(tempPoints) + "平方公里";
        floatingPoint = viewer.entities.add({
          name: "多边形面积",
          position: positions[positions.length - 1],
          // point : {
          //  pixelSize : 5,
          //  color : Cesium.Color.RED,
          //  outlineColor : Cesium.Color.WHITE,
          //  outlineWidth : 2,
          //  heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
          // },
          label: {
            text: textArea,
            font: "18px sans-serif",
            fillColor: Cesium.Color.GOLD,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(20, -20),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          }
        });
        _this.measureIds.push(floatingPoint.id);
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

      var radiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
      var degreesPerRadian = 180.0 / Math.PI; //弧度转化为角度

      //计算多边形面积
      function getArea(points) {
        var res = 0;
        //拆分三角曲面

        for (var i = 0; i < points.length - 2; i++) {
          var j = (i + 1) % points.length;
          var k = (i + 2) % points.length;
          var totalAngle = Angle(points[i], points[j], points[k]);

          var dis_temp1 = distance(positions[i], positions[j]);
          var dis_temp2 = distance(positions[j], positions[k]);
          res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle));
          console.log(res);
        }

        return (res / 1000000.0).toFixed(4);
      }

      /*角度*/
      function Angle(p1, p2, p3) {
        var bearing21 = Bearing(p2, p1);
        var bearing23 = Bearing(p2, p3);
        var angle = bearing21 - bearing23;
        if (angle < 0) {
          angle += 360;
        }
        return angle;
      }
      /*方向*/
      function Bearing(from, to) {
        var lat1 = from.lat * radiansPerDegree;
        var lon1 = from.lon * radiansPerDegree;
        var lat2 = to.lat * radiansPerDegree;
        var lon2 = to.lon * radiansPerDegree;
        var angle = -Math.atan2(
          Math.sin(lon1 - lon2) * Math.cos(lat2),
          Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
        );
        if (angle < 0) {
          angle += Math.PI * 2.0;
        }
        angle = angle * degreesPerRadian; //角度
        return angle;
      }

      var PolygonPrimitive = (function() {
        function _(positions) {
          this.options = {
            name: "多边形",
            polygon: {
              hierarchy: [],
              // perPositionHeight : true,
              material: Cesium.Color.GREEN.withAlpha(0.5)
              // heightReference:20000
            }
          };

          this.hierarchy = { positions };
          this._init();
        }

        _.prototype._init = function() {
          var _self = this;
          var _update = function() {
            return _self.hierarchy;
          };
          //实时更新polygon.hierarchy
          this.options.polygon.hierarchy = new Cesium.CallbackProperty(
            _update,
            false
          );
          polygon = viewer.entities.add(this.options);
          _this.measureIds.push(polygon.id);
        };

        return _;
      })();

      function distance(point1, point2) {
        var point1cartographic = Cesium.Cartographic.fromCartesian(point1);
        var point2cartographic = Cesium.Cartographic.fromCartesian(point2);
        /**根据经纬度计算出距离**/
        var geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(point1cartographic, point2cartographic);
        var s = geodesic.surfaceDistance;
        //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
        //返回两点之间的距离
        s = Math.sqrt(
          Math.pow(s, 2) +
            Math.pow(point2cartographic.height - point1cartographic.height, 2)
        );
        return s;
      }
    };
    this.clear = function clear() {
      /* viewer.entities.removeAll(); */
      for (var jj = 0; jj < _this.measureIds.length; jj++) {
        viewer.entities.removeById(_this.measureIds[jj]);
      }
      _this.measureIds.length = 0;
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#cesiumContainer {
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0px;
  top: 0px;
}
/* #cesiumContainer {
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
  z-index: 1;
} */
.position {
  position: absolute;
  bottom: 4%;
  left: 12.5%;
  z-index: 1;
  font-size: 15px;
  color: white;
}

.cascader {
  position: absolute;
  left: 3%;
  top: 3%;
  z-index: 50;
}
.icon-warp {
  color: white;
  font-size: 30px;
  position: absolute;
  left: 0.5%;
  top: 0.5%;
  z-index: 50;
  cursor: pointer;
}
.draw {
  position: absolute;
  top: 0.5%;
  right: 0.5%;
}
</style>
