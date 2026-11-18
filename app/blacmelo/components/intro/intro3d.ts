import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { LOGO_PATHS } from "../art/Logo";
import { LETTER_PATHS } from "../art/wordmark-paths";

/**
 * The 3D logo reveal: the BLACMELO mark and the wordmark as solid, glossy black objects.
 * World units are screen pixels at z = 0, so the flattened word lands exactly on the
 * 2D wordmark it hands over to.
 */
export type Intro3D = {
  logo: THREE.Group;
  word: THREE.Group;
  /** scale.z of this group flattens the word */
  wordDepth: THREE.Group;
  render: () => void;
  dispose: () => void;
};

function shapesFrom(svg: string) {
  const data = new SVGLoader().parse(svg);
  return data.paths.flatMap((p) => p.toShapes());
}

export function createIntro3D(canvas: HTMLCanvasElement, fontPx: number): Intro3D {
  const w = window.innerWidth;
  const h = window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.16; // deep black faces, reflections only catch the edges

  // 1 world unit = 1 px on the z = 0 plane
  const fov = 28;
  const camera = new THREE.PerspectiveCamera(fov, w / h, 10, 20000);
  camera.position.z = h / 2 / Math.tan(THREE.MathUtils.degToRad(fov / 2));

  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(-900, 700, 300); // grazing light: catches the sides and bevels, not the faces
  scene.add(key);
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));

  const material = new THREE.MeshPhysicalMaterial({
    color: 0x050505,
    roughness: 0.45,
    metalness: 0,
    clearcoat: 0.8,
    clearcoatRoughness: 0.18,
    side: THREE.DoubleSide,
  });

  // ---- the mark (same on-screen size as the 2D mark: 2.776em wide)
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg">${LOGO_PATHS.map(
    ([d, t]) => `<path d="${d}" transform="${t}"/>`
  ).join("")}</svg>`;
  const logoDepth = 260;
  const logoGeo = new THREE.ExtrudeGeometry(shapesFrom(logoSvg), {
    depth: logoDepth,
    bevelEnabled: true,
    bevelThickness: 18,
    bevelSize: 10,
    bevelSegments: 1,
    curveSegments: 3,
  });
  logoGeo.translate(-1106, -694, -logoDepth / 2);
  const logoMesh = new THREE.Mesh(logoGeo, material);
  const logoScale = (2.776 * fontPx) / 2212;
  logoMesh.scale.set(logoScale, -logoScale, logoScale); // SVG y points down
  const logo = new THREE.Group();
  logo.add(logoMesh);
  scene.add(logo);

  // ---- the wordmark (6.76em x 0.76em box, centred like the 2D word)
  const wordSvg = `<svg xmlns="http://www.w3.org/2000/svg">${LETTER_PATHS.map((d) => `<path d="${d}"/>`).join("")}</svg>`;
  const wordDepthUnits = 240;
  const wordGeo = new THREE.ExtrudeGeometry(shapesFrom(wordSvg), {
    depth: wordDepthUnits,
    bevelEnabled: true,
    bevelThickness: 10,
    bevelSize: 6,
    bevelSegments: 2,
    curveSegments: 6,
  });
  wordGeo.translate(-3380, -380, -wordDepthUnits / 2);
  const wordMesh = new THREE.Mesh(wordGeo, material);
  const wordScale = fontPx / 1000;
  wordMesh.scale.set(wordScale, -wordScale, wordScale);
  const wordDepth = new THREE.Group();
  wordDepth.add(wordMesh);
  const word = new THREE.Group();
  word.add(wordDepth);
  word.visible = false;
  scene.add(word);

  const render = () => renderer.render(scene, camera);

  // compile shaders and upload geometry now, so the first animated frame doesn't stall
  word.visible = true;
  renderer.compile(scene, camera);
  render();
  word.visible = false;
  render();

  const dispose = () => {
    logoGeo.dispose();
    wordGeo.dispose();
    material.dispose();
    env.dispose();
    pmrem.dispose();
    renderer.dispose();
  };

  return { logo, word, wordDepth, render, dispose };
}
