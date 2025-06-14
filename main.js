import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

// Audio setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioSource = null;
let analyser = null;
let dataArray = null;
let bufferLength = null;

// Create audio elements
const audio = new Audio();
audio.crossOrigin = "anonymous";

// Get music control buttons
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');
const songList = document.getElementById('songList');
const customSongInput = document.getElementById('customSong');

// Available songs
const songs = [
    'Cry For Me (feat. Bubi) - Ironmouse',
    'Blood & Thunder - Ministry of Dark',
    'Evil Twin (feat. Shuba) - Lindsey Stirling',
    'Azizam - Ed Sheeran (Rock Cover by Rain Paris)',
    'Aylex - Blast'
];

// Set up audio analysis
function setupAudioAnalysis() {
    // Only create a new source if one doesn't exist
    if (!audioSource) {
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        // Create new audio source
        audioSource = audioContext.createMediaElementSource(audio);
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
    }
}

// Populate song list
songs.forEach(song => {
    const songItem = document.createElement('div');
    songItem.className = 'song-item';
    songItem.textContent = song;
    songItem.addEventListener('click', async () => {
        try {
            // Remove active class from all items
            document.querySelectorAll('.song-item').forEach(item => item.classList.remove('active'));
            // Add active class to clicked item
            songItem.classList.add('active');
            
            // Stop current playback if any
            audio.pause();
            audio.currentTime = 0;
            
            // Update audio source
            audio.src = `music/${song}.mp3`;
            
            // Wait for audio to be loaded
            await new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', resolve, { once: true });
                audio.addEventListener('error', reject, { once: true });
                audio.load();
            });
            
            // Update button states
            playButton.classList.remove('hidden');
            pauseButton.classList.add('hidden');
            stopButton.classList.add('hidden');
        } catch (error) {
            console.error('Error loading song:', error);
            alert('Error loading song. Please try another song.');
        }
    });
    songList.appendChild(songItem);
});

// Handle custom song upload
customSongInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'audio/mpeg') {
        try {
            const url = URL.createObjectURL(file);
            audio.src = url;
            
            // Wait for audio to be loaded
            await new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', resolve, { once: true });
                audio.addEventListener('error', reject, { once: true });
                audio.load();
            });
            
            // Add to song list
            const songItem = document.createElement('div');
            songItem.className = 'song-item active';
            songItem.textContent = file.name.replace('.mp3', '');
            // Remove active class from all items
            document.querySelectorAll('.song-item').forEach(item => item.classList.remove('active'));
            songList.insertBefore(songItem, songList.firstChild);
            
            // Update button states
            playButton.classList.remove('hidden');
            pauseButton.classList.add('hidden');
            stopButton.classList.add('hidden');
        } catch (error) {
            console.error('Error loading uploaded song:', error);
            alert('Error loading uploaded song. Please try another file.');
        }
    }
});

// Handle play button click
playButton.addEventListener('click', async () => {
    try {
        if (!audio.src) {
            // If no song is selected, select the first one
            const firstSong = document.querySelector('.song-item');
            if (firstSong) {
                firstSong.click();
                // Wait a moment for the song to load
                await new Promise(resolve => setTimeout(resolve, 100));
            } else {
                throw new Error('No songs available');
            }
        }
        
        // Resume audio context if suspended
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        
        // Play the audio
        await audio.play();
        playButton.classList.add('hidden');
        pauseButton.classList.remove('hidden');
        stopButton.classList.remove('hidden');
    } catch (error) {
        console.error('Error playing audio:', error);
        alert('Could not play audio. Please ensure the audio file exists and is accessible.');
    }
});

// Handle pause button click
pauseButton.addEventListener('click', async () => {
    try {
        audio.pause();
        pauseButton.classList.add('hidden');
        playButton.classList.remove('hidden');
    } catch (error) {
        console.error('Error pausing audio:', error);
    }
});

// Handle stop button click
stopButton.addEventListener('click', async () => {
    try {
        audio.pause();
        audio.currentTime = 0;
        pauseButton.classList.add('hidden');
        stopButton.classList.add('hidden');
        playButton.classList.remove('hidden');
    } catch (error) {
        console.error('Error stopping audio:', error);
    }
});

// Handle audio end
audio.addEventListener('ended', () => {
    pauseButton.classList.add('hidden');
    stopButton.classList.add('hidden');
    playButton.classList.remove('hidden');
});

// Video setup with proper error handling
const videoElement = document.getElementById('videoElement');
const canvasOverlay = document.getElementById('canvasOverlay');
const ctx = canvasOverlay.getContext('2d');

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 2;

// Create face outline geometry
const faceOutlineGeometry = new THREE.BufferGeometry();
const faceOutlineMaterial = new THREE.LineBasicMaterial({ 
    color: 0xffff00,
    linewidth: 2
});
const faceOutline = new THREE.Line(faceOutlineGeometry, faceOutlineMaterial);
scene.add(faceOutline);

// Create eyes geometry
const leftEyeGeometry = new THREE.BufferGeometry();
const rightEyeGeometry = new THREE.BufferGeometry();
const eyeMaterial = new THREE.LineBasicMaterial({ 
    color: 0xffff00,
    linewidth: 2
});
const leftEye = new THREE.Line(leftEyeGeometry, eyeMaterial);
const rightEye = new THREE.Line(rightEyeGeometry, eyeMaterial);
scene.add(leftEye);
scene.add(rightEye);

// Create audio visualization
const audioGeometry = new THREE.BufferGeometry();
const audioMaterial = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
    vertexColors: true // Enable vertex colors
});
const audioMesh = new THREE.Mesh(audioGeometry, audioMaterial);
scene.add(audioMesh);

// Add particle system setup after the audio mesh setup
const particleCount = 1000;
const particles = new Float32Array(particleCount * 3);
const particleVelocities = new Float32Array(particleCount * 3);
const particleAges = new Float32Array(particleCount);
const particleLifetimes = new Float32Array(particleCount);

// Initialize particles
for (let i = 0; i < particleCount; i++) {
    particleAges[i] = -1;
    particleLifetimes[i] = 3 + Math.random() * 2; // Longer lifetime: 3-5 seconds
}

const particleGeometry = new THREE.BufferGeometry();
const particleMaterial = new THREE.PointsMaterial({
    size: 0.03, // Smaller particles
    transparent: true,
    opacity: 0.8,
    vertexColors: true,
    blending: THREE.AdditiveBlending
});

const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleSystem);

// Face mesh landmark indices for outline and eyes
const FACE_OUTLINE_INDICES = [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
    397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
    172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
];

const LEFT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const RIGHT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

// Add results variable for face mesh
let results = null;
let isFaceTracking = false;

function updateFaceVisualization(landmarks) {
    // Clear the canvas completely
    ctx.clearRect(0, 0, canvasOverlay.width, canvasOverlay.height);
    
    // Get audio data for visualization
    let audioData = new Uint8Array(0);
    let isMusicPlaying = false;
    if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        audioData = dataArray;
        const audioLevel = audioData.reduce((a, b) => a + b, 0) / audioData.length;
        isMusicPlaying = audioLevel > 5;
    }
    
    // Calculate different frequency bands for color control
    const bassFreq = audioData.slice(0, 5).reduce((a, b) => a + b, 0) / 1275;
    const midFreq = audioData.slice(5, 15).reduce((a, b) => a + b, 0) / 2550;
    const highFreq = audioData.slice(15, 30).reduce((a, b) => a + b, 0) / 3825;
    
    // Create dynamic gradient based on audio frequencies
    const time = Date.now() * 0.001;
    
    // Calculate mesh center for gradient origin
    let meshCenterX = 0;
    let meshCenterY = 0;
    FACE_OUTLINE_INDICES.forEach(index => {
        const lm = landmarks[index];
        meshCenterX += lm.x * canvasOverlay.width;
        meshCenterY += lm.y * canvasOverlay.height;
    });
    meshCenterX /= FACE_OUTLINE_INDICES.length;
    meshCenterY /= FACE_OUTLINE_INDICES.length;
    
    // Create vertical gradient emerging from mesh center
    const gradient = ctx.createLinearGradient(
        meshCenterX, meshCenterY, // Start at mesh center
        meshCenterX, meshCenterY - canvasOverlay.height // Extend upward
    );
    
    // Base hue rotation speed on bass frequencies
    const baseHue = (time * 20 + bassFreq * 180) % 360;
    
    // Add vibrant rainbow colors to gradient with audio influence
    // Using more saturated colors and adding more color stops for smoother transitions
    gradient.addColorStop(0, `hsl(${baseHue}, 100%, 50%)`); // Start with pure color at mesh
    gradient.addColorStop(0.1, `hsl(${(baseHue + 30) % 360}, 100%, 50%)`);
    gradient.addColorStop(0.2, `hsl(${(baseHue + 60) % 360}, 100%, 50%)`);
    gradient.addColorStop(0.3, `hsl(${(baseHue + 90) % 360}, 100%, 50%)`);
    gradient.addColorStop(0.4, `hsl(${(baseHue + 120) % 360}, 100%, 50%)`);
    gradient.addColorStop(0.5, `hsl(${(baseHue + 150) % 360}, 100%, 50%)`);
    gradient.addColorStop(0.6, `hsl(${(baseHue + 180) % 360}, 100%, 50%)`);
    gradient.addColorStop(0.7, `hsl(${(baseHue + 210) % 360}, 100%, 50%)`);
    gradient.addColorStop(0.8, `hsl(${(baseHue + 240) % 360}, 100%, 50%)`);
    gradient.addColorStop(0.9, `hsl(${(baseHue + 270) % 360}, 100%, 50%)`);
    gradient.addColorStop(1, `hsl(${(baseHue + 300) % 360}, 100%, 50%)`);
    
    // Calculate wobble effect based on music intensity
    const wobbleIntensity = isMusicPlaying ? bassFreq * 0.1 : 0;
    const wobbleX = Math.sin(time * 5) * wobbleIntensity;
    const wobbleY = Math.cos(time * 3) * wobbleIntensity;
    
    // Draw glow effect with audio-reactive intensity
    if (isMusicPlaying) {
        const glowIntensity = 10 + bassFreq * 20;
        ctx.shadowBlur = glowIntensity;
        ctx.shadowColor = `hsl(${baseHue}, 100%, 50%)`; // Match the vibrant color
    } else {
        ctx.shadowBlur = 0;
    }
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    
    // Apply wobble transformation
    ctx.save();
    ctx.translate(canvasOverlay.width / 2, canvasOverlay.height / 2);
    ctx.rotate(wobbleX);
    ctx.translate(-canvasOverlay.width / 2, -canvasOverlay.height / 2);
    
    // Draw face outline with sharp corners
    ctx.beginPath();
    FACE_OUTLINE_INDICES.forEach((index, i) => {
        const lm = landmarks[index];
        const x = lm.x * canvasOverlay.width;
        const y = lm.y * canvasOverlay.height;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.closePath();
    ctx.stroke();
    
    // Draw eyes with sharp corners
    // Left eye
    ctx.beginPath();
    LEFT_EYE_INDICES.forEach((index, i) => {
        const lm = landmarks[index];
        const x = lm.x * canvasOverlay.width;
        const y = lm.y * canvasOverlay.height;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.closePath();
    ctx.stroke();
    
    // Right eye
    ctx.beginPath();
    RIGHT_EYE_INDICES.forEach((index, i) => {
        const lm = landmarks[index];
        const x = lm.x * canvasOverlay.width;
        const y = lm.y * canvasOverlay.height;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.closePath();
    ctx.stroke();
    
    // Restore transformation
    ctx.restore();
    
    // Reset shadow for next frame
    ctx.shadowBlur = 0;
}

function updateAudioVisualization(dataArray) {
    const positions = [];
    const colors = [];
    
    // Calculate average intensity for color
    const averageIntensity = dataArray.slice(0, 20).reduce((a, b) => a + b, 0) / 5120;
    const hue = (averageIntensity * 720) % 360;
    
    // Define colors for the particles
    const colorStart = new THREE.Color().setHSL(hue / 360, 1, 0.5);
    const colorEnd = new THREE.Color().setHSL(hue / 360, 1, 0.8);

    if (!results || !results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        return;
    }
    
    // Get face center position
    const faceCenter = new THREE.Vector3();
    FACE_OUTLINE_INDICES.forEach(index => {
        const lm = results.multiFaceLandmarks[0][index];
        faceCenter.x += (lm.x - 0.5) * 4;
        faceCenter.y += (lm.y - 0.5) * 4;
        faceCenter.z += lm.z * 2;
    });
    faceCenter.divideScalar(FACE_OUTLINE_INDICES.length);

    // Check if music is playing
    const isMusicPlaying = averageIntensity > 0.1;

    // Update particles
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        if (!isMusicPlaying) {
            // Reset particles when no music
            particleAges[i] = -1;
            particles[i3] = 0;
            particles[i3 + 1] = 0;
            particles[i3 + 2] = 0;
            continue;
        }

        if (particleAges[i] < 0) {
            // Spawn new particle
            if (Math.random() < 0.05) { // Slower spawn rate
                const angle = Math.random() * Math.PI * 2;
                const radius = 0.8; // Closer spawn radius
                
                particles[i3] = faceCenter.x + Math.cos(angle) * radius;
                particles[i3 + 1] = faceCenter.y + Math.sin(angle) * radius;
                particles[i3 + 2] = faceCenter.z;
                
                // Set initial velocity outward (slower)
                const speed = 0.1 + Math.random() * 0.1; // Much slower speed
                particleVelocities[i3] = Math.cos(angle) * speed;
                particleVelocities[i3 + 1] = Math.sin(angle) * speed;
                particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.05;
                
                particleAges[i] = 0;
            }
        } else {
            // Update existing particle
            particleAges[i] += 0.016;
            
            if (particleAges[i] >= particleLifetimes[i]) {
                particleAges[i] = -1;
                continue;
            }
            
            // Update position based on velocity
            particles[i3] += particleVelocities[i3];
            particles[i3 + 1] += particleVelocities[i3 + 1];
            particles[i3 + 2] += particleVelocities[i3 + 2];
            
            // Add very subtle randomness to movement
            particleVelocities[i3] += (Math.random() - 0.5) * 0.002;
            particleVelocities[i3 + 1] += (Math.random() - 0.5) * 0.002;
            
            // Keep particles within a maximum distance from center
            const dx = particles[i3] - faceCenter.x;
            const dy = particles[i3 + 1] - faceCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 1.2; // Maximum distance from center
            
            if (distance > maxDistance) {
                // Pull particles back if they go too far
                const pullFactor = 0.1;
                particles[i3] = faceCenter.x + (dx / distance) * maxDistance;
                particles[i3 + 1] = faceCenter.y + (dy / distance) * maxDistance;
                // Reduce velocity when pulling back
                particleVelocities[i3] *= 0.9;
                particleVelocities[i3 + 1] *= 0.9;
            }
            
            // Calculate color based on age
            const ageRatio = particleAges[i] / particleLifetimes[i];
            const color = new THREE.Color().lerpColors(colorStart, colorEnd, ageRatio);
            
            // Add to geometry
            positions.push(particles[i3], particles[i3 + 1], particles[i3 + 2]);
            colors.push(color.r, color.g, color.b);
        }
    }
    
    // Update particle system
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    particleGeometry.attributes.position.needsUpdate = true;
    particleGeometry.attributes.color.needsUpdate = true;
}

// Face Mesh setup with error handling
const faceMesh = new FaceMesh({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

let currentStream = null;
let selectedDeviceId = localStorage.getItem('preferredCam');
let isProcessingFrame = false;

faceMesh.onResults(newResults => {
    results = newResults;
    const loader = document.querySelector('.loader');
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        if (!isFaceTracking) {
            isFaceTracking = true;
            if (loader) loader.style.display = 'none';
        }
        updateFaceVisualization(results.multiFaceLandmarks[0]);
    } else {
        isFaceTracking = false;
        if (loader) loader.style.display = 'inline-grid';
    }
});

// Manual MediaPipe frame loop
async function requestVideoFrame() {
    if (videoElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        try {
            await faceMesh.send({ image: videoElement });
        } catch (e) {
            console.error("FaceMesh error:", e);
        }
    }
    // Use requestAnimationFrame as a fallback for browsers that don't support requestVideoFrameCallback
    if (videoElement.requestVideoFrameCallback) {
        videoElement.requestVideoFrameCallback(requestVideoFrame);
    } else {
        requestAnimationFrame(requestVideoFrame);
    }
}

// Strict camera start function that never falls back
async function startCamera(deviceId) {
    // stop any old stream
    if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
        currentStream = null;
    }

    try {
        const constraints = {
            video: { 
                deviceId: { exact: deviceId },
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        };
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = currentStream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                videoElement.play().then(() => {
                    console.log('Video element started playing');
                    resolve();
                }).catch(e => {
                    console.error('Error playing video:', e);
                    resolve();
                });
            };
        });

        // Set canvas size to match video
        canvasOverlay.width = videoElement.videoWidth;
        canvasOverlay.height = videoElement.videoHeight;
        
        // Start frame loop
        requestVideoFrame();
    } catch (err) {
        console.error("Could not start camera:", err);
        alert("Failed to open that camera. Try selecting another.");
    }
}

// Initialize devices with permission request
async function initDevices() {
    // 1) ask for any camera once, so labels become available
    try {
        const tmp = await navigator.mediaDevices.getUserMedia({ 
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });
        tmp.getTracks().forEach(t => t.stop());
    } catch (e) {
        console.warn("No camera permission yet:", e);
    }

    // 2) now build a clean list of *real* cameras
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cams = devices
        .filter(d => d.kind === "videoinput")
        // drop anything whose label looks like a virtual cam
        .filter(d => !/virtual|vcam|obs/i.test(d.label));

    const select = document.getElementById("cameraSelect");
    select.innerHTML = '<option value="">Select Camera</option>';

    cams.forEach(cam => {
        const option = new Option(cam.label || `Camera ${cams.indexOf(cam) + 1}`, cam.deviceId);
        select.append(option);
    });

    // 3) wire up change → startCamera + store
    select.onchange = () => {
        const id = select.value;
        if (!id) return;
        localStorage.setItem("preferredCam", id);
        startCamera(id);
    };

    // 4) restore last choice if still present
    const saved = localStorage.getItem("preferredCam");
    if (saved && cams.some(c => c.deviceId === saved)) {
        select.value = saved;
        startCamera(saved);
    }
}

// Initialize audio analysis once
setupAudioAnalysis();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update audio visualization
    if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        updateAudioVisualization(dataArray);
    }
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start everything
initDevices();
animate();
