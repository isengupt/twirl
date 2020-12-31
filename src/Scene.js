import React, { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { vertex } from "./shaders/vertex";
import { fragment } from "./shaders/fragment";

var colors = require('nice-color-palettes')

let palette = colors[Math.floor(Math.random()*100)]

class Scene extends Component {
  constructor(props) {
    super(props);

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.animate = this.animate.bind(this);
  }
  componentDidMount() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    this.width = this.mount.clientWidth;
    this.height = this.mount.clientHeight;
    this.renderer.setClearColor("#000", 1);
    this.renderer.setSize(this.width, this.height);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container = document.getElementById("scene");

    this.mount.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      50,
      this.width / this.height,
      0.01,
      100
    );

    this.camera.position.set(0, 0, 6);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.time = 0;
    this.setupResize();
    this.addObjects();
    this.animate();

    this.resize();
  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        offset: { type: "f", value: 0 },
        color: { type: "v3", value: new THREE.Color("#000000") },
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1),
        },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.animated = [];

    function range(min, max) {
      return min + Math.random() * (max - min);
    }

    let number = 250;

    this.scene.rotation.z = Math.PI / 9;
    for (let i = 0; i < number; i++) {
      let precision = 100;
      let level = range(-300, 300);
      let zero = (level) / 300;
      let rad = 130 * zero *zero + Math.random() * 10;
      //let rad = 130 * (Math.sin(zero*10) + Math.sin(zero*10))+ Math.random() * 10;
      let spline = [];
      let offset = Math.abs(zero);
      let angle = range(0, 2 * Math.PI);
      let width = Math.random() * 0.5 + 0.5;

      let center = {
        x: range(-2,2),
        y: range(-2,2)
      }

      for (let j = 0; j <= precision * width; j++) {
        let x =  center.x + rad * Math.sin((Math.PI * 2 * j) / precision);
        let z =  center.y + rad * Math.cos((Math.PI * 2 * j) / precision);

        spline.push(new THREE.Vector3(x, level, z));
      }

      let sampleClosedSpline = new THREE.CatmullRomCurve3(spline);

      let params = {
        scale: 4,
        extrusionSegments: 400,
        radiusSegments: 16,
        closed: false,
      };

      let tubeGeometry = new THREE.TubeBufferGeometry(
        sampleClosedSpline,
        params.extrusionSegments,
        0.5,
        params.radiusSegments,
        params.closed
      );
      let tubeGeometry1 = new THREE.TubeBufferGeometry(
        sampleClosedSpline,
        params.extrusionSegments,
        0.5 + 0.5,
        params.radiusSegments,
        params.closed
      );

      //this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
      let m = this.material.clone();
      let m1 = this.material.clone();
      //m.uniforms.color.value = new THREE.Color("#ffffff");
      m.uniforms.color.value = new THREE.Color(palette[Math.floor(Math.random()*5)])
      m.uniforms.offset.value = offset;
      m1.uniforms.offset.value = offset;
      m1.side = THREE.BackSide;
      let mesh = new THREE.Mesh(tubeGeometry, m);
      let mesh1 = new THREE.Mesh(tubeGeometry1, m1);
      //this.plane = new THREE.Mesh(this.geometry, this.material);
      mesh.scale.set(0.01, 0.01, 0.01);
      mesh1.scale.set(0.01, 0.01, 0.01);

      mesh.rotation.y = mesh1.rotation.y = angle;

      this.scene.add(mesh);
      this.scene.add(mesh1);

      this.animated.push({
        mesh: mesh,
        material: m,
        material1: m1,
      });
    }
  }

  setupResize = () => {
    window.addEventListener("resize", this.resize);
  };

  resize = () => {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    console.log("resize");

    this.imageAspect = 853 / 1280;
    /* 
    let a1;
    let a2;

    if (this.height / this.width > this.imageAspect) {
      a1 = (this.width / this.height) * this.imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = this.height / this.width / this.imageAspect;
    }

    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;

    const dist = this.camera.position.z;
    const height = 1;
    this.camera.fov = 2* (180/Math.PI) * Math.atan(height/(2*dist));

    if (this.width / this.height > 1) {
      this.plane.scale.x = this.camera.aspect;
    } else {
      this.plane.scale.y = 1 / this.camera.aspect;
    }  */

    this.camera.updateProjectionMatrix();
    console.log(this.camera);
  };

  componentWillUnmount() {
    this.stop();
    this.mount.removeChild(this.renderer.domElement);
  }

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  }

  stop() {
    cancelAnimationFrame(this.frameId);
  }

  animate() {
    this.time += 0.01;

    this.animated.forEach((o) => {
      o.material.uniforms.time.value = this.time;
      o.material1.uniforms.time.value = this.time;
    });

    this.frameId = requestAnimationFrame(this.animate);

    this.renderScene();
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div
        id="scene"
        ref={(mount) => {
          this.mount = mount;
        }}
      />
    );
  }
}

export default Scene;
