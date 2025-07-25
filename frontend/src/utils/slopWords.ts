export const slopParagraphs: string[] = [
  // 1 — keep the iconic janitor promo
  `Thrilled to announce that after six months of relentlessly leveraging synergies, I have been PROMOTED from Janitor to *Senior* Janitor! 🚀 I couldn't have swept this milestone without my incredible support network of mops, buckets, and late-night grind mindset. Remember: success is 1% inspiration, 99% perspiration (and a good disinfectant). #Humbled #Blessed #LevelUp #CleaningTheC-Suite`,

  // 2 — software-engineering brag
  `Humbled to reveal that my 3-AM microservice migration reduced latency by 0.0007 ms, unlocking eight-figure ARR potential and inspiring the team to rally around a shared vision of seamless scalability. I personally penned 2,000 lines of bug-free TypeScript, refactored legacy regex into renaissance art, and coached five interns on servant-leadership paradigms while the city slept. Innovation never dozes; it simply commits with ✨ --amend ✨ and rebases reality. #10xEngineer #LatencySlayer #CodeZen`,

  // 3 — dev-ops triumph
  `Honored to single-handedly dockerize our sprawling legacy monolith, craft artisanal YAML, and orchestrate a flawless Kubernetes rollout between bites of a quinoa power-bowl. Achieved zero downtime, infinite impact, and a standing ovation from the office coffee machine. True leaders ship, sip cold brew, and autoscale feelings—sometimes all before the first stand-up. 🐳⎈ #DevOpsMaestro #CloudCrusader`,

  // 4 — code review flex
  `Beyond excited to celebrate my 500th consecutive *approved-with-no-comments* pull request, a streak native legend now whisper about in sprint retros. Teammates claim my diffs read like haiku; I prefer to think they smell like raw velocity distilled into brackets. Dropping knowledge bombs one git push at a time, I transform semicolons into semicolossus outcomes. 🚀 #MergeMaverick #EleganceInBrackets`,

  // 5 — agile evangelism
  `Just facilitated a record-shattering 7-minute stand-up that birthed our proprietary “Sprint-Within-A-Sprint” framework, complete with synergistic synergy and velocity multipliers. We didn’t just move the needle—we refactored it into reusable components, wrote a white-paper, and got three patents pending before the coffee finished brewing. Stand up, sync up, scale up! 🔄 #AgileArtisan #ScrumSavvy`,

  // 6 — testing supremacy
  `Proud to unveil 120% test coverage after unit-testing the unit tests, snapshotting the snapshots, and mocking existential dread itself. Bugs now file tickets against *themselves*, complete with reproduction steps and heartfelt apologies. Quality isn’t an act, it’s a CI/CD lifestyle endorsed by my standing desk and growth mindset. ✅ #TestDrivenLife #FailFastWinFaster`,

  // 7 — mentorship spin
  `Hit a milestone: transformed three caffeine-powered juniors into purpose-driven *Solution Architects* via my proprietary “Console.Log to C-Level” masterclass, delivered during a single elevator ride that felt like an IPO roadshow. Legacy? Loading… but the progress bar is already blue-chip. ☕ #MentorMindset #GrowthLoop`,

  // 8 — AI synergy
  `Humbled yet electrified to announce that my latest multi-modal LLM prompt engineering session turned coffee-shop napkin scribbles, whiteboard hieroglyphics, and a dash of manifest destiny into production-grade GraphQL schemas before my single-origin oat-milk latte even reached optimal sipping temperature. We didn’t just align algorithms; we harmonised ambition, authenticity, and API elegance inside a 90-word vision statement. 🤖 #AIMagus #PromptCraft #LatteLatency`,

  // 9 — infrastructure glow-up
  `Thrilled to have simultaneously closed the feedback loop between *terraform plan* and my personal growth plan while misting the office plants for mindfulness. In precisely one hundred seconds I provisioned 37 cloud resources, abolished technical debt, and manifested an unstoppable mindset that now autoscaling positivity across all availability zones. Infrastructure as Code? More like Confidence as Code, served with a side of continuous charisma. ☁️ #IaCIcon #StateLifted #ZoneOfGenius`,

  // 10 — storytelling swagger
  `Honored to elevate my LinkedIn headline from “Bug Fixer” to “Narrative-Driven Software Visionary and Chief Refactor Evangelist.” When your commit messages read like epic sagas and your release notes double as TED-Talk transcripts, every deploy becomes a blockbuster premiere with popcorn-level anticipation. Early reviews call it the cinematic universe of continuous delivery, but the post-credits scene—featuring a zero-downtime migration—still leaves audiences speechless. 📖🎬 #StoryCode #ReleaseTheHero #DeployAndChill`,
];

export function getRandomSlopParagraph(): string {
  const idx = Math.floor(Math.random() * slopParagraphs.length);
  return slopParagraphs[idx];
} 