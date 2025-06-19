gsap.registerPlugin(ScrollToPlugin);

const ANIMATION_DURATION = .85;
const messages = Array.from(document.querySelectorAll('.bwv-display-message-box'));
const mq = window.matchMedia('(max-width: 40em)');
const overlay = document.querySelector('.overlay');

class Leaf extends HTMLElement {
    static CONFIG = {
        states: {
            default: {
                scale: 1,
                rotation: { x: 0, y: 0, z: 0 },
                position: { top: 0, left: 0 },
                zIndex: 0
            },
            expanded: {
                scale: 7.5,
                rotation: { x: 180, y: 180, z: 45 },
                position: { top: '50%', left: '50%' },
                zIndex: 2,
            }
        },
        animation: {
            duration: ANIMATION_DURATION,
            ease: 'sine.inOut'
        },
    };

    static LEAVES = Array.from(document.querySelectorAll('leaf-element'));

    constructor() {
        super();
        this.initialPosition = null;
        this.initialRotation = null;
        this.isAnimating = false;
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
        // this.addEventListener('mouseover', () => this.handleLeafMouseOver());
        // this.addEventListener('mouseleave', () => this.handleLeafMouseLeave());
        window.addEventListener('resize', () => this.handleResize());
    }

    handleLeafClick(e) {
        if (this.getAttribute('disabled')) return;
        e.preventDefault();
        e.currentTarget.blur();

        // Kill any ongoing animations
        gsap.killTweensOf(this);

        if (this.initialPosition === null || this.initialRotation === null) this.initPositioning();

        // Don't allow expansion if another leaf is already expanded
        if (!this.isExpanded && Leaf.LEAVES.some(leaf => leaf.isExpanded)) return;

        const config = this.getConfigurationForState();
        this.toggleExpansion();
        this.animateLeaf(config);
    }

    handleLeafMouseOver() {
        if (this.isExpanded || this.isAnimating) {
            return;
        }
        if (this.initialPosition === null || this.initialRotation === null) this.initPositioning();

        gsap.to(
            this,
            {
                rotation: this.initialRotation.z - 15,
                duration: 1,
                onComplete: () => {
                    gsap.fromTo(
                        this,
                        { rotation: this.initialRotation.z - 15 },
                        {
                            duration: 2,
                            rotation: this.initialRotation.z + 15,
                            yoyo: true,
                            repeat: -1,
                            // transformOrigin: "center bottom",
                            ease: "sine.inOut"
                        }
                    );
                }

            }
        );
    }

    handleLeafMouseLeave() {
        if (this.isExpanded || this.isAnimating) {
            return;
        }
        // Kill any ongoing animations
        gsap.killTweensOf(this);

        gsap.to(
            this,
            {
                rotation: this.initialRotation.z,
                duration: 1
            }
        );
    }

    handleResize() {
        this.setAttribute('data-expanded', 'false');

        this.removeAttribute('style');

        // Kill any ongoing animations
        gsap.killTweensOf(this);

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
        } else {
            // TODO: Alter scales here
            config.scale = mq.matches ? 3.5 : 7.5;
        }
        return { ...config, animation: Leaf.CONFIG.animation };
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
                this.isAnimating = true;
            },
            onComplete: () => {
                if (!this.isExpanded) this.style.zIndex = config.zIndex;
                this.isAnimating = false;
            }
        });
    }
}

customElements.define('leaf-element', Leaf);

Leaf.LEAVES.forEach((leaf, idx) => {
    leaf.addEventListener('click', () => {
        if (messages.some(msg => msg.classList.contains('active')) && !messages[idx].classList.contains('active')) {
            return;
        }

        if (leaf.getAttribute('disabled')) return;

        leaf.setAttribute('disabled', true);

        if (messages[idx].classList.contains('active')) {
            messages[idx].classList.toggle('active');
            overlay.classList.toggle('active');
            if (mq.matches) document.body.style.overflow = 'initial';
            leaf.removeAttribute('disabled');
        } else {
            setTimeout(() => {
                overlay.classList.toggle('active');
                messages[idx].classList.toggle('active');
                focusAndScroll(leaf).then(() => {
                    if (mq.matches) document.body.style.overflow = 'hidden';
                    leaf.removeAttribute('disabled');
                });
            }, ANIMATION_DURATION * 1000);
        }
    });
});


window.addEventListener('resize', () => {
    messages.forEach(msg => {
        msg.classList.remove('active');
    });
    overlay.classList.remove('active');
    document.body.style.overflow = 'initial';
});

async function focusAndScroll(el) {
    el.focus();

    const elRect = el.getBoundingClientRect();
    const elTop = window.scrollY + elRect.top;
    const elHeight = elRect.height;
    const windowHeight = window.innerHeight;

    const targetScrollY = elTop - (windowHeight / 2) + (elHeight / 2);

    await gsap.to(window, {
        duration: 0.5,
        scrollTo: {
            y: targetScrollY
        },
        ease: "power2.out"
    });
}