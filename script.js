// let flipped = false;

// //GSAP animation with staggered effect
// gsap.from(".leaf", {
//   rotationY: 180,
//   scale: 0,
//   opacity: 0,
//   duration: 1,
//   stagger: 0.5,
//   ease: "power3.out"
// });

// //Add click event to trigger animation on individual leaves
// const leaves = document.querySelectorAll('.leaf');

// leaves.forEach(leaf => {
//   leaf.addEventListener('click', () => {
//     if (flipped == false) {
//       gsap.to(leaf, {
//         transformOrigin: "25% 25%",
//         rotationY: 180, // Rotate the leaf on click
//         y: -50,//move upwards
//         //scale:1.2, //slightly enlarge the leaf 
//         duration: 1,//duration of the animation 
//         //repeat:2,
//         ease: 'power1.inOut'//smoothing easing for rotation and movement
//       });
//       flipped = true;
//     } else {
//       gsap.to(leaf, {
//         transformOrigin: "25% 25%",
//         rotationY: 360,
//         y: 50,
//         duration: 1,
//         ease: 'power1.inOut'//smoothing easing for rotation and movement
//       });
//       flipped = false;
//     }
//   });
// });

const leaves = document.querySelectorAll('.leaf');

let flipped = false;
let currFlipped = null;

const container = document.querySelector(".backgroundContainer");

const leafPositions = [];
const msgBoxes = document.querySelectorAll(".bwv-display-message-box");

leaves.forEach((leaf, idx) => {
    leafPositions.push(
        {
            top: (gsap.getProperty(leaf, "top") / gsap.getProperty(container, "height")) * 100,
            left: (gsap.getProperty(leaf, "left") / gsap.getProperty(container, "width")) * 100,
            right: (gsap.getProperty(leaf, "right") / gsap.getProperty(container, "width")) * 100
        }
    );
    leaf.addEventListener('click', () => {
        const txt = msgBoxes[idx];

        if (currFlipped == null || currFlipped == idx) {
            if (currFlipped == null) {currFlipped = idx}
            else {currFlipped = null}

            gsap.to(leaf, {
                scale: flipped ? 1 : 7.5,
                rotationY: flipped ? 0 : 180, // Rotate the leaf on click
                rotationZ: flipped ? 0 : -45,
                top: flipped ? `${leafPositions[idx].top}%` : "50%",
                left: flipped ? `${leafPositions[idx].left}%` : "50%",
                right: flipped ? `${leafPositions[idx].right}%` : "50%",
                xPercent: flipped ? 0 : -50,
                yPercent: flipped ? 0 : -50,
                zIndex: flipped ? 0 : 999999,
                duration: 1,//duration of the animation 
                ease: 'power1.inOut',//smoothing easing for rotation and movement
                onComplete: () => {
                    if (flipped) txt.style.display = 'initial'
                },
                onStart: () => {
                    if (!flipped) txt.style.display = "none"
                },
            });

            flipped = !flipped;
        }
    })
});