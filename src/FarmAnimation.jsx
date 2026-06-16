import React, { useEffect, useRef } from 'react';

function FarmAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track handle resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Animation state variables
    let time = 0;
    
    // Cloud state
    const clouds = [
      { x: 100, y: 80, speed: 0.2, scale: 0.6 },
      { x: 400, y: 120, speed: 0.15, scale: 0.8 },
      { x: 800, y: 60, speed: 0.25, scale: 0.5 },
      { x: 1100, y: 100, speed: 0.1, scale: 0.7 },
    ];

    // Birds state
    const birds = [
      { x: 200, y: 150, speed: 0.8, size: 8, phase: 0 },
      { x: 500, y: 120, speed: 0.6, size: 6, phase: 2 },
      { x: 900, y: 180, speed: 0.7, size: 7, phase: 4 },
    ];

    // Milk droplet state
    let milkDrops = [];
    let bucketLevel = 0.1; // 0.1 to 1.0 fullness
    let rippleRadius = 0;

    // Selling shop transaction state
    const shopX = 850; // virtual X coord
    const customer = {
      x: 1300, // virtual X
      state: 'walking_to_shop', // walking_to_shop, buying, walking_away, waiting
      speed: 1.5,
      bottleScale: 0,
      animOffset: 0,
      cooldown: 0,
      handExtended: false,
    };

    let coins = []; // Floating coins or rupees
    let merchantWave = 0;

    // Main animation loop
    const render = () => {
      time += 0.05;

      // Update states
      // Clouds
      clouds.forEach((cloud) => {
        cloud.x += cloud.speed;
        if (cloud.x > width + 150) {
          cloud.x = -150;
        }
      });

      // Birds
      birds.forEach((bird) => {
        bird.x += bird.speed;
        bird.phase += 0.1;
        if (bird.x > width + 100) {
          bird.x = -50;
          bird.y = 80 + Math.random() * 120;
        }
      });

      // Milking Logic (drops and bucket)
      // Generate milk drops periodically
      if (Math.floor(time * 5) % 3 === 0) {
        milkDrops.push({
          x: 232 + (Math.random() - 0.5) * 8, // Center relative to cow udders
          y: 470,
          vy: 4 + Math.random() * 2,
          radius: 2 + Math.random() * 1.5,
        });
      }

      // Update milk drops
      milkDrops = milkDrops.filter((drop) => {
        drop.y += drop.vy;
        if (drop.y >= 515) {
          // hit bucket
          bucketLevel += 0.0015;
          if (bucketLevel > 1.0) {
            bucketLevel = 0.1; // empty/reset bucket animation
          }
          rippleRadius = 1;
          return false;
        }
        return true;
      });

      if (rippleRadius > 0) {
        rippleRadius += 0.5;
        if (rippleRadius > 15) rippleRadius = 0;
      }

      // Customer Logic
      if (customer.state === 'walking_to_shop') {
        customer.x -= customer.speed;
        if (customer.x <= 950) {
          customer.x = 950;
          customer.state = 'buying';
          customer.animOffset = time;
        }
      } else if (customer.state === 'buying') {
        const elapsed = time - customer.animOffset;
        if (elapsed > 4 && elapsed <= 5 && coins.length === 0) {
          // Spawn rupees
          coins.push({ x: 920, y: 460, vy: -1.5, alpha: 1, text: '₹' });
          coins.push({ x: 940, y: 450, vy: -1.8, alpha: 1, text: '₹' });
          customer.handExtended = true;
        }
        if (elapsed > 6 && elapsed <= 7) {
          // Merchant slides milk bottle
          customer.bottleScale = Math.min(1, customer.bottleScale + 0.1);
        }
        if (elapsed > 10) {
          customer.state = 'walking_away';
        }
      } else if (customer.state === 'walking_away') {
        customer.x -= customer.speed;
        if (customer.x < -100) {
          customer.state = 'waiting';
          customer.cooldown = time;
          customer.bottleScale = 0;
          customer.handExtended = false;
        }
      } else if (customer.state === 'waiting') {
        if (time - customer.cooldown > 5) {
          customer.x = Math.max(width, 1300);
          customer.state = 'walking_to_shop';
        }
      }

      // Update Coins
      coins.forEach((c) => {
        c.y += c.vy;
        c.alpha -= 0.015;
      });
      coins = coins.filter((c) => c.alpha > 0);

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // We define a base scaling factor so the farm elements fit nicely
      // virtual coordinates: ground level is y=550, elements are drawn around x=0 to 1200
      const sceneScale = Math.min(1.2, Math.max(0.6, width / 1200));
      const offsetX = 0;
      const offsetY = height - 550 * sceneScale; // Anchor to screen bottom

      // 1. Draw Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#7bc6ff'); // bright cartoon sky blue
      skyGrad.addColorStop(0.6, '#aee1ff'); // softer bottom sky
      skyGrad.addColorStop(1, '#e2f4ff');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Sun
      ctx.save();
      const sunX = width - 120;
      const sunY = 100;
      ctx.translate(sunX, sunY);
      ctx.rotate(time * 0.05);
      ctx.fillStyle = 'rgba(255, 230, 100, 0.4)';
      // Rays
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(-15, -15);
        ctx.lineTo(0, -70);
        ctx.lineTo(15, -15);
        ctx.closePath();
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 35, 0, Math.PI * 2);
      ctx.fillStyle = '#ffe033';
      ctx.fill();
      ctx.restore();

      // 3. Draw Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      clouds.forEach((cloud) => {
        ctx.save();
        ctx.translate(cloud.x, cloud.y);
        ctx.scale(cloud.scale, cloud.scale);
        ctx.beginPath();
        ctx.arc(50, 50, 30, 0, Math.PI * 2);
        ctx.arc(90, 40, 40, 0, Math.PI * 2);
        ctx.arc(130, 50, 30, 0, Math.PI * 2);
        ctx.arc(90, 65, 30, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // 4. Draw Birds
      ctx.strokeStyle = '#5a7c96';
      ctx.lineWidth = 2.5;
      birds.forEach((bird) => {
        ctx.save();
        ctx.translate(bird.x, bird.y);
        const wingOffset = Math.sin(bird.phase) * bird.size;
        ctx.beginPath();
        ctx.moveTo(-bird.size, wingOffset);
        ctx.quadraticCurveTo(-bird.size/2, -bird.size, 0, 0);
        ctx.quadraticCurveTo(bird.size/2, -bird.size, bird.size, wingOffset);
        ctx.stroke();
        ctx.restore();
      });

      // Apply master scaling for farm elements
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(sceneScale, sceneScale);

      // 5. Draw Far Mountains / Background Hills
      ctx.fillStyle = '#8bd388'; // soft green-teal
      ctx.beginPath();
      ctx.moveTo(-100, 560);
      ctx.quadraticCurveTo(width / (4 * sceneScale), 320, width / (2 * sceneScale), 440);
      ctx.quadraticCurveTo(width * 0.75 / sceneScale, 360, width / sceneScale + 100, 560);
      ctx.closePath();
      ctx.fill();

      // Draw Windmill on background hill
      drawWindmill(ctx, width * 0.4 / sceneScale, 400, time);

      // 6. Draw Foreground Hills
      ctx.fillStyle = '#60c968'; // bright grassy green
      ctx.beginPath();
      ctx.moveTo(-100, 560);
      ctx.quadraticCurveTo(200, 400, 500, 480);
      ctx.quadraticCurveTo(850, 380, width / sceneScale + 100, 560);
      ctx.closePath();
      ctx.fill();

      // Draw some background trees
      drawTree(ctx, 450, 460, 20);
      drawTree(ctx, 480, 470, 18);
      drawTree(ctx, 800, 440, 25);
      drawTree(ctx, 830, 445, 22);

      // Draw Barn
      drawBarn(ctx, 60, 360);

      // Draw Fences in middle
      drawFence(ctx, 350, 460, 4);

      // 7. Draw Milking Area (Left Foreground)
      // Cow is drawn at x=150, y=360
      drawCow(ctx, 150, 360, time);

      // Farmer is drawn at x=280, y=410
      drawMilkingFarmer(ctx, 290, 430, time);

      // Draw Bucket
      drawBucket(ctx, 220, 490, bucketLevel, rippleRadius);

      // Draw falling milk drops
      drawMilkDrops(ctx, milkDrops);

      // 8. Draw Selling Area (Right Foreground)
      // Shop Stall is at x=780, y=380
      drawMilkStall(ctx, 780, 380);

      // Merchant inside stall
      drawMerchant(ctx, 830, 400, time);

      // Customer
      if (customer.state !== 'waiting') {
        const drawCustX = customer.x / sceneScale;
        drawCustomer(ctx, drawCustX, 430, customer, time);
      }

      // Draw Floating Rupees
      drawRupees(ctx, coins);

      // Draw foreground details (flowers, grass clumps)
      drawGrassClump(ctx, 100, 530);
      drawGrassClump(ctx, 600, 520);
      drawGrassClump(ctx, 1000, 545);

      drawFlower(ctx, 340, 530, '#ff6b6b');
      drawFlower(ctx, 360, 540, '#ffd93d');
      drawFlower(ctx, 720, 525, '#ffffff');

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    // Sub-drawing helper functions
    function drawTree(ctx, x, y, size) {
      ctx.save();
      // Trunk
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(x - size/6, y, size/3, size);
      // Leaves
      ctx.fillStyle = '#388e3c';
      ctx.beginPath();
      ctx.arc(x, y, size*0.8, 0, Math.PI*2);
      ctx.arc(x - size*0.4, y - size*0.4, size*0.6, 0, Math.PI*2);
      ctx.arc(x + size*0.4, y - size*0.4, size*0.6, 0, Math.PI*2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawWindmill(ctx, x, y, time) {
      ctx.save();
      ctx.translate(x, y);

      // Tower
      ctx.fillStyle = '#eceff1';
      ctx.strokeStyle = '#b0bec5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-15, 80);
      ctx.lineTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.lineTo(15, 80);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cap
      ctx.fillStyle = '#b0bec5';
      ctx.beginPath();
      ctx.arc(0, 0, 8, Math.PI, 0);
      ctx.closePath();
      ctx.fill();

      // Sails/Blades
      ctx.save();
      ctx.rotate(time * 0.3);
      ctx.strokeStyle = '#78909c';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        // Stick
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -60);
        ctx.stroke();
        // Cloth
        ctx.fillRect(-8, -60, 8, 40);
        ctx.strokeRect(-8, -60, 8, 40);
      }
      ctx.restore();

      // center pin
      ctx.fillStyle = '#546e7a';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI*2);
      ctx.fill();

      ctx.restore();
    }

    function drawBarn(ctx, x, y) {
      ctx.save();
      ctx.translate(x, y);

      // Silo (next to barn)
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(-25, 30, 20, 90);
      ctx.fillStyle = '#b0bec5';
      ctx.fillRect(-25, 30, 4, 90);
      // Silo Dome
      ctx.fillStyle = '#d32f2f';
      ctx.beginPath();
      ctx.arc(-15, 30, 10, Math.PI, 0);
      ctx.fill();

      // Barn Body
      ctx.fillStyle = '#d32f2f'; // classic red barn
      ctx.strokeStyle = '#b71c1c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 120);
      ctx.lineTo(0, 60);
      ctx.lineTo(30, 25);
      ctx.lineTo(70, 25);
      ctx.lineTo(100, 60);
      ctx.lineTo(100, 120);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Barn Roof
      ctx.fillStyle = '#eceff1';
      ctx.beginPath();
      ctx.moveTo(-5, 62);
      ctx.lineTo(28, 20);
      ctx.lineTo(72, 20);
      ctx.lineTo(105, 62);
      ctx.lineTo(98, 62);
      ctx.lineTo(68, 27);
      ctx.lineTo(32, 27);
      ctx.lineTo(2, 62);
      ctx.closePath();
      ctx.fill();

      // Barn Door
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(35, 75, 30, 45);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(35, 75, 30, 45);
      // X beams on door
      ctx.beginPath();
      ctx.moveTo(35, 75);
      ctx.lineTo(65, 120);
      ctx.moveTo(65, 75);
      ctx.lineTo(35, 120);
      ctx.stroke();

      // Loft window
      ctx.fillStyle = '#37474f';
      ctx.beginPath();
      ctx.arc(50, 45, 8, Math.PI, 0);
      ctx.lineTo(58, 55);
      ctx.lineTo(42, 55);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.restore();
    }

    function drawFence(ctx, x, y, count) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = '#d7ccc8';
      ctx.strokeStyle = '#a1887f';
      ctx.lineWidth = 1.5;

      const spacing = 35;
      for (let i = 0; i < count; i++) {
        const px = i * spacing;
        // Posts
        ctx.fillRect(px, 0, 6, 40);
        ctx.strokeRect(px, 0, 6, 40);
        // Pointy tops
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px + 3, -5);
        ctx.lineTo(px + 6, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Rails
      ctx.fillRect(-5, 10, count * spacing, 5);
      ctx.strokeRect(-5, 10, count * spacing, 5);
      ctx.fillRect(-5, 25, count * spacing, 5);
      ctx.strokeRect(-5, 25, count * spacing, 5);

      ctx.restore();
    }

    function drawCow(ctx, x, y, time) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(-1, 1);
      ctx.translate(-150, 0);

      // Swaying Tail
      const tailAngle = Math.sin(time * 1.5) * 0.25;
      ctx.save();
      ctx.translate(15, 65);
      ctx.rotate(tailAngle);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-15, 20, -10, 45);
      ctx.stroke();
      // Tail puff
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-10, 45, 6, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();

      // Legs
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#bdbdbd';
      ctx.lineWidth = 2;
      // Back legs
      ctx.fillRect(25, 90, 10, 40);
      ctx.strokeRect(25, 90, 10, 40);
      ctx.fillRect(45, 90, 10, 40);
      ctx.strokeRect(45, 90, 10, 40);
      // Front legs
      ctx.fillRect(95, 90, 10, 40);
      ctx.strokeRect(95, 90, 10, 40);
      ctx.fillRect(115, 90, 10, 40);
      ctx.strokeRect(115, 90, 10, 40);

      // Hooves
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(25, 122, 10, 8);
      ctx.fillRect(45, 122, 10, 8);
      ctx.fillRect(95, 122, 10, 8);
      ctx.fillRect(115, 122, 10, 8);

      // Udders (pink)
      ctx.fillStyle = '#ff80ab';
      ctx.beginPath();
      ctx.arc(65, 90, 16, 0, Math.PI, false);
      ctx.fill();
      // Teats
      ctx.fillRect(55, 96, 4, 10);
      ctx.fillRect(63, 98, 4, 10);
      ctx.fillRect(71, 98, 4, 10);
      ctx.fillRect(79, 96, 4, 10);

      // Cow Body
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#757575';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(20, 35, 110, 60, 20);
      ctx.fill();
      ctx.stroke();

      // Cow Spots (Black patches)
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(45, 55, 12, 0, Math.PI * 2);
      ctx.arc(58, 45, 10, 0, Math.PI * 2);
      ctx.arc(88, 70, 15, 0, Math.PI * 2);
      ctx.arc(105, 50, 12, 0, Math.PI * 2);
      ctx.arc(120, 68, 8, 0, Math.PI * 2);
      ctx.fill();

      // Neck
      ctx.fillStyle = '#ffffff';
      ctx.save();
      ctx.translate(110, 45);
      ctx.rotate(-Math.PI/6);
      ctx.beginPath();
      ctx.roundRect(0, -25, 25, 45, 8);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Head
      ctx.save();
      ctx.translate(130, 25);
      // Head nodding
      const nod = Math.sin(time * 0.8) * 0.05;
      ctx.rotate(nod);

      // Horns
      ctx.fillStyle = '#eeeeee';
      ctx.strokeStyle = '#bdbdbd';
      ctx.beginPath();
      ctx.moveTo(-10, -20);
      ctx.quadraticCurveTo(-15, -35, -5, -40);
      ctx.quadraticCurveTo(-5, -28, -2, -22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Horn right
      ctx.beginPath();
      ctx.moveTo(10, -20);
      ctx.quadraticCurveTo(15, -35, 5, -40);
      ctx.quadraticCurveTo(5, -28, 2, -22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Ears
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-18, -10, 12, 6, -Math.PI/6, 0, Math.PI*2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ff80ab';
      ctx.beginPath();
      ctx.ellipse(-16, -10, 8, 3, -Math.PI/6, 0, Math.PI*2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(18, -10, 12, 6, Math.PI/6, 0, Math.PI*2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ff80ab';
      ctx.beginPath();
      ctx.ellipse(16, -10, 8, 3, Math.PI/6, 0, Math.PI*2);
      ctx.fill();

      // Head Base
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-16, -20, 32, 40, 10);
      ctx.fill();
      ctx.stroke();

      // Big Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-6, -6, 5, 0, Math.PI*2);
      ctx.arc(6, -6, 5, 0, Math.PI*2);
      ctx.fill();
      ctx.stroke();
      // Pupils (blinking)
      const blink = Math.floor(time) % 5 === 0 && (time % 1 < 0.15);
      if (!blink) {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-5, -6, 2.5, 0, Math.PI*2);
        ctx.arc(5, -6, 2.5, 0, Math.PI*2);
        ctx.fill();
        // Eye shine
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-6, -7, 1, 0, Math.PI*2);
        ctx.arc(4, -7, 1, 0, Math.PI*2);
        ctx.fill();
      } else {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-10, -6);
        ctx.lineTo(-2, -6);
        ctx.moveTo(2, -6);
        ctx.lineTo(10, -6);
        ctx.stroke();
      }

      // Snout (Pink)
      ctx.fillStyle = '#ff80ab';
      ctx.beginPath();
      ctx.roundRect(-18, 5, 36, 22, 10);
      ctx.fill();
      ctx.stroke();
      // Nostrils
      ctx.fillStyle = '#c2185b';
      ctx.beginPath();
      ctx.arc(-6, 12, 2.5, 0, Math.PI*2);
      ctx.arc(6, 12, 2.5, 0, Math.PI*2);
      ctx.fill();

      // Mouth chewing grass
      const chew = Math.abs(Math.sin(time * 3.5)) * 4;
      ctx.strokeStyle = '#2e7d32';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-5, 22);
      ctx.lineTo(-8, 22 + chew);
      ctx.lineTo(-12, 20 + chew);
      ctx.stroke();

      ctx.restore();

      ctx.restore();
    }

    function drawMilkingFarmer(ctx, x, y, time) {
      ctx.save();
      ctx.translate(x, y);

      // Stool
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(-12, 50, 24, 6);
      ctx.fillRect(-8, 56, 4, 18);
      ctx.fillRect(4, 56, 4, 18);

      // Farmer Body (Overall/apron)
      ctx.fillStyle = '#1565c0'; // blue overalls
      ctx.beginPath();
      ctx.roundRect(-15, 0, 30, 52, 10);
      ctx.fill();

      // Sleeves (yellow shirt)
      ctx.fillStyle = '#fbc02d';
      ctx.beginPath();
      ctx.roundRect(-22, 5, 8, 20, 4);
      ctx.roundRect(14, 5, 8, 20, 4);
      ctx.fill();

      // Hands milking (moving up/down)
      const handOffset = Math.sin(time * 5) * 5;
      ctx.fillStyle = '#ffcc80'; // skin tone
      // Left arm/hand
      ctx.beginPath();
      ctx.arc(-24, 25 + handOffset, 5, 0, Math.PI*2);
      ctx.fill();
      // Right arm/hand (offset phase)
      ctx.beginPath();
      ctx.arc(-32, 28 - handOffset, 5, 0, Math.PI*2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#ffcc80';
      ctx.beginPath();
      ctx.arc(0, -15, 12, 0, Math.PI*2);
      ctx.fill();

      // Eyes and Smile
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-4, -17, 1.5, 0, Math.PI*2);
      ctx.arc(4, -17, 1.5, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -12, 4, 0, Math.PI);
      ctx.stroke();

      // Straw Hat
      ctx.fillStyle = '#ffb300'; // straw color
      ctx.beginPath();
      ctx.ellipse(0, -25, 20, 6, 0, 0, Math.PI*2);
      ctx.fill();
      // Crown
      ctx.beginPath();
      ctx.arc(0, -25, 9, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#c67c00';
      ctx.stroke();

      ctx.restore();
    }

    // Draw bucket under cow
    function drawBucket(ctx, x, y, level, ripple) {
      ctx.save();
      ctx.translate(x, y);

      // Bucket back
      ctx.fillStyle = '#78909c';
      ctx.strokeStyle = '#455a64';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.lineTo(-10, 30);
      ctx.lineTo(10, 30);
      ctx.lineTo(15, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Milk inside
      ctx.save();
      // Clip to bucket interior
      ctx.beginPath();
      ctx.moveTo(-14, 2);
      ctx.lineTo(-9, 29);
      ctx.lineTo(9, 29);
      ctx.lineTo(14, 2);
      ctx.closePath();
      ctx.clip();

      // Draw milk fill
      const milkY = 30 - 28 * level;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-20, milkY, 40, 40);

      // Ripple effect
      if (ripple > 0) {
        ctx.strokeStyle = 'rgba(200, 220, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, milkY, ripple, ripple * 0.3, 0, 0, Math.PI*2);
        ctx.stroke();
      }
      ctx.restore();

      // Bucket rim
      ctx.strokeStyle = '#37474f';
      ctx.beginPath();
      ctx.ellipse(0, 0, 15, 3, 0, 0, Math.PI*2);
      ctx.stroke();

      // Handle
      ctx.beginPath();
      ctx.arc(0, 0, 15, Math.PI, 0);
      ctx.stroke();

      ctx.restore();
    }

    function drawMilkDrops(ctx, drops) {
      ctx.fillStyle = '#ffffff';
      drops.forEach((d) => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawMilkStall(ctx, x, y) {
      ctx.save();
      ctx.translate(x, y);

      // Stall Pillars
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(0, 20, 8, 110);
      ctx.fillRect(95, 20, 8, 110);

      // Counter Table
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(-10, 75, 123, 12);
      ctx.fillStyle = '#a1887f';
      ctx.fillRect(-10, 75, 123, 3); // top trim

      // Stall Base
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(-5, 87, 113, 43);

      // Milk Bottles on Counter
      drawStallBottle(ctx, 10, 52);
      drawStallBottle(ctx, 22, 52);
      drawStallBottle(ctx, 80, 52);

      // Roof Awning (striped red and white)
      const stripeWidth = 17;
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = (i % 2 === 0) ? '#d32f2f' : '#ffffff';
        ctx.fillRect(-8 + i * stripeWidth, 0, stripeWidth, 24);
        ctx.beginPath();
        ctx.arc(-8 + i * stripeWidth + stripeWidth/2, 24, stripeWidth/2, 0, Math.PI);
        ctx.fill();
      }

      // Shop Sign Board
      ctx.fillStyle = '#ffe082';
      ctx.strokeStyle = '#ffb300';
      ctx.lineWidth = 2.5;
      ctx.fillRect(15, 28, 70, 22);
      ctx.strokeRect(15, 28, 70, 22);

      ctx.fillStyle = '#5d4037';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('FRESH MILK', 50, 39);

      ctx.restore();
    }

    function drawStallBottle(ctx, bx, by) {
      ctx.save();
      ctx.translate(bx, by);

      // Glass body
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.strokeStyle = '#b0bec5';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(0, 8, 10, 15, 2);
      ctx.fill();
      ctx.stroke();

      // Milk fill
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, 11, 8, 11);

      // Neck
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillRect(3, 2, 4, 6);
      ctx.strokeRect(3, 2, 4, 6);

      // Blue cap
      ctx.fillStyle = '#1e88e5';
      ctx.fillRect(2, 0, 6, 3);

      ctx.restore();
    }

    function drawMerchant(ctx, x, y, time) {
      ctx.save();
      ctx.translate(x, y);

      // Body (clothed in green)
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.roundRect(0, 35, 28, 40, 6);
      ctx.fill();

      // Head
      ctx.fillStyle = '#ffcc80';
      ctx.beginPath();
      ctx.arc(14, 20, 11, 0, Math.PI*2);
      ctx.fill();

      // Face
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(10, 19, 1.2, 0, Math.PI*2);
      ctx.arc(18, 19, 1.2, 0, Math.PI*2);
      ctx.fill();
      // Smile
      ctx.beginPath();
      ctx.arc(14, 23, 3, 0, Math.PI);
      ctx.stroke();

      // Waving hand
      const wave = Math.sin(time * 2.5) * 6;
      ctx.fillStyle = '#ffcc80';
      ctx.save();
      ctx.translate(30, 42);
      ctx.rotate(wave * Math.PI/180);
      ctx.beginPath();
      ctx.arc(0, -10, 4, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = '#ffcc80';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-8, 8);
      ctx.lineTo(0, -10);
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    }

    function drawCustomer(ctx, x, y, cust, time) {
      ctx.save();
      ctx.translate(x, y);

      // Walking bounce
      const bounce = cust.state === 'walking_to_shop' || cust.state === 'walking_away' 
        ? Math.abs(Math.sin(time * 4)) * 5 
        : 0;

      ctx.translate(0, -bounce);

      // Legs walking motion
      ctx.strokeStyle = '#37474f';
      ctx.lineWidth = 3.5;
      if (cust.state === 'walking_to_shop' || cust.state === 'walking_away') {
        const legAngle = Math.sin(time * 6) * 12;
        // Leg 1
        ctx.beginPath();
        ctx.moveTo(8, 65);
        ctx.lineTo(8 - legAngle, 95);
        ctx.stroke();
        // Leg 2
        ctx.beginPath();
        ctx.moveTo(18, 65);
        ctx.lineTo(18 + legAngle, 95);
        ctx.stroke();
      } else {
        ctx.fillRect(8, 65, 4, 30);
        ctx.fillRect(16, 65, 4, 30);
      }

      // Shoes
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(6, 92, 7, 5);
      ctx.fillRect(15, 92, 7, 5);

      // Body
      ctx.fillStyle = '#ef5350'; // Red jacket
      ctx.beginPath();
      ctx.roundRect(2, 25, 22, 44, 8);
      ctx.fill();

      // Head
      ctx.fillStyle = '#ffcc80';
      ctx.beginPath();
      ctx.arc(13, 12, 10, 0, Math.PI*2);
      ctx.fill();

      // Face
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(9, 10, 1.2, 0, Math.PI*2);
      ctx.arc(17, 10, 1.2, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(13, 14, 3, 0, Math.PI);
      ctx.stroke();

      // Hair
      ctx.fillStyle = '#5d4037';
      ctx.beginPath();
      ctx.arc(13, 6, 10, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(3, 6, 4, 8);
      ctx.fillRect(19, 6, 4, 8);

      // Extended Hand
      ctx.fillStyle = '#ffcc80';
      if (cust.state === 'buying') {
        ctx.strokeStyle = '#ffcc80';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(4, 38);
        ctx.lineTo(-12, 32);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-12, 32, 4.5, 0, Math.PI*2);
        ctx.fill();

        // Milk bottle in hand
        if (cust.bottleScale > 0) {
          ctx.save();
          ctx.translate(-16, 12);
          ctx.scale(cust.bottleScale, cust.bottleScale);
          drawStallBottle(ctx, 0, 0);
          ctx.restore();
        }
      } else if (cust.state === 'walking_away' && cust.bottleScale > 0) {
        ctx.save();
        ctx.translate(22, 30);
        drawStallBottle(ctx, 0, 0);
        ctx.restore();
      }

      ctx.restore();
    }

    function drawRupees(ctx, coinsList) {
      coinsList.forEach((c) => {
        ctx.save();
        ctx.globalAlpha = c.alpha;
        ctx.translate(c.x, c.y);

        // Draw rupee circle
        ctx.fillStyle = '#ffd54f';
        ctx.strokeStyle = '#ffb300';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();

        // Symbol
        ctx.fillStyle = '#e65100';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.text, 0, 0.5);

        // sparkle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(6, -6, 2, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
      });
    }

    function drawGrassClump(ctx, x, y) {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = '#4caf50';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-8, -15, -12, -18);
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(0, -20, 2, -24);
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(8, -15, 14, -16);
      ctx.stroke();
      ctx.restore();
    }

    // Draw details
    function drawFlower(ctx, x, y, color) {
      ctx.save();
      ctx.translate(x, y);

      ctx.strokeStyle = '#4caf50';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-3, -12, -4, -20);
      ctx.stroke();

      ctx.translate(-4, -20);

      ctx.fillStyle = color;
      for (let i = 0; i < 5; i++) {
        ctx.rotate((Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.ellipse(0, -5, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#fdd835';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Start Animation
    render();

    // Clean up
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}

export default FarmAnimation;
