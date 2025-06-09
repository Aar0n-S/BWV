const ANIMATION_DURATION = 1.25;

const messages = Array.from(document.querySelectorAll('.bwv-display-message-box'));

const mq = window.matchMedia('(max-width: 40em)');

class Leaf extends HTMLElement {
    static CONFIG = {
        states: {
            default: {
                scale: 1,
                rotation: {x: 0, y: 0, z: 0},
                position: {top: 0, left: 0},
                zIndex: 0
            },
            expanded: {
                scale: 7.5,
                rotation: {x: 180, y: 180, z: 45},
                position: {top: '50%', left: '50%'},
                zIndex: 2,
            }
        },
        animation: {
            duration: ANIMATION_DURATION,
            ease: 'sine.inOut'
        },
    };

    static LEAVES = Array.from(document.querySelectorAll('button[is="leaf-element"]'));

    constructor() {
        super();
        this.initialPosition = null;
        this.initialRotation = null;
    }

    connectedCallback() {
        this.initialiseEventListeners();
        // Initialise with collapsed state
        this.setAttribute('data-expanded', 'false');
        gsap.set(this, {
            xPercent: -50,
            yPercent: -50
        });

    }

    initialiseEventListeners() {
        this.addEventListener('click', (e) => this.handleLeafClick(e));
        window.addEventListener('resize', () => this.handleResize());
    }

    handleLeafClick(e) {
        e.preventDefault();
        e.currentTarget.blur();

        if (this.initialPosition === null || this.initialRotation === null) this.initPositioning();

        // Don't allow expansion if another leaf is already expanded
        if (!this.isExpanded && Leaf.LEAVES.some(leaf => leaf.isExpanded)) return;

        const config = this.getConfigurationForState();
        this.toggleExpansion();
        this.animateLeaf(config);
    }

    handleResize() {
        messages.forEach(message => message.classList.remove('active'));

        this.setAttribute('data-expanded', 'false');

        this.removeAttribute('style');

        // Kill any ongoing animations
        gsap.killTweensOf(this)

        // Clear GSAP inline styles
        gsap.set(this, {
            clearProps: "all",
        });

        gsap.set(this, {
            xPercent: -50,
            yPercent: -50
        });

        // Force a reflow
        this.offsetHeight;

        // Reset initial values
        this.initialPosition = null;
        this.initialRotation = null;

        // Reinitialise positioning
        this.initPositioning();
    }


    get isExpanded() {
        return this.getAttribute('data-expanded') === 'true';
    }

    toggleExpansion() {
        this.setAttribute('data-expanded', (!this.isExpanded).toString());
    }

    initPositioning() {
        this.initialPosition = this.calculateInitialPosition(this);
        this.initialRotation = this.calculateInitialRotation(this);
    }

    calculateInitialPosition(element) {
        const tree = document.querySelector('.tree');
        return {
            top: `${(gsap.getProperty(element, 'top') / gsap.getProperty(tree, 'height')) * 100}%`,
            left: `${(gsap.getProperty(element, 'left') / gsap.getProperty(tree, 'width')) * 100}%`
        };
    }

    calculateInitialRotation(element) {
        return {
            x: gsap.getProperty(element, 'rotationX') ?? 0,
            y: gsap.getProperty(element, 'rotationY') ?? 0,
            z: gsap.getProperty(element, 'rotationZ') ?? 0
        };
    }

    getConfigurationForState() {
        const config = this.isExpanded ? Leaf.CONFIG.states.default : Leaf.CONFIG.states.expanded;
        if (this.isExpanded) {
            config.position = this.initialPosition;
            config.rotation = this.initialRotation;
        }
        else {
            config.scale = mq.matches ? 3.5 : 7.5;
        }
        return {...config, animation: Leaf.CONFIG.animation};
    }

    scrollToLeaf() {
        const rect = this.getBoundingClientRect();
        const elementCenter = rect.top + window.scrollY + (rect.height / 2);
        const windowCenter = window.innerHeight / 2;
        const scrollToPosition = elementCenter - windowCenter;

        window.scrollTo({
            top: scrollToPosition,
            behavior: 'smooth'
        });
    }

    animateLeaf(config) {
        gsap.to(this, {
            scale: config.scale,
            rotationX: config.rotation.x,
            rotationY: config.rotation.y,
            rotationZ: config.rotation.z,
            top: config.position.top,
            left: config.position.left,
            ...config.animation,
            onStart: () => {
                if (this.isExpanded) this.style.zIndex = config.zIndex;
            },
            onComplete: () => {
                if (this.isExpanded) this.scrollToLeaf();
                if (!this.isExpanded) this.style.zIndex = config.zIndex;
            }
        });
    }
}

customElements.define('leaf-element', Leaf);

Leaf.LEAVES.forEach((leaf, idx) => {
    leaf.addEventListener('click', () => {
        // If there is an active message which isn't this one, do nothing
        if (messages.some(msg => msg.classList.contains('active')) && !messages[idx].classList.contains('active')) {
            return;
        }
        if (messages[idx].classList.contains('active')) {
            messages[idx].classList.toggle('active');
        } else {
            setTimeout(() => {
                messages[idx].classList.toggle('active');
            }, ANIMATION_DURATION * 1000)
        }

    });
});