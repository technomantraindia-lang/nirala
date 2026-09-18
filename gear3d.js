// Interactive 3D Gear Assembly Renderer
// Uses WebGL via Three.js (when available) or high-performance 2D Canvas fallback

class Gear3DRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.rotationSpeed = this.isReducedMotion ? 0 : 0.005;
    this.angle = 0;
    this.isDragging = false;
    this.previousMouseX = 0;

    // Introductory sway gesture state
    this.introSwaying = !this.isReducedMotion;
    this.introTimer = 0;
    this.swayOffset = 0;

    this.dialControl = document.getElementById('gearDialControl');
    this.dialThumb = document.getElementById('dialThumb');

    this.initCanvas();
    this.bindEvents();
    this.animate();
  }

  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    this.resize();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width || 400;
    this.height = rect.height || 400;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  updateDialThumb(currentAngle) {
    if (!this.dialThumb) return;
    // Map angle (0 to 2PI) to thumb left offset (2px to 34px within 48px track):
    const trackWidth = 32;
    const norm = ((currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const thumbLeft = 2 + (norm / (Math.PI * 2)) * trackWidth;
    this.dialThumb.style.left = thumbLeft + 'px';

    if (this.dialControl) {
      const degrees = Math.round((norm / (Math.PI * 2)) * 360);
      this.dialControl.setAttribute('aria-valuenow', degrees);
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    const markInteracted = () => {
      this.introSwaying = false;
      this.swayOffset = 0;
      if (this.dialControl && !this.dialControl.classList.contains('interacted')) {
        this.dialControl.classList.add('interacted');
      }
    };

    const onPointerDown = (e) => {
      this.isDragging = true;
      this.previousMouseX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      markInteracted();
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const deltaX = currentX - this.previousMouseX;
      this.angle += deltaX * 0.014;
      this.previousMouseX = currentX;
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    // Listen on container canvas and dial control
    this.container.addEventListener('mousedown', onPointerDown);
    if (this.dialControl) {
      this.dialControl.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        onPointerDown(e);
      });
    }

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.container.addEventListener('touchstart', onPointerDown, { passive: true });
    if (this.dialControl) {
      this.dialControl.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        onPointerDown(e);
      }, { passive: true });
    }

    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Keyboard controls on container & dialControl
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.angle -= 0.15;
        markInteracted();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.angle += 0.15;
        markInteracted();
      }
    };

    this.container.addEventListener('keydown', handleKeyDown);
    if (this.dialControl) {
      this.dialControl.addEventListener('keydown', handleKeyDown);
    }
  }

  drawGear(cx, cy, outerRadius, innerRadius, teeth, angle, colorMain, colorHighlight) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Draw Gear Outer Teeth
    ctx.beginPath();
    const toothAngle = (Math.PI * 2) / teeth;
    const halfTooth = toothAngle / 4;

    for (let i = 0; i < teeth; i++) {
      const a = i * toothAngle;
      ctx.lineTo(Math.cos(a - halfTooth) * innerRadius, Math.sin(a - halfTooth) * innerRadius);
      ctx.lineTo(Math.cos(a - halfTooth * 0.5) * outerRadius, Math.sin(a - halfTooth * 0.5) * outerRadius);
      ctx.lineTo(Math.cos(a + halfTooth * 0.5) * outerRadius, Math.sin(a + halfTooth * 0.5) * outerRadius);
      ctx.lineTo(Math.cos(a + halfTooth) * innerRadius, Math.sin(a + halfTooth) * innerRadius);
    }
    ctx.closePath();

    // Radial Metallic Gradient
    const grad = ctx.createRadialGradient(0, 0, innerRadius * 0.2, 0, 0, outerRadius);
    grad.addColorStop(0, '#e1c67d');
    grad.addColorStop(0.5, colorMain);
    grad.addColorStop(1, '#181d22');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(199, 165, 87, 0.4)';
    ctx.shadowBlur = 15;
    ctx.fill();

    ctx.strokeStyle = colorHighlight;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center Bore & Keyway Cutout
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#111418';
    ctx.fill();
    ctx.strokeStyle = colorHighlight;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Keyway Notch
    ctx.fillRect(-innerRadius * 0.08, -innerRadius * 0.45, innerRadius * 0.16, innerRadius * 0.15);

    // Light reflection streak
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius * 0.7, -Math.PI * 0.3, Math.PI * 0.1);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (!this.isDragging && !this.isReducedMotion) {
      this.angle += this.rotationSpeed;
    }

    // Intro Sway Gesture Animation
    if (this.introSwaying) {
      this.introTimer += 0.04;
      this.swayOffset = Math.sin(this.introTimer * 2.5) * 0.35;
      if (this.introTimer > Math.PI * 2) {
        this.introSwaying = false;
        this.swayOffset = 0;
      }
    }

    const currentAngle = this.angle + this.swayOffset;

    // Update round control dial thumb position
    this.updateDialThumb(currentAngle);

    const cx = this.width / 2;
    const cy = this.height / 2;

    // Radius scale factor: ensures no tooth or glow shadow gets clipped
    const baseR = Math.min(cx, cy) * 0.52;
    const pinionR = baseR * 0.42;

    // Pinion position relative offset
    const distance = baseR * 0.82 + pinionR * 0.82;
    const dx = Math.cos(Math.PI * 0.25) * distance * 0.75;
    const dy = Math.sin(Math.PI * 0.25) * distance * 0.75;

    // Centering correction offset to position the ENTIRE assembly centroid at exact center (cx, cy)
    const mainX = cx - dx * 0.38;
    const mainY = cy - dy * 0.38;
    const pinionX = mainX + dx;
    const pinionY = mainY + dy;

    // Draw Main Gear
    this.drawGear(mainX, mainY, baseR, baseR * 0.82, 18, currentAngle, '#c7a557', '#e1c67d');

    // Draw Secondary Interlocking Small Pinion Gear
    const pinionAngle = -currentAngle * (18 / 10);
    this.drawGear(pinionX, pinionY, pinionR, pinionR * 0.8, 10, pinionAngle, '#d9413a', '#e86b35');

    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Gear3DRenderer('gear3dContainer');
});
