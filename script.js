class LeafManager {
    static CONFIG = {
        default: {
            scale: 1,
            rotation: { y: 0, z: 0 },
            position: 'original',
            zIndex: 0
        },
        expanded: {
            scale: 7.5,
            rotation: { y: 180, z: -45 },
            position: { top: '50%', left: '50%' },
            transform: { x: -50, y: -50 },
            zIndex: 999999,
        },
        animation: {
            duration: 1,
            ease: 'power1.inOut'
        }
    };

    constructor() {
        this.leaves = document.querySelectorAll('.leaf');
        this.messageBoxes = document.querySelectorAll('.bwv-display-message-box');
        this.positions = this.calculatePositions();
        this.activeIndex = null;

        this.leaves.forEach((leaf, index) => {
            leaf.addEventListener('click', () => this.toggleLeaf(index));
        });
    }

    // Store top and left positions of each leaf
    calculatePositions() {
        const container = document.querySelector('.backgroundContainer');
        return Array.from(this.leaves).map(leaf => ({
            top: (gsap.getProperty(leaf, 'top') / gsap.getProperty(container, 'height')) * 100,
            left: (gsap.getProperty(leaf, 'left') / gsap.getProperty(container, 'width')) * 100
        }));
    }

    toggleLeaf(index) {
        if (this.activeIndex !== null && this.activeIndex !== index) return;

        // If activeIndex is null, the leaf needs to flip
        const isFlipping = this.activeIndex === null;
        // If the leaf does not need to flip, there is no activeIndex
        this.activeIndex = isFlipping ? index : null;
        
        const leaf = this.leaves[index];
        const messageBox = this.messageBoxes[index];

        // Use the default config when not flipping leaf
        const config = isFlipping ? LeafManager.CONFIG.expanded : LeafManager.CONFIG.default;

        gsap.to(leaf, {
            scale: config.scale,
            rotationY: config.rotation.y,
            rotationZ: config.rotation.z,
            top: isFlipping ? config.position.top : `${this.positions[index].top}%`,
            left: isFlipping ? config.position.left : `${this.positions[index].left}%`,
            xPercent: config.transform?.x ?? 0,
            yPercent: config.transform?.y ?? 0,
            zIndex: config.zIndex,
            ...LeafManager.CONFIG.animation,
            onStart: () => !isFlipping && (messageBox.style.display = 'none'),
            onComplete: () => isFlipping && (messageBox.style.display = 'initial')
        });
    }
}

window.addEventListener('load', () => new LeafManager());