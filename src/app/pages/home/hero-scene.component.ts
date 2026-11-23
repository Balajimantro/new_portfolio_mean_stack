import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import type { Group, Mesh, PerspectiveCamera, Points, Scene, ShaderMaterial, WebGLRenderer } from 'three';

@Component({
  selector: 'app-hero-scene',
  templateUrl: './hero-scene.component.html',
  styleUrl: './hero-scene.component.css'
})
export class HeroSceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('stage', { static: true }) stageRef!: ElementRef<HTMLDivElement>;

  readonly ready = signal(false);

  private readonly zone = inject(NgZone);

  private renderer?: WebGLRenderer;
  private scene?: Scene;
  private camera?: PerspectiveCamera;
  private group?: Group;
  private core?: Mesh;
  private particles?: Points;
  private coreMaterial?: ShaderMaterial;

  private raf = 0;
  private observer?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;
  private running = false;
  private disposed = false;
  private reducedMotion = false;

  private pointerX = 0;
  private pointerY = 0;
  private targetX = 0;
  private targetY = 0;
  private scrollNorm = 0;

  private readonly onPointerMove = (event: PointerEvent) => {
    const rect = this.stageRef.nativeElement.getBoundingClientRect();
    this.pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
  };

  private readonly onWindowScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollNorm = max > 0 ? Math.min(1, window.scrollY / max) : 0;
  };

  private readonly onVisibility = () => {
    if (document.hidden) {
      this.stop();
    } else if (this.running && this.observerActive) {
      this.start();
    }
  };

  private observerActive = false;
  private animateFrame?: () => void;

  ngAfterViewInit(): void {
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.observerActive = entry.isIntersecting;
          if (entry.isIntersecting) {
            this.start();
          } else {
            this.stop();
          }
        });
      },
      { threshold: 0.05 }
    );
    this.observer.observe(this.stageRef.nativeElement);

    this.zone.runOutsideAngular(() => {
      void this.initScene();
    });
  }

  private async initScene(): Promise<void> {
    try {
      const THREE = await import('three');
      if (this.disposed) return;

      const canvas = this.canvasRef.nativeElement;
      const stage = this.stageRef.nativeElement;
      const width = stage.clientWidth || 480;
      const height = stage.clientHeight || 480;
      const isMobile = window.matchMedia?.('(max-width: 767px)').matches ?? false;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
      renderer.setSize(width, height, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer = renderer;

      const scene = new THREE.Scene();
      this.scene = scene;

      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      camera.position.set(0, 0, 5.4);
      this.camera = camera;

      const group = new THREE.Group();
      group.position.y = -0.1;
      scene.add(group);
      this.group = group;

      // --- core crystal -------------------------------------------------
      const geometry = new THREE.IcosahedronGeometry(1.42, isMobile ? 1 : 2);

      const coreMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: true,
        uniforms: {
          uTime: { value: 0 },
          uColorA: { value: new THREE.Color('#7c5cff') },
          uColorB: { value: new THREE.Color('#22d3ee') },
          uColorC: { value: new THREE.Color('#f472b6') }
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vViewDir;
          varying float vHeight;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vViewDir = normalize(-mv.xyz);
            vHeight = position.y;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          uniform vec3 uColorC;
          uniform float uTime;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          varying float vHeight;
          void main() {
            float fresnel = pow(1.0 - clamp(dot(vNormal, vViewDir), 0.0, 1.0), 1.9);
            vec3 base = mix(uColorA, uColorB, clamp(vHeight * 0.5 + 0.5, 0.0, 1.0));
            vec3 color = mix(base, uColorC, fresnel * 0.55);
            float pulse = 0.86 + 0.14 * sin(uTime * 0.9);
            float alpha = 0.34 + fresnel * 0.66;
            gl_FragColor = vec4(color * pulse, alpha);
          }
        `
      });
      this.coreMaterial = coreMaterial;

      const core = new THREE.Mesh(geometry, coreMaterial);
      core.rotation.set(0.3, 0.4, 0);
      group.add(core);
      this.core = core;

      // wireframe shell
      const wire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.5, 1),
        new THREE.MeshBasicMaterial({
          color: 0x8b9bff,
          wireframe: true,
          transparent: true,
          opacity: 0.12
        })
      );
      group.add(wire);

      // --- orbit rings --------------------------------------------------
      const ringGeo = new THREE.TorusGeometry(2.05, 0.006, 6, 160);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x9aa4ff,
        transparent: true,
        opacity: 0.5
      });
      const ringA = new THREE.Mesh(ringGeo, ringMaterial);
      ringA.rotation.set(1.25, 0.2, 0.3);
      group.add(ringA);

      const ringB = new THREE.Mesh(
        new THREE.TorusGeometry(2.42, 0.004, 6, 160),
        new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.28 })
      );
      ringB.rotation.set(-0.9, -0.4, 1.1);
      group.add(ringB);

      // --- particle field ----------------------------------------------
      const count = isMobile ? 520 : 1100;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const radius = 2.5 + Math.random() * 1.9;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.8;
        positions[i * 3 + 2] = radius * Math.cos(phi);
      }
      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particles = new THREE.Points(
        particleGeo,
        new THREE.PointsMaterial({
          color: 0xa5b4fc,
          size: isMobile ? 0.035 : 0.026,
          transparent: true,
          opacity: 0.7,
          sizeAttenuation: true,
          depthWrite: false
        })
      );
      group.add(particles);
      this.particles = particles;

      // --- interaction --------------------------------------------------
      stage.addEventListener('pointermove', this.onPointerMove, { passive: true });
      window.addEventListener('scroll', this.onWindowScroll, { passive: true });
      document.addEventListener('visibilitychange', this.onVisibility);

      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(stage);

      canvas.addEventListener('webglcontextlost', this.handleContextLost, false);

      // first frame
      const clock = new THREE.Clock();
      const renderFrame = () => {
        const elapsed = clock.getElapsedTime();
        if (this.coreMaterial) {
          this.coreMaterial.uniforms['uTime'].value = elapsed;
        }
        renderer.render(scene, camera);
      };

      if (this.reducedMotion) {
        this.resize();
        renderFrame();
        this.ready.set(true);
        return;
      }

      let elapsed = 0;
      const animate = () => {
        if (this.disposed || !this.running) {
          return;
        }
        elapsed += Math.min(clock.getDelta(), 0.05);

        this.targetX += (this.pointerX * 0.35 - this.targetX) * 0.045;
        this.targetY += (this.pointerY * 0.28 - this.targetY) * 0.045;

        group.rotation.y = elapsed * 0.16 + this.targetX;
        group.rotation.x = this.targetY * 0.75 + Math.sin(elapsed * 0.4) * 0.04;
        group.rotation.z = Math.sin(elapsed * 0.22) * 0.05;

        group.position.y = -0.1 + Math.sin(elapsed * 0.7) * 0.06 - this.scrollNorm * 0.35;

        if (this.core) {
          this.core.rotation.y = elapsed * 0.22;
          this.core.rotation.x = Math.sin(elapsed * 0.35) * 0.25;
        }
        if (this.particles) {
          this.particles.rotation.y = -elapsed * 0.05;
        }
        ringA.rotation.z = 0.3 + elapsed * 0.1;
        ringB.rotation.z = 1.1 - elapsed * 0.06;

        if (this.coreMaterial) {
          this.coreMaterial.uniforms['uTime'].value = elapsed;
        }

        renderer.render(scene, camera);
        this.raf = requestAnimationFrame(animate);
      };

      this.animateFrame = animate;
      this.running = true;
      this.ready.set(true);
      this.resize();
      this.raf = requestAnimationFrame(animate);
    } catch (error) {
      // WebGL unavailable — CSS fallback stays visible.
      console.warn('Hero 3D scene unavailable, using CSS fallback.', error);
    }
  }

  private handleContextLost = (event: Event): void => {
    event.preventDefault();
    this.stop();
    this.ready.set(false);
  };

  private resize(): void {
    if (!this.renderer || !this.camera) return;
    const stage = this.stageRef.nativeElement;
    const width = stage.clientWidth || 1;
    const height = stage.clientHeight || 1;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private start(): void {
    if (this.disposed || this.reducedMotion || this.running || !this.animateFrame) return;
    this.running = true;
    this.raf = requestAnimationFrame(this.animateFrame);
  }

  private stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  ngOnDestroy(): void {
    this.disposed = true;
    this.stop();
    this.observer?.disconnect();
    this.resizeObserver?.disconnect();
    this.stageRef?.nativeElement.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('scroll', this.onWindowScroll);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.canvasRef?.nativeElement.removeEventListener('webglcontextlost', this.handleContextLost);
    this.renderer?.dispose();
  }
}
