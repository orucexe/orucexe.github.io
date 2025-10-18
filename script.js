const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const starsGeometry = new THREE.BufferGeometry();
const starVertices = [];
for(let i=0; i<10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
}
starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.7 });
const starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);

// Audio Setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioSource, analyser, audioBuffer, isPlaying = false;

const selectBtn = document.getElementById('selectBtn');
const playBtn = document.getElementById('playBtn');
const audioInput = document.getElementById('audioInput');
const songName = document.getElementById('songName');
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');
const playText = document.querySelector('.play-text');
const moodToggle = document.getElementById('moodToggle');
const musicPlayer = document.getElementById('musicPlayer');
const socialLinks = document.querySelector('.social-links');

moodToggle.addEventListener('click', () => {
    moodToggle.classList.toggle('active');
    musicPlayer.classList.toggle('show');
});

selectBtn.addEventListener('click', () => {
    audioInput.click();
});

audioInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function() {
        audioContext.decodeAudioData(reader.result, function(buffer) {
            audioBuffer = buffer;
            songName.textContent = file.name.replace(/\.[^/.]+$/, "");
            playBtn.disabled = false;
            
            if (audioSource) {
                audioSource.stop();
                isPlaying = false;
                playBtn.classList.remove('playing');
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                playText.textContent = 'Play';
            }
        });
    };
    reader.readAsArrayBuffer(file);
});

playBtn.addEventListener('click', () => {
    if (!audioBuffer) return;
    
    if (isPlaying) {
        audioSource.stop();
        isPlaying = false;
        playBtn.classList.remove('playing');
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        playText.textContent = 'Play';
    } else {
        if (audioSource) audioSource.stop();
        
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        
        analyser = audioContext.createAnalyser();
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
        
        audioSource.start(0);
        isPlaying = true;
        playBtn.classList.add('playing');
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        playText.textContent = 'Pause';
        
        audioSource.onended = () => {
            isPlaying = false;
            playBtn.classList.remove('playing');
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            playText.textContent = 'Play';
        };
    }
});

camera.position.z = 1000;
function animate() {
    requestAnimationFrame(animate);
    
    starField.rotation.x += 0.0005;
    starField.rotation.y += 0.0005;
    
    if(analyser) {
        const frequencyData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(frequencyData);
        const average = frequencyData.reduce((a,b) => a + b) / frequencyData.length;
        starField.scale.set(1 + average/100, 1 + average/100, 1 + average/100);
    }
    
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

document.addEventListener('mousemove', (e) => {
    starField.rotation.x = (e.clientY / window.innerHeight - 0.5) * 2;
    starField.rotation.y = (e.clientX / window.innerWidth - 0.5) * 2;
});

document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    starField.rotation.x = (touch.clientY / window.innerHeight - 0.5) * 2;
    starField.rotation.y = (touch.clientX / window.innerWidth - 0.5) * 2;
});

gsap.registerPlugin();

const tl = gsap.timeline({ delay: 1 });

const letters = document.querySelectorAll('.letter');

letters.forEach((letter, index) => {
    tl.to(letter, {
        opacity: 1,
        scale: 1,
        x: 0,
        rotationY: 0,
        duration: 1.2,
        ease: "elastic.out(1, 0.5)",
        transformOrigin: "center center"
    }, index * 0.12);
});

tl.to(".letter", {
    animation: "professionalGlow 4s ease-in-out infinite",
    duration: 0.1
}, "-=0.3");

const typingText = document.querySelector('.typing-text');
const prefix = document.querySelector('.prefix');
const cursor = document.querySelector('.cursor');
const titles = [
    'Oruc Cabbarlı',
    'from Azerbaijan',
    'Competitive Programmer',
    'AI explorer',
    'Robotics Engineer'
];

let titleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

tl.to(prefix, {
    opacity: 1,
    duration: 0.8,
    ease: "elastic.out(1, 0.6)"
}, "-=0.5");

tl.to(cursor, {
    opacity: 1,
    duration: 0.3,
    ease: "power2.out",
    onComplete: () => {
        cursor.classList.add('active');
    }
}, "+=0.2");

function typeWriter() {
    const currentTitle = titles[titleIndex];
    if (isDeleting) {
        typingText.textContent = currentTitle.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        typingText.textContent = currentTitle.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
    }
    
    if (!isDeleting && charIndex === currentTitle.length) {
        typingSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        typingSpeed = 500;
    }
    
    setTimeout(typeWriter, typingSpeed);
}

setTimeout(() => {
    typeWriter();
}, 3000);

document.querySelector(".orucexe-text").addEventListener("mouseenter", () => {
    gsap.to(".letter", {
        scale: 1.15,
        duration: 0.6,
        ease: "elastic.out(1, 0.4)",
        stagger: 0.04
    });
});

document.querySelector(".orucexe-text").addEventListener("mouseleave", () => {
    gsap.to(".letter", {
        scale: 1,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)",
        stagger: 0.03
    });
});

document.querySelector(".subtitle").addEventListener("mouseenter", () => {
    gsap.to(".typing-text", {
        scale: 1.1,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)"
    });
    gsap.to(".cursor", {
        scale: 1.2,
        duration: 0.3,
        ease: "power2.out"
    });
});

document.querySelector(".subtitle").addEventListener("mouseleave", () => {
    gsap.to(".typing-text", {
        scale: 1,
        duration: 0.6,
        ease: "elastic.out(1, 0.6)"
    });
    gsap.to(".cursor", {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
    });
});

let audioAnimation = gsap.timeline({ paused: true });
audioAnimation.to(".letter", {
    scale: 1.3,
    duration: 0.15,
    ease: "power2.out",
    stagger: 0.02
}).to(".letter", {
    scale: 1,
    duration: 1,
    ease: "elastic.out(1, 0.5)",
    stagger: 0.02
});

let subAudioAnimation = gsap.timeline({ paused: true });
subAudioAnimation.to(".typing-text, .cursor", {
    y: -5,
    scale: 1.15,
    duration: 0.1,
    ease: "power2.out"
}).to(".typing-text, .cursor", {
    y: 0,
    scale: 1,
    duration: 0.8,
    ease: "elastic.out(1, 0.5)"
});

function updateAudioVisualization() {
    if(analyser) {
        const frequencyData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(frequencyData);
        const average = frequencyData.reduce((a,b) => a + b) / frequencyData.length;
        
        if(average > 20) {
            audioAnimation.restart();
            if(average > 40) {
                subAudioAnimation.restart();
            }
        }
    }
    requestAnimationFrame(updateAudioVisualization);
}
updateAudioVisualization();