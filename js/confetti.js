/**
 * Confetti Module - Celebration animation for workout completion
 */

const Confetti = {
  canvas: null,
  ctx: null,
  particles: [],
  animationId: null,
  
  colors: [
    '#10b981', // murph-accent (green)
    '#065f46', // murph-primary (dark green)
    '#fbbf24', // amber
    '#f59e0b', // yellow
    '#ef4444', // red
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
  ],
  
  /**
   * Initialize the confetti canvas
   */
  init() {
    this.canvas = document.getElementById('confetti-canvas');
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    
    window.addEventListener('resize', () => this.resize());
  },
  
  /**
   * Resize canvas to window size
   */
  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },
  
  /**
   * Create a single confetti particle
   */
  createParticle(x, y) {
    return {
      x: x || Math.random() * this.canvas.width,
      y: y || -20,
      size: Math.random() * 10 + 5,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      speedX: (Math.random() - 0.5) * 8,
      speedY: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      opacity: 1,
      gravity: 0.1,
      friction: 0.99,
      wobble: Math.random() * 10
    };
  },
  
  /**
   * Update particle position
   */
  updateParticle(particle) {
    particle.speedY += particle.gravity;
    particle.speedX *= particle.friction;
    particle.x += particle.speedX + Math.sin(particle.wobble) * 0.5;
    particle.y += particle.speedY;
    particle.rotation += particle.rotationSpeed;
    particle.wobble += 0.1;
    
    // Fade out near bottom
    if (particle.y > this.canvas.height * 0.8) {
      particle.opacity -= 0.02;
    }
    
    return particle;
  },
  
  /**
   * Draw a particle
   */
  drawParticle(particle) {
    this.ctx.save();
    this.ctx.translate(particle.x, particle.y);
    this.ctx.rotate((particle.rotation * Math.PI) / 180);
    this.ctx.globalAlpha = particle.opacity;
    this.ctx.fillStyle = particle.color;
    
    if (particle.shape === 'rect') {
      this.ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.6);
    } else {
      this.ctx.beginPath();
      this.ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.restore();
  },
  
  /**
   * Animation loop
   */
  animate() {
    if (!this.ctx) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw particles
    this.particles = this.particles.filter(particle => {
      this.updateParticle(particle);
      this.drawParticle(particle);
      
      // Remove particles that are off screen or faded
      return particle.y < this.canvas.height + 50 && particle.opacity > 0;
    });
    
    // Continue animation if there are particles
    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    }
  },
  
  /**
   * Fire confetti burst
   */
  fire(options = {}) {
    const {
      particleCount = 150,
      spread = 70,
      origin = { x: 0.5, y: 0.3 }
    } = options;
    
    this.init();
    
    const startX = this.canvas.width * origin.x;
    const startY = this.canvas.height * origin.y;
    
    // Create particles in a burst pattern
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180);
      const velocity = Math.random() * 10 + 5;
      
      const particle = this.createParticle(startX, startY);
      particle.speedX = Math.sin(angle) * velocity;
      particle.speedY = -Math.abs(Math.cos(angle) * velocity) - 3;
      
      this.particles.push(particle);
    }
    
    // Start animation if not already running
    if (!this.animationId) {
      this.animate();
    }
  },
  
  /**
   * Fire multiple bursts for celebration
   */
  celebrate() {
    // First burst - center
    this.fire({ particleCount: 100, origin: { x: 0.5, y: 0.4 } });
    
    // Delayed bursts from sides
    setTimeout(() => {
      this.fire({ particleCount: 75, origin: { x: 0.2, y: 0.5 } });
    }, 200);
    
    setTimeout(() => {
      this.fire({ particleCount: 75, origin: { x: 0.8, y: 0.5 } });
    }, 400);
    
    // Final big burst
    setTimeout(() => {
      this.fire({ particleCount: 150, origin: { x: 0.5, y: 0.3 }, spread: 90 });
    }, 600);
  },
  
  /**
   * Stop all confetti
   */
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.particles = [];
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
};

// Export for use in other modules
window.Confetti = Confetti;
