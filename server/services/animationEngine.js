const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class AnimationEngine {
  constructor() {
    this.processedDir = path.join(__dirname, '..', 'processed');
    this.tempDir = path.join(__dirname, '..', 'temp');
    this.ensureDirectoryExists(this.processedDir);
    this.ensureDirectoryExists(this.tempDir);

    // Animation types and their characteristics
    this.animationTypes = {
      'subtle': {
        name: 'Subtle Movement',
        description: 'Gentle breathing and micro-expressions',
        intensity: 0.3,
        movements: ['breathing', 'eye_blink', 'head_sway'],
        physics: { gravity: 0.1, damping: 0.8, stiffness: 0.5 }
      },
      'natural': {
        name: 'Natural Movement',
        description: 'Realistic human-like movements',
        intensity: 0.6,
        movements: ['breathing', 'eye_blink', 'head_sway', 'shoulder_shift', 'torso_lean'],
        physics: { gravity: 0.2, damping: 0.7, stiffness: 0.6 }
      },
      'expressive': {
        name: 'Expressive Movement',
        description: 'Dynamic and engaging movements',
        intensity: 0.8,
        movements: ['breathing', 'eye_blink', 'head_turn', 'shoulder_shift', 'torso_lean', 'hand_gesture'],
        physics: { gravity: 0.3, damping: 0.6, stiffness: 0.7 }
      },
      'dramatic': {
        name: 'Dramatic Movement',
        description: 'Bold and theatrical movements',
        intensity: 1.0,
        movements: ['breathing', 'eye_blink', 'head_turn', 'shoulder_shift', 'torso_lean', 'hand_gesture', 'pose_change'],
        physics: { gravity: 0.4, damping: 0.5, stiffness: 0.8 }
      },
      'presentation': {
        name: 'Presentation Style',
        description: 'Professional presentation movements',
        intensity: 0.7,
        movements: ['breathing', 'eye_blink', 'head_turn', 'hand_gesture', 'confident_pose'],
        physics: { gravity: 0.2, damping: 0.7, stiffness: 0.7 }
      }
    };

    // Movement patterns and their parameters
    this.movementPatterns = {
      'breathing': {
        frequency: 0.2, // Hz (breaths per second)
        amplitude: 2, // pixels
        bodyParts: ['chest', 'shoulders'],
        waveform: 'sine',
        phase: 0
      },
      'eye_blink': {
        frequency: 0.3, // blinks per second
        duration: 0.15, // seconds
        amplitude: 1,
        bodyParts: ['eyelids'],
        randomness: 0.4
      },
      'head_sway': {
        frequency: 0.1,
        amplitude: 3,
        bodyParts: ['head', 'neck'],
        waveform: 'sine',
        phase: Math.PI / 4
      },
      'head_turn': {
        frequency: 0.05,
        amplitude: 8,
        bodyParts: ['head', 'neck', 'eyes'],
        waveform: 'perlin',
        randomness: 0.3
      },
      'shoulder_shift': {
        frequency: 0.08,
        amplitude: 4,
        bodyParts: ['shoulders', 'arms'],
        waveform: 'sine',
        alternating: true
      },
      'torso_lean': {
        frequency: 0.06,
        amplitude: 6,
        bodyParts: ['torso', 'waist'],
        waveform: 'sine',
        phase: Math.PI / 2
      },
      'hand_gesture': {
        frequency: 0.4,
        amplitude: 15,
        bodyParts: ['hands', 'wrists', 'forearms'],
        waveform: 'custom',
        gestures: ['point', 'open_palm', 'fist', 'wave', 'counting']
      },
      'pose_change': {
        frequency: 0.02,
        amplitude: 20,
        bodyParts: ['full_body'],
        waveform: 'step',
        poses: ['neutral', 'confident', 'relaxed', 'engaged']
      },
      'confident_pose': {
        frequency: 0.03,
        amplitude: 8,
        bodyParts: ['shoulders', 'chest', 'head'],
        waveform: 'sine',
        confidence_boost: true
      }
    };

    // Body part definitions and their relationships
    this.bodyParts = {
      'head': {
        joints: ['neck'],
        constraints: { rotation: [-30, 30], translation: [-10, 10] },
        mass: 1.0,
        children: ['eyes', 'mouth', 'nose']
      },
      'neck': {
        joints: ['head', 'shoulders'],
        constraints: { rotation: [-45, 45], translation: [-5, 5] },
        mass: 0.5
      },
      'shoulders': {
        joints: ['neck', 'arms', 'chest'],
        constraints: { rotation: [-15, 15], translation: [-8, 8] },
        mass: 1.5
      },
      'chest': {
        joints: ['shoulders', 'waist'],
        constraints: { rotation: [-10, 10], translation: [-5, 5] },
        mass: 2.0
      },
      'waist': {
        joints: ['chest', 'hips'],
        constraints: { rotation: [-20, 20], translation: [-6, 6] },
        mass: 1.5
      },
      'arms': {
        joints: ['shoulders', 'elbows'],
        constraints: { rotation: [-60, 60], translation: [-20, 20] },
        mass: 0.8
      },
      'hands': {
        joints: ['wrists'],
        constraints: { rotation: [-45, 45], translation: [-15, 15] },
        mass: 0.3
      },
      'eyes': {
        joints: ['head'],
        constraints: { rotation: [-30, 30], translation: [-5, 5] },
        mass: 0.1
      }
    };

    // Physics simulation parameters
    this.physicsSettings = {
      frameRate: 30,
      timeStep: 1/30,
      iterations: 5,
      gravity: { x: 0, y: 0.2 },
      airResistance: 0.02,
      springConstant: 0.8,
      dampingFactor: 0.9
    };
  }

  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async generateAnimation(photoPath, animationType, intensity, duration, progressCallback) {
    try {
      progressCallback && progressCallback(0, 'Initializing animation generation...');

      // Analyze photo for body structure
      const bodyAnalysis = await this.analyzeBodyStructure(photoPath);
      progressCallback && progressCallback(20, 'Body structure analysis complete');

      // Get animation configuration
      const animConfig = this.animationTypes[animationType] || this.animationTypes['natural'];
      const adjustedIntensity = intensity * animConfig.intensity;

      // Generate movement timeline
      const movementTimeline = await this.generateMovementTimeline(
        animConfig, 
        adjustedIntensity, 
        duration
      );
      progressCallback && progressCallback(40, 'Movement timeline generated');

      // Create physics simulation
      const physicsSimulation = await this.createPhysicsSimulation(
        bodyAnalysis,
        movementTimeline,
        animConfig.physics
      );
      progressCallback && progressCallback(60, 'Physics simulation created');

      // Generate animation keyframes
      const animationKeyframes = await this.generateAnimationKeyframes(
        physicsSimulation,
        bodyAnalysis,
        duration
      );
      progressCallback && progressCallback(80, 'Animation keyframes generated');

      // Apply realistic constraints and smoothing
      const finalAnimation = await this.applyRealisticConstraints(
        animationKeyframes,
        bodyAnalysis
      );
      progressCallback && progressCallback(100, 'Animation generation complete');

      return {
        animationId: uuidv4(),
        animationType,
        intensity: adjustedIntensity,
        duration,
        bodyAnalysis,
        movementTimeline,
        physicsSimulation,
        animationKeyframes: finalAnimation,
        metadata: {
          frameRate: this.physicsSettings.frameRate,
          totalFrames: Math.ceil(duration * this.physicsSettings.frameRate),
          bodyParts: Object.keys(bodyAnalysis.detectedParts),
          movements: animConfig.movements
        },
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Animation generation error:', error);
      throw new Error(`Failed to generate animation: ${error.message}`);
    }
  }

  async analyzeBodyStructure(photoPath) {
    try {
      // In production, this would use pose estimation models like PoseNet, MediaPipe, or OpenPose
      // For demo purposes, we'll create a realistic body structure analysis
      
      const mockBodyAnalysis = {
        bodyDetected: true,
        confidence: 0.92,
        pose: 'frontal',
        detectedParts: {
          head: { 
            center: { x: 400, y: 150 }, 
            size: { width: 120, height: 160 },
            confidence: 0.95,
            landmarks: {
              top: { x: 400, y: 70 },
              bottom: { x: 400, y: 230 },
              left: { x: 340, y: 150 },
              right: { x: 460, y: 150 }
            }
          },
          neck: {
            center: { x: 400, y: 240 },
            size: { width: 40, height: 60 },
            confidence: 0.88
          },
          shoulders: {
            center: { x: 400, y: 300 },
            size: { width: 200, height: 40 },
            confidence: 0.90,
            left: { x: 300, y: 300 },
            right: { x: 500, y: 300 }
          },
          chest: {
            center: { x: 400, y: 380 },
            size: { width: 180, height: 120 },
            confidence: 0.85
          },
          waist: {
            center: { x: 400, y: 480 },
            size: { width: 160, height: 80 },
            confidence: 0.80
          },
          leftArm: {
            shoulder: { x: 300, y: 300 },
            elbow: { x: 250, y: 400 },
            wrist: { x: 220, y: 500 },
            confidence: 0.75
          },
          rightArm: {
            shoulder: { x: 500, y: 300 },
            elbow: { x: 550, y: 400 },
            wrist: { x: 580, y: 500 },
            confidence: 0.75
          }
        },
        skeleton: this.generateSkeletonStructure(),
        boundingBox: { x: 200, y: 50, width: 400, height: 500 }
      };

      return mockBodyAnalysis;
    } catch (error) {
      console.error('Body structure analysis error:', error);
      throw error;
    }
  }

  generateSkeletonStructure() {
    return {
      joints: [
        { id: 'head', position: { x: 400, y: 150 }, parent: 'neck' },
        { id: 'neck', position: { x: 400, y: 240 }, parent: 'shoulders' },
        { id: 'shoulders', position: { x: 400, y: 300 }, parent: 'chest' },
        { id: 'chest', position: { x: 400, y: 380 }, parent: 'waist' },
        { id: 'waist', position: { x: 400, y: 480 }, parent: null },
        { id: 'leftShoulder', position: { x: 300, y: 300 }, parent: 'shoulders' },
        { id: 'rightShoulder', position: { x: 500, y: 300 }, parent: 'shoulders' },
        { id: 'leftElbow', position: { x: 250, y: 400 }, parent: 'leftShoulder' },
        { id: 'rightElbow', position: { x: 550, y: 400 }, parent: 'rightShoulder' },
        { id: 'leftWrist', position: { x: 220, y: 500 }, parent: 'leftElbow' },
        { id: 'rightWrist', position: { x: 580, y: 500 }, parent: 'rightElbow' }
      ],
      bones: [
        { from: 'head', to: 'neck', length: 90 },
        { from: 'neck', to: 'shoulders', length: 60 },
        { from: 'shoulders', to: 'chest', length: 80 },
        { from: 'chest', to: 'waist', length: 100 },
        { from: 'leftShoulder', to: 'leftElbow', length: 120 },
        { from: 'rightShoulder', to: 'rightElbow', length: 120 },
        { from: 'leftElbow', to: 'leftWrist', length: 100 },
        { from: 'rightElbow', to: 'rightWrist', length: 100 }
      ]
    };
  }

  async generateMovementTimeline(animConfig, intensity, duration) {
    const timeline = [];
    const frameRate = this.physicsSettings.frameRate;
    const totalFrames = Math.ceil(duration * frameRate);

    for (const movementType of animConfig.movements) {
      const pattern = this.movementPatterns[movementType];
      if (!pattern) continue;

      const movementFrames = [];
      
      for (let frame = 0; frame < totalFrames; frame++) {
        const time = frame / frameRate;
        const value = this.calculateMovementValue(pattern, time, intensity);
        
        movementFrames.push({
          frame,
          time,
          value,
          bodyParts: pattern.bodyParts
        });
      }

      timeline.push({
        type: movementType,
        pattern,
        frames: movementFrames,
        intensity: intensity * (pattern.amplitude || 1)
      });
    }

    return {
      movements: timeline,
      duration,
      totalFrames,
      frameRate
    };
  }

  calculateMovementValue(pattern, time, intensity) {
    const frequency = pattern.frequency;
    const amplitude = pattern.amplitude * intensity;
    const phase = pattern.phase || 0;
    
    switch (pattern.waveform) {
      case 'sine':
        return amplitude * Math.sin(2 * Math.PI * frequency * time + phase);
      
      case 'cosine':
        return amplitude * Math.cos(2 * Math.PI * frequency * time + phase);
      
      case 'perlin':
        // Simplified Perlin noise approximation
        return amplitude * this.perlinNoise(time * frequency);
      
      case 'step':
        const stepValue = Math.floor(time * frequency) % 2;
        return amplitude * (stepValue * 2 - 1);
      
      case 'custom':
        return this.calculateCustomMovement(pattern, time, amplitude);
      
      default:
        return amplitude * Math.sin(2 * Math.PI * frequency * time + phase);
    }
  }

  perlinNoise(x) {
    // Simplified 1D Perlin noise
    const i = Math.floor(x);
    const f = x - i;
    const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
    
    const grad = (hash, x) => {
      const h = hash & 15;
      const grad = 1 + (h & 7);
      return (h & 8 ? -grad : grad) * x;
    };
    
    const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225];
    const a = grad(p[i & 255], f);
    const b = grad(p[(i + 1) & 255], f - 1);
    
    return (a + fade(f) * (b - a)) / 255;
  }

  calculateCustomMovement(pattern, time, amplitude) {
    if (pattern.bodyParts.includes('hands') && pattern.gestures) {
      // Hand gesture animation
      const gestureIndex = Math.floor(time * pattern.frequency) % pattern.gestures.length;
      const gesture = pattern.gestures[gestureIndex];
      return this.getGestureValue(gesture, time, amplitude);
    }
    
    return amplitude * Math.sin(2 * Math.PI * pattern.frequency * time);
  }

  getGestureValue(gesture, time, amplitude) {
    const gesturePatterns = {
      'point': amplitude * Math.sin(time * 4),
      'open_palm': amplitude * 0.5,
      'fist': amplitude * -0.3,
      'wave': amplitude * Math.sin(time * 8) * Math.cos(time * 2),
      'counting': amplitude * Math.floor(time * 2) % 5 / 5
    };
    
    return gesturePatterns[gesture] || 0;
  }

  async createPhysicsSimulation(bodyAnalysis, movementTimeline, physicsConfig) {
    const simulation = {
      bodies: [],
      constraints: [],
      forces: [],
      settings: { ...this.physicsSettings, ...physicsConfig }
    };

    // Create physics bodies for each detected body part
    for (const [partName, partData] of Object.entries(bodyAnalysis.detectedParts)) {
      if (this.bodyParts[partName]) {
        const body = this.createPhysicsBody(partName, partData, this.bodyParts[partName]);
        simulation.bodies.push(body);
      }
    }

    // Create constraints between connected body parts
    simulation.constraints = this.createPhysicsConstraints(simulation.bodies);

    // Add forces from movement timeline
    simulation.forces = this.createMovementForces(movementTimeline, simulation.bodies);

    return simulation;
  }

  createPhysicsBody(partName, partData, bodyPartConfig) {
    return {
      id: partName,
      position: { ...partData.center },
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      mass: bodyPartConfig.mass,
      size: partData.size,
      constraints: bodyPartConfig.constraints,
      forces: [],
      damping: 0.9
    };
  }

  createPhysicsConstraints(bodies) {
    const constraints = [];
    
    // Create spring constraints between connected body parts
    const connections = [
      ['head', 'neck'], ['neck', 'shoulders'], ['shoulders', 'chest'],
      ['chest', 'waist'], ['shoulders', 'leftArm'], ['shoulders', 'rightArm']
    ];

    for (const [bodyA, bodyB] of connections) {
      const bodyAObj = bodies.find(b => b.id === bodyA);
      const bodyBObj = bodies.find(b => b.id === bodyB);
      
      if (bodyAObj && bodyBObj) {
        constraints.push({
          id: `${bodyA}_${bodyB}`,
          bodyA: bodyAObj,
          bodyB: bodyBObj,
          restLength: this.calculateDistance(bodyAObj.position, bodyBObj.position),
          stiffness: 0.8,
          damping: 0.1
        });
      }
    }

    return constraints;
  }

  calculateDistance(pos1, pos2) {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
  }

  createMovementForces(movementTimeline, bodies) {
    const forces = [];
    
    for (const movement of movementTimeline.movements) {
      for (const bodyPartName of movement.pattern.bodyParts) {
        const body = bodies.find(b => b.id === bodyPartName);
        if (body) {
          forces.push({
            id: `${movement.type}_${bodyPartName}`,
            targetBody: body,
            movementType: movement.type,
            pattern: movement.pattern,
            intensity: movement.intensity,
            frames: movement.frames
          });
        }
      }
    }

    return forces;
  }

  async generateAnimationKeyframes(physicsSimulation, bodyAnalysis, duration) {
    const keyframes = [];
    const frameRate = this.physicsSettings.frameRate;
    const totalFrames = Math.ceil(duration * frameRate);

    // Initialize physics state
    let currentState = this.initializePhysicsState(physicsSimulation);

    for (let frame = 0; frame < totalFrames; frame++) {
      const time = frame / frameRate;
      
      // Apply forces for this frame
      this.applyFrameForces(currentState, physicsSimulation.forces, frame);
      
      // Update physics simulation
      currentState = this.updatePhysicsSimulation(currentState, physicsSimulation.settings);
      
      // Create keyframe
      const keyframe = {
        frame,
        time,
        bodyPositions: this.captureBodyPositions(currentState),
        transformations: this.calculateTransformations(currentState, bodyAnalysis)
      };
      
      keyframes.push(keyframe);
    }

    return {
      keyframes,
      totalFrames,
      frameRate,
      duration
    };
  }

  initializePhysicsState(simulation) {
    return {
      bodies: simulation.bodies.map(body => ({
        ...body,
        position: { ...body.position },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        forces: []
      })),
      constraints: [...simulation.constraints]
    };
  }

  applyFrameForces(state, forces, frame) {
    for (const force of forces) {
      const frameData = force.frames[frame];
      if (frameData) {
        const body = state.bodies.find(b => b.id === force.targetBody.id);
        if (body) {
          // Apply movement force based on pattern
          const forceVector = this.calculateForceVector(force, frameData.value);
          body.forces.push(forceVector);
        }
      }
    }
  }

  calculateForceVector(force, value) {
    const pattern = force.pattern;
    let forceX = 0, forceY = 0;

    switch (force.movementType) {
      case 'breathing':
        forceY = value * 0.1;
        break;
      case 'head_sway':
        forceX = value * 0.05;
        break;
      case 'head_turn':
        forceX = value * 0.08;
        forceY = value * 0.02;
        break;
      case 'shoulder_shift':
        forceX = value * 0.06;
        break;
      case 'torso_lean':
        forceX = value * 0.04;
        forceY = value * 0.02;
        break;
      case 'hand_gesture':
        forceX = value * 0.2;
        forceY = value * 0.1;
        break;
      default:
        forceX = value * 0.03;
        forceY = value * 0.03;
    }

    return {
      x: forceX * force.intensity,
      y: forceY * force.intensity
    };
  }

  updatePhysicsSimulation(state, settings) {
    const dt = settings.timeStep;
    
    // Apply forces and update velocities
    for (const body of state.bodies) {
      // Sum all forces
      let totalForceX = 0, totalForceY = 0;
      for (const force of body.forces) {
        totalForceX += force.x;
        totalForceY += force.y;
      }
      
      // Add gravity
      totalForceY += settings.gravity.y * body.mass;
      
      // Calculate acceleration (F = ma)
      body.acceleration.x = totalForceX / body.mass;
      body.acceleration.y = totalForceY / body.mass;
      
      // Update velocity with damping
      body.velocity.x = (body.velocity.x + body.acceleration.x * dt) * body.damping;
      body.velocity.y = (body.velocity.y + body.acceleration.y * dt) * body.damping;
      
      // Update position
      body.position.x += body.velocity.x * dt;
      body.position.y += body.velocity.y * dt;
      
      // Clear forces for next frame
      body.forces = [];
    }
    
    // Apply constraints
    for (let i = 0; i < settings.iterations; i++) {
      this.applyConstraints(state.constraints);
    }
    
    return state;
  }

  applyConstraints(constraints) {
    for (const constraint of constraints) {
      const { bodyA, bodyB, restLength, stiffness } = constraint;
      
      const dx = bodyB.position.x - bodyA.position.x;
      const dy = bodyB.position.y - bodyA.position.y;
      const currentLength = Math.sqrt(dx * dx + dy * dy);
      
      if (currentLength > 0) {
        const difference = (currentLength - restLength) / currentLength;
        const offsetX = dx * difference * stiffness * 0.5;
        const offsetY = dy * difference * stiffness * 0.5;
        
        // Apply position corrections
        bodyA.position.x += offsetX / bodyA.mass;
        bodyA.position.y += offsetY / bodyA.mass;
        bodyB.position.x -= offsetX / bodyB.mass;
        bodyB.position.y -= offsetY / bodyB.mass;
      }
    }
  }

  captureBodyPositions(state) {
    const positions = {};
    for (const body of state.bodies) {
      positions[body.id] = {
        x: body.position.x,
        y: body.position.y,
        velocity: { ...body.velocity }
      };
    }
    return positions;
  }

  calculateTransformations(state, bodyAnalysis) {
    const transformations = {};
    
    for (const body of state.bodies) {
      const originalPos = bodyAnalysis.detectedParts[body.id]?.center;
      if (originalPos) {
        transformations[body.id] = {
          translation: {
            x: body.position.x - originalPos.x,
            y: body.position.y - originalPos.y
          },
          rotation: this.calculateRotation(body, state),
          scale: { x: 1, y: 1 } // Could be modified for breathing effects
        };
      }
    }
    
    return transformations;
  }

  calculateRotation(body, state) {
    // Calculate rotation based on velocity and connected bodies
    const velocityAngle = Math.atan2(body.velocity.y, body.velocity.x);
    return velocityAngle * 0.1; // Subtle rotation based on movement
  }

  async applyRealisticConstraints(animationKeyframes, bodyAnalysis) {
    // Apply realistic movement constraints and smoothing
    const constrained = {
      ...animationKeyframes,
      keyframes: animationKeyframes.keyframes.map((keyframe, index) => {
        const constrainedFrame = { ...keyframe };
        
        // Apply movement limits for each body part
        for (const [bodyPart, transformation] of Object.entries(keyframe.transformations)) {
          const constraints = this.bodyParts[bodyPart]?.constraints;
          if (constraints) {
            // Limit translation
            if (constraints.translation) {
              transformation.translation.x = Math.max(
                constraints.translation[0],
                Math.min(constraints.translation[1], transformation.translation.x)
              );
              transformation.translation.y = Math.max(
                constraints.translation[0],
                Math.min(constraints.translation[1], transformation.translation.y)
              );
            }
            
            // Limit rotation
            if (constraints.rotation) {
              transformation.rotation = Math.max(
                constraints.rotation[0] * Math.PI / 180,
                Math.min(constraints.rotation[1] * Math.PI / 180, transformation.rotation)
              );
            }
          }
        }
        
        return constrainedFrame;
      })
    };
    
    // Apply smoothing between keyframes
    return this.smoothAnimationKeyframes(constrained);
  }

  smoothAnimationKeyframes(animationData) {
    const smoothed = { ...animationData };
    const keyframes = smoothed.keyframes;
    
    // Apply temporal smoothing
    for (let i = 1; i < keyframes.length - 1; i++) {
      const prev = keyframes[i - 1];
      const current = keyframes[i];
      const next = keyframes[i + 1];
      
      for (const bodyPart in current.transformations) {
        if (prev.transformations[bodyPart] && next.transformations[bodyPart]) {
          // Smooth translation
          current.transformations[bodyPart].translation.x = 
            0.25 * prev.transformations[bodyPart].translation.x +
            0.5 * current.transformations[bodyPart].translation.x +
            0.25 * next.transformations[bodyPart].translation.x;
            
          current.transformations[bodyPart].translation.y = 
            0.25 * prev.transformations[bodyPart].translation.y +
            0.5 * current.transformations[bodyPart].translation.y +
            0.25 * next.transformations[bodyPart].translation.y;
        }
      }
    }
    
    return smoothed;
  }
}

module.exports = new AnimationEngine();