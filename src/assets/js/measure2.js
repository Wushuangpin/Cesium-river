/*
 * params:
 *     viewer:required,三维视图
 *     target:required,测量工具放置的div的id
 * */


    function _(option) {
        this.viewer = option.viewer;
        this.dom = document.getElementById(option.target);
        this.options = option;

        var me = this;

        l1.onclick = function () {
            $("#ul").slideToggle()
            $("[class='popover fade right in']").remove()
            i = 1
            if (me.bMeasuring)
                return;

            me.bMeasuring = true;
            me._measureLineSpace();
        };

        area = function () {
            $("#ul").slideToggle()
            $("[class='popover fade right in']").remove()
            i = 1
            if (me.bMeasuring)
                return;

            me.bMeasuring = true;
            me._measureAreaSpace();
        };

        l3.onclick = function () {
            $("#ul").slideToggle()
            $("[class='popover fade right in']").remove()
            i = 1
            //删除事先记录的id
            for (var jj = 0; jj < me.measureIds.length; jj++) {
                me.viewer.entities.removeById(me.measureIds[jj]);
            }
            me.measureIds.length = 0;
        };

        this.bMeasuring = false;
        this.measureIds = [];
    }

    _.prototype._finishMeasure = function () {
        this.bMeasuring = false;
    }

    //内部测量距离函数
    _.prototype._measureLineSpace = function () {
      
        // 取消双击事件-追踪该位置
        window.earth.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        var handler = new Cesium.ScreenSpaceEventHandler(window.earth.scene._imageryLayerCollection);
        var positions = [];
        var poly = null;
        var distance = 0;
        var cartesian = null;
        var floatingPoint;
        var labelPt;

        handler.setInputAction(function (movement) {
            let ray = window.earth.camera.getPickRay(movement.endPosition);
            cartesian = window.earth.scene.globe.pick(ray, window.earth.scene);
            if (!Cesium.defined(cartesian)) //跳出地球时异常
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

        handler.setInputAction(function (movement) {
            let ray = window.earth.camera.getPickRay(movement.position);
            cartesian = window.earth.scene.globe.pick(ray, window.earth.scene);
            if (!Cesium.defined(cartesian)) //跳出地球时异常
                return;

            if (positions.length == 0) {
                positions.push(cartesian.clone());
            }
            positions.push(cartesian);
            //记录鼠标单击时的节点位置，异步计算贴地距离
            labelPt = positions[positions.length - 1];

            /* if ((positions.length) > 2) {
                labelPt.x = (positions[positions.length - 3].x + positions[positions.length - 1].x) / 2;
                labelPt.y = (positions[positions.length - 3].y + positions[positions.length - 1].y) / 2;
            }
            else {
                labelPt.x = (positions[positions.length - 2].x + positions[positions.length - 1].x) / 2;
                labelPt.y = (positions[positions.length - 2].y + positions[positions.length - 1].y) / 2;
            } */

            if (positions.length > 2) {
                getSpaceDistance(positions);
            } else if (positions.length == 2) {
                //在三维场景中添加Label
                floatingPoint = window.earth.entities.add({
                    name: '空间距离',
                    position: labelPt,
                    point: {
                        pixelSize: 5,
                        color: Cesium.Color.RED,
                        outlineColor: Cesium.Color.WHITE,
                        outlineWidth: 2,
                    }
                });
                me.measureIds.push(floatingPoint.id);
            }

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        handler.setInputAction(function (movement) {
            handler.destroy(); //关闭事件句柄
            handler = undefined;
            positions.pop(); //最后一个点无效
            if (positions.length == 1)
                window.earth.entities.remove(floatingPoint);
            //记录测量工具状态
            me._finishMeasure();

        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        var PolyLinePrimitive = (function () {
            function _(positions) {
                this.options = {
                    name: '直线',
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

            _.prototype._init = function () {
                var _self = this;
                var _update = function () {
                    return _self.positions;
                };
                //实时更新polyline.positions
                this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
                var addedEntity = window.earth.entities.add(this.options);
                me.measureIds.push(addedEntity.id);
            };

            return _;
        })();

        //空间两点距离计算函数
        function getSpaceDistance(positions) {
            //只计算最后一截，与前面累加
            //因move和鼠标左击事件，最后两个点坐标重复
            var i = positions.length - 3;
            var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
            var point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
            getTerrainDistance(point1cartographic, point2cartographic);
        }

        function getTerrainDistance(point1cartographic, point2cartographic) {
            var geodesic = new Cesium.EllipsoidGeodesic();
            geodesic.setEndPoints(point1cartographic, point2cartographic);
            var s = geodesic.surfaceDistance;
            var cartoPts = [point1cartographic];
            for (var jj = 1000; jj < s; jj += 1000) {　　//分段采样计算距离
                var cartoPt = geodesic.interpolateUsingSurfaceDistance(jj);
                //                console.log(cartoPt);
                cartoPts.push(cartoPt);
            }
            cartoPts.push(point2cartographic);
            //返回两点之间的距离
            var promise = Cesium.sampleTerrain(window.earth.terrainProvider, 8, cartoPts);
            Cesium.when(promise, function (updatedPositions) {
                // positions height have been updated.
                // updatedPositions is just a reference to positions.
                for (var jj = 0; jj < updatedPositions.length - 1; jj++) {
                    var geoD = new Cesium.EllipsoidGeodesic();
                    geoD.setEndPoints(updatedPositions[jj], updatedPositions[jj + 1]);
                    var innerS = geoD.surfaceDistance;
                    innerS = Math.sqrt(Math.pow(innerS, 2) + Math.pow(updatedPositions[jj + 1].height - updatedPositions[jj].height, 2));
                    distance += innerS;
                }

                //在三维场景中添加Label
                var textDisance = distance.toFixed(2) + "米";
                //console.log(labelPt.x+","+labelPt.y)
                if (distance > 10000)
                    textDisance = (distance / 1000.0).toFixed(2) + "千米";
                floatingPoint = window.earth.entities.add({
                    name: '贴地距离',
                    position: labelPt,
                    point: {
                        pixelSize: 5,
                        color: Cesium.Color.RED,
                        outlineColor: Cesium.Color.WHITE,
                        outlineWidth: 2,
                    },
                    label: {
                        text: textDisance,
                        font: '18px sans-serif',
                        fillColor: Cesium.Color.GOLD,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        outlineWidth: 2,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(20, -20),
                    }
                });
                if ((positions.length) > 2) {
                    labelPt.x = (positions[positions.length - 3].x + positions[positions.length - 1].x) / 2;
                    labelPt.y = (positions[positions.length - 3].y + positions[positions.length - 1].y) / 2;
                }
                else {
                    labelPt.x = (positions[positions.length - 2].x + positions[positions.length - 1].x) / 2;
                    labelPt.y = (positions[positions.length - 2].y + positions[positions.length - 1].y) / 2;
                }
                label = window.earth.entities.add({
                    name: '贴地距离',
                    position: labelPt,
                    label: {
                        text: textDisance,
                        font: '18px sans-serif',
                        fillColor: Cesium.Color.GOLD,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        outlineWidth: 2,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(20, -20),
                    }
                });
                me.measureIds.push(floatingPoint.id);
            });
            return distance
        }
    }

    //内部测量面积函数
    _.prototype._measureAreaSpace = function () {


        // 取消双击事件-追踪该位置
        viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        // 鼠标事件
        handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
        var positions = [];
        var tempPoints = [];
        var polygon = null;
        // var tooltip = document.getElementById("toolTip");
        var cartesian = null;
        var floatingPoint;//浮动点
        // tooltip.style.display = "block";

        handler.setInputAction(function (movement) {
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

        handler.setInputAction(function (movement) {
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
            var cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
            var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
            var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
            var heightString = cartographic.height;
            tempPoints.push({ lon: longitudeString, lat: latitudeString, hei: heightString });
            floatingPoint = viewer.entities.add({
                name: '多边形面积',
                position: positions[positions.length - 1],
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                }
            });
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        handler.setInputAction(function (movement) {
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
            viewer.entities.add({
                name: '多边形面积',
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
                    font: '18px sans-serif',
                    fillColor: Cesium.Color.GOLD,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(20, -40),
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                }
            });
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        var radiansPerDegree = Math.PI / 180.0;//角度转化为弧度(rad) 
        var degreesPerRadian = 180.0 / Math.PI;//弧度转化为角度

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
            var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
            if (angle < 0) {
                angle += Math.PI * 2.0;
            }
            angle = angle * degreesPerRadian;//角度
            return angle;
        }

        var PolygonPrimitive = (function () {
            function _(positions) {
                this.options = {
                    name: '多边形',
                    polygon: {
                        hierarchy: [],
                        // perPositionHeight : true,
                        material: Cesium.Color.GREEN.withAlpha(0.5),
                        // heightReference:20000
                    }
                };

                this.hierarchy = { positions }
                this._init();
            }

            _.prototype._init = function () {
                var _self = this;
                var _update = function () {
                    return _self.hierarchy;
                };
                //实时更新polygon.hierarchy
                this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false);
                viewer.entities.add(this.options);
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
            s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
            return s;
        }

    }
    return _;
