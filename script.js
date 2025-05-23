let flipped = false;

//GSAP animation with staggered effect
gsap.from(".leaf", {
  rotationY: 180,
  scale: 0,
  opacity: 0,
  duration: 1,
  stagger: 0.5,
  ease: "power3.out"
});

//Add click event to trigger animation on individual leaves
const leaves = document.querySelectorAll('.leaf');

leaves.forEach(leaf => {
  leaf.addEventListener('click', () => {
    if (flipped == false) {
      gsap.to(leaf, {
        transformOrigin: "25% 25%",
        rotationY: 180, // Rotate the leaf on click
        y: -50,//move upwards
        //scale:1.2, //slightly enlarge the leaf 
        duration: 1,//duration of the animation 
        //repeat:2,
        ease: 'power1.inOut'//smoothing easing for rotation and movement
      });
      flipped = true;
      console.log(flipped);
    } else {
      gsap.to(leaf, {
        transformOrigin: "25% 25%",
        rotationY: 360,
        y: 50,
        duration: 1,
        ease: 'power1.inOut'//smoothing easing for rotation and movement
      });
      flipped = false;
      console.log(flipped);
    }
  });
});