const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".navigation");
const siteHeader = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const heroImage = document.querySelector(".hero__image");
const headerThemeSections = document.querySelectorAll("[data-header-theme]");
let parallaxFrameRequested = false;

const titleLines = document.querySelectorAll(".hero__title-line");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupCounters() {
  const counters = document.querySelectorAll("[data-counter]");

  if (!counters.length) {
    return;
  }

  const setFinalValues = () => {
    counters.forEach((counter) => {
      counter.textContent = `${counter.dataset.prefix ?? ""}${counter.dataset.target}`;
    });
  };

  if (prefersReducedMotion) {
    setFinalValues();
    return;
  }

  if (!("IntersectionObserver" in window)) {
    setFinalValues();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const counter = entry.target;
        const target = Number(counter.dataset.target);
        const prefix = counter.dataset.prefix ?? "";
        const duration = 1400;
        let startTime;

        function countUp(timestamp) {
          startTime ??= timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          const easedProgress = 1 - (1 - progress) ** 4;
          counter.textContent = `${prefix}${Math.round(target * easedProgress)}`;

          if (progress < 1) {
            window.requestAnimationFrame(countUp);
          } else {
            counter.textContent = `${prefix}${target}`;
          }
        }

        window.requestAnimationFrame(countUp);
        observer.unobserve(counter);
      });
    },
    { threshold: 0.6 },
  );

  counters.forEach((counter) => {
    counter.textContent = `${counter.dataset.prefix ?? ""}0`;
    observer.observe(counter);
  });
}

setupCounters();

function setupSectionAnimations() {
  if (prefersReducedMotion) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    return;
  }

  const revealGroups = [
    { selector: ".hero__content > .eyebrow, .hero__description, .hero__content .button", effect: "rise" },
    { selector: ".highlight", effect: "rise", stagger: 100 },
    { selector: ".projects-gallery__heading > *", effect: "rise", stagger: 100 },
    { selector: ".project-card", effect: "fade", stagger: 90 },
    { selector: ".engineer__portrait", effect: "photo" },
    { selector: ".engineer__content > *", effect: "rise", stagger: 90 },
    { selector: ".intro .section__heading > *, .intro__copy > *", effect: "rise", stagger: 100 },
    { selector: ".solutions .section__heading > *", effect: "rise", stagger: 100 },
    { selector: ".solution", effect: "rise", stagger: 90 },
    { selector: ".smart-home__intro > *", effect: "rise", stagger: 100 },
    { selector: ".smart-home__room", effect: "photo" },
    { selector: ".smart-panel > *", effect: "rise", stagger: 80 },
    { selector: ".project__image, .project__content > *", effect: "rise", stagger: 90 },
    { selector: ".footer > div:first-child > *, .footer > .button", effect: "rise", stagger: 100 },
    { selector: ".footer__bottom", effect: "fade" },
  ];

  revealGroups.forEach(({ selector, effect, stagger = 0 }) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.dataset.reveal = effect;
      element.style.setProperty("--reveal-delay", `${index * stagger}ms`);
    });
  });

  document.body.classList.add("has-reveal-animations");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
  );

  document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
}

setupSectionAnimations();

if (titleLines.length === 2) {
  if (prefersReducedMotion) {
    titleLines.forEach((line) => {
      line.textContent = line.dataset.text;
    });
  } else {
    const pause = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

    async function typeTitle() {
      for (const line of titleLines) {
        line.classList.add("is-typing");

        for (const character of Array.from(line.dataset.text)) {
          line.textContent += character;
          await pause(72);
        }

        line.classList.remove("is-typing");
        await pause(220);
      }
    }

    typeTitle();
  }
}

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Abrir menu" : "Fechar menu");
    navigation.classList.toggle("is-open", !isExpanded);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
      navigation.classList.remove("is-open");
    }
  });
}

const smartHomeRoom = document.querySelector("#smart-home-room");
const smartHomeStatus = document.querySelector("#smart-home-status");
const brightnessInput = document.querySelector("#room-brightness");
const brightnessValue = document.querySelector("#brightness-value");
const mainLightControl = document.querySelector('[data-smart-control="main-light"]');
const ambientLightControl = document.querySelector('[data-smart-control="ambient-light"]');

if (
  smartHomeRoom instanceof HTMLElement &&
  smartHomeStatus instanceof HTMLElement &&
  brightnessInput instanceof HTMLInputElement &&
  brightnessValue instanceof HTMLOutputElement &&
  mainLightControl instanceof HTMLButtonElement &&
  ambientLightControl instanceof HTMLButtonElement
) {
  let mainLightOn = true;
  let ambientLightOn = false;

  function updateSmartHome() {
    const brightnessPercent = Number(brightnessInput.value);
    const brightness = brightnessPercent / 100;
    const anyLightOn = mainLightOn || ambientLightOn;
    const effectiveBrightness = anyLightOn
      ? 0.48 + brightness * (mainLightOn ? 0.64 : 0.4)
      : 0.3;

    smartHomeRoom.style.setProperty("--room-brightness", effectiveBrightness.toFixed(2));
    smartHomeRoom.style.setProperty("--room-dim", anyLightOn ? ".04" : ".76");
    smartHomeRoom.style.setProperty("--ceiling-glow", mainLightOn ? (0.3 + brightness * 0.7).toFixed(2) : ".02");
    smartHomeRoom.style.setProperty("--room-glow", ambientLightOn ? (0.25 + brightness * 0.65).toFixed(2) : ".01");
    mainLightControl.classList.toggle("is-active", mainLightOn);
    mainLightControl.setAttribute("aria-pressed", String(mainLightOn));
    ambientLightControl.classList.toggle("is-active", ambientLightOn);
    ambientLightControl.setAttribute("aria-pressed", String(ambientLightOn));
    brightnessValue.value = `${brightnessPercent}%`;

    if (mainLightOn && ambientLightOn) {
      smartHomeStatus.textContent = "Luzes acesas — sala iluminada";
    } else if (mainLightOn) {
      smartHomeStatus.textContent = "Luz do teto acesa — sala iluminada";
    } else if (ambientLightOn) {
      smartHomeStatus.textContent = "Luminária acesa — iluminação suave";
    } else {
      smartHomeStatus.textContent = "Luzes apagadas — modo economia";
    }
  }

  mainLightControl.addEventListener("click", () => {
    mainLightOn = !mainLightOn;
    updateSmartHome();
  });

  ambientLightControl.addEventListener("click", () => {
    ambientLightOn = !ambientLightOn;
    updateSmartHome();
  });

  brightnessInput.addEventListener("input", updateSmartHome);
  updateSmartHome();
}

function updateHeroParallax() {
  parallaxFrameRequested = false;

  if (siteHeader) {
    const isScrolled = window.scrollY > 24;
    siteHeader.classList.toggle("is-scrolled", isScrolled);

    const sectionUnderHeader = Array.from(headerThemeSections).find((section) => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= siteHeader.offsetHeight / 2 && bounds.bottom > siteHeader.offsetHeight / 2;
    });

    siteHeader.classList.toggle(
      "is-dark",
      isScrolled && sectionUnderHeader?.dataset.headerTheme === "light",
    );
  }

  if (!hero || !heroImage || prefersReducedMotion) {
    return;
  }

  const scrolledDistance = Math.max(0, -hero.getBoundingClientRect().top);
  const maxOffset = hero.offsetHeight * 0.22;
  const offset = Math.min(scrolledDistance * 0.3, maxOffset);

  heroImage.style.setProperty("--parallax-offset", `${offset}px`);
}

window.addEventListener(
  "scroll",
  () => {
    if (!parallaxFrameRequested) {
      parallaxFrameRequested = true;
      window.requestAnimationFrame(updateHeroParallax);
    }
  },
  { passive: true },
);

updateHeroParallax();
