const siteContent = {
  nav: [
    { label: "Home", href: "#hero" },
    { label: "Frameworks", href: "#frameworks" },
    { label: "Who I Am", href: "#identity" },
    { label: "What I Bring", href: "#capabilities" },
    { label: "Proof", href: "#impact" },
    { label: "Timeline", href: "#timeline" },
    { label: "Plan", href: "#roadmap" },
    { label: "Closing", href: "#closing" },
  ],
  hero: {
    tagline: "Governance x Product x Strategy",
    name: "Prakhar Bhargava",
    role: "Structured thinker for public systems, last-mile execution, and impact at scale.",
    brief:
      "I am applying to Haqdarshak because my strongest work has lived at the exact intersection it operates in: governance, field learning, product thinking, and execution design. I like turning complexity into structure so teams can move faster and outcomes can reach people better.",
    pointers: [
      {
        label: "Current",
        value: "PGP in Technology & Business Management, Masters' Union",
      },
      {
        label: "Standing",
        value: "Dean's List | Rank 6",
      },
      {
        label: "Former",
        value: "Senior Political & Governance Consultant, Nation with NaMo",
      },
      {
        label: "Built in",
        value: "APM, Swiggy | Mechanical Engineer, NIT Trichy",
      },
    ],
    frameworkLine:
      "2 x 2 lenses, decision trees, timelines, and operating reviews to simplify ambiguity and sharpen action.",
    metrics: [
      { value: "1000+", label: "Ground interviews" },
      { value: "54", label: "Governance papers" },
      { value: "36", label: "Policies advanced" },
      { value: "15%", label: "Delivery lift" },
    ],
    actions: [
      { label: "See my frameworks", href: "#frameworks", variant: "primary" },
      { label: "See what I bring", href: "#capabilities", variant: "secondary" },
    ],
    panel: {
      title: "Why Haqdarshak",
      body:
        "Haqdarshak solves the exact kind of problem I care about: how policy intent becomes real access. It combines welfare understanding, field execution, and systems thinking in one platform - and that is the environment where I believe I can contribute most meaningfully.",
    },
  },
  frameworks: {
    title: "Frameworks I believe in to understand systems better",
    copy:
      "Whenever I face a messy operating problem, I avoid jumping to solutions. I first ask what kind of problem it is, where it sits in the user or operator journey, and what level of intervention is actually required. These are the lenses I tend to use.",
    matrix: {
      title: "My default 2 x 2 for diagnosing problems",
      xAxis: "Execution complexity ->",
      yAxis: "Human depth ->",
      quadrants: [
        {
          title: "High human depth / low complexity",
          body: "Make the experience simpler. Reduce confusion, improve trust, and improve clarity.",
        },
        {
          title: "High human depth / high complexity",
          body: "Invest in assisted journeys, field immersion, and high-touch problem solving.",
        },
        {
          title: "Low human depth / low complexity",
          body: "Standardize the workflow, automate repeatable steps, and improve consistency.",
        },
        {
          title: "Low human depth / high complexity",
          body: "Build dashboards, escalation rules, and operating reviews that manage scale.",
        },
      ],
    },
    decisionTree: {
      title: "My decision tree for public-delivery problems",
      copy:
        "I usually start by asking where the system breaks: awareness, fit, action, or follow-through. That determines whether the answer is communication, workflow design, training, accountability, or data visibility.",
      root: "Where is the journey breaking?",
      branches: [
        {
          question: "People do not know enough?",
          answer: "Fix discovery, communication, and scheme clarity.",
        },
        {
          question: "People know, but cannot act?",
          answer: "Fix documents, workflows, assisted completion, and guidance.",
        },
        {
          question: "People apply, but nothing moves?",
          answer: "Fix tracking, escalation, ownership, and response loops.",
        },
        {
          question: "Teams are solving blindly?",
          answer: "Fix dashboards, taxonomy, metrics, and decision cadence.",
        },
      ],
    },
    beliefs: [
      {
        title: "Go on ground first",
        body: "The most important system insight usually appears before the spreadsheet does.",
      },
      {
        title: "Make complexity visible",
        body: "A framework is useful only when it turns confusion into a decision.",
      },
      {
        title: "Design for adoption",
        body: "A solution works only if real users and real teams can use it consistently.",
      },
      {
        title: "Measure where friction lives",
        body: "Metrics matter most when they reveal where inclusion is still failing.",
      },
    ],
  },
  identity: {
    title: "Who I am as a person and why I am applying",
    copy:
      "I am someone who likes learning through real systems, not abstract case studies. Across governance consulting, political strategy, product work, and AI-led projects, the common pattern in my work has been: understand deeply, structure clearly, and execute with ownership. That is also why I want Haqdarshak.",
    cards: [
      {
        title: "I prefer reality over narrative",
        body:
          "Whether it was citizen conversations, political-ground interviews, or user interviews at Swiggy, my instinct has always been to understand what is truly happening beneath the surface.",
      },
      {
        title: "I naturally think in systems",
        body:
          "I do not only ask what the answer is. I ask what the mechanism is, how the failure repeats, and what operating loop can make the outcome more reliable.",
      },
      {
        title: "I care about impact with dignity",
        body:
          "Haqdarshak stands out because it works on the difficult layer between eligibility and actual access. That is where execution, trust, design, and human support all matter.",
      },
    ],
  },
  capabilities: {
    title: "What I can bring to the table",
    copy:
      "I can contribute across product, strategy, program management, and CEO-office style problem solving because I have already worked on systems that demanded structure, decision support, and execution under ambiguity.",
    cards: [
      {
        title: "Governance and public-system understanding",
        body:
          "I have worked on scheme penetration, policy implementation, satisfaction tracking, governance issue-mapping, and ministry-level adoption. That gives me a grounded understanding of how public systems fail and how they can improve.",
        bullets: [
          "54 governance issue papers delivered to Chief Minister-level leadership.",
          "36 targeted policies and schemes advanced through cross-ministry adoption.",
          "15% improvement in last-mile delivery by identifying low-uptake blocks.",
        ],
      },
      {
        title: "Decision-system and dashboard building",
        body:
          "I have repeatedly built products for operators: prediction dashboards, scorecards, issue trackers, and decision systems that help leaders and teams move faster and with more clarity.",
        bullets: [
          "12 decision-support dashboards built for political and governance leadership.",
          "100% leader adoption of integrated digital dashboards in live environments.",
          "Dashboard rollout cycle cut from 30 days to 10 days through training.",
        ],
      },
      {
        title: "User insight to execution",
        body:
          "From large-scale interviews to support-flow redesign and agent enablement, I know how to convert field signals into changes that improve usability, performance, and trust.",
        bullets: [
          "85+ user interviews at Swiggy used to simplify support journeys.",
          "500K+ delivery logs analyzed to identify funnel friction and fix operations.",
          "Workflow redesign improved warehouse efficiency by 70%.",
        ],
      },
    ],
  },
  impact: {
    title: "Proof that I can execute in high-stakes environments",
    copy:
      "The strongest pattern across my work is consistent: diagnose fast, structure ambiguity, and push toward adoption. The numbers below are not just achievements. They are evidence of how I operate.",
    stats: [
      {
        value: "1000+",
        label: "Interviews and ground signals",
        copy: "Citizen, stakeholder, and field inputs converted into strategy and action.",
      },
      {
        value: "54",
        label: "Governance papers",
        copy: "Structured papers delivered for high-level policy and execution review.",
      },
      {
        value: "36",
        label: "Policies and schemes advanced",
        copy: "Cross-ministry adoption supported through prioritization and follow-through.",
      },
      {
        value: "15%",
        label: "Last-mile delivery lift",
        copy: "Achieved by identifying low-uptake blocks and satisfaction gaps.",
      },
      {
        value: "12",
        label: "Team members led",
        copy: "Youngest Project Director leading analysts and delivery workflows.",
      },
      {
        value: "500K+",
        label: "Operational logs analyzed",
        copy: "Used for product diagnosis, funnel fixes, and operating visibility.",
      },
      {
        value: "70%",
        label: "Efficiency gain",
        copy: "Process redesign at Swiggy improved warehouse performance materially.",
      },
      {
        value: "10 days",
        label: "Dashboard rollout cycle",
        copy: "Reduced from 30 days through training and standardization.",
      },
    ],
    bridge:
      "For Haqdarshak, this matters because the role is not only about having ideas. It is about building systems that teams can use and citizens can actually feel.",
  },
  timeline: {
    title: "A timeline of how I have built across governance, product, and systems",
    copy:
      "My journey has not been random. Each phase added a different layer to how I think: leadership, operational rigor, public-system understanding, and AI-enabled system design.",
    items: [
      {
        period: "NIT Trichy",
        title: "Built early leadership and problem-solving muscle",
        body:
          "Led teams, founded initiatives, and worked on product and operations challenges that rewarded structured thinking.",
        tags: ["Leadership", "Problem solving", "Structured thinking"],
      },
      {
        period: "Swiggy",
        title: "Learned how user research and operational data shape product decisions",
        body:
          "Worked on warehouse efficiency, support journeys, real-time dashboards, and funnel improvements.",
        tags: ["Product", "Ops", "User research"],
      },
      {
        period: "Nation with NaMo",
        title: "Scaled governance and decision-system execution",
        body:
          "Worked with senior political and governance leaders, built dashboards, authored governance papers, and translated on-ground insight into action.",
        tags: ["Governance", "Dashboards", "Execution"],
      },
      {
        period: "G-Roota.AI",
        title: "Moved toward AI-enabled public-system design",
        body:
          "Explored how AI, tagging, automation, and structured intelligence can improve workflows in governance environments.",
        tags: ["AI", "Automation", "System design"],
      },
      {
        period: "Why Haqdarshak now",
        title: "Bring everything together on one meaningful platform",
        body:
          "Public systems, citizen access, human-centered execution, and scale come together here in a way that strongly matches how I want to build.",
        tags: ["Impact", "Scale", "Citizen access"],
      },
    ],
  },
  focus: {
    title: "What I would focus on after joining",
    copy:
      "My first instinct would be to understand the full user and operator journey, then strengthen the exact points where confusion, friction, and lack of visibility are most damaging.",
    cards: [
      {
        title: "Sharpen citizen discovery and assisted completion",
        body:
          "I would look closely at how awareness, eligibility clarity, and documentation readiness influence actual conversion.",
      },
      {
        title: "Improve field-to-product feedback loops",
        body:
          "I would make sure agent and partner insights are structured, visible, and routed into product and strategy decisions.",
      },
      {
        title: "Build decision infrastructure for scale",
        body:
          "I would create clearer dashboards and operating reviews for funnel health, geography variance, and partner performance.",
      },
      {
        title: "Explore high-leverage AI wedges",
        body:
          "I would assess multilingual discovery, guided workflows, prioritization, and post-application support as scalable interventions.",
      },
    ],
  },
  metrics: {
    title: "Metrics I would track",
    copy:
      "I would use metrics as a way to understand where the citizen journey is improving and where the organization is still operating without enough clarity.",
    items: [
      {
        title: "Discovery to eligibility",
        body: "How many incoming users are matched to one or more relevant opportunities?",
      },
      {
        title: "Application completion",
        body: "How many promising cases actually become completed submissions?",
      },
      {
        title: "Time to resolution",
        body: "How long does it take to move from first contact to access or closure?",
      },
      {
        title: "Drop-off stage",
        body: "At what exact stage do users stop: awareness, documents, verification, or follow-up?",
      },
      {
        title: "Agent productivity",
        body: "Which support patterns correlate with better throughput and better success quality?",
      },
      {
        title: "Geography variance",
        body: "Which districts or partner channels show the strongest and weakest outcomes?",
      },
      {
        title: "Redressal health",
        body: "Are open issues being surfaced, escalated, and resolved with visibility?",
      },
      {
        title: "User trust",
        body: "Do users feel supported, informed, and confident through the journey?",
      },
    ],
  },
  roadmap: {
    title: "How I would structure my 3 / 6 / 9 months",
    copy:
      "My approach would be to learn deeply first, then fix the critical bottlenecks, and then convert what works into repeatable systems that scale.",
    cards: [
      {
        stage: "0-3 months",
        title: "Understand the live operating reality",
        body:
          "Spend time across product, field teams, partners, data, and users to build a shared picture of where the system is strongest and weakest.",
        bullets: [
          "Map the full citizen and agent journey.",
          "Review scheme, grievance, and performance data.",
          "Define the top operating bottlenecks with clarity.",
        ],
      },
      {
        stage: "3-6 months",
        title: "Fix the biggest friction points",
        body:
          "Prioritize the few interventions that most improve conversion, clarity, and visibility across the benefits funnel.",
        bullets: [
          "Launch a sharper review cadence and dashboard layer.",
          "Pilot improvements in guidance, workflow, or tracking.",
          "Create a clean field-to-product escalation loop.",
        ],
      },
      {
        stage: "6-9 months",
        title: "Turn wins into repeatable scale systems",
        body:
          "Codify the playbooks, automation layers, and decision rules that let Haqdarshak scale quality, not just volume.",
        bullets: [
          "Document repeatable intervention playbooks.",
          "Propose high-leverage AI-enabled features.",
          "Support the next wave of product or geography scale.",
        ],
      },
    ],
  },
  closing: {
    title: "I want to build where insight becomes access",
    copy:
      "What excites me about Haqdarshak is that it treats access as a system design challenge with human consequences. I would come in not only to contribute ideas, but to help build better systems for citizens, field teams, and decision-makers.",
    points: [
      {
        title: "Who I am",
        body: "A structured thinker who learns fast from the field.",
      },
      {
        title: "What I bring",
        body: "Governance depth, product thinking, and execution discipline.",
      },
      {
        title: "What I want to do",
        body: "Make access systems clearer, faster, and more reliable at scale.",
      },
      {
        title: "Why this matters",
        body: "Because better systems do not just improve metrics - they improve lives.",
      },
    ],
  },
  footer:
    "Built as a Haqdarshak-inspired application website for Prakhar Bhargava. Add a local image named profile-photo.png in the project root to replace the hero placeholder.",
};

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function appendChildren(target, nodes) {
  nodes.forEach((node) => target.appendChild(node));
}

function createCard({ title, body, bullets = [] }, className = "content-card") {
  const card = document.createElement("article");
  card.className = className;

  const heading = document.createElement("h3");
  heading.textContent = title;

  const copy = document.createElement("p");
  copy.textContent = body;

  appendChildren(card, [heading, copy]);

  if (bullets.length) {
    const list = document.createElement("ul");
    bullets.forEach((bullet) => {
      const item = document.createElement("li");
      item.textContent = bullet;
      list.appendChild(item);
    });
    card.appendChild(list);
  }

  return card;
}

function renderNav() {
  const nav = document.getElementById("site-nav");
  siteContent.nav.forEach((item) => {
    const link = document.createElement("a");
    link.href = item.href;
    link.textContent = item.label;
    nav.appendChild(link);
  });
}

function renderHero() {
  const { hero } = siteContent;
  setText("hero-tagline", hero.tagline);
  setText("hero-name", hero.name);
  setText("hero-role", hero.role);
  setText("hero-brief", hero.brief);
  setText("hero-framework-line", hero.frameworkLine);
  setText("hero-panel-title", hero.panel.title);
  setText("hero-panel-body", hero.panel.body);

  const pointerWrap = document.getElementById("hero-pointer-grid");
  hero.pointers.forEach((item) => {
    const card = document.createElement("div");
    card.className = "hero-pointer";
    card.innerHTML = `<span>${item.label}</span><strong>${item.value}</strong>`;
    pointerWrap.appendChild(card);
  });

  const metricWrap = document.getElementById("hero-metrics-row");
  hero.metrics.forEach((item) => {
    const metric = document.createElement("div");
    metric.className = "hero-metric";
    metric.innerHTML = `<strong>${item.value}</strong><span>${item.label}</span>`;
    metricWrap.appendChild(metric);
  });

  const actionWrap = document.getElementById("hero-actions");
  hero.actions.forEach((action) => {
    const link = document.createElement("a");
    link.href = action.href;
    link.className = `button-link ${action.variant}`;
    link.textContent = action.label;
    actionWrap.appendChild(link);
  });
}

function renderFrameworks() {
  const { frameworks } = siteContent;
  setText("frameworks-title", frameworks.title);
  setText("frameworks-copy", frameworks.copy);
  setText("matrix-title", frameworks.matrix.title);
  setText("matrix-x-axis", frameworks.matrix.xAxis);
  setText("matrix-y-axis", frameworks.matrix.yAxis);
  setText("decision-title", frameworks.decisionTree.title);
  setText("decision-copy", frameworks.decisionTree.copy);

  const matrixGrid = document.getElementById("matrix-grid");
  frameworks.matrix.quadrants.forEach((quadrant) => {
    const cell = document.createElement("div");
    cell.className = "matrix-cell";
    cell.innerHTML = `<strong>${quadrant.title}</strong><span>${quadrant.body}</span>`;
    matrixGrid.appendChild(cell);
  });

  const tree = document.getElementById("decision-tree");
  const root = document.createElement("div");
  root.className = "tree-root";
  root.innerHTML = `<strong>Root question</strong><span>${frameworks.decisionTree.root}</span>`;
  tree.appendChild(root);

  const branchWrap = document.createElement("div");
  branchWrap.className = "tree-branches";
  frameworks.decisionTree.branches.forEach((branch) => {
    const node = document.createElement("div");
    node.className = "tree-branch";
    node.innerHTML = `<strong>${branch.question}</strong><span>${branch.answer}</span>`;
    branchWrap.appendChild(node);
  });
  tree.appendChild(branchWrap);

  const beliefGrid = document.getElementById("belief-pill-grid");
  frameworks.beliefs.forEach((belief) => {
    const pill = document.createElement("div");
    pill.className = "belief-pill";
    pill.innerHTML = `<strong>${belief.title}</strong><span>${belief.body}</span>`;
    beliefGrid.appendChild(pill);
  });
}

function renderSection(sectionKey, titleId, copyId, cardsId) {
  const section = siteContent[sectionKey];
  setText(titleId, section.title);
  setText(copyId, section.copy);

  const wrap = document.getElementById(cardsId);
  section.cards.forEach((card) => wrap.appendChild(createCard(card)));
}

function renderImpact() {
  const { impact } = siteContent;
  setText("impact-title", impact.title);
  setText("impact-copy", impact.copy);
  setText("impact-bridge", impact.bridge);

  const stats = document.getElementById("impact-stats");
  impact.stats.forEach((stat) => {
    const card = document.createElement("article");
    card.className = "stat-card";
    card.innerHTML = `
      <span class="stat-value">${stat.value}</span>
      <span class="stat-label">${stat.label}</span>
      <p class="stat-copy">${stat.copy}</p>
    `;
    stats.appendChild(card);
  });
}

function renderTimeline() {
  const { timeline } = siteContent;
  setText("timeline-title", timeline.title);
  setText("timeline-copy", timeline.copy);

  const wrap = document.getElementById("timeline-list");
  timeline.items.forEach((item, index) => {
    const row = document.createElement("article");
    row.className = "timeline-item";

    const tags =
      item.tags?.length
        ? `<div class="timeline-tags">${item.tags
            .map((tag) => `<span class="timeline-tag">${tag}</span>`)
            .join("")}</div>`
        : "";

    row.innerHTML = `
      <div class="timeline-marker">${index + 1}</div>
      <div class="timeline-content">
        <span class="timeline-period">${item.period}</span>
        <h3>${item.title}</h3>
        <p>${item.body}</p>
        ${tags}
      </div>
    `;
    wrap.appendChild(row);
  });
}

function renderMetrics() {
  const { metrics } = siteContent;
  setText("metrics-title", metrics.title);
  setText("metrics-copy", metrics.copy);

  const wrap = document.getElementById("metrics-list");
  metrics.items.forEach((item) => {
    const pill = document.createElement("div");
    pill.className = "metric-pill";
    pill.innerHTML = `<strong>${item.title}</strong><span>${item.body}</span>`;
    wrap.appendChild(pill);
  });
}

function renderRoadmap() {
  const { roadmap } = siteContent;
  setText("roadmap-title", roadmap.title);
  setText("roadmap-copy", roadmap.copy);

  const wrap = document.getElementById("roadmap-cards");
  roadmap.cards.forEach((cardData) => {
    const card = document.createElement("article");
    card.className = "roadmap-card";
    card.innerHTML = `
      <span class="roadmap-stage">${cardData.stage}</span>
      <h3>${cardData.title}</h3>
      <p>${cardData.body}</p>
    `;

    if (cardData.bullets?.length) {
      const list = document.createElement("ul");
      cardData.bullets.forEach((bullet) => {
        const item = document.createElement("li");
        item.textContent = bullet;
        list.appendChild(item);
      });
      card.appendChild(list);
    }

    wrap.appendChild(card);
  });
}

function renderClosing() {
  const { closing } = siteContent;
  setText("closing-title", closing.title);
  setText("closing-copy", closing.copy);

  const wrap = document.getElementById("closing-points");
  closing.points.forEach((point) => {
    const item = document.createElement("div");
    item.className = "closing-point";
    item.innerHTML = `<strong>${point.title}</strong><span>${point.body}</span>`;
    wrap.appendChild(item);
  });
}

function enableHeroMotion() {
  const hero = document.getElementById("hero");
  const avatar = document.getElementById("avatar-shell");
  const note = document.querySelector(".hero-note-card");

  if (!hero || !avatar || !note) return;

  function updateHeroMotion() {
    const rect = hero.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const rawProgress = 1 - Math.max(Math.min(rect.bottom / (viewport + rect.height), 1), 0);
    const progress = Math.max(0, Math.min(rawProgress, 1));

    avatar.style.transform =
      `translateY(${progress * -18}px) rotate(${progress * -4}deg) scale(${1 + progress * 0.03})`;
    note.style.transform =
      `translateY(${progress * -10}px)`;
  }

  updateHeroMotion();
  window.addEventListener("scroll", updateHeroMotion, { passive: true });
}

function init() {
  renderNav();
  renderHero();
  renderFrameworks();
  renderSection("identity", "identity-title", "identity-copy", "identity-cards");
  renderSection("capabilities", "capabilities-title", "capabilities-copy", "capability-cards");
  renderImpact();
  renderTimeline();
  renderSection("focus", "focus-title", "focus-copy", "focus-cards");
  renderMetrics();
  renderRoadmap();
  renderClosing();
  setText("footer-note", siteContent.footer);
  enableHeroMotion();
}

init();
